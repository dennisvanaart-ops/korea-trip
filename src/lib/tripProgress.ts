import type { TripDay } from "@/data/trip";
import { TRIP_START, TRIP_END } from "@/data/trip";

export type TripStatus = "upcoming" | "active" | "past";

export interface TripProgress {
  status: TripStatus;
  currentDay: TripDay | null;
  currentDayNumber: number | null;
  totalDays: number;
  daysUntilStart: number | null;
  daysSinceEnd: number | null;
  todayDate: string;
}

/**
 * Returns YYYY-MM-DD in device-local timezone.
 *
 * Why NOT toISOString(): that method always returns UTC. In Korea (UTC+9),
 * toISOString() at 00:01 local time returns the previous UTC date, causing
 * the wrong trip day to be highlighted. getFullYear/Month/Date use the
 * device's local calendar date regardless of timezone.
 */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return getLocalDateKey(new Date());
}

/** @deprecated Use getToday() */
export const getTodayAmsterdam = getToday;

function diffDays(from: string, to: string): number {
  // Parse as local noon to avoid any DST edge at midnight
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTripProgress(today: string, days: TripDay[]): TripProgress {
  const totalDays = days.length;

  if (today < TRIP_START) {
    return {
      status: "upcoming",
      currentDay: null,
      currentDayNumber: null,
      totalDays,
      daysUntilStart: diffDays(today, TRIP_START),
      daysSinceEnd: null,
      todayDate: today,
    };
  }

  if (today > TRIP_END) {
    return {
      status: "past",
      currentDay: null,
      currentDayNumber: null,
      totalDays,
      daysUntilStart: null,
      daysSinceEnd: diffDays(TRIP_END, today),
      todayDate: today,
    };
  }

  const currentDay = days.find((d) => d.date === today) ?? null;

  return {
    status: "active",
    currentDay,
    currentDayNumber: currentDay?.dayNumber ?? null,
    totalDays,
    daysUntilStart: null,
    daysSinceEnd: null,
    todayDate: today,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  passed: boolean;
  results: Array<{ label: string; passed: boolean; detail: string }>;
}

export function validateTripProgress(days: TripDay[]): ValidationResult {
  const progressCases: Array<{
    label: string;
    today: string;
    expect: Partial<TripProgress>;
  }> = [
    {
      label: "Vóór de reis (2026-04-20)",
      today: "2026-04-20",
      expect: { status: "upcoming", daysUntilStart: 8 },
    },
    {
      label: "Eerste dag reis (2026-04-28, dag 1)",
      today: "2026-04-28",
      expect: { status: "active", currentDayNumber: 1 },
    },
    {
      label: "Tijdens de reis (2026-05-03, dag 6)",
      today: "2026-05-03",
      expect: { status: "active", currentDayNumber: 6 },
    },
    {
      label: "Laatste dag reis (2026-05-12, dag 15)",
      today: "2026-05-12",
      expect: { status: "active", currentDayNumber: 15 },
    },
    {
      label: "Na de reis (2026-05-20)",
      today: "2026-05-20",
      expect: { status: "past", daysSinceEnd: 8 },
    },
  ];

  const progressResults = progressCases.map(({ label, today, expect: ex }) => {
    const result = getTripProgress(today, days);
    const checks = (Object.keys(ex) as Array<keyof TripProgress>).map(
      (k) => result[k] === ex[k]
    );
    const ok = checks.every(Boolean);
    const detail = ok
      ? `status=${result.status}`
      : `expected ${JSON.stringify(ex)}, got ${JSON.stringify(
          Object.fromEntries(
            (Object.keys(ex) as Array<keyof TripProgress>).map((k) => [k, result[k]])
          )
        )}`;
    return { label, passed: ok, detail };
  });

  // Midnight boundary: getLocalDateKey must return the local calendar date,
  // not UTC. We verify it matches the Date's own local accessors (the ground
  // truth for local date), not toISOString().
  function testMidnight(): { label: string; passed: boolean; detail: string } {
    const label = "Midnight boundary: getLocalDateKey uses local date, not UTC";
    // Use the current date just past local midnight (00:01 local time today).
    const d = new Date();
    d.setHours(0, 1, 0, 0);
    const got = getLocalDateKey(d);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    // Also confirm it differs from naive UTC for UTC-offset timezones.
    const utcDate = d.toISOString().split("T")[0];
    const passed = got === expected;
    const detail = passed
      ? `local=${got}, utc=${utcDate}${got !== utcDate ? " (correctly differ)" : " (same tz as UTC)"}`
      : `got=${got}, expected=${expected}`;
    return { label, passed, detail };
  }

  const results = [...progressResults, testMidnight()];
  return { passed: results.every((r) => r.passed), results };
}
