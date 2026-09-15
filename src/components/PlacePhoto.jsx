import { useState } from "react";

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

export function placeEmoji(amenity) {
  return EMOJI_BY_AMENITY[amenity] || "🍽️";
}

// Shows the place's real photo (from OSM's image/wikimedia_commons/wikidata
// tags) when there is one, otherwise the emoji visual — never a stock photo
// standing in for a place that didn't publish one.
export function PlacePhoto({ place, className, emojiClassName }) {
  const [failed, setFailed] = useState(false);
  const emoji = placeEmoji(place.amenity);

  if (!place.photoUrl || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-ember-100 to-ember-300 dark:from-ember-900 dark:to-ember-700 ${className || ""}`}
      >
        <span className={emojiClassName}>{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={place.photoUrl}
      alt={place.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className || ""}`}
    />
  );
}
