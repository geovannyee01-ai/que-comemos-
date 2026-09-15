import { estimateMinutes, haversineMeters, travelMode } from "./geo";

// Real place data from OpenStreetMap — no API key needed, no invented
// listings. We ask Overpass for every food-related POI in the radius once
// per location, then filter/sort/rank all of it client-side so switching
// food type or filters doesn't need another network round trip.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const FOOD_AMENITIES = ["restaurant", "fast_food", "cafe", "bar", "pub", "ice_cream", "food_court"];
const FOOD_SHOPS = ["bakery", "pastry", "confectionery"];

function buildQuery(lat, lon, radiusMeters) {
  const amenityRe = FOOD_AMENITIES.join("|");
  const shopRe = FOOD_SHOPS.join("|");
  return `[out:json][timeout:25];(
    node["amenity"~"^(${amenityRe})$"](around:${radiusMeters},${lat},${lon});
    way["amenity"~"^(${amenityRe})$"](around:${radiusMeters},${lat},${lon});
    node["shop"~"^(${shopRe})$"](around:${radiusMeters},${lat},${lon});
    way["shop"~"^(${shopRe})$"](around:${radiusMeters},${lat},${lon});
  );out center tags;`;
}

function formatAddress(tags) {
  const parts = [
    [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" "),
    tags["addr:city"],
  ].filter(Boolean);
  return parts.join(", ") || null;
}

function yesNoUnknown(v) {
  if (v === "yes" || v === "only") return "yes";
  if (v === "no") return "no";
  return "unknown"; // tag absent from OSM — we don't know, we don't guess
}

const SEATED_AMENITIES = new Set(["restaurant", "cafe", "bar", "pub", "food_court"]);
function dineInFromTags(tags) {
  if (tags.indoor_seating === "yes" || tags.outdoor_seating === "yes") return "yes";
  if (tags.indoor_seating === "no" && tags.outdoor_seating === "no") return "no";
  if (SEATED_AMENITIES.has(tags.amenity)) return "yes"; // typical for the category, not a guarantee
  return "unknown";
}

function normalizeElement(el, userCoords) {
  const tags = el.tags || {};
  const lat = el.type === "node" ? el.lat : el.center?.lat;
  const lon = el.type === "node" ? el.lon : el.center?.lon;
  if (lat == null || lon == null) return null;

  const distanceMeters = haversineMeters(userCoords, { lat, lon });

  return {
    id: `${el.type}/${el.id}`,
    lat,
    lon,
    name: tags.name || "Lugar sin nombre en el mapa",
    amenity: tags.amenity || tags.shop || "restaurant",
    cuisine: tags.cuisine || "",
    openingHours: tags.opening_hours || null,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    address: formatAddress(tags),
    delivery: yesNoUnknown(tags.delivery),
    takeaway: yesNoUnknown(tags.takeaway),
    dineIn: dineInFromTags(tags),
    vegetarian: yesNoUnknown(tags["diet:vegetarian"]),
    vegan: yesNoUnknown(tags["diet:vegan"]),
    glutenFree: yesNoUnknown(tags["diet:gluten_free"]),
    wheelchair: tags.wheelchair || null,
    brand: tags.brand || null,
    distanceMeters,
    etaMinutes: estimateMinutes(distanceMeters),
    travelMode: travelMode(distanceMeters),
    tags,
  };
}

export async function fetchNearbyPlaces(userCoords, radiusMeters = 3000, { signal } = {}) {
  const query = buildQuery(userCoords.lat, userCoords.lon, radiusMeters);
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal,
      });
      if (!res.ok) {
        lastError = new Error(`Overpass respondió ${res.status}`);
        continue;
      }
      const json = await res.json();
      const places = (json.elements || [])
        .map((el) => normalizeElement(el, userCoords))
        .filter(Boolean)
        .filter((p) => p.name !== "Lugar sin nombre en el mapa" || p.cuisine); // drop unnamed noise unless it at least tags a cuisine
      return { places, error: null };
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      lastError = err;
    }
  }
  return { places: [], error: new Error("No se pudo conectar con OpenStreetMap. Revisa tu conexión e intenta de nuevo.") };
}
