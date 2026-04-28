"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import { getTransitionBetweenDays } from "@/lib/tripHelpers";
import { DayCard } from "./DayCard";
import { DayTransition } from "./DayTransition";
import { RouteMapPreview } from "./RouteMapPreview";

export function TripTimeline() {
  const today = getToday();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);
  const todayRef = useRef<HTMLDivElement>(null);
  const lastDayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current day index (0-based in tripDays array) — -1 when not active
  const todayIndex = useMemo(() => {
    if (progress.status !== "active" || !progress.currentDay) return -1;
    return tripDays.findIndex((d) => d.date === progress.currentDay!.date);
  }, [progress]);

  // Restore scroll position when coming back from a day detail page,
  // or auto-scroll to the relevant day on first visit.
  useEffect(() => {
    const { sourceView, listScrollY } = getNavigationState();

    if (sourceView === "list" && listScrollY !== undefined && listScrollY > 0) {
      // Coming back from a list card click — restore exact scroll position.
      const container = containerRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
      if (container) {
        requestAnimationFrame(() => { container.scrollTop = listScrollY; });
      }
    } else if (progress.status === "active" && todayRef.current) {
      // During trip — scroll to today.
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    } else if (progress.status === "past" && lastDayRef.current) {
      // After trip — scroll to the last day.
      const timer = setTimeout(() => {
        lastDayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
    // upcoming → stays at top (first day is already visible)
  }, [progress.status]);

  function handleCardClick(date: string, scrollY: number) {
    saveNavigationState({
      selectedDate: date,
      sourceView: "list",
      listScrollY: scrollY,
    });
  }

  return (
    <div ref={containerRef} className="pb-12">
      {/* ── Route overview map ──────────────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Route overzicht
          </p>
          <Link
            href="/flights"
            className="text-xs font-medium text-blue-600 active:opacity-70"
          >
            Vluchten →
          </Link>
        </div>
        <RouteMapPreview
          status={progress.status}
          currentDayIndex={todayIndex}
        />
      </div>

      {/* ── Day cards ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        {tripDays.map((day, idx) => {
          const isToday = progress.status === "active" && day.date === today;
          const isLast = idx === tripDays.length - 1;
          const prevDay = idx > 0 ? tripDays[idx - 1] : null;
          const transition = prevDay ? getTransitionBetweenDays(prevDay, day) : null;

          return (
            <div
              key={day.date}
              ref={isToday ? todayRef : isLast ? lastDayRef : undefined}
            >
              {/* Transport connector before this card */}
              {transition ? (
                <div className="py-1">
                  <DayTransition transition={transition} />
                </div>
              ) : (
                // Subtle gap when no connector
                <div className="h-2" />
              )}

              <DayCard
                day={day}
                isToday={isToday}
                onNavigate={(scrollY) => handleCardClick(day.date, scrollY)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
