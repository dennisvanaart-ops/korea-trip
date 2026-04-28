"use client";

import { useEffect, useRef } from "react";
import { tripDays } from "@/data/trip";
import { useTripStateContext } from "@/lib/TripStateContext";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import { getTransitionBetweenDays } from "@/lib/tripHelpers";
import { DayCard } from "./DayCard";
import { DayTransition } from "./DayTransition";

export function TripTimeline() {
  const { today, progress, todayIndex } = useTripStateContext();

  const todayRef   = useRef<HTMLDivElement>(null);
  const lastDayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore scroll or auto-scroll to today
  useEffect(() => {
    const { sourceView, listScrollY } = getNavigationState();

    if (sourceView === "list" && listScrollY !== undefined && listScrollY > 0) {
      const container = containerRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
      if (container) {
        requestAnimationFrame(() => { container.scrollTop = listScrollY; });
      }
    } else if (progress.status === "active" && todayRef.current) {
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    } else if (progress.status === "past" && lastDayRef.current) {
      const timer = setTimeout(() => {
        lastDayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress.status]);

  function handleCardClick(date: string, scrollY: number) {
    saveNavigationState({ selectedDate: date, sourceView: "list", listScrollY: scrollY });
  }

  return (
    <div ref={containerRef} className="pb-12">
      {/* Day cards */}
      <div className="px-4 pt-3">
        {tripDays.map((day, idx) => {
          const isToday = progress.status === "active" && day.date === today;
          const isLast  = idx === tripDays.length - 1;
          const prevDay = idx > 0 ? tripDays[idx - 1] : null;
          const transition = prevDay ? getTransitionBetweenDays(prevDay, day) : null;

          return (
            <div
              key={day.date}
              ref={isToday ? todayRef : isLast ? lastDayRef : undefined}
            >
              {transition ? (
                <div className="py-1">
                  <DayTransition transition={transition} />
                </div>
              ) : (
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
