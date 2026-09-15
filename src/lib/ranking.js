import { getOpeningStatus } from "./openingHours";
import { matchesFoodOption, matchesFreeWords } from "./foodTypes";

export const DEFAULT_FILTERS = {
  maxDistanceMeters: 3000,
  maxWaitMinutes: 60,
  openNowOnly: true,
  delivery: false,
  takeaway: false,
  dineIn: false,
  vegetarian: false,
  vegan: false,
  glutenFree: false,
};

export function enrichWithStatus(places, at = new Date()) {
  return places.map((p) => ({ ...p, openingStatus: getOpeningStatus(p.openingHours, at) }));
}

export function filterPlaces(places, { option, freeWords, filters }) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  return places.filter((p) => {
    if (!matchesFoodOption(p, option)) return false;
    if (!matchesFreeWords(p, freeWords)) return false;
    if (p.distanceMeters > f.maxDistanceMeters) return false;
    if (p.etaMinutes > f.maxWaitMinutes) return false;
    if (f.openNowOnly && p.openingStatus.known && p.openingStatus.isOpen === false) return false;
    if (f.delivery && p.delivery !== "yes") return false;
    if (f.takeaway && p.takeaway !== "yes") return false;
    if (f.dineIn && p.dineIn !== "yes") return false;
    if (f.vegetarian && p.vegetarian !== "yes") return false;
    if (f.vegan && p.vegan !== "yes") return false;
    if (f.glutenFree && p.glutenFree !== "yes") return false;
    return true;
  });
}

// Base sort: open-now first, then soonest ETA, then nearest — this is also
// the order used by "Tengo hambre YA".
export function sortByFastest(places) {
  return [...places].sort((a, b) => {
    const openA = a.openingStatus.known ? (a.openingStatus.isOpen ? 0 : 1) : 0.5;
    const openB = b.openingStatus.known ? (b.openingStatus.isOpen ? 0 : 1) : 0.5;
    if (openA !== openB) return openA - openB;
    if (a.etaMinutes !== b.etaMinutes) return a.etaMinutes - b.etaMinutes;
    return a.distanceMeters - b.distanceMeters;
  });
}

// Computes which place (if any) earns each highlight badge. Ratings/price
// badges are intentionally absent — OSM has no reliable public source for
// either, and we don't invent one (see README).
export function computeHighlights(places) {
  const open = places.filter((p) => p.openingStatus.known ? p.openingStatus.isOpen : true);
  const highlights = {};
  if (open.length === 0) return highlights;

  highlights.fastest = open.reduce((best, p) => (p.etaMinutes < best.etaMinutes ? p : best), open[0]).id;
  highlights.nearest = open.reduce((best, p) => (p.distanceMeters < best.distanceMeters ? p : best), open[0]).id;

  const withCloseTime = open.filter((p) => p.openingStatus.known && p.openingStatus.isOpen && p.openingStatus.closesAt);
  if (withCloseTime.length > 0) {
    highlights.openLatest = withCloseTime.reduce((best, p) =>
      p.openingStatus.closesAt > best.openingStatus.closesAt ? p : best
    , withCloseTime[0]).id;
  }

  const withAffinity = open.filter((p) => p.affinity?.score >= 0.5);
  if (withAffinity.length > 0) {
    highlights.forYou = withAffinity.reduce((best, p) => (p.affinity.score > best.affinity.score ? p : best), withAffinity[0]).id;
  }
  return highlights;
}

export function pickRandom(places) {
  if (places.length === 0) return null;
  return places[Math.floor(Math.random() * places.length)];
}
