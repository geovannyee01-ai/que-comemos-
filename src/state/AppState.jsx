import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useGeolocation } from "../lib/geo";
import { fetchNearbyPlaces } from "../lib/overpass";
import { enrichWithStatus, filterPlaces, computeHighlights, DEFAULT_FILTERS } from "../lib/ranking";
import { personalizeAndSort, weightedRandomPick } from "../lib/personalization";
import { resolveFoodQuery, QUICK_OPTIONS } from "../lib/foodTypes";
import { loadPrefs, savePrefs, loadFavorites, toggleFavorite as toggleFavoriteStorage, loadHistory, pushHistory, clearHistory as clearHistoryStorage } from "../lib/storage";
import { dayPart as getDayPart } from "../lib/time";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const geo = useGeolocation();
  const [manualCoords, setManualCoords] = useState(null);
  const coords = manualCoords || geo.coords;

  const [rawPlaces, setRawPlaces] = useState([]);
  const [placesStatus, setPlacesStatus] = useState("idle"); // idle | loading | ready | error
  const [placesError, setPlacesError] = useState(null);

  const [queryText, setQueryText] = useState("");
  const [option, setOption] = useState(null);
  const [freeWords, setFreeWords] = useState([]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const loadPlaces = useCallback(
    async (radiusMeters) => {
      if (!coords) return;
      setPlacesStatus("loading");
      setPlacesError(null);
      try {
        const { places, error } = await fetchNearbyPlaces(coords, radiusMeters ?? filters.maxDistanceMeters + 500);
        if (error && places.length === 0) {
          setPlacesStatus("error");
          setPlacesError(error.message || "No se pudo cargar lugares cercanos.");
          return;
        }
        setRawPlaces(places);
        setPlacesStatus("ready");
      } catch (err) {
        setPlacesStatus("error");
        setPlacesError(err.message || "No se pudo cargar lugares cercanos.");
      }
    },
    [coords, filters.maxDistanceMeters]
  );

  useEffect(() => {
    if (coords && placesStatus === "idle") loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const submitQuery = useCallback(
    (text) => {
      const trimmed = (text || "").trim();
      setQueryText(trimmed);
      const { option: resolvedOption, freeWords: words } = resolveFoodQuery(trimmed);
      setOption(resolvedOption);
      setFreeWords(words);
      setHistory(
        pushHistory({
          type: "busqueda",
          text: trimmed || resolvedOption.label,
          optionId: resolvedOption.id,
          dayPart: getDayPart(),
        })
      );
      return resolvedOption;
    },
    []
  );

  const pickOption = useCallback((opt) => {
    setQueryText(opt.label);
    setOption(opt);
    setFreeWords([]);
    setHistory(pushHistory({ type: "busqueda", text: opt.label, optionId: opt.id, dayPart: getDayPart() }));
  }, []);

  const placesWithStatus = useMemo(() => enrichWithStatus(rawPlaces), [rawPlaces]);

  const results = useMemo(() => {
    if (!option) return [];
    const matched = filterPlaces(placesWithStatus, { option, freeWords, filters });
    return personalizeAndSort(matched, { history, favorites, prefs, dayPart: getDayPart() });
  }, [placesWithStatus, option, freeWords, filters, history, favorites, prefs]);

  const highlights = useMemo(() => computeHighlights(results), [results]);

  const pickWeightedRandom = useCallback(
    (candidates) => weightedRandomPick(candidates, { history, favorites, prefs, dayPart: getDayPart() }),
    [history, favorites, prefs]
  );

  const anyPlaceHasField = useCallback(
    (field) => placesWithStatus.some((p) => p[field] === "yes" || p[field] === "no"),
    [placesWithStatus]
  );

  const toggleFavorite = useCallback((place) => {
    setFavorites(toggleFavoriteStorage(place));
  }, []);

  const clearHistory = useCallback(() => setHistory(clearHistoryStorage()), []);

  const value = {
    geoStatus: geo.status,
    geoError: geo.error,
    coords,
    usingManualCoords: Boolean(manualCoords),
    requestLocation: geo.retry,
    setManualCoords,

    rawPlaces: placesWithStatus,
    placesStatus,
    placesError,
    loadPlaces,

    queryText,
    option,
    freeWords,
    submitQuery,
    pickOption,
    quickOptions: QUICK_OPTIONS,

    filters,
    setFilters,
    results,
    highlights,
    anyPlaceHasField,
    pickWeightedRandom,

    prefs,
    setPrefs,
    favorites,
    toggleFavorite,
    history,
    clearHistory,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
