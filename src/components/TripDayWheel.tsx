"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import type { TripDay } from "@/data/trip";
import { getTodayAmsterdam, getTripProgress } from "@/lib/tripProgress";

const CARD_H = 80;
const GAP = 8;
const STRIDE = CARD_H + GAP;

function WheelCard({
  day,
  distance,
  isToday,
}: {
  day: TripDay;
  distance: number;
  isToday: boolean;
}) {
  const dateObj = new Date(`${day.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  const opacity = distance === 0 ? 1 : distance === 1 ? 0.45 : 0.2;
  const scale = distance === 0 ? 1 : distance === 1 ? 0.96 : 0.92;

  return (
    <Link href={`/day/${day.date}`} className="block mx-4">
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
        className={[
          "flex items-center gap-3 rounded-xl border px-4 py-2.5",
          distance === 0
            ? isToday
              ? "bg-green-50 border-green-300 shadow-sm"
              : "bg-white border-blue-200 shadow-sm"
            : "bg-gray-50 border-gray-200",
        ].join(" ")}
      >
        <div className="flex-shrink-0 w-10 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
            {weekday}
          </p>
          <p
            className={[
              "text-xl font-bold leading-none mt-0.5",
              isToday ? "text-green-700" : "text-gray-900",
            ].join(" ")}
          >
            {dayNum}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{month}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{day.emoji}</span>
            <p
              className={[
                "text-sm font-semibold truncate",
                isToday ? "text-green-900" : "text-gray-900",
              ].join(" ")}
            >
              {day.title}
            </p>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{day.location}</p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-1.5">
          {isToday && distance === 0 && (
            <span className="rounded-full bg-green-200 px-1.5 py-0.5 text-[10px] font-semibold text-green-800 leading-tight">
              Vandaag
            </span>
          )}
          <svg
            className={distance === 0 ? "text-gray-400" : "text-gray-300"}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function TripDayWheel() {
  const today = getTodayAmsterdam();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);

  const initialIndex = useMemo(() => {
    if (progress.status === "active" && progress.currentDayNumber !== null) {
      return progress.currentDayNumber - 1;
    }
    if (progress.status === "past") return tripDays.length - 1;
    return 0;
  }, [progress]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollingRef = useRef(false);

  // Sync active index from scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const idx = Math.round(el.scrollTop / STRIDE);
      setActiveIndex(Math.max(0, Math.min(tripDays.length - 1, idx)));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to initial index on mount (instant, no animation)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    scrollingRef.current = true;
    el.scrollTop = initialIndex * STRIDE;
    scrollingRef.current = false;
  }, [initialIndex]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-scroll overscroll-contain"
      style={{
        height: "60svh",
        scrollSnapType: "y mandatory",
        // hide scrollbar visually but keep functional
        scrollbarWidth: "none",
      }}
    >
      {/* Top spacer so first card can center */}
      <div
        aria-hidden="true"
        style={{ height: `calc(50% - ${CARD_H / 2}px)` }}
      />

      {tripDays.map((day, i) => {
        const isToday = progress.status === "active" && day.date === today;
        const distance = Math.abs(i - activeIndex);
        return (
          <div
            key={day.date}
            ref={(el) => { itemRefs.current[i] = el; }}
            data-index={i}
            style={{
              height: CARD_H,
              marginBottom: i < tripDays.length - 1 ? GAP : 0,
              scrollSnapAlign: "center",
              scrollSnapStop: "always",
            }}
          >
            <WheelCard day={day} distance={distance} isToday={isToday} />
          </div>
        );
      })}

      {/* Bottom spacer so last card can center */}
      <div
        aria-hidden="true"
        style={{ height: `calc(50% - ${CARD_H / 2}px)` }}
      />
    </div>
  );
}
