"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import type { TripDay } from "@/data/trip";
import { getTodayAmsterdam, getTripProgress } from "@/lib/tripProgress";

const CARD_H = 84;
const GAP = 8;
const STRIDE = CARD_H + GAP;

function WheelCard({
  day,
  distance,
  isToday,
  focusIndex,
  dayIndex,
}: {
  day: TripDay;
  distance: number;
  isToday: boolean;
  focusIndex: number;
  dayIndex: number;
}) {
  const dateObj = new Date(`${day.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  const opacity = distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25;
  const scale = distance === 0 ? 1 : distance === 1 ? 0.92 : 0.84;
  const blur = distance >= 2 ? "blur(0.5px)" : "none";

  const isActive = distance === 0;

  let borderClass = "border-gray-200 bg-gray-50";
  let shadowStyle: React.CSSProperties = {};
  if (isActive) {
    if (isToday) {
      borderClass = "border-green-300 bg-green-50";
      shadowStyle = { boxShadow: "0 4px 12px 0 rgb(134 239 172 / 0.5)" };
    } else {
      borderClass = "border-blue-200 bg-white";
      shadowStyle = { boxShadow: "0 4px 12px 0 rgb(191 219 254 / 0.5)" };
    }
  }

  return (
    <Link href={`/day/${day.date}`} className="block mx-4">
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: blur,
          transition: "opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease",
          height: CARD_H,
          ...shadowStyle,
        }}
        className={[
          "flex items-center gap-3 rounded-xl border px-4",
          borderClass,
        ].join(" ")}
      >
        <div className="flex-shrink-0 w-10 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
            {weekday}
          </p>
          <p
            className={[
              "text-xl font-bold leading-none mt-0.5",
              isToday && isActive ? "text-green-700" : isActive ? "text-blue-700" : "text-gray-500",
            ].join(" ")}
          >
            {dayNum}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{month}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={["text-base leading-none", !isActive && "opacity-60"].filter(Boolean).join(" ")}>
              {day.emoji}
            </span>
            <p
              className={[
                "text-sm font-semibold truncate",
                isToday && isActive
                  ? "text-green-900"
                  : isActive
                  ? "text-gray-900"
                  : "text-gray-400",
              ].join(" ")}
            >
              {day.title}
            </p>
          </div>
          <p className={["text-xs truncate mt-0.5", isActive ? "text-gray-500" : "text-gray-400"].join(" ")}>
            {day.location}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-1.5">
          {isActive && (
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-tight",
                isToday
                  ? "bg-green-200 text-green-800"
                  : "bg-blue-100 text-blue-700",
              ].join(" ")}
            >
              {isToday ? "Vandaag" : `Dag ${dayIndex + 1}`}
            </span>
          )}
          <svg
            className={isActive ? "text-gray-400" : "text-gray-300"}
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
  const isScrollingToToday = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onScroll() {
      if (!el || isScrollingToToday.current) return;
      const idx = Math.round(el.scrollTop / STRIDE);
      setActiveIndex(Math.max(0, Math.min(tripDays.length - 1, idx)));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = initialIndex * STRIDE;
  }, [initialIndex]);

  function scrollToToday() {
    const el = containerRef.current;
    if (!el) return;
    isScrollingToToday.current = true;
    el.scrollTo({ top: initialIndex * STRIDE, behavior: "smooth" });
    setActiveIndex(initialIndex);
    setTimeout(() => { isScrollingToToday.current = false; }, 600);
  }

  const showTodayButton =
    progress.status === "active" && activeIndex !== initialIndex;

  return (
    <div className="relative" style={{ height: "58svh" }}>
      {/* Fade overlay top */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: "30%",
          background: "linear-gradient(to bottom, rgb(249 250 251) 0%, transparent 100%)",
        }}
      />

      {/* Fade overlay bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: "30%",
          background: "linear-gradient(to top, rgb(249 250 251) 0%, transparent 100%)",
        }}
      />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-scroll overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
        }}
      >
        {/* Top spacer to allow first card to center */}
        <div style={{ height: `calc(50% - ${CARD_H / 2}px)`, flexShrink: 0 }} />

        {tripDays.map((day, i) => {
          const isToday = progress.status === "active" && day.date === today;
          const distance = Math.abs(i - activeIndex);
          return (
            <div
              key={day.date}
              style={{
                height: CARD_H,
                marginBottom: GAP,
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
              }}
            >
              <WheelCard
                day={day}
                distance={distance}
                isToday={isToday}
                focusIndex={activeIndex}
                dayIndex={i}
              />
            </div>
          );
        })}

        {/* Bottom spacer to allow last card to center */}
        <div style={{ height: `calc(50% - ${CARD_H / 2}px)`, flexShrink: 0 }} />
      </div>

      {/* Floating "Vandaag" button */}
      {showTodayButton && (
        <button
          onClick={scrollToToday}
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg active:bg-green-700 transition-colors"
          style={{ transform: "translateX(-50%)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Vandaag
        </button>
      )}
    </div>
  );
}
