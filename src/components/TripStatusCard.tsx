"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTripStateContext } from "@/lib/TripStateContext";
import { tripDays } from "@/data/trip";
import { getDayType } from "@/lib/tripHelpers";
import { TRIP_START, TRIP_END } from "@/data/trip";
import { TRIP_ROUTE, getActiveTripPoint } from "@/lib/tripSegments";
import { useWeather } from "@/lib/useWeather";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * WeatherWidget — reads activeDayIndex from context, debounces it (800 ms),
 * derives the geo-location from the trip route, and fetches weather.
 *
 * Debounce prevents a fetch on every wheel snap during fast scroll.
 * The cache in useWeather suppresses redundant network calls.
 */
function WeatherWidget() {
  const { activeDayIndex } = useTripStateContext();

  // Debounce: only update the location after the user has paused scrolling
  const [debouncedIdx, setDebouncedIdx] = useState(activeDayIndex);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedIdx(activeDayIndex), 800);
    return () => clearTimeout(t);
  }, [activeDayIndex]);

  const activePoint = getActiveTripPoint(TRIP_ROUTE.points, debouncedIdx);
  const weather = useWeather(activePoint?.lat ?? null, activePoint?.lng ?? null);

  if (!weather) return null;

  return (
    <span className="flex items-center gap-0.5 text-[11px] text-gray-500 tabular-nums">
      <span className="leading-none">{weather.icon}</span>
      <span className="font-medium">{weather.temp}°</span>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TripStatusCard() {
  const { progress } = useTripStateContext();

  // ── VOOR DE REIS ─────────────────────────────────────────────────────────
  if (progress.status === "upcoming") {
    const start = new Date(`${TRIP_START}T12:00:00`).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <div className="mx-4 mb-3 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">
              Aankomende reis
            </p>
            <p className="text-sm font-bold text-gray-900 leading-snug">
              Vertrek over{" "}
              <span className="text-blue-600">
                {progress.daysUntilStart} dag{progress.daysUntilStart !== 1 ? "en" : ""}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{start}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <WeatherWidget />
            <span className="text-2xl leading-none">✈️</span>
          </div>
        </div>
      </div>
    );
  }

  // ── NA DE REIS ───────────────────────────────────────────────────────────
  if (progress.status === "past") {
    return (
      <div className="mx-4 mb-3 rounded-2xl bg-gray-100 border border-gray-200 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
          Afgeronde reis
        </p>
        <p className="text-sm font-bold text-gray-700">Reis afgerond 🎉</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {fmt(TRIP_START)} – {fmt(TRIP_END)}
        </p>
      </div>
    );
  }

  // ── TIJDENS DE REIS ──────────────────────────────────────────────────────
  const day = progress.currentDay;
  const dayIdx = day ? tripDays.findIndex((d) => d.date === day.date) : -1;
  const nextDay = dayIdx >= 0 ? tripDays[dayIdx + 1] ?? null : null;
  const dayType = day ? getDayType(day) : null;
  const statusLine = day?.location ?? `Dag ${progress.currentDayNumber}`;

  return (
    <div className="mx-4 mb-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">
          Reisstatus
        </p>
        <div className="flex items-center gap-2">
          {/* Weather for the scrolled active day */}
          <WeatherWidget />
          <span className="text-[11px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
            Dag {progress.currentDayNumber} / {progress.totalDays}
          </span>
        </div>
      </div>

      {/* Main row */}
      <div className="flex items-center gap-3">
        {day && <span className="text-xl leading-none flex-shrink-0">{day.emoji}</span>}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {statusLine}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {dayType && dayType !== "Verblijf" && (
              <span
                className={[
                  "text-[10px] font-medium rounded-full px-1.5 py-0.5",
                  dayType === "Reisdag"
                    ? "bg-amber-100 text-amber-700"
                    : dayType === "Vlucht"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-purple-100 text-purple-700",
                ].join(" ")}
              >
                {dayType}
              </span>
            )}
            {nextDay && (
              <p className="text-[11px] text-gray-400 truncate">
                Morgen: <span className="font-medium text-gray-500">{nextDay.location}</span>
              </p>
            )}
          </div>
        </div>

        {day && (
          <Link
            href={`/day/${day.date}`}
            className="flex-shrink-0 flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white active:bg-green-700"
          >
            Vandaag
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
