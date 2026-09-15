import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Flame, Shuffle, Loader2, LocateFixed } from "lucide-react";
import { useAppState } from "../state/AppState";
import { QuickOptionButton } from "../components/QuickOptionButton";
import { BottomNav } from "../components/Shell";
import { dayPart, DAY_PART_LABEL, DAY_PART_HINT, formatTime, dayName } from "../lib/time";
import { filterPlaces, sortByFastest, pickRandom, DEFAULT_FILTERS } from "../lib/ranking";
import { QUICK_OPTIONS } from "../lib/foodTypes";
import { isValidLatLon } from "../lib/geo";

function LocationGate() {
  const { geoStatus, geoError, requestLocation, setManualCoords } = useAppState();
  const [showManual, setShowManual] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  if (geoStatus === "granted") return null;

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-ember-200 bg-ember-50 dark:bg-ember-900/20 dark:border-ember-800 p-4">
      <div className="flex items-start gap-3">
        <MapPin className="text-ember-500 shrink-0 mt-0.5" size={22} />
        <div className="flex-1">
          <p className="font-semibold text-sm text-char-900 dark:text-char-50">
            {geoStatus === "prompting" && "Buscando tu ubicación…"}
            {geoStatus === "denied" && "No tenemos permiso de ubicación"}
            {geoStatus === "error" && "No pudimos obtener tu ubicación"}
            {geoStatus === "unsupported" && "Tu navegador no soporta ubicación"}
            {geoStatus === "idle" && "Necesitamos tu ubicación"}
          </p>
          <p className="text-xs text-char-800/70 dark:text-char-100/70 mt-1">
            {geoStatus === "prompting"
              ? "Acepta el permiso del navegador para mostrarte lugares cerca de ti."
              : geoError || "Actívala para encontrar lugares cerca de ti, o ingrésala manualmente."}
          </p>
          {geoStatus === "prompting" ? (
            <Loader2 className="animate-spin text-ember-500 mt-2" size={18} />
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-1.5 rounded-full bg-ember-500 text-white text-xs font-semibold px-3 py-1.5"
              >
                <LocateFixed size={14} /> Reintentar
              </button>
              <button
                onClick={() => setShowManual((s) => !s)}
                className="rounded-full border border-ember-300 text-ember-700 dark:text-ember-300 text-xs font-semibold px-3 py-1.5"
              >
                Ingresar ubicación manualmente
              </button>
            </div>
          )}
          {showManual && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const la = parseFloat(lat);
                const lo = parseFloat(lon);
                if (isValidLatLon(la, lo)) setManualCoords({ lat: la, lon: lo });
              }}
            >
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitud"
                inputMode="decimal"
                className="w-24 rounded-lg border border-char-100 px-2 py-1.5 text-xs dark:bg-char-800"
              />
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="Longitud"
                inputMode="decimal"
                className="w-24 rounded-lg border border-char-100 px-2 py-1.5 text-xs dark:bg-char-800"
              />
              <button type="submit" className="rounded-lg bg-char-900 text-white text-xs font-semibold px-3">
                Usar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    coords,
    geoStatus,
    rawPlaces,
    placesStatus,
    loadPlaces,
    submitQuery,
    pickOption,
    filters,
  } = useAppState();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(null); // "hungry" | "surprise" | null

  const part = useMemo(() => dayPart(), []);
  const now = useMemo(() => new Date(), []);

  const goToResults = (opt) => {
    if (opt) pickOption(opt);
    navigate("/resultados");
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    submitQuery(text);
    navigate("/resultados");
  };

  async function ensurePlaces() {
    if (placesStatus !== "ready" || rawPlaces.length === 0) {
      await loadPlaces();
    }
  }

  const handleHungryNow = async () => {
    setBusy("hungry");
    await ensurePlaces();
    pickOption(QUICK_OPTIONS.find((o) => o.id === "cualquiera"));
    navigate("/resultados?modo=ya");
    setBusy(null);
  };

  const handleSurprise = async () => {
    setBusy("surprise");
    await ensurePlaces();
    const cualquiera = QUICK_OPTIONS.find((o) => o.id === "cualquiera");
    const matched = sortByFastest(
      filterPlaces(rawPlaces, { option: cualquiera, freeWords: [], filters: { ...DEFAULT_FILTERS, openNowOnly: true } })
    );
    const pick = pickRandom(matched.length ? matched : rawPlaces);
    setBusy(null);
    if (pick) navigate(`/restaurante/${encodeURIComponent(pick.id)}`);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <div className="px-5 pt-8 pb-2">
        <p className="text-sm font-medium text-char-800/60 dark:text-char-100/60">
          {DAY_PART_LABEL[part]} · {dayName(now)} {formatTime(now)}
          {coords && geoStatus === "granted" && (
            <span className="inline-flex items-center gap-1 ml-2 text-ember-600 dark:text-ember-400">
              <MapPin size={13} /> ubicación detectada
            </span>
          )}
        </p>
        <h1 className="font-display font-extrabold text-3xl mt-1 leading-tight">¿Qué quieres comer hoy? 🍔</h1>
        <p className="text-sm text-char-800/60 dark:text-char-100/60 mt-1">{DAY_PART_HINT[part]}</p>
      </div>

      <LocationGate />

      <form onSubmit={handleSubmit} className="px-5 mt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-char-100 dark:border-white/10 bg-white dark:bg-char-800 px-4 py-3 shadow-card">
          <Search size={18} className="text-char-800/40 dark:text-char-100/40 shrink-0" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe lo que tienes ganas de comer…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button type="submit" className="text-ember-500 font-semibold text-sm shrink-0" disabled={!text.trim()}>
            Buscar
          </button>
        </div>
      </form>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_OPTIONS.filter((o) => o.id !== "cualquiera").map((o) => (
            <QuickOptionButton key={o.id} option={o} onClick={goToResults} />
          ))}
        </div>
        <div className="mt-3">
          <QuickOptionButton
            option={QUICK_OPTIONS.find((o) => o.id === "cualquiera")}
            onClick={goToResults}
          />
        </div>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-3">
        <button
          onClick={handleHungryNow}
          disabled={busy !== null}
          className="animate-qch-pulse flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ember-500 to-ember-600 text-white font-bold py-4 shadow-lg disabled:opacity-70"
        >
          {busy === "hungry" ? <Loader2 className="animate-spin" size={20} /> : <Flame size={20} />}
          🔥 Tengo hambre YA
        </button>
        <button
          onClick={handleSurprise}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-char-900 dark:border-white text-char-900 dark:text-white font-bold py-4 disabled:opacity-70"
        >
          {busy === "surprise" ? <Loader2 className="animate-spin" size={20} /> : <Shuffle size={20} />}
          🎲 Sorpréndeme
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
