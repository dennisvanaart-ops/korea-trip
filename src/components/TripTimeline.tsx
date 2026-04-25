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
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore scroll position when coming back from a day detail page,
  // or scroll to today on first visit.
  useEffect(() => {
    const { sourceView, listScrollY } = getNavigationState();

    if (sourceView === "list" && listScrollY !== undefined && listScrollY > 0) {
      // Coming back from a list card click — restore exact scroll position.
      // Use the parent scroll container (TripNavigation's overflow-y-auto div).
      const container = containerRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
      if (container) {
        // Small rAF delay to ensure layout is complete before setting scrollTop.
        requestAnimationFrame(() => { container.scrollTop = listScrollY; });
      }
    } else if (progress.status === "active" && todayRef.current) {
      // Fresh visit during trip — scroll to today.
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
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
      {tripDays.map((day) => {
        const isToday = progress.status === "active" && day.date === today;
        return (
          <div key={day.date} ref={isToday ? todayRef : undefined}>
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
