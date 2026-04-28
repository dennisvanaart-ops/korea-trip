"use client";

import { useEffect, useRef } from "react";
import { tripDays } from "@/data/trip";
import { useTripStateContext } from "@/lib/TripStateContext";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import { getTransitionBetweenDays } from "@/lib/tripHelpers";
import { DayCard } from "./DayCard";
import { DayTransition } from "./DayTransition";

interface TripTimelineProps {
  /** Called when the visible/focused day changes — use to sync map highlight */
  onActiveDayChange?: (dayIndex: number) => void;
}

export function TripTimeline({ onActiveDayChange }: TripTimelineProps) {
  const { today, progress, todayIndex } = useTripStateContext();

  const todayRef   = useRef<HTMLDivElement>(null);
  const lastDayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map from day index → card DOM element
  const cardRefs = useRef(new Map<number, HTMLDivElement>());

  // Stable ref so the scroll handler never captures a stale callback
  const onActiveDayChangeRef = useRef(onActiveDayChange);
  useEffect(() => { onActiveDayChangeRef.current = onActiveDayChange; }, [onActiveDayChange]);

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

  // Scroll-based active day detection
  useEffect(() => {
    const getScrollContainer = () =>
      containerRef.current?.closest(".overflow-y-auto") as HTMLElement | null;

    let raf = 0;

    function detectActiveDay() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollContainer = getScrollContainer();
        if (!scrollContainer) return;

        const containerRect = scrollContainer.getBoundingClientRect();
        const focusY = containerRect.top + containerRect.height * 0.4;

        let bestIdx = todayIndex;
        let bestDist = Infinity;

        cardRefs.current.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const cardCenterY = rect.top + rect.height / 2;
          const dist = Math.abs(cardCenterY - focusY);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });

        onActiveDayChangeRef.current?.(bestIdx);
      });
    }

    const setup = setTimeout(() => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;
      scrollContainer.addEventListener("scroll", detectActiveDay, { passive: true });
      detectActiveDay();
    }, 400);

    return () => {
      clearTimeout(setup);
      cancelAnimationFrame(raf);
      const scrollContainer = getScrollContainer();
      scrollContainer?.removeEventListener("scroll", detectActiveDay);
    };
  }, [todayIndex]);

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
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(idx, el);
                  if (isToday) (todayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  if (isLast) (lastDayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                } else {
                  cardRefs.current.delete(idx);
                }
              }}
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
