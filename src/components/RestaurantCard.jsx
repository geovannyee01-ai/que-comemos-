import { Link } from "react-router-dom";
import { Heart, MapPin, Clock, Bike, ShoppingBag, Phone, Music } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Badge, HIGHLIGHT_META } from "./Badge";
import { PlacePhoto } from "./PlacePhoto";
import { formatDistance } from "../lib/geo";
import { useAppState } from "../state/AppState";

export function RestaurantCard({ place, badgeKeys = [], onOpenMap }) {
  const { favorites, toggleFavorite } = useAppState();
  const isFav = favorites.some((f) => f.id === place.id);

  return (
    <div className="rounded-2xl border border-char-100 bg-white shadow-card overflow-hidden dark:bg-char-800 dark:border-white/10">
      <Link to={`/restaurante/${encodeURIComponent(place.id)}`} className="block">
        <PlacePhoto place={place} className="h-28 w-full" emojiClassName="text-5xl" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/restaurante/${encodeURIComponent(place.id)}`} className="min-w-0">
            <h3 className="font-display font-bold text-lg text-char-900 dark:text-char-50 truncate">{place.name}</h3>
            <p className="text-sm text-char-800/60 dark:text-char-100/60 capitalize">
              {place.cuisine ? place.cuisine.split(";")[0].replace(/_/g, " ") : place.amenity.replace(/_/g, " ")}
            </p>
          </Link>
          <button
            onClick={() => toggleFavorite(place)}
            aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
            className="shrink-0 rounded-full p-2 hover:bg-ember-50 dark:hover:bg-white/5"
          >
            <Heart size={20} className={isFav ? "fill-ember-500 text-ember-500" : "text-char-800/40 dark:text-char-100/40"} />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusPill status={place.openingStatus} />
          <Badge>
            <Clock size={12} /> {place.etaMinutes} min · {place.travelMode}
          </Badge>
          <Badge>
            <MapPin size={12} /> {formatDistance(place.distanceMeters)}
          </Badge>
          {place.delivery === "yes" && (
            <Badge tone="neutral">
              <Bike size={12} /> Delivery
            </Badge>
          )}
          {place.takeaway === "yes" && (
            <Badge tone="neutral">
              <ShoppingBag size={12} /> Recogida
            </Badge>
          )}
          {place.liveMusic === "yes" && (
            <Badge tone="neutral">
              <Music size={12} /> Música en vivo
            </Badge>
          )}
        </div>

        {badgeKeys.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badgeKeys.map((key) => (
              <Badge key={key} tone="ember">
                {HIGHLIGHT_META[key].emoji} {HIGHLIGHT_META[key].label}
              </Badge>
            ))}
          </div>
        )}

        {place.affinity?.reasons?.length > 0 && (
          <p className="mt-2 text-xs text-char-800/50 dark:text-char-100/50">💡 {place.affinity.reasons[0]}</p>
        )}

        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-char-900 text-white dark:bg-white dark:text-char-900 text-sm font-semibold py-2.5"
          >
            <Phone size={15} /> Llamar · {place.phone}
          </a>
        )}
      </div>
    </div>
  );
}
