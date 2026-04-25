/**
 * search.ts — multi-source image search
 *
 * Strategy A — Wikimedia Commons (for landmarks, nature, transport)
 *   No API key, CC-licensed images.
 *
 * Strategy B — Web search via DuckDuckGo + og:image extraction (for cafés, restaurants, hotels)
 *   1. DuckDuckGo HTML search → candidate page URLs
 *   2. Fetch each page → extract og:image / twitter:image meta tag
 *   3. The result is the venue's own social-sharing photo (their best shot of their place)
 *
 * Optional Strategy C — Naver Image API (for Korean venues, requires env vars)
 *   Set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in your environment.
 */

import type { ImageCandidate, SourceType } from "./types.js";

// ── Constants ────────────────────────────────────────────────────────────────

const WIKI_API = "https://commons.wikimedia.org/w/api.php";
const WIKI_MAX = 8;
const WEB_PAGE_MAX = 6;       // max pages to fetch og:image from
const WEB_TIMEOUT_MS = 8_000; // per-fetch timeout

// ── Helpers ──────────────────────────────────────────────────────────────────

async function safeFetch(url: string, init: RequestInit = {}): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), WEB_TIMEOUT_MS);
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    clearTimeout(tid);
    return res;
  } catch {
    return null;
  }
}

function guessSourceType(url: string): SourceType {
  if (url.includes("wikimedia.org") || url.includes("wikipedia.org")) return "wikimedia";
  if (url.includes("booking.com")) return "booking";
  if (url.includes("instagram.com") || url.includes("cdninstagram.com")) return "instagram";
  if (url.includes("naver.com") || url.includes("pstatic.net")) return "naver";
  if (url.includes("google.com") || url.includes("googleusercontent.com")) return "google";
  if (
    url.includes("tripadvisor") ||
    url.includes("timeout.com") ||
    url.includes("trazy.com") ||
    url.includes("visitkorea") ||
    url.includes("blog.")
  )
    return "blog";
  return "other";
}

// ── Strategy A: Wikimedia Commons ────────────────────────────────────────────

interface WikiSearchHit { title: string; snippet: string }
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
  const res = await safeFetch(url.toString());
  if (!res?.ok) throw new Error(`Wikimedia HTTP ${res?.status}`);
  return res.json();
}

async function wikiSearchTitles(query: string): Promise<WikiSearchHit[]> {
  const data = (await wikiFetch({
    action: "query",
    list: "search",
    srsearch: query,
    srnamespace: "6",
    srlimit: String(WIKI_MAX),
  })) as { query?: { search?: WikiSearchHit[] } };
  return data?.query?.search ?? [];
}

async function wikiImageInfo(titles: string[]): Promise<Map<string, WikiImageInfo>> {
  const data = (await wikiFetch({
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600",
  })) as { query?: { pages?: Record<string, { title: string; imageinfo?: WikiImageInfo[] }> } };

  const map = new Map<string, WikiImageInfo>();
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0];
    if (info?.url) map.set(page.title, info);
  }
  return map;
}

export async function searchWikimedia(query: string): Promise<ImageCandidate[]> {
  let hits: WikiSearchHit[];
  try {
    hits = await wikiSearchTitles(query);
  } catch { return []; }

  const imageHits = hits.filter((h) => /\.(jpe?g|png|webp)$/i.test(h.title));
  if (!imageHits.length) return [];

  let infoMap: Map<string, WikiImageInfo>;
  try {
    infoMap = await wikiImageInfo(imageHits.map((h) => h.title));
  } catch { return []; }

  const candidates: ImageCandidate[] = [];
  for (const hit of imageHits) {
    const info = infoMap.get(hit.title);
    if (!info) continue;
    const rawTitle =
      info.extmetadata?.ObjectName?.value ||
      info.extmetadata?.ImageDescription?.value ||
      hit.title.replace(/^File:/, "").replace(/\.[^.]+$/, "").replace(/_/g, " ");
    const title = rawTitle.replace(/<[^>]*>/g, "").trim();
    candidates.push({
      url: info.url,
      source: "Wikimedia Commons",
      sourceType: "wikimedia",
      title,
      widthPx: info.width,
      heightPx: info.height,
    });
  }
  return candidates;
}

// ── Strategy B: DuckDuckGo + og:image ────────────────────────────────────────

/**
 * Fetch DuckDuckGo HTML results and return page URLs + titles.
 * Uses the lite HTML endpoint which requires no login.
 */
async function duckduckgoSearch(query: string): Promise<Array<{ url: string; title: string }>> {
  const params = new URLSearchParams({ q: query, kl: "wt-wt" });
  const res = await safeFetch(`https://html.duckduckgo.com/html/?${params}`, {
    headers: {
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res?.ok) return [];

  const html = await res.text();

  // DDG wraps result hrefs in: //duckduckgo.com/l/?uddg=<encoded-actual-url>&rut=...
  // We need to extract and decode the uddg parameter.
  const results: Array<{ url: string; title: string }> = [];
  const linkRe = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)</gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null && results.length < WEB_PAGE_MAX) {
    let href = m[1];
    const title = m[2]
      .replace(/&amp;/g, "&")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();

    // Decode DDG redirect wrapper → extract the uddg param
    if (href.includes("duckduckgo.com/l/") || href.startsWith("//duckduckgo.com")) {
      try {
        const fullHref = href.startsWith("//") ? `https:${href}` : href;
        const uddg = new URL(fullHref).searchParams.get("uddg");
        if (uddg) href = decodeURIComponent(uddg);
      } catch { continue; }
    }

    if (href.startsWith("http") && !href.includes("duckduckgo.com")) {
      results.push({ url: href, title });
    }
  }
  return results;
}

/**
 * Fetch a page and extract its og:image (or twitter:image) meta tag.
 */
async function extractOgImage(
  pageUrl: string,
  pageTitle: string
): Promise<ImageCandidate | null> {
  const res = await safeFetch(pageUrl, {
    headers: {
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
    },
  });
  if (!res?.ok) return null;

  let html: string;
  try {
    html = await res.text();
  } catch { return null; }

  // Look for og:image or twitter:image
  const ogRe = /<meta[^>]+(?:property="og:image"|name="og:image")[^>]+content="([^"]+)"/i;
  const twRe = /<meta[^>]+name="twitter:image(?:src)?"[^>]+content="([^"]+)"/i;
  // Also try content-first attribute order
  const ogRe2 = /<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i;

  const imageUrl =
    (ogRe.exec(html) ?? ogRe2.exec(html) ?? twRe.exec(html))?.[1];

  if (!imageUrl || !imageUrl.startsWith("http")) return null;

  // Skip tiny placeholder or default images
  const lower = imageUrl.toLowerCase();
  if (
    lower.includes("placeholder") ||
    lower.includes("default") ||
    lower.includes("no-image") ||
    lower.includes("logo") && !lower.includes("interior")
  ) return null;

  const sourceType = guessSourceType(pageUrl);

  return {
    url: imageUrl,
    source: new URL(pageUrl).hostname.replace(/^www\./, ""),
    sourceType,
    title: pageTitle,
    pageUrl,
  };
}

/**
 * Web search: DuckDuckGo → page URLs → og:image extraction.
 * Best for cafés, restaurants, hotels.
 */
export async function searchWeb(queries: string[]): Promise<ImageCandidate[]> {
  const seen = new Set<string>();
  const candidates: ImageCandidate[] = [];

  for (const query of queries) {
    const pages = await duckduckgoSearch(query);
    await new Promise((r) => setTimeout(r, 800)); // polite delay

    for (const page of pages) {
      if (seen.has(page.url)) continue;
      seen.add(page.url);

      // Skip obviously irrelevant domains
      if (
        page.url.includes("youtube.com") ||
        page.url.includes("facebook.com") ||
        page.url.includes("twitter.com") ||
        page.url.includes("reddit.com") ||
        page.url.includes("maps.google.com")
      ) continue;

      const candidate = await extractOgImage(page.url, page.title);
      if (candidate && !seen.has(candidate.url)) {
        seen.add(candidate.url);
        candidates.push(candidate);
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    if (candidates.length >= 4) break; // good enough
  }

  return candidates;
}

// ── Strategy C: Naver Image API (optional, needs API key) ────────────────────

const NAVER_ID = process.env.NAVER_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function searchNaver(query: string): Promise<ImageCandidate[]> {
  if (!NAVER_ID || !NAVER_SECRET) return [];

  const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=5&sort=sim`;
  const res = await safeFetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_ID,
      "X-Naver-Client-Secret": NAVER_SECRET,
    },
  });
  if (!res?.ok) return [];

  const data = (await res.json()) as {
    items?: Array<{ link: string; title: string; sizewidth: string; sizeheight: string }>;
  };

  return (data.items ?? []).map((item) => ({
    url: item.link,
    source: "Naver Image Search",
    sourceType: "naver" as SourceType,
    title: item.title.replace(/<[^>]*>/g, "").trim(),
    widthPx: parseInt(item.sizewidth) || undefined,
    heightPx: parseInt(item.sizeheight) || undefined,
  }));
}

// ── Combined: all queries, deduplicated ──────────────────────────────────────

export async function searchAllQueries(
  queries: string[],
  strategy: "wikimedia" | "web" | "both"
): Promise<ImageCandidate[]> {
  const seen = new Set<string>();
  const merged: ImageCandidate[] = [];

  const push = (candidates: ImageCandidate[]) => {
    for (const c of candidates) {
      if (!seen.has(c.url)) { seen.add(c.url); merged.push(c); }
    }
  };

  if (strategy === "wikimedia" || strategy === "both") {
    for (const q of queries) {
      push(await searchWikimedia(q));
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (strategy === "web" || strategy === "both") {
    // Naver first if configured (most relevant for Korean venues)
    if (NAVER_ID) {
      for (const q of queries.slice(0, 2)) {
        push(await searchNaver(q));
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    push(await searchWeb(queries));
  }

  return merged;
}
