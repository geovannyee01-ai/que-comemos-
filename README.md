# ¿Qué Comemos Hoy? 🍔

Asistente para decidir dónde comer (o tomar algo) — no un directorio de
restaurantes. Combina qué quieres + dónde estás + qué está abierto ahora
mismo + qué tan rápido puedes conseguirlo. Además de comida, incluye
**bares, pubs y discotecas** — útil de noche cuando lo que buscas es un lugar
con música en vivo, no una cena.

**En vivo:** https://geovannyee01-ai.github.io/que-comemos-/ (se publica solo
con cada push a `main`, ver [Despliegue](#despliegue)).

## Cómo funciona (arquitectura de datos)

Esta primera versión usa **OpenStreetMap** como fuente de datos, sin necesidad
de ninguna API key:

- **Overpass API** (`overpass-api.de`, con `overpass.kumi.systems` como
  respaldo) para encontrar restaurantes, comida rápida, cafés, panaderías,
  bares, pubs y discotecas cerca de la ubicación del usuario, con sus
  etiquetas reales: nombre, tipo de cocina, horario (`opening_hours`),
  teléfono (con botón directo para llamar), sitio web, dirección y — cuando
  el lugar lo publicó — delivery, recogida, música en vivo y opciones
  vegetarianas/veganas/sin gluten.
- **Fotos reales**, nunca inventadas (`src/lib/photos.js`): si el lugar tiene
  las etiquetas `image`, `wikimedia_commons` o `wikidata` en OpenStreetMap,
  se muestra esa foto real (Wikidata se resuelve vía su API pública, en lote,
  sin API key). La mayoría de los lugares no tienen foto publicada — en ese
  caso se muestra el ícono de categoría en vez de una imagen genérica o de
  stock.
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

## Aprendizaje de preferencias

`src/lib/personalization.js` reordena los resultados según lo que el propio
usuario ha guardado y buscado en su dispositivo — un puntaje heurístico
transparente, no un modelo de machine learning:

- Un lugar guardado como favorito, o que comparte cocina/categoría con tus
  favoritos, sube en la lista.
- Las comidas marcadas como favoritas en Perfil, y lo que más buscas en el
  historial (incluso cruzado con la hora del día — p. ej. si sueles pedir
  sushi de noche), suman puntos.
- Las restricciones alimentarias del Perfil dan un empujón suave a los
  lugares que sí las cumplen (sin ocultar el resto — para eso están los
  Filtros, que si excluyen).

Ese puntaje se traduce en un "bono" de minutos equivalentes en el orden
final: puede hacer que tu sushi favorito le gane a una hamburguesa 3 minutos
más rápida, pero nunca a una opción real y notoriamente más cercana o
rápida — sigue siendo honesto con el tiempo/distancia reales. **🎲
Sorpréndeme** usa el mismo puntaje como peso en una elección aleatoria, así
que no deja de ser una sorpresa, pero pesa un poco hacia lo que sueles
elegir. Cuando un lugar se destaca así, la tarjeta muestra la insignia
❤️ "Como te gusta" y la razón (p. ej. "Lo buscas seguido").

Todo esto vive solo en `localStorage` de este navegador — no hay cuenta ni
servidor que junte estos datos.

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

## Despliegue

`.github/workflows/deploy.yml` compila la app y la publica en GitHub Pages
automáticamente en cada push a `main`. Usa `HashRouter` (URLs con `/#/...`)
porque Pages es hosting estático puro, sin reglas de redirección en el
servidor — así una recarga directa en `/#/mapa` sigue funcionando.

**Paso único manual, la primera vez:** en GitHub, ve a este repositorio →
**Settings → Pages** → en "Build and deployment" → "Source" elige
**GitHub Actions** (en vez de "Deploy from a branch"). Después de eso cada
push a `main` publica solo, sin volver a tocar nada.

## Stack

React + React Router + Vite + Tailwind CSS · Leaflet/React-Leaflet para el
mapa · lucide-react para iconos.
