/**
 * Domain helpers for the Korea trip app.
 *
 * Covers:
 *  - getDayType          — Vlucht / Reisdag / Transfer / Verblijf
 *  - getTransitionBetweenDays — connector between consecutive day cards
 *  - ROUTE_POINTS        — named Korean cities with lat/lng + day ranges
 *  - getVisibleRoutePoints — progress-aware filter for the route map
 *  - CITY_COORDS         — coordinates for routing URLs
 */

import type { TripDay } from "@/data/trip";
import type { TripStatus } from "@/lib/tripProgress";

// ─── Day type ─────────────────────────────────────────────────────────────────

export type DayType = "Vlucht" | "Reisdag" | "Transfer" | "Verblijf";

/**
 * Derive a simple day-type label from a TripDay.
 *
 * Priority: flight > drive (travelTime) > transfer > verblijf
 */
export function getDayType(day: TripDay): DayType {
  if (day.transport?.some((t) => t.type === "flight")) return "Vlucht";
  if (day.travelTime) return "Reisdag";
  if (day.transport?.some((t) => t.type === "transfer")) return "Transfer";
  return "Verblijf";
}

// ─── Day transitions ───────────────────────────────────────────────────────────

export type TransportKind = "drive" | "flight";

export interface Transition {
  kind: TransportKind;
  icon: string;
  label: string;
  /** "City A, Zuid-Korea" — only for drive */
  origin?: string;
  /** "City B, Zuid-Korea" — only for drive */
  destination?: string;
  /** Driving duration string (e.g. "± 2,5–3 uur") */
  duration?: string;
}

/** Parse "Seoul → Sokcho" → { origin, destination } */
function parseRouteLocation(location: string): { origin: string; destination: string } | null {
  const idx = location.indexOf("→");
  if (idx === -1) return null;
  return {
    origin: location.slice(0, idx).trim(),
    destination: location.slice(idx + 1).trim(),
  };
}

/**
 * Returns a Transition descriptor for the gap between dayA and dayB, or null
 * if the transition is not worth showing (same location / overnight / etc).
 *
 * Only two cases are shown:
 *  - Drive:  dayB.travelTime is set (car journey between cities)
 *  - Flight: dayB has flight transport but no travelTime (transition flight day)
 */
export function getTransitionBetweenDays(
  dayA: TripDay,
  dayB: TripDay,
): Transition | null {
  // Suppress the transition if dayA itself was already a flight day — the
  // flight info is already visible in the dayA card.
  const dayAisFlight = dayA.transport?.some((t) => t.type === "flight") ?? false;

  // ── Drive transition ─────────────────────────────────────────────────────
  if (dayB.travelTime) {
    const route = parseRouteLocation(dayB.location);
    return {
      kind: "drive",
      icon: "🚗",
      label: dayB.travelTime,
      origin: route ? `${route.origin}, Zuid-Korea` : undefined,
      destination: route ? `${route.destination}, Zuid-Korea` : undefined,
      duration: dayB.travelTime,
    };
  }

  // ── Flight transition ────────────────────────────────────────────────────
  if (!dayAisFlight && dayB.transport?.some((t) => t.type === "flight")) {
    const flight = dayB.transport.find((t) => t.type === "flight")?.flight;
    return {
      kind: "flight",
      icon: "✈️",
      label: flight ? `${flight.duration} · ${flight.from.city} → ${flight.to.city}` : "Vlucht",
    };
  }

  return null;
}

// ─── Route points for the map ─────────────────────────────────────────────────

export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Human-readable day range, e.g. "Dag 2–4" */
  dayLabel: string;
  /** Index of the first tripDay that "lives" at this location (0-based) */
  firstDayIndex: number;
  /** Index of the last tripDay at this location (inclusive) */
  lastDayIndex: number;
}

/**
 * Fixed route through Korea — only Korean cities.
 * Day 0 (Amsterdam → Beijing) and Day 1 (Beijing → Seoul) are transit
 * and are NOT shown as separate route points.
 *
 * Route: Seoul → Sokcho → Andong → Busan → Jeonju → Seoul
 */
export const ROUTE_POINTS: RoutePoint[] = [
  {
    id: "seoul-1",
    name: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    dayLabel: "Dag 2–4",
    firstDayIndex: 1,  // day 2: Aankomst Seoul
    lastDayIndex: 4,   // day 5 starts in Seoul (car pickup) → include
  },
  {
    id: "sokcho",
    name: "Sokcho",
    lat: 38.2078,
    lng: 128.5918,
    dayLabel: "Dag 5–7",
    firstDayIndex: 4,
    lastDayIndex: 6,
  },
  {
    id: "andong",
    name: "Andong",
    lat: 36.5684,
    lng: 128.7294,
    dayLabel: "Dag 8",
    firstDayIndex: 7,
    lastDayIndex: 7,
  },
  {
    id: "busan",
    name: "Busan",
    lat: 35.1796,
    lng: 129.0756,
    dayLabel: "Dag 9–10",
    firstDayIndex: 8,
    lastDayIndex: 9,
  },
  {
    id: "jeonju",
    name: "Jeonju",
    lat: 35.8242,
    lng: 127.148,
    dayLabel: "Dag 11–12",
    firstDayIndex: 10,
    lastDayIndex: 11,
  },
  {
    id: "seoul-2",
    name: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    dayLabel: "Dag 13–15",
    firstDayIndex: 12,
    lastDayIndex: 14,
  },
];

export interface VisibleRoutePoint extends RoutePoint {
  isCurrent: boolean;
  isFaded: boolean;
}

/**
 * Returns the subset of ROUTE_POINTS that should be rendered on the map.
 *
 * - upcoming/past → all points (full route)
 * - active:
 *     · Find which point the currentDayIndex falls within.
 *     · Hide points that are 2+ steps behind (return null for them).
 *     · Show 1 step behind as faded.
 *     · Show current + future as normal.
 */
export function getVisibleRoutePoints(
  status: TripStatus,
  currentDayIndex: number,
): VisibleRoutePoint[] {
  if (status !== "active") {
    return ROUTE_POINTS.map((rp) => ({ ...rp, isCurrent: false, isFaded: false }));
  }

  // Find the route-point index that contains currentDayIndex.
  let currentPointIdx = ROUTE_POINTS.findIndex(
    (rp) => currentDayIndex >= rp.firstDayIndex && currentDayIndex <= rp.lastDayIndex,
  );
  // Day 0 (Amsterdam flight) falls before first route point — treat as idx 0.
  if (currentPointIdx === -1) {
    currentPointIdx = currentDayIndex === 0 ? 0 : ROUTE_POINTS.length - 1;
  }

  return ROUTE_POINTS.flatMap((rp, i): VisibleRoutePoint[] => {
    const stepsBehind = currentPointIdx - i;
    if (stepsBehind >= 2) return []; // hidden
    return [
      {
        ...rp,
        isCurrent: i === currentPointIdx,
        isFaded: stepsBehind === 1,
      },
    ];
  });
}

// ─── City coordinates (for routing URLs) ─────────────────────────────────────

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Seoul: { lat: 37.5665, lng: 126.978 },
  Sokcho: { lat: 38.2078, lng: 128.5918 },
  Andong: { lat: 36.5684, lng: 128.7294 },
  Busan: { lat: 35.1796, lng: 129.0756 },
  Jeonju: { lat: 35.8242, lng: 127.148 },
};

/** Look up coordinates by partial city name (case-insensitive). */
export function getCityCoords(
  city: string,
): { lat: number; lng: number } | undefined {
  const key = Object.keys(CITY_COORDS).find((k) =>
    city.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? CITY_COORDS[key] : undefined;
}

// ─── Route navigation links ───────────────────────────────────────────────────

export interface RouteLinks {
  google: string;
  naver: string;
  kakao: string;
}

/**
 * Build driving-direction links for a road trip between two Korean cities.
 * Falls back to destination search when coordinates are unavailable.
 */
export function buildRouteLinks(
  origin: string,
  destination: string,
): RouteLinks {
  const enc = encodeURIComponent;
  const originCoords = getCityCoords(origin);
  const destCoords = getCityCoords(destination);

  // Google Maps directions
  const google =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${enc(origin)}` +
    `&destination=${enc(destination)}` +
    `&travelmode=driving`;

  // Naver Maps — uses lng,lat order
  const naver =
    originCoords && destCoords
      ? `https://map.naver.com/v5/directions/${originCoords.lng},${originCoords.lat},${enc(origin.split(",")[0])},-/-/${destCoords.lng},${destCoords.lat},${enc(destination.split(",")[0])},-/car`
      : `https://map.naver.com/v5/search/${enc(destination.split(",")[0])}`;

  // KakaoMap — link to destination (no public route URL with origin support)
  const kakao = destCoords
    ? `https://map.kakao.com/link/to/${enc(destination.split(",")[0])},${destCoords.lat},${destCoords.lng}`
    : `https://map.kakao.com/?q=${enc(destination.split(",")[0])}`;

  return { google, naver, kakao };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface TripHelpersValidation {
  passed: boolean;
  results: Array<{ label: string; passed: boolean; detail: string }>;
}

export function validateTripHelpers(): TripHelpersValidation {
  const results: Array<{ label: string; passed: boolean; detail: string }> = [];

  function check(label: string, condition: boolean, detail: string) {
    results.push({ label, passed: condition, detail });
  }

  // getDayType
  check(
    "getDayType: flight day returns Vlucht",
    getDayType({ date: "", dayNumber: 1, title: "", location: "", emoji: "", transport: [{ id: "x", type: "flight", title: "" }] }) === "Vlucht",
    "",
  );
  check(
    "getDayType: travelTime day returns Reisdag",
    getDayType({ date: "", dayNumber: 1, title: "", location: "", emoji: "", travelTime: "2u" }) === "Reisdag",
    "",
  );
  check(
    "getDayType: no transport returns Verblijf",
    getDayType({ date: "", dayNumber: 1, title: "", location: "", emoji: "" }) === "Verblijf",
    "",
  );

  // getVisibleRoutePoints — upcoming
  const allPoints = getVisibleRoutePoints("upcoming", 0);
  check("getVisibleRoutePoints: upcoming shows all 6 points", allPoints.length === 6, `got ${allPoints.length}`);

  // getVisibleRoutePoints — during Sokcho (dayIndex 5)
  const sokcho = getVisibleRoutePoints("active", 5);
  const seoulFaded = sokcho.find((p) => p.id === "seoul-1");
  const sokchoCurrent = sokcho.find((p) => p.id === "sokcho");
  check("getVisibleRoutePoints: active sokcho — seoul-1 is faded", !!seoulFaded?.isFaded, "");
  check("getVisibleRoutePoints: active sokcho — sokcho is current", !!sokchoCurrent?.isCurrent, "");
  check("getVisibleRoutePoints: active sokcho — all future points included", sokcho.length === 5, `got ${sokcho.length}`);

  // getVisibleRoutePoints — during Busan (dayIndex 9)
  const busan = getVisibleRoutePoints("active", 9);
  const seoulHidden = busan.find((p) => p.id === "seoul-1");
  check("getVisibleRoutePoints: active busan — seoul-1 hidden", seoulHidden === undefined, "");
  const andongFaded = busan.find((p) => p.id === "andong");
  check("getVisibleRoutePoints: active busan — andong is faded", !!andongFaded?.isFaded, "");

  // buildRouteLinks
  const links = buildRouteLinks("Seoul, Zuid-Korea", "Sokcho, Zuid-Korea");
  check("buildRouteLinks: google includes travelmode=driving", links.google.includes("travelmode=driving"), links.google);
  check("buildRouteLinks: naver is defined", links.naver.length > 0, links.naver);
  check("buildRouteLinks: kakao is defined", links.kakao.length > 0, links.kakao);

  return { passed: results.every((r) => r.passed), results };
}
