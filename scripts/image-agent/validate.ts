/**
 * validate.ts — scoring and quality evaluation for image candidates
 *
 * Scoring is heuristic (no vision model) and uses:
 *   - Lexical matching: do location hints appear in title/URL?
 *   - Source trust: Wikimedia > official > naver/instagram > blog > other
 *   - Size check: penalise tiny thumbnails
 *   - Generic-penalty terms
 *   - Type-specific rules: cafés/restaurants need name match
 */

import type { ImageCandidate, ValidatedCandidate } from "./types.js";
import type { TripItem } from "./config.js";

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_W_HIGH = 800;
const MIN_W_MED = 400;

const GENERIC_TERMS = [
  "stock", "generic", "clipart", "icon", "template", "background",
  "illustration", "vector", "cartoon", "flat lay", "studio shot",
  "coffee cup", "coffee bean", "latte art", // too generic for a named café
];

const QUALITY_TERMS = [
  "interior", "exterior", "facade", "entrance", "lobby",
  "view", "panorama", "photograph", "photo", "commons",
];

// Source trust levels (higher = more trustworthy for confidence scoring)
const SOURCE_TRUST: Record<string, number> = {
  wikimedia: 3,
  official: 3,
  naver: 2,
  instagram: 2,
  booking: 2,
  google: 1,
  blog: 1,
  other: 0,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}
function containsAny(hay: string, needles: string[]) {
  const h = normalise(hay);
  return needles.some((n) => h.includes(normalise(n)));
}
function countMatches(hay: string, needles: string[]) {
  const h = normalise(hay);
  return needles.filter((n) => h.includes(normalise(n))).length;
}

// License/usage note per source type
function licenseNote(sourceType: string): string {
  if (sourceType === "wikimedia") return "Wikimedia Commons — check individual file license (usually CC-BY or CC-BY-SA)";
  if (sourceType === "official") return "Venue official website — verify usage rights before public distribution";
  if (sourceType === "naver") return "Naver — verify usage rights before public distribution";
  if (sourceType === "instagram") return "Instagram — verify usage rights before public distribution";
  if (sourceType === "booking") return "Booking.com — hotel promotional image, verify rights";
  if (sourceType === "google") return "Google — verify usage rights before public distribution";
  return "Unknown source — verify usage rights before public distribution";
}

// ── Type-specific bonus ───────────────────────────────────────────────────────

function typeBonus(c: ImageCandidate, item: TripItem): { points: number; note: string } {
  const blob = `${c.title ?? ""} ${c.url} ${c.pageUrl ?? ""}`;

  if (item.type === "hotel") {
    if (containsAny(blob, ["exterior", "facade", "lobby", "entrance", "front"])) {
      return { points: 1, note: "hotel exterior/lobby" };
    }
    if (containsAny(blob, ["room", "bedroom"]) && !containsAny(blob, item.locationHints)) {
      return { points: -1, note: "generic room without location match" };
    }
  }

  if (item.type === "activity") {
    const isCafeOrFood =
      item.name.toLowerCase().includes("coffee") ||
      item.name.toLowerCase().includes("cafe") ||
      item.name.toLowerCase().includes("bakery") ||
      item.name.toLowerCase().includes("restaurant") ||
      item.name.toLowerCase().includes("bibimbap");

    if (isCafeOrFood) {
      // For named venues: name MUST appear somewhere in page/title/URL.
      // For food dishes (bibimbap) the item name is the dish itself — any good shot is ok.
      const isDish = item.genericOk;
      if (!isDish && !containsAny(blob, [item.name, ...item.locationHints.slice(0, 2)])) {
        return { points: -2, note: "named café/restaurant — name absent, likely wrong venue" };
      }
      return { points: 1, note: "café/restaurant context present" };
    }

    if (containsAny(blob, ["view", "panorama", "landscape", "overview", "aerial"])) {
      return { points: 1, note: "landmark/wide view" };
    }
  }

  return { points: 0, note: "" };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function validateCandidate(
  candidate: ImageCandidate,
  item: TripItem
): ValidatedCandidate {
  const blob = `${candidate.title ?? ""} ${candidate.url} ${candidate.pageUrl ?? ""}`;
  const reasons: string[] = [];

  // 1. Location-hint matching
  const hintMatches = countMatches(blob, item.locationHints);
  const matchesLocation = hintMatches > 0;
  reasons.push(matchesLocation
    ? `${hintMatches}/${item.locationHints.length} hints matched`
    : "no location hints found");

  // 2. Generic penalty
  const isGeneric = !item.genericOk && containsAny(blob, GENERIC_TERMS);
  if (isGeneric) reasons.push("generic terms detected");

  // 3. Quality signal
  if (containsAny(blob, QUALITY_TERMS)) reasons.push("quality indicator");

  // 4. Size
  const w = candidate.widthPx ?? 0;
  if (w > 0) reasons.push(`${w}×${candidate.heightPx ?? "?"}px`);

  // 5. Source trust
  const trust = SOURCE_TRUST[candidate.sourceType] ?? 0;
  reasons.push(`source:${candidate.sourceType}(trust:${trust})`);

  // 6. Type bonus
  const { points: tp, note: tn } = typeBonus(candidate, item);
  if (tn) reasons.push(tn);

  // ── Score ────────────────────────────────────────────────────────────────
  let score = 0;

  score += hintMatches >= 2 ? 3 : hintMatches === 1 ? 2 : 0;
  score -= isGeneric ? 3 : 0;
  score += trust;
  score += tp;
  score += w >= MIN_W_HIGH ? 1 : w > 0 && w < MIN_W_MED ? -1 : 0;

  // Transport / food-dish items where generic is ok: floor at 1
  if (item.genericOk && score < 1) score = 1;

  // Penalise "official" source for a named café when name is absent
  // (already handled via tp -2 above)

  const confidence: "high" | "medium" | "low" =
    score >= 5 ? "high" : score >= 2 ? "medium" : "low";

  return {
    url: candidate.url,
    source: candidate.source,
    sourceType: candidate.sourceType,
    title: candidate.title,
    confidence,
    reason: reasons.filter(Boolean).join("; "),
    isGeneric,
    matchesLocation,
    licenseOrUsageNote: licenseNote(candidate.sourceType),
  };
}

export function rankCandidates(validated: ValidatedCandidate[]): {
  shortlist: ValidatedCandidate[];
  rejected: ValidatedCandidate[];
} {
  const order = { high: 0, medium: 1, low: 2 };
  const sorted = [...validated].sort((a, b) => {
    const d = order[a.confidence] - order[b.confidence];
    return d !== 0 ? d : (b.matchesLocation ? 1 : 0) - (a.matchesLocation ? 1 : 0);
  });
  return {
    shortlist: sorted.filter((c) => c.confidence !== "low"),
    rejected: sorted.filter((c) => c.confidence === "low"),
  };
}
