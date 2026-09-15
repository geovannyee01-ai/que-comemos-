import { useCallback, useEffect, useState } from "react";

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Straight-line estimate, not routed — always labelled as "estimado" in the
// UI since we have no real routing/traffic API wired in. Walking under 1.2km,
// otherwise a city-driving speed; both are rough averages, not a promise.
const WALK_SPEED_MPM = 75; // ~4.5 km/h
const DRIVE_SPEED_MPM = 400; // ~24 km/h city average

export function estimateMinutes(meters) {
  if (meters <= 1200) return Math.max(1, Math.round(meters / WALK_SPEED_MPM));
  return Math.max(2, Math.round(meters / DRIVE_SPEED_MPM));
}

export function travelMode(meters) {
  return meters <= 1200 ? "a pie" : "en auto";
}

const POSITION_OPTIONS = { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 };

export function useGeolocation() {
  const [state, setState] = useState({
    status: "idle", // idle | prompting | granted | denied | unsupported | error
    coords: null,
    error: null,
  });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "unsupported", coords: null, error: "Este navegador no soporta geolocalización." });
      return;
    }
    setState((s) => ({ ...s, status: "prompting" }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "granted",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy },
          error: null,
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          coords: null,
          error: err.message || "No se pudo obtener tu ubicación.",
        });
      },
      POSITION_OPTIONS
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, retry: request };
}

// Manual override — lets someone without location permission (or testing on
// desktop) drop a pin / type coordinates instead of being stuck.
export function isValidLatLon(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}
