"use client";

import Link from "next/link";
import { useMemo } from "react";
import { tripDays } from "@/data/trip";
import { getTodayAmsterdam, getTripProgress } from "@/lib/tripProgress";

export function TripStatusCard() {
  const today = getTodayAmsterdam();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);

  const formattedStart = new Date(
    "2026-04-28T12:00:00"
  ).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (progress.status === "upcoming") {
    return (
      <div className="mx-4 mb-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
          Aankomende reis
        </p>
        <p className="text-lg font-bold text-gray-900">
          Je reis begint over {progress.daysUntilStart} dag
          {progress.daysUntilStart !== 1 ? "en" : ""}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">Start: {formattedStart}</p>
      </div>
    );
  }

  if (progress.status === "past") {
    return (
      <div className="mx-4 mb-4 rounded-xl bg-gray-100 border border-gray-200 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Afgeronde reis
        </p>
        <p className="text-lg font-bold text-gray-700">Deze reis is afgerond</p>
        <p className="text-sm text-gray-500 mt-0.5">Bekijk het volledige reisschema hieronder</p>
      </div>
    );
  }

  // active
  const day = progress.currentDay;
  const formattedToday = new Date(`${today}T12:00:00`).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-4 mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
        Reis bezig
      </p>
      <p className="text-lg font-bold text-gray-900">
        Dag {progress.currentDayNumber} van {progress.totalDays}
      </p>
      <p className="text-sm text-gray-500 mt-0.5 capitalize">{formattedToday}</p>
      {day && (
        <p className="text-sm font-medium text-gray-700 mt-1">{day.location}</p>
      )}
      {day && (
        <Link
          href={`/day/${day.date}`}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white active:bg-green-700"
        >
          Bekijk vandaag
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
