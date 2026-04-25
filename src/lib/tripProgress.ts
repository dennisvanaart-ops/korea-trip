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

export function getTodayAmsterdam(): string {
  const parts = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value ?? "2026";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
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
