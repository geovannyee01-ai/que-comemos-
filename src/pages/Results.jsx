import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SlidersHorizontal, Map as MapIcon, Flame } from "lucide-react";
import { Screen } from "../components/Shell";
import { RestaurantCard } from "../components/RestaurantCard";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { useAppState } from "../state/AppState";

export default function Results() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hungryMode = params.get("modo") === "ya";
  const { option, queryText, placesStatus, placesError, loadPlaces, results, highlights, coords, geoStatus } =
    useAppState();

  useEffect(() => {
    if (!option && coords) navigate("/", { replace: true });
  }, [option, coords, navigate]);

  const badgeKeysFor = (id) => Object.entries(highlights).filter(([, v]) => v === id).map(([k]) => k);

  let body;
  if (geoStatus !== "granted" && !coords) {
    body = <EmptyState title="Necesitamos tu ubicación" hint="Vuelve al inicio y permite el acceso a tu ubicación." />;
  } else if (placesStatus === "loading" || placesStatus === "idle") {
    body = <LoadingState />;
  } else if (placesStatus === "error") {
    body = <ErrorState message={placesError} onRetry={() => loadPlaces()} />;
  } else if (results.length === 0) {
    body = (
      <EmptyState
        title="No encontramos opciones que cumplan todo"
        hint="Prueba ampliando la distancia, el tiempo máximo, o apagando 'abierto ahora' en Filtros."
      />
    );
  } else {
    body = (
      <div className="px-4 py-4 flex flex-col gap-3">
        {results.map((p) => (
          <RestaurantCard key={p.id} place={p} badgeKeys={badgeKeysFor(p.id)} />
        ))}
      </div>
    );
  }

  return (
    <Screen title={option ? `${option.emoji} ${queryText || option.label}` : "Resultados"} back>
      {hungryMode && (
        <div className="mx-4 mt-3 rounded-xl bg-ember-500 text-white text-sm font-semibold px-4 py-2 flex items-center gap-2">
          <Flame size={16} /> Mostrando lo que puedes comer más rápido, ahora mismo
        </div>
      )}
      {results.length > 0 && (
        <p className="px-4 pt-3 text-sm text-char-800/70 dark:text-char-100/70">
          {option?.emoji} Encontré {results.length} {results.length === 1 ? "opción" : "opciones"} cerca de ti
        </p>
      )}
      <div className="px-4 pt-3 flex gap-2">
        <button
          onClick={() => navigate("/filtros")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-char-100 dark:border-white/10 text-sm font-semibold py-2"
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
        <button
          onClick={() => navigate("/mapa")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-char-100 dark:border-white/10 text-sm font-semibold py-2"
        >
          <MapIcon size={16} /> Ver mapa
        </button>
      </div>
      {body}
    </Screen>
  );
}
