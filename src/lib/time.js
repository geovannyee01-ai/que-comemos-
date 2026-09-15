const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// OSM opening_hours weekday order starts on Monday.
export const OSM_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function now() {
  return new Date();
}

export function dayName(date = new Date()) {
  return DAY_NAMES[date.getDay()];
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
}

// Buckets the current hour into a meal moment, driving which quick options
// and copy the Home screen leads with (mañana → desayuno, etc).
export function dayPart(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5 && h < 11) return "manana";
  if (h >= 11 && h < 15) return "mediodia";
  if (h >= 15 && h < 18.5) return "tarde";
  if (h >= 18.5 && h < 23.5) return "noche";
  return "madrugada";
}

export const DAY_PART_LABEL = {
  manana: "Buenos días",
  mediodia: "Buenas tardes",
  tarde: "Buenas tardes",
  noche: "Buenas noches",
  madrugada: "Buenas noches",
};

export const DAY_PART_HINT = {
  manana: "Es hora del desayuno — panaderías y cafés cerca de ti.",
  mediodia: "Hora de almuerzo — restaurantes y comida rápida abiertos ahora.",
  tarde: "Hora de la merienda — cafés y postres para la tarde.",
  noche: "Hora de la cena — te mostramos lo que sigue abierto hasta tarde.",
  madrugada: "Es madrugada — solo te mostramos lugares que de verdad están abiertos ahora.",
};
