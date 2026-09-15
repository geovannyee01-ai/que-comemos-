// Quick options shown on the Home screen, each mapped to real OSM tags so the
// Overpass query can actually filter on them — no invented categories.
// `amenities` are OSM amenity/shop primary tags; `cuisineWords` match against
// the (semicolon-separated) OSM `cuisine` tag; `keywords` are what we look for
// in the free-text box and in a place's own name as a last-resort match.
export const QUICK_OPTIONS = [
  {
    id: "hamburguesa",
    emoji: "🍔",
    label: "Hamburguesa",
    amenities: ["fast_food", "restaurant"],
    cuisineWords: ["burger"],
    keywords: ["hamburguesa", "burger", "hamburguesas"],
  },
  {
    id: "pizza",
    emoji: "🍕",
    label: "Pizza",
    amenities: ["restaurant", "fast_food"],
    cuisineWords: ["pizza"],
    keywords: ["pizza", "pizzas"],
  },
  {
    id: "mexicana",
    emoji: "🌮",
    label: "Mexicana",
    amenities: ["restaurant", "fast_food"],
    cuisineWords: ["mexican", "taco", "tex-mex", "tex_mex"],
    keywords: ["mexicana", "mexicano", "taco", "tacos", "burrito", "burritos", "quesadilla"],
  },
  {
    id: "sushi",
    emoji: "🍣",
    label: "Sushi",
    amenities: ["restaurant"],
    cuisineWords: ["sushi", "japanese"],
    keywords: ["sushi", "japones", "japonesa", "ramen", "poke"],
  },
  {
    id: "pollo",
    emoji: "🍗",
    label: "Pollo",
    amenities: ["restaurant", "fast_food"],
    cuisineWords: ["chicken"],
    keywords: ["pollo", "chicken", "alitas", "fried_chicken"],
  },
  {
    id: "pasta",
    emoji: "🍝",
    label: "Pasta",
    amenities: ["restaurant"],
    cuisineWords: ["italian", "pasta"],
    keywords: ["pasta", "italiana", "italiano", "spaghetti", "lasagna"],
  },
  {
    id: "saludable",
    emoji: "🥗",
    label: "Saludable",
    amenities: ["restaurant", "cafe"],
    cuisineWords: ["vegetarian", "vegan", "salad", "healthy", "juice"],
    keywords: ["saludable", "ensalada", "ensaladas", "vegetariano", "vegano", "fit", "healthy"],
  },
  {
    id: "desayuno",
    emoji: "🍳",
    label: "Desayuno",
    amenities: ["cafe", "restaurant", "fast_food"],
    shops: ["bakery"],
    cuisineWords: ["breakfast", "brunch"],
    keywords: ["desayuno", "desayunos", "brunch", "panaderia", "panadería"],
  },
  {
    id: "postre",
    emoji: "🍰",
    label: "Postre",
    amenities: ["cafe", "ice_cream"],
    primaryAmenities: ["ice_cream"],
    shops: ["bakery", "pastry", "confectionery"],
    cuisineWords: ["dessert", "ice_cream", "cake", "bakery"],
    keywords: ["postre", "postres", "helado", "helados", "dulce", "torta", "pastel"],
  },
  {
    id: "cafe",
    emoji: "☕",
    label: "Café",
    amenities: ["cafe"],
    primaryAmenities: ["cafe"],
    cuisineWords: ["coffee_shop"],
    keywords: ["cafe", "café", "coffee", "cafeteria", "cafetería"],
  },
  {
    id: "comida_rapida",
    emoji: "🥡",
    label: "Comida rápida",
    amenities: ["fast_food"],
    primaryAmenities: ["fast_food"],
    cuisineWords: [],
    keywords: ["comida rapida", "comida rápida", "fast food", "rapido", "rápido"],
  },
  {
    id: "bares",
    emoji: "🍸",
    label: "Bares y música",
    amenities: ["bar", "pub", "nightclub"],
    primaryAmenities: ["bar", "pub", "nightclub"],
    cuisineWords: [],
    keywords: [
      "bar", "bares", "trago", "tragos", "copas", "discoteca", "disco",
      "vida nocturna", "musica en vivo", "música en vivo", "rumba", "party", "club",
    ],
  },
  {
    id: "cualquiera",
    emoji: "🍽️",
    label: "Lo que sea",
    amenities: ["restaurant", "fast_food", "cafe", "bar", "pub", "nightclub", "ice_cream", "food_court"],
    cuisineWords: [],
    keywords: [],
  },
];

function stripAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
export function normalizeText(s) {
  return stripAccents(String(s || "").toLowerCase().trim());
}

const STOPWORDS = new Set([
  "quiero", "quisiera", "tengo", "ganas", "de", "comer", "algo", "un", "una", "unos", "unas",
  "hoy", "por favor", "me", "provoca", "se", "antoja", "el", "la", "los", "las", "y", "con",
]);

// Best-effort resolver: if the free text names a known quick option, reuse its
// real OSM filters. Otherwise fall back to matching whatever meaningful words
// are left against a place's name/cuisine tag directly (still real data — we
// just widen the search instead of pretending to understand the request).
export function resolveFoodQuery(rawText) {
  const text = normalizeText(rawText);
  if (!text) return { option: QUICK_OPTIONS.find((o) => o.id === "cualquiera"), freeWords: [] };

  for (const option of QUICK_OPTIONS) {
    if (option.id === "cualquiera") continue;
    if (option.keywords.some((k) => text.includes(normalizeText(k)))) {
      return { option, freeWords: [] };
    }
  }

  const words = text
    .split(/[\s,.!?]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  return { option: QUICK_OPTIONS.find((o) => o.id === "cualquiera"), freeWords: words };
}

export function matchesFreeWords(place, freeWords) {
  if (!freeWords || freeWords.length === 0) return true;
  const haystack = normalizeText(`${place.name || ""} ${place.cuisine || ""}`);
  return freeWords.some((w) => haystack.includes(w));
}

export function matchesFoodOption(place, option) {
  if (!option || option.id === "cualquiera") return true;
  const cuisineList = normalizeText(place.cuisine)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const cuisineHit = (option.cuisineWords || []).some((w) => cuisineList.includes(normalizeText(w)));
  const nameHit = (option.keywords || []).some((k) => normalizeText(place.name).includes(normalizeText(k)));
  const shopHit = (option.shops || []).includes(place.amenity);
  const primaryHit = (option.primaryAmenities || []).includes(place.amenity);
  return cuisineHit || nameHit || shopHit || primaryHit;
}
