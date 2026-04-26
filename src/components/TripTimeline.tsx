"use client";

import { useEffect, useMemo, useRef } from "react";
import { tripDays } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import { DayCard } from "./DayCard";

export function TripTimeline() {
  const today = getToday();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);
  const todayRef = useRef<HTMLDivElement>(null);
  const lastDayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="px-4 space-y-2 pb-12">
      {tripDays.map((day, idx) => {
        const isToday = progress.status === "active" && day.date === today;
        const isLast = idx === tripDays.length - 1;
        return (
          <div
            key={day.date}
            ref={isToday ? todayRef : isLast ? lastDayRef : undefined}
          >
            <DayCard
              day={day}
              isToday={isToday}
              onNavigate={(scrollY) => handleCardClick(day.date, scrollY)}
            />
          </div>
        );
      })}
    </div>
  );
}
