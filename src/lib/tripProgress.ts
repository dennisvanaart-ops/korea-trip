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

function diffDays(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// Returns YYYY-MM-DD in device-local timezone (getFullYear/Month/Date are local, not UTC).
// Never use toISOString().split('T')[0] — that returns UTC date, wrong at midnight in Korea.
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayAmsterdam(): string {
  return getLocalDateString(new Date());
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

// ─── Validation (3 scenario's) ────────────────────────────────────────────────

export interface ValidationResult {
  passed: boolean;
  results: Array<{ label: string; passed: boolean; detail: string }>;
}

export function validateTripProgress(days: TripDay[]): ValidationResult {
  const cases: Array<{ label: string; today: string; expect: Partial<TripProgress> }> = [
    {
      label: "Vóór de reis (2026-04-20)",
      today: "2026-04-20",
      expect: { status: "upcoming", daysUntilStart: 8 },
    },
    {
      label: "Tijdens de reis (2026-05-03, dag 6)",
      today: "2026-05-03",
      expect: { status: "active", currentDayNumber: 6 },
    },
    {
      label: "Na de reis (2026-05-20)",
      today: "2026-05-20",
      expect: { status: "past", daysSinceEnd: 8 },
    },
  ];

  const results = cases.map(({ label, today, expect: ex }) => {
    const result = getTripProgress(today, days);
    const checks = (Object.keys(ex) as Array<keyof TripProgress>).map(
      (k) => result[k] === ex[k]
    );
    const ok = checks.every(Boolean);
    const detail = ok
      ? `status=${result.status}`
      : `expected ${JSON.stringify(ex)}, got ${JSON.stringify(
          Object.fromEntries((Object.keys(ex) as Array<keyof TripProgress>).map((k) => [k, result[k]]))
        )}`;
    return { label, passed: ok, detail };
  });

  return { passed: results.every((r) => r.passed), results };
}
