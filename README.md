# ¿Qué Comemos Hoy? 🍔

Asistente para decidir dónde comer — no un directorio de restaurantes. Combina
qué quieres comer + dónde estás + qué está abierto ahora mismo + qué tan rápido
puedes conseguirlo.

## Cómo funciona (arquitectura de datos)

Esta primera versión usa **OpenStreetMap** como fuente de datos, sin necesidad
de ninguna API key:

- **Overpass API** (`overpass-api.de`, con `overpass.kumi.systems` como
  respaldo) para encontrar restaurantes, comida rápida, cafés, bares y
  panaderías cerca de la ubicación del usuario, con sus etiquetas reales:
  nombre, tipo de cocina, horario (`opening_hours`), teléfono, sitio web,
  dirección y — cuando el lugar lo publicó — delivery, recogida y opciones
  vegetarianas/veganas/sin gluten.
- **`opening_hours`** se interpreta con un parser propio
  (`src/lib/openingHours.js`) que cubre la sintaxis más común de OSM y
  calcula si el lugar está abierto *ahora mismo*, a qué hora cierra o cuándo
  vuelve a abrir. Si el horario no viene en los datos o usa una sintaxis que
  no reconocemos, la app lo dice explícitamente ("Horario no disponible") en
  vez de inventarlo.
- **Distancia y tiempo estimado** se calculan con la ubicación real del
  usuario (línea recta + una velocidad promedio caminando/en auto) — siempre
  se muestran como estimado, no como una promesa de ruta real.
- **Calificación y precio no están disponibles todavía.** OpenStreetMap no
  tiene una fuente pública confiable para esto, así que la app lo indica
  claramente en vez de simularlo. La arquitectura (`src/lib/overpass.js`,
  `src/state/AppState.jsx`) está pensada para poder sumar más adelante una
  fuente con esos datos (Google Places, Yelp, un agregador de delivery del
  país) sin rehacer el resto de la app.

## Pantallas

Inicio · Resultados · Mapa · Detalle del restaurante · Filtros · Favoritos ·
Perfil/Preferencias · Historial — con dos atajos destacados en Inicio:
**🔥 Tengo hambre YA** (lo más rápido y abierto ahora) y **🎲 Sorpréndeme**
(elige uno al azar entre lo disponible).

Favoritos, preferencias e historial de búsqueda se guardan en el propio
dispositivo (`localStorage`) — no hay cuenta de usuario ni backend propio en
esta versión.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción a dist/
npm run preview   # sirve el build de producción
```

Requiere que el navegador permita geolocalización y pueda alcanzar
`overpass-api.de` y `tile.openstreetmap.org` (ambos por HTTPS, sin API key).
Si el permiso de ubicación se niega, la pantalla de inicio permite escribir
latitud/longitud manualmente.

## Stack

React + React Router + Vite + Tailwind CSS · Leaflet/React-Leaflet para el
mapa · lucide-react para iconos.
