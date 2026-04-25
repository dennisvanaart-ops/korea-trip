/**
 * search.ts — Wikimedia Commons image search
 *
 * Uses two consecutive API calls:
 *   1. query/list/search  → file titles that match the query
 *   2. query/prop/imageinfo → actual URLs + dimensions for those titles
 *
 * No API key required. Rate-limit friendly: we fetch at most 8 results
 * per query and batch the imageinfo request.
 */

import type { ImageCandidate } from "./types.js";

const WIKI_API = "https://commons.wikimedia.org/w/api.php";
const MAX_RESULTS = 8;

interface WikiSearchHit {
  title: string; // e.g. "File:Gyeongbokgung_Palace.jpg"
  snippet: string;
}

interface WikiImageInfo {
  url: string;
  width: number;
  height: number;
  extmetadata?: {
    ObjectName?: { value: string };
    ImageDescription?: { value: string };
  };
}

async function wikiFetch(params: Record<string, string>): Promise<unknown> {
  const url = new URL(WIKI_API);
  for (const [k, v] of Object.entries({ ...params, format: "json", origin: "*" })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Wikimedia HTTP ${res.status}`);
  return res.json();
}

/** Step 1: full-text search for file pages */
async function searchTitles(query: string): Promise<WikiSearchHit[]> {
  const data = (await wikiFetch({
    action: "query",
    list: "search",
    srsearch: query,
    srnamespace: "6", // File: namespace
    srlimit: String(MAX_RESULTS),
  })) as { query?: { search?: WikiSearchHit[] } };

  return data?.query?.search ?? [];
}

/** Step 2: batch-fetch imageinfo for an array of file titles */
async function fetchImageInfo(
  titles: string[]
): Promise<Map<string, WikiImageInfo>> {
  const data = (await wikiFetch({
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600", // request scaled URL at max 1600px
  })) as {
    query?: {
      pages?: Record<
        string,
        { title: string; imageinfo?: WikiImageInfo[] }
      >;
    };
  };

  const map = new Map<string, WikiImageInfo>();
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0];
    if (info?.url) map.set(page.title, info);
  }
  return map;
}

/** Returns deduplicated candidates from a single search query string */
export async function searchImages(query: string): Promise<ImageCandidate[]> {
  let hits: WikiSearchHit[];
  try {
    hits = await searchTitles(query);
  } catch (err) {
    console.warn(`  ⚠ Wikimedia search failed for "${query}":`, err);
    return [];
  }

  if (hits.length === 0) return [];

  // Only keep JPEG / PNG / WebP files (skip SVG, OGG, PDF, etc.)
  const imageHits = hits.filter((h) =>
    /\.(jpe?g|png|webp)$/i.test(h.title)
  );
  if (imageHits.length === 0) return [];

  let infoMap: Map<string, WikiImageInfo>;
  try {
    infoMap = await fetchImageInfo(imageHits.map((h) => h.title));
  } catch (err) {
    console.warn(`  ⚠ Wikimedia imageinfo failed:`, err);
    return [];
  }

  const candidates: ImageCandidate[] = [];
  for (const hit of imageHits) {
    const info = infoMap.get(hit.title);
    if (!info) continue;

    // Prefer the scaled (iiurlwidth) URL but fall back to original
    const url = info.url;

    const rawTitle =
      info.extmetadata?.ObjectName?.value ||
      info.extmetadata?.ImageDescription?.value ||
      hit.title.replace(/^File:/, "").replace(/\.[^.]+$/, "").replace(/_/g, " ");

    // Strip HTML tags that sometimes appear in extmetadata
    const title = rawTitle.replace(/<[^>]*>/g, "").trim();

    candidates.push({
      url,
      source: "Wikimedia Commons",
      title,
      widthPx: info.width,
      heightPx: info.height,
    });
  }

  return candidates;
}

/**
 * Run multiple queries and merge results, removing URL duplicates.
 * Earlier queries (more specific) take precedence.
 */
export async function searchAllQueries(
  queries: string[]
): Promise<ImageCandidate[]> {
  const seen = new Set<string>();
  const merged: ImageCandidate[] = [];

  for (const query of queries) {
    const results = await searchImages(query);
    for (const c of results) {
      if (!seen.has(c.url)) {
        seen.add(c.url);
        merged.push(c);
      }
    }
    // Small politeness delay between requests
    await new Promise((r) => setTimeout(r, 300));
  }

  return merged;
}
