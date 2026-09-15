import { useMemo } from "react";
import { Screen } from "../components/Shell";
import { RestaurantCard } from "../components/RestaurantCard";
import { EmptyState } from "../components/States";
import { useAppState } from "../state/AppState";
import { getOpeningStatus } from "../lib/openingHours";
import { haversineMeters, estimateMinutes, travelMode } from "../lib/geo";

export default function Favorites() {
  const { favorites, coords } = useAppState();

  const enriched = useMemo(
    () =>
      favorites.map((f) => {
        const distanceMeters = coords ? haversineMeters(coords, { lat: f.lat, lon: f.lon }) : f.distanceMeters;
        return {
          ...f,
          openingStatus: getOpeningStatus(f.openingHours),
          distanceMeters,
          etaMinutes: coords ? estimateMinutes(distanceMeters) : f.etaMinutes,
          travelMode: coords ? travelMode(distanceMeters) : f.travelMode,
        };
      }),
    [favorites, coords]
  );

  return (
    <Screen title="Favoritos">
      {enriched.length === 0 ? (
        <EmptyState title="Aún no tienes favoritos" hint="Toca el corazón en cualquier lugar para guardarlo aquí." />
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {enriched.map((p) => (
            <RestaurantCard key={p.id} place={p} />
          ))}
        </div>
      )}
    </Screen>
  );
}
