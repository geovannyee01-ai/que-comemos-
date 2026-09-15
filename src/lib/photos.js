// Real photos only, sourced from what the place itself published on
// OpenStreetMap/Wikidata — never a stock image or an AI-generated one. Most
// places simply won't have one, and that's fine: the UI falls back to the
// emoji visual instead of pretending.
//
// Three tags can lead to a photo, checked in order of directness:
//   1. `image`           — usually a direct URL to a photo.
//   2. `wikimedia_commons` — a "File:xxx.jpg" reference on Commons.
//   3. `wikidata`         — a Q-id; its P18 (image) claim points to a
//      Commons file, resolved via a batched Wikidata API call.
const COMMONS_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

function commonsFileUrl(fileName, width = 480) {
  const clean = fileName.replace(/^File:/i, "").trim();
  if (!clean) return null;
  return `${COMMONS_FILE_PATH}${encodeURIComponent(clean)}?width=${width}`;
}

// Synchronous — no network call. Covers the two tags that already contain
// enough information to build a working image URL on their own.
export function directPhotoUrl(tags) {
  if (!tags) return null;
  const image = tags.image;
  if (image && /^https?:\/\//i.test(image)) return image;

  const commons = tags.wikimedia_commons;
  if (commons && /^File:/i.test(commons)) return commonsFileUrl(commons);

  return null;
}

const WIKIDATA_ENDPOINT = "https://www.wikidata.org/w/api.php";
const CHUNK_SIZE = 50; // wbgetentities' own limit per request

// Batch-resolves Wikidata Q-ids to a Commons photo URL via each entity's P18
// (image) claim. Returns a Map<qid, url> containing only the ids that
// actually have a P18 image — callers should keep whatever they had for the
// rest.
export async function resolveWikidataPhotos(qids, { signal } = {}) {
  const unique = [...new Set(qids)].filter(Boolean);
  const result = new Map();

  for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
    const chunk = unique.slice(i, i + CHUNK_SIZE);
    const url = `${WIKIDATA_ENDPOINT}?action=wbgetentities&ids=${chunk.join("|")}&props=claims&format=json&origin=*`;
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) continue;
      const json = await res.json();
      for (const qid of chunk) {
        const claims = json.entities?.[qid]?.claims?.P18;
        const fileName = claims?.[0]?.mainsnak?.datavalue?.value;
        if (fileName) {
          const photoUrl = commonsFileUrl(fileName);
          if (photoUrl) result.set(qid, photoUrl);
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      // Best effort — a batch failing just means those places keep the emoji fallback.
    }
  }

  return result;
}
