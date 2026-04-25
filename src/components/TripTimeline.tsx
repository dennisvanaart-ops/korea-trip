"use client";

import { useEffect, useMemo, useRef } from "react";
import { tripDays } from "@/data/trip";
import { getTodayAmsterdam, getTripProgress } from "@/lib/tripProgress";
import { DayCard } from "./DayCard";

export function TripTimeline() {
  const today = getTodayAmsterdam();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progress.status !== "active" || !todayRef.current) return;
    const timer = setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(timer);
  }, [progress.status]);

  return (
    <div className="px-4 space-y-2 pb-12">
      {tripDays.map((day) => {
        const isToday = progress.status === "active" && day.date === today;
        return (
          <div key={day.date} ref={isToday ? todayRef : undefined}>
            <DayCard day={day} isToday={isToday} />
          </div>
        );
      })}
    </div>
  );
}
