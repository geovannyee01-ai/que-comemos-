// Learns from what the user actually does in this browser — saved favorites,
// past searches, and standing preferences — and turns it into a soft nudge on
// ordering, never a hard filter. A place that's slightly farther but is a
// saved favorite (or matches what the user usually picks at this time of
// day) can outrank a marginally faster stranger; it can't turn a 40-minute
// place into a better answer than one 5 minutes away.
import { QUICK_OPTIONS, matchesFoodOption } from "./foodTypes";

const WEIGHTS = {
  exactFavorite: 3,
  favoriteCuisine: 0.6,
  favoriteAmenity: 0.3,
  favoriteFoodType: 0.4,
  searchFrequency: 0.5,
  dayPartPattern: 0.35,
  restrictionAligned: 0.15,
};

function splitCuisine(cuisine) {
  return (cuisine || "")
    .toLowerCase()
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function frequencyScore(entries, place) {
  if (!entries.length) return 0;
  const counts = {};
  for (const h of entries) {
    if (h.optionId) counts[h.optionId] = (counts[h.optionId] || 0) + 1;
  }
  const values = Object.values(counts);
  if (values.length === 0) return 0;
  const maxCount = Math.max(...values);
  let best = 0;
  for (const [optionId, count] of Object.entries(counts)) {
    const option = QUICK_OPTIONS.find((o) => o.id === optionId);
    if (option && matchesFoodOption(place, option)) best = Math.max(best, count / maxCount);
  }
  return best;
}

export function computeAffinity(place, { history = [], favorites = [], prefs, dayPart } = {}) {
  let score = 0;
  const reasons = [];

  if (favorites.some((f) => f.id === place.id)) {
    score += WEIGHTS.exactFavorite;
    reasons.push("Es uno de tus favoritos guardados");
  } else {
    const favCuisines = new Set(favorites.flatMap((f) => splitCuisine(f.cuisine)));
    const favAmenities = new Set(favorites.map((f) => f.amenity).filter(Boolean));
    const placeCuisines = splitCuisine(place.cuisine);
    if (placeCuisines.some((c) => favCuisines.has(c))) {
      score += WEIGHTS.favoriteCuisine;
      reasons.push("Se parece a lugares que ya guardaste");
    } else if (favAmenities.has(place.amenity)) {
      score += WEIGHTS.favoriteAmenity;
    }
  }

  if (prefs?.favoriteFoodIds?.length) {
    const matchesPreferredFood = QUICK_OPTIONS.filter((o) => prefs.favoriteFoodIds.includes(o.id)).some((o) =>
      matchesFoodOption(place, o)
    );
    if (matchesPreferredFood) {
      score += WEIGHTS.favoriteFoodType;
      reasons.push("Es una de tus comidas favoritas");
    }
  }

  const searchScore = frequencyScore(history, place);
  if (searchScore > 0) {
    score += searchScore * WEIGHTS.searchFrequency;
    if (searchScore >= 0.5) reasons.push("Lo buscas seguido");
  }

  if (dayPart) {
    const samePart = history.filter((h) => h.dayPart === dayPart);
    if (samePart.length >= 2) {
      const partScore = frequencyScore(samePart, place);
      if (partScore > 0) {
        score += partScore * WEIGHTS.dayPartPattern;
        if (partScore >= 0.6) reasons.push("Sueles pedir esto a esta hora");
      }
    }
  }

  if (prefs?.restrictions) {
    for (const [key, field] of [
      ["vegetarian", "vegetarian"],
      ["vegan", "vegan"],
      ["glutenFree", "glutenFree"],
    ]) {
      if (!prefs.restrictions[key]) continue;
      if (place[field] === "yes") score += WEIGHTS.restrictionAligned;
      else if (place[field] === "no") score -= WEIGHTS.restrictionAligned;
    }
  }

  return { score: Math.max(0, score), reasons };
}

// ETA-equivalent nudge: each affinity point pulls a place forward as if it
// were ~4 minutes closer. Keeps ordering honest (still real ETA underneath)
// while letting a strong match win close calls.
const AFFINITY_MINUTES = 4;

export function personalizeAndSort(places, ctx) {
  const withAffinity = places.map((p) => ({ ...p, affinity: computeAffinity(p, ctx) }));
  return withAffinity.sort((a, b) => {
    const openA = a.openingStatus.known ? (a.openingStatus.isOpen ? 0 : 1) : 0.5;
    const openB = b.openingStatus.known ? (b.openingStatus.isOpen ? 0 : 1) : 0.5;
    if (openA !== openB) return openA - openB;
    const scoreA = a.etaMinutes - a.affinity.score * AFFINITY_MINUTES;
    const scoreB = b.etaMinutes - b.affinity.score * AFFINITY_MINUTES;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.distanceMeters - b.distanceMeters;
  });
}

// Weighted pick for "Sorpréndeme" — still random, but places that match the
// user's history/favorites are proportionally more likely to come up.
export function weightedRandomPick(places, ctx) {
  if (places.length === 0) return null;
  const weights = places.map((p) => 1 + computeAffinity(p, ctx).score);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < places.length; i++) {
    r -= weights[i];
    if (r <= 0) return places[i];
  }
  return places[places.length - 1];
}
