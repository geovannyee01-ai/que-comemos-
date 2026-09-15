const KEYS = {
  favorites: "qch_favorites_v1",
  prefs: "qch_prefs_v1",
  history: "qch_history_v1",
};

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) — fail silently, app still works this session */
  }
}

export const DEFAULT_PREFS = {
  name: "",
  favoriteFoodIds: [],
  favoriteRestaurantNames: [],
  budgetLevel: null, // "$" | "$$" | "$$$" | null
  maxDistanceMeters: 3000,
  maxWaitMinutes: 30,
  restrictions: { vegetarian: false, vegan: false, glutenFree: false },
};

export function loadPrefs() {
  return { ...DEFAULT_PREFS, ...readJSON(KEYS.prefs, {}) };
}
export function savePrefs(prefs) {
  writeJSON(KEYS.prefs, prefs);
}

export function loadFavorites() {
  return readJSON(KEYS.favorites, []);
}
export function isFavorite(favorites, placeId) {
  return favorites.some((f) => f.id === placeId);
}
export function toggleFavorite(place) {
  const favorites = loadFavorites();
  const exists = favorites.some((f) => f.id === place.id);
  const next = exists ? favorites.filter((f) => f.id !== place.id) : [{ ...place, savedAt: Date.now() }, ...favorites];
  writeJSON(KEYS.favorites, next);
  return next;
}

const MAX_HISTORY = 40;
export function loadHistory() {
  return readJSON(KEYS.history, []);
}
export function pushHistory(entry) {
  const history = loadHistory();
  const next = [{ ...entry, ts: Date.now() }, ...history].slice(0, MAX_HISTORY);
  writeJSON(KEYS.history, next);
  return next;
}
export function clearHistory() {
  writeJSON(KEYS.history, []);
  return [];
}
