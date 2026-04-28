/**
 * Route segment helpers for the Korea trip.
 *
 * buildRouteSegmentsFromTrip — derives ordered route stops + segments from
 *   trip data (hotels + flights). No hardcoded coordinates or route order.
 *
 * getActiveTripPoint — returns the route point that corresponds to a given
 *   day index (hotel stays take priority over flight-only days).
 *
 * TRIP_ROUTE — pre-built from the real trip data.
 */

import type { TripDay } from "@/data/trip";
import { tripDays } from "@/data/trip";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface TripPoint {
  id: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
  firstDayIndex: number;
  lastDayIndex: number;
  /** Where this stop came from in the trip data */
  source: "hotel" | "flight" | "transfer";
}

export interface TripSegment {
  fromPointId: string;
  toPointId: string;
  type: "flight" | "drive" | "transfer";
  label: string;
}

// ─── Coordinate lookup ────────────────────────────────────────────────────────

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Beijing: { lat: 39.9042, lng: 116.4074 },
  Seoul: { lat: 37.5665, lng: 126.978 },
  Incheon: { lat: 37.4602, lng: 126.4407 },
  Sokcho: { lat: 38.2078, lng: 128.5918 },
  Andong: { lat: 36.5684, lng: 128.7294 },
  Busan: { lat: 35.1796, lng: 129.0756 },
  Jeonju: { lat: 35.8242, lng: 127.148 },
};

function findCoords(text: string): { lat: number; lng: number } | null {
  for (const [city, c] of Object.entries(CITY_COORDS)) {
    if (text.toLowerCase().includes(city.toLowerCase())) return c;
  }
  return null;
}

function findCityName(text: string): string | null {
  for (const city of Object.keys(CITY_COORDS)) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return null;
}

// ─── Builder ─────────────────────────────────────────────────────────────────

/**
 * Derives the full route (points + segments) from trip planning data.
 *
 * Algorithm (linear scan):
 *  – Flights add the from/to cities; consecutive flights chain into a sequence.
 *  – Hotels extend or replace the current city stop.
 *  – Drive days (travelTime) produce a "drive" segment to the next hotel city.
 *  – Days with no hotel and no flights extend the previous stop's day range.
 */
export function buildRouteSegmentsFromTrip(days: TripDay[]): {
  points: TripPoint[];
  segments: TripSegment[];
} {
  const pts: TripPoint[] = [];
  const segs: TripSegment[] = [];
  // Track how many times each city has appeared as a flight stop
  const cityFlightCount: Record<string, number> = {};

  function ck(city: string) {
    return city.toLowerCase().replace(/\s+/g, "-");
  }

  function nextFlightId(city: string): string {
    const key = ck(city);
    cityFlightCount[key] = (cityFlightCount[key] ?? 0) + 1;
    return `flight-${key}-${cityFlightCount[key]}`;
  }

  function currentCity(): string | null {
    return pts.length > 0 ? pts[pts.length - 1].city : null;
  }

  function extendLast(di: number) {
    if (pts.length > 0) pts[pts.length - 1].lastDayIndex = di;
  }

  function pushSeg(toId: string, type: TripSegment["type"], label: string) {
    if (pts.length >= 2) {
      segs.push({ fromPointId: pts[pts.length - 2].id, toPointId: toId, type, label });
    }
  }

  function addPt(pt: TripPoint): string {
    pts.push(pt);
    return pt.id;
  }

  for (let di = 0; di < days.length; di++) {
    const day = days[di];
    const flights = (day.transport ?? []).filter((t) => t.type === "flight");

    // ── Flights ──────────────────────────────────────────────────────────────
    for (const tr of flights) {
      const f = tr.flight;
      if (!f) continue;

      // Add departure city only on the very first stop
      if (pts.length === 0) {
        const from = f.from.city;
        addPt({
          id: nextFlightId(from),
          label: from,
          city: from,
          ...(findCoords(from) ?? { lat: 0, lng: 0 }),
          firstDayIndex: di,
          lastDayIndex: di,
          source: "flight",
        });
      }

      // Add destination city
      const toCity = f.to.city;
      if (currentCity() !== toCity) {
        const toId = nextFlightId(toCity);
        addPt({
          id: toId,
          label: toCity,
          city: toCity,
          ...(findCoords(toCity) ?? { lat: 0, lng: 0 }),
          firstDayIndex: di,
          lastDayIndex: di,
          source: "flight",
        });
        pushSeg(toId, "flight", `${f.flightNumber} · ${f.from.city} → ${toCity}`);
      }
    }

    // ── Hotel ─────────────────────────────────────────────────────────────────
    if (day.hotel) {
      const addr = day.hotel.address;
      const hotelCity = findCityName(addr) ?? addr.split(",")[0].trim();
      const hotelId = `hotel-${day.hotel.id}`;

      if (currentCity() === hotelCity) {
        // Arrived at same city as current stop — just extend the stay
        extendLast(di);
        // Upgrade source to "hotel" (so active-day logic prefers this stop)
        if (pts[pts.length - 1].source === "flight") {
          pts[pts.length - 1].source = "hotel";
        }
      } else if (currentCity() !== null) {
        // Different city — reached by car or transfer
        const segType: TripSegment["type"] =
          (day.transport ?? []).some((t) => t.type === "transfer") ? "transfer" : "drive";
        addPt({
          id: hotelId,
          label: hotelCity,
          city: hotelCity,
          ...(findCoords(addr) ?? { lat: 0, lng: 0 }),
          firstDayIndex: di,
          lastDayIndex: di,
          source: "hotel",
        });
        pushSeg(hotelId, segType, day.travelTime ?? "Auto");
      } else {
        // Very first stop is a hotel (edge case)
        addPt({
          id: hotelId,
          label: hotelCity,
          city: hotelCity,
          ...(findCoords(addr) ?? { lat: 0, lng: 0 }),
          firstDayIndex: di,
          lastDayIndex: di,
          source: "hotel",
        });
      }
    } else if (flights.length === 0 && pts.length > 0) {
      // Nothing happening today — stay at current city
      extendLast(di);
    }
  }

  return { points: pts, segments: segs };
}

// ─── Active point lookup ──────────────────────────────────────────────────────

/**
 * Given a day index, return the route point the user is "at" that day.
 * Hotel stops take priority (you sleep there); for pure flight days the
 * destination of the last flight is returned.
 */
export function getActiveTripPoint(
  points: TripPoint[],
  dayIndex: number,
): TripPoint | undefined {
  const candidates = points.filter(
    (p) => dayIndex >= p.firstDayIndex && dayIndex <= p.lastDayIndex,
  );
  return candidates.find((p) => p.source === "hotel") ?? candidates[candidates.length - 1];
}

// Pre-built from the real trip data
export const TRIP_ROUTE = buildRouteSegmentsFromTrip(tripDays);
