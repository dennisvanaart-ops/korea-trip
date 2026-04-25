/**
 * validate.ts — scoring / quality evaluation for image candidates
 *
 * Scoring is heuristic (no vision model) and uses:
 *   - Lexical matching: do location hints appear in the title/URL?
 *   - Size check: reject tiny thumbnails
 *   - Generic-penalty terms: reduce confidence for stock-photo patterns
 *   - Type-specific rules: cafés need name match, transport can be generic
 */

import type { ImageCandidate, ValidatedCandidate } from "./types.js";
import type { TripItem } from "./config.js";

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_WIDTH_HIGH = 1000; // px — must be at least this for "high"
const MIN_WIDTH_MEDIUM = 500; // px — must be at least this for "medium"

/** Terms that strongly suggest a generic stock image — always penalised */
const GENERIC_PENALTY_TERMS = [
  "stock",
  "generic",
  "clipart",
  "icon",
  "logo",
  "banner",
  "template",
  "background",
  "illustration",
  "vector",
  "cartoon",
  "coffee cup",       // too generic for a café entry
  "flat lay",
  "studio shot",
];

/** Terms in URL/title that indicate specific, recognisable photography */
const QUALITY_BONUS_TERMS = [
  "commons",          // from Wikimedia Commons → usually well-curated
  "photograph",
  "photo",
  "view",
  "exterior",
  "facade",
  "interior",
  "architecture",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function containsAny(haystack: string, needles: string[]): boolean {
  const h = normalise(haystack);
  return needles.some((n) => h.includes(normalise(n)));
}

function countMatches(haystack: string, needles: string[]): number {
  const h = normalise(haystack);
  return needles.filter((n) => h.includes(normalise(n))).length;
}

// ── Per-type heuristics ───────────────────────────────────────────────────────

/**
 * Returns 0–3 bonus points based on type-specific criteria.
 * Positive = good match, negative = reject signal.
 */
function typeBonus(
  candidate: ImageCandidate,
  item: TripItem
): { points: number; note: string } {
  const blob = `${candidate.title ?? ""} ${candidate.url}`;

  switch (item.type) {
    case "hotel":
      // Hotels: exterior / lobby preferred; a room shot without the name is weak
      if (containsAny(blob, ["exterior", "facade", "lobby", "entrance", "front"])) {
        return { points: 1, note: "hotel exterior/lobby visible" };
      }
      if (containsAny(blob, ["room", "bedroom", "bathroom"]) &&
          !containsAny(blob, item.locationHints)) {
        return { points: -1, note: "generic room shot without location match" };
      }
      return { points: 0, note: "" };

    case "activity":
      if (item.name.toLowerCase().includes("cafe") ||
          item.name.toLowerCase().includes("coffee") ||
          item.name.toLowerCase().includes("bakery") ||
          item.name.toLowerCase().includes("restaurant")) {
        // For cafés/restaurants: name MUST appear — generic food shots disallowed
        if (!containsAny(blob, [item.name, ...item.locationHints.slice(0, 2)])) {
          return { points: -2, note: "café/restaurant image without name match — likely generic" };
        }
        return { points: 1, note: "café/restaurant with name context" };
      }
      // Landmarks: recognisable architectural view preferred
      if (containsAny(blob, ["view", "panorama", "landscape", "aerial", "overview"])) {
        return { points: 1, note: "wide/landmark view" };
      }
      return { points: 0, note: "" };

    case "transport":
      if (item.genericOk) return { points: 0, note: "generic transport ok" };
      return { points: 0, note: "" };

    default:
      return { points: 0, note: "" };
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function validateCandidate(
  candidate: ImageCandidate,
  item: TripItem
): ValidatedCandidate {
  const blob = `${candidate.title ?? ""} ${candidate.url}`;
  const reasons: string[] = [];

  // 1. Location-hint matching
  const hintMatches = countMatches(blob, item.locationHints);
  const matchesLocation = hintMatches > 0;
  if (matchesLocation) {
    reasons.push(`${hintMatches}/${item.locationHints.length} location hints matched`);
  } else {
    reasons.push("no location hints found in title/URL");
  }

  // 2. Generic-penalty check
  const isGeneric = !item.genericOk && containsAny(blob, GENERIC_PENALTY_TERMS);
  if (isGeneric) {
    const matched = GENERIC_PENALTY_TERMS.filter((t) =>
      normalise(blob).includes(normalise(t))
    );
    reasons.push(`generic terms detected: ${matched.join(", ")}`);
  }

  // 3. Quality bonus
  if (containsAny(blob, QUALITY_BONUS_TERMS)) {
    reasons.push("quality indicator present");
  }

  // 4. Size check
  const width = candidate.widthPx ?? 0;
  if (width > 0) {
    reasons.push(`${width}×${candidate.heightPx ?? "?"}px`);
  }

  // 5. Type-specific bonus
  const { points: typePoints, note: typeNote } = typeBonus(candidate, item);
  if (typeNote) reasons.push(typeNote);

  // ── Score → confidence ────────────────────────────────────────────────────
  let score = 0;

  // Location match is the most important signal
  if (matchesLocation) score += hintMatches >= 2 ? 3 : 2;
  if (isGeneric) score -= 3;
  score += typePoints;

  // Size
  if (width >= MIN_WIDTH_HIGH) score += 1;
  else if (width < MIN_WIDTH_MEDIUM && width > 0) score -= 1;

  // For transport items that allow generic: treat a name match as a bonus,
  // but don't penalise lack of match
  if (item.genericOk && !matchesLocation) score = Math.max(score, 1);

  let confidence: "high" | "medium" | "low";
  if (score >= 4) {
    confidence = "high";
  } else if (score >= 1) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return {
    url: candidate.url,
    source: candidate.source,
    title: candidate.title,
    confidence,
    reason: reasons.filter(Boolean).join("; "),
    isGeneric,
    matchesLocation,
  };
}

/**
 * Sort validated candidates: high > medium > low, then by location match.
 * Filters out "low" for the shortlist (caller decides what to do with them).
 */
export function rankCandidates(
  candidates: ValidatedCandidate[]
): { shortlist: ValidatedCandidate[]; rejected: ValidatedCandidate[] } {
  const order = { high: 0, medium: 1, low: 2 };
  const sorted = [...candidates].sort((a, b) => {
    const confDiff = order[a.confidence] - order[b.confidence];
    if (confDiff !== 0) return confDiff;
    // Tie-break: location match first
    return (b.matchesLocation ? 1 : 0) - (a.matchesLocation ? 1 : 0);
  });

  return {
    shortlist: sorted.filter((c) => c.confidence !== "low"),
    rejected: sorted.filter((c) => c.confidence === "low"),
  };
}
