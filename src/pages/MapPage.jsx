import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Screen } from "../components/Shell";
import { StatusPill } from "../components/StatusPill";
import { EmptyState } from "../components/States";
import { useAppState } from "../state/AppState";
import { formatDistance } from "../lib/geo";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const userIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#F4511E;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points }) {
  const map = useMap();
  useMemo(() => {
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    }
  }, [points, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { coords, results, option, rawPlaces } = useAppState();
  const places = option ? results : rawPlaces;

  if (!coords) {
    return (
      <Screen title="Mapa" back>
        <EmptyState title="Necesitamos tu ubicación" hint="Vuelve al inicio y permite el acceso a tu ubicación." />
      </Screen>
    );
  }

  const points = [[coords.lat, coords.lon], ...places.map((p) => [p.lat, p.lon])];

  return (
    <Screen title="Mapa" back noBottomPad>
      <div className="h-[calc(100vh-56px)]">
        <MapContainer center={[coords.lat, coords.lon]} zoom={15} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          <Marker position={[coords.lat, coords.lon]} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
          {places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={defaultIcon}>
              <Popup minWidth={200}>
                <div className="text-sm">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-char-800/60 capitalize">
                    {p.cuisine ? p.cuisine.split(";")[0].replace(/_/g, " ") : p.amenity.replace(/_/g, " ")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <StatusPill status={p.openingStatus} compact />
                  </div>
                  <div className="mt-1 text-xs">
                    {formatDistance(p.distanceMeters)} · {p.etaMinutes} min ({p.travelMode})
                  </div>
                  <button
                    onClick={() => navigate(`/restaurante/${encodeURIComponent(p.id)}`)}
                    className="mt-2 w-full rounded-lg bg-ember-500 text-white text-xs font-semibold py-1.5"
                  >
                    Ver restaurante
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Screen>
  );
}
