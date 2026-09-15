import { Link } from "react-router-dom";
import { Heart, MapPin, Clock, Bike, ShoppingBag } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Badge, HIGHLIGHT_META } from "./Badge";
import { formatDistance } from "../lib/geo";
import { useAppState } from "../state/AppState";

const EMOJI_BY_AMENITY = {
  restaurant: "🍽️",
  fast_food: "🥡",
  cafe: "☕",
  bar: "🍹",
  pub: "🍺",
  ice_cream: "🍨",
  food_court: "🍜",
  bakery: "🥐",
  pastry: "🍰",
  confectionery: "🍬",
};

export function RestaurantCard({ place, badgeKeys = [], onOpenMap }) {
  const { favorites, toggleFavorite } = useAppState();
  const isFav = favorites.some((f) => f.id === place.id);
  const emoji = EMOJI_BY_AMENITY[place.amenity] || "🍽️";

  return (
    <div className="rounded-2xl border border-char-100 bg-white shadow-card overflow-hidden dark:bg-char-800 dark:border-white/10">
      <Link to={`/restaurante/${encodeURIComponent(place.id)}`} className="block">
        <div className="h-28 flex items-center justify-center text-5xl bg-gradient-to-br from-ember-100 to-ember-300 dark:from-ember-900 dark:to-ember-700">
          {emoji}
        </div>
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
      </div>
    </div>
  );
}
