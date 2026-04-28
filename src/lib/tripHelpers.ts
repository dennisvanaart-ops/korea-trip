/**
 * Domain helpers for the Korea trip app.
 *
 *  - getDayType                  — Vlucht / Reisdag / Transfer / Verblijf
 *  - getTransitionBetweenDays    — connector between consecutive day cards
 *  - buildRoutePointsFromTrip    — derive route stops from trip data (hotels + flights)
 *  - ROUTE_POINTS                — Korea stops (computed from trip data, not hardcoded)
 *  - lngLatToMapPx               — geographic → OSM-tile pixel coordinate
 *  - getVisibleRoutePoints       — progress+activeDay-aware filter for the map
 *  - CITY_COORDS / buildRouteLinks — navigation URL helpers
 */

import type { TripDay } from "@/data/trip";
import { tripDays } from "@/data/trip";
import type { TripStatus } from "@/lib/tripProgress";

// ─── Day type ─────────────────────────────────────────────────────────────────

export type DayType = "Vlucht" | "Reisdag" | "Transfer" | "Verblijf";

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
  origin?: string;
  destination?: string;
  duration?: string;
}

function parseRouteLocation(location: string): { origin: string; destination: string } | null {
  const idx = location.indexOf("→");
  if (idx === -1) return null;
  return {
    origin: location.slice(0, idx).trim(),
    destination: location.slice(idx + 1).trim(),
  };
}

export function getTransitionBetweenDays(dayA: TripDay, dayB: TripDay): Transition | null {
  const dayAisFlight = dayA.transport?.some((t) => t.type === "flight") ?? false;

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

  if (!dayAisFlight && dayB.transport?.some((t) => t.type === "flight")) {
    const flight = dayB.transport.find((t) => t.type === "flight")?.flight;
    return {
      kind: "flight",
      icon: "✈️",
      label: flight
        ? `${flight.duration} · ${flight.from.city} → ${flight.to.city}`
        : "Vlucht",
    };
  }

  return null;
}

// ─── Route points ─────────────────────────────────────────────────────────────

export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dayLabel: string;
  firstDayIndex: number;
  lastDayIndex: number;
}

/** Known coordinates for cities that appear in the trip */
const KNOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Beijing: { lat: 39.9042, lng: 116.4074 },
  Seoul: { lat: 37.5665, lng: 126.978 },
  Sokcho: { lat: 38.2078, lng: 128.5918 },
  Andong: { lat: 36.5684, lng: 128.7294 },
  Busan: { lat: 35.1796, lng: 129.0756 },
  Jeonju: { lat: 35.8242, lng: 127.148 },
};

function findCoords(text: string): { lat: number; lng: number } | null {
  for (const [city, c] of Object.entries(KNOWN_COORDS)) {
    if (text.toLowerCase().includes(city.toLowerCase())) return c;
  }
  return null;
}

function findCityName(text: string): string | null {
  for (const city of Object.keys(KNOWN_COORDS)) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return null;
}

function dayRangeLabel(first: number, last: number): string {
  return first === last ? `Dag ${first + 1}` : `Dag ${first + 1}–${last + 1}`;
}

/**
 * Derive route stops from the trip planning data.
 *
 * Sources (in order):
 *  1. Departure city from first flight on day 0
 *  2. Transit stop from first flight on day 1 (when it departs from a different city than the hotel)
 *  3. Korean hotel stops, grouped by hotel ID
 *  4. Return destination from last flight on last day
 */
export function buildRoutePointsFromTrip(days: TripDay[]): RoutePoint[] {
  const result: RoutePoint[] = [];

  // 1. Departure city
  const day0 = days[0];
  const depFlight = day0?.transport?.find((t) => t.type === "flight")?.flight;
  if (depFlight) {
    const city = depFlight.from.city;
    const coords = findCoords(city) ?? { lat: 0, lng: 0 };
    result.push({
      id: `dep-${city.toLowerCase()}`,
      name: city,
      ...coords,
      dayLabel: dayRangeLabel(0, 0),
      firstDayIndex: 0,
      lastDayIndex: 0,
    });
  }

  // 2. Transit stop (e.g. Beijing layover)
  const day1 = days[1];
  const transitFlight = day1?.transport?.find((t) => t.type === "flight")?.flight;
  if (transitFlight && transitFlight.from.city !== depFlight?.from.city) {
    const city = transitFlight.from.city;
    const coords = findCoords(city) ?? { lat: 0, lng: 0 };
    const hotelCity = day1?.hotel ? findCityName(day1.hotel.address) : null;
    if (!hotelCity || hotelCity !== city) {
      result.push({
        id: `transit-${city.toLowerCase()}`,
        name: city,
        ...coords,
        dayLabel: dayRangeLabel(1, 1),
        firstDayIndex: 1,
        lastDayIndex: 1,
      });
    }
  }

  // 3. Hotel-based Korea stops
  let i = 0;
  while (i < days.length) {
    const day = days[i];
    if (!day.hotel) { i++; continue; }

    const hotelId = day.hotel.id;
    const address = day.hotel.address;
    const city = findCityName(address) ?? address.split(",")[0].trim();
    const coords = findCoords(address) ?? { lat: 0, lng: 0 };

    // Group consecutive days with the same hotel
    let j = i;
    while (j < days.length && days[j].hotel?.id === hotelId) j++;
    const lastIdx = j - 1;

    // Skip if this day range already covered by a transit/departure entry
    const covered = result.some((r) => r.firstDayIndex <= i && r.lastDayIndex >= i);
    if (!covered) {
      result.push({
        id: `hotel-${hotelId}`,
        name: city,
        ...coords,
        dayLabel: dayRangeLabel(i, lastIdx),
        firstDayIndex: i,
        lastDayIndex: lastIdx,
      });
    }
    i = j;
  }

  // 4. Return destination
  const lastDay = days[days.length - 1];
  const returnFlights = lastDay?.transport?.filter((t) => t.type === "flight") ?? [];
  const lastFlight = returnFlights[returnFlights.length - 1]?.flight;
  if (lastFlight) {
    const city = lastFlight.to.city;
    const coords = findCoords(city) ?? { lat: 0, lng: 0 };
    const idx = days.length - 1;
    result.push({
      id: `arr-${city.toLowerCase()}`,
      name: city,
      ...coords,
      dayLabel: dayRangeLabel(idx, idx),
      firstDayIndex: idx,
      lastDayIndex: idx,
    });
  }

  return result.sort((a, b) => a.firstDayIndex - b.firstDayIndex);
}

/** All stops including international (Amsterdam, Beijing) */
export const ALL_ROUTE_POINTS: RoutePoint[] = buildRoutePointsFromTrip(tripDays);

/**
 * Korea-only stops — visible on the Korea OSM tile map.
 * Automatically derived from hotel data; no manual maintenance needed.
 */
export const ROUTE_POINTS: RoutePoint[] = ALL_ROUTE_POINTS.filter(
  (rp) => rp.lat >= 33 && rp.lat <= 40 && rp.lng >= 124 && rp.lng <= 131,
);

// ─── Map pixel projection ─────────────────────────────────────────────────────

/**
 * Convert lat/lng to pixel coordinates on the Korea tile map.
 *
 * Map spec: zoom=6, tile grid x=[54,55], y=[24,25] → 512×512px JPEG.
 * Returns pixel position within the image. Values outside [0,512] are
 * off-screen and should not be rendered.
 */
export function lngLatToMapPx(lat: number, lng: number): { x: number; y: number } {
  const n = 64; // 2^6
  const x = (lng + 180) / 360 * n * 256 - 54 * 256;
  const lr = (lat * Math.PI) / 180;
  const y =
    (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n * 256 -
    24 * 256;
  return { x, y };
}

// ─── Visible route points ─────────────────────────────────────────────────────

export interface VisibleRoutePoint extends RoutePoint {
  isCurrent: boolean;
  isFaded: boolean;
}

/**
 * Filter ROUTE_POINTS for map rendering.
 *
 * status "upcoming" / "past" → all points, none highlighted
 * status "active":
 *   – Finds which route point contains `activeDayIndex`
 *   – Points 2+ steps behind are hidden
 *   – 1 step behind → faded
 *   – Current → green highlight
 *   – Future → normal blue
 */
export function getVisibleRoutePoints(
  status: TripStatus,
  activeDayIndex: number,
  routePoints: RoutePoint[] = ROUTE_POINTS,
): VisibleRoutePoint[] {
  if (status !== "active") {
    return routePoints.map((rp) => ({ ...rp, isCurrent: false, isFaded: false }));
  }

  let currentIdx = routePoints.findIndex(
    (rp) => activeDayIndex >= rp.firstDayIndex && activeDayIndex <= rp.lastDayIndex,
  );

  // Flight/transit days before first Korea stop → show first stop as destination
  if (currentIdx === -1 && activeDayIndex < (routePoints[0]?.firstDayIndex ?? 0)) {
    currentIdx = 0;
  }
  // Post-trip → last stop
  if (currentIdx === -1) currentIdx = routePoints.length - 1;

  return routePoints.flatMap((rp, i): VisibleRoutePoint[] => {
    const behind = currentIdx - i;
    if (behind >= 2) return [];
    return [{ ...rp, isCurrent: i === currentIdx, isFaded: behind === 1 }];
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

export function getCityCoords(city: string): { lat: number; lng: number } | undefined {
  const key = Object.keys(CITY_COORDS).find((k) =>
    city.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? CITY_COORDS[key] : undefined;
}

export interface RouteLinks { google: string; naver: string; kakao: string }

export function buildRouteLinks(origin: string, destination: string): RouteLinks {
  const enc = encodeURIComponent;
  const oC = getCityCoords(origin);
  const dC = getCityCoords(destination);

  const google =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${enc(origin)}&destination=${enc(destination)}&travelmode=driving`;

  const naver =
    oC && dC
      ? `https://map.naver.com/v5/directions/${oC.lng},${oC.lat},${enc(origin.split(",")[0])},-/-/${dC.lng},${dC.lat},${enc(destination.split(",")[0])},-/car`
      : `https://map.naver.com/v5/search/${enc(destination.split(",")[0])}`;

  const kakao = dC
    ? `https://map.kakao.com/link/to/${enc(destination.split(",")[0])},${dC.lat},${dC.lng}`
    : `https://map.kakao.com/?q=${enc(destination.split(",")[0])}`;

  return { google, naver, kakao };
}
