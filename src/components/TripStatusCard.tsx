"use client";

import Link from "next/link";
import { useMemo } from "react";
import { tripDays } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";
import { TRIP_START, TRIP_END } from "@/data/trip";

function fmt(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TripStatusCard() {
  const today = getToday();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);

  // ── VOOR DE REIS ──────────────────────────────────────────────────────────
  if (progress.status === "upcoming") {
    const start = new Date(`${TRIP_START}T12:00:00`).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <div className="mx-4 mb-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
          Aankomende reis
        </p>
        <p className="text-xl font-bold text-gray-900 leading-snug">
          Je reis begint over{" "}
          <span className="text-blue-600">
            {progress.daysUntilStart} dag{progress.daysUntilStart !== 1 ? "en" : ""}
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-1 capitalize">{start}</p>
      </div>
    );
  }

  // ── NA DE REIS ────────────────────────────────────────────────────────────
  if (progress.status === "past") {
    return (
      <div className="mx-4 mb-4 rounded-2xl bg-gray-100 border border-gray-200 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          Afgeronde reis
        </p>
        <p className="text-xl font-bold text-gray-700">Je reis is afgerond</p>
        <p className="text-sm text-gray-400 mt-1">
          {fmt(TRIP_START)} – {fmt(TRIP_END)}
        </p>
      </div>
    );
  }

  // ── TIJDENS DE REIS ───────────────────────────────────────────────────────
  const day = progress.currentDay;
  const dayIdx = day ? tripDays.findIndex((d) => d.date === day.date) : -1;
  const nextDay = dayIdx >= 0 ? tripDays[dayIdx + 1] ?? null : null;

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-green-50 border border-green-200 px-4 py-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-green-600">
          Reis bezig
        </p>
        <span className="text-[11px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
          Dag {progress.currentDayNumber} / {progress.totalDays}
        </span>
      </div>

      {day ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{day.emoji}</span>
            <p className="text-base font-bold text-gray-900 leading-snug">
              {day.title}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 ml-9">{day.location}</p>

          {nextDay && (
            <p className="text-xs text-gray-400 mt-2 ml-9">
              Morgen:{" "}
              <span className="font-medium text-gray-600">{nextDay.title}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-base font-semibold text-gray-700">
          Dag {progress.currentDayNumber} van {progress.totalDays}
        </p>
      )}

      {day && (
        <Link
          href={`/day/${day.date}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-green-700"
        >
          Bekijk vandaag
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}
