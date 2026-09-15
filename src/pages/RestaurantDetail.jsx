import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Phone, Navigation, Globe, MapPin, Clock, Bike, ShoppingBag, Armchair, Leaf, WheatOff } from "lucide-react";
import { Screen } from "../components/Shell";
import { StatusPill } from "../components/StatusPill";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/States";
import { useAppState } from "../state/AppState";
import { formatDistance } from "../lib/geo";
import { getOpeningStatus } from "../lib/openingHours";

const EMOJI_BY_AMENITY = {
  restaurant: "🍽️", fast_food: "🥡", cafe: "☕", bar: "🍹", pub: "🍺",
  ice_cream: "🍨", food_court: "🍜", bakery: "🥐", pastry: "🍰", confectionery: "🍬",
};

function TagLine({ icon: Icon, value, na = "No disponible" }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={16} className="text-char-800/50 dark:text-char-100/50 shrink-0" />
      <span className={value ? "" : "text-char-800/40 dark:text-char-100/40 italic"}>{value || na}</span>
    </div>
  );
}

function YesNoUnknown({ label, value }) {
  const text = value === "yes" ? "Sí" : value === "no" ? "No" : "No especificado";
  const tone = value === "yes" ? "open" : value === "no" ? "closed" : "warn";
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-char-100 dark:border-white/10 last:border-0">
      <span>{label}</span>
      <Badge tone={tone}>{text}</Badge>
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rawPlaces, favorites, toggleFavorite } = useAppState();

  const place = useMemo(() => {
    const decoded = decodeURIComponent(id);
    const fromLive = rawPlaces.find((p) => p.id === decoded);
    if (fromLive) return fromLive;
    const fromFav = favorites.find((f) => f.id === decoded);
    if (fromFav) return { ...fromFav, openingStatus: getOpeningStatus(fromFav.openingHours) };
    return null;
  }, [id, rawPlaces, favorites]);

  if (!place) {
    return (
      <Screen title="Restaurante" back>
        <EmptyState title="No encontramos este lugar" hint="Puede que ya no esté en tu búsqueda actual." />
      </Screen>
    );
  }

  const isFav = favorites.some((f) => f.id === place.id);
  const mapsUrl = `https://www.openstreetmap.org/directions?from=&to=${place.lat}%2C${place.lon}`;

  return (
    <Screen title={place.name} back>
      <div className="h-40 flex items-center justify-center text-7xl bg-gradient-to-br from-ember-100 to-ember-300 dark:from-ember-900 dark:to-ember-700">
        {EMOJI_BY_AMENITY[place.amenity] || "🍽️"}
      </div>

      <div className="px-4 -mt-6">
        <div className="rounded-2xl bg-white dark:bg-char-800 shadow-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display font-extrabold text-xl">{place.name}</h2>
              <p className="text-sm text-char-800/60 dark:text-char-100/60 capitalize">
                {place.cuisine ? place.cuisine.split(";").join(", ").replace(/_/g, " ") : place.amenity.replace(/_/g, " ")}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(place)}
              className="shrink-0 rounded-full p-2 border border-char-100 dark:border-white/10"
              aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <Heart size={20} className={isFav ? "fill-ember-500 text-ember-500" : ""} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusPill status={place.openingStatus} />
            <Badge>
              <Clock size={12} /> {place.etaMinutes} min · {place.travelMode}
            </Badge>
            <Badge>
              <MapPin size={12} /> {formatDistance(place.distanceMeters)}
            </Badge>
          </div>

          <p className="mt-3 text-xs text-char-800/50 dark:text-char-100/50">
            ⭐ Calificación y 💰 precio: no disponibles todavía — no hay una fuente de datos abierta confiable conectada
            en esta versión.
          </p>
        </div>
      </div>

      <div className="px-4 mt-4 grid grid-cols-2 gap-2">
        <a
          href={place.phone ? `tel:${place.phone}` : undefined}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${
            place.phone ? "bg-char-900 text-white dark:bg-white dark:text-char-900" : "bg-char-100 text-char-800/40 dark:bg-white/5 dark:text-char-100/30 pointer-events-none"
          }`}
        >
          <Phone size={16} /> Llamar
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-ember-500 text-white"
        >
          <Navigation size={16} /> Indicaciones
        </a>
      </div>

      <div className="px-4 mt-5">
        <h3 className="font-semibold text-sm mb-2">Información</h3>
        <div className="rounded-2xl bg-white dark:bg-char-800 shadow-card p-4 flex flex-col gap-2.5">
          <TagLine icon={MapPin} value={place.address} />
          <TagLine icon={Phone} value={place.phone} />
          <TagLine
            icon={Globe}
            value={
              place.website ? (
                <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-ember-600 underline">
                  Sitio web
                </a>
              ) : null
            }
          />
          <TagLine icon={Clock} value={place.openingHours} na="Horario no disponible" />
        </div>
      </div>

      <div className="px-4 mt-5 pb-8">
        <h3 className="font-semibold text-sm mb-2">Delivery, recogida y dieta</h3>
        <div className="rounded-2xl bg-white dark:bg-char-800 shadow-card p-4">
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><Bike size={14}/> Delivery</span>} value={place.delivery} />
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><ShoppingBag size={14}/> Recogida</span>} value={place.takeaway} />
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><Armchair size={14}/> Comer en el local</span>} value={place.dineIn} />
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><Leaf size={14}/> Opción vegetariana</span>} value={place.vegetarian} />
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><Leaf size={14}/> Opción vegana</span>} value={place.vegan} />
          <YesNoUnknown label={<span className="flex items-center gap-1.5"><WheatOff size={14}/> Sin gluten</span>} value={place.glutenFree} />
        </div>
        <p className="text-xs text-char-800/50 dark:text-char-100/50 mt-2">
          Datos de OpenStreetMap. "No especificado" significa que el lugar no publicó ese dato — no que la opción no exista.
        </p>
      </div>
    </Screen>
  );
}
