"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import type { TripDay } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";

const CARD_H = 84;
const GAP = 8;
const STRIDE = CARD_H + GAP; // 92px per item

function WheelCard({
  day,
  distance,
  isToday,
  dayIndex,
}: {
  day: TripDay;
  distance: number;
  isToday: boolean;
  dayIndex: number;
}) {
  const dateObj = new Date(`${day.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  const isActive = distance === 0;

  // Stronger wheel effect — items far away almost disappear
  const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.18;
  const scale = distance === 0 ? 1 : distance === 1 ? 0.91 : 0.82;
  const blur = distance >= 2 ? "blur(1px)" : "none";

  let borderClass = "border-gray-200 bg-gray-50/80";
  let shadowStyle: React.CSSProperties = {};
  if (isActive) {
    if (isToday) {
      borderClass = "border-green-300 bg-green-50";
      shadowStyle = { boxShadow: "0 4px 16px 0 rgb(134 239 172 / 0.45)" };
    } else {
      borderClass = "border-blue-200 bg-white";
      shadowStyle = { boxShadow: "0 4px 16px 0 rgb(191 219 254 / 0.5)" };
    }
  }

  return (
    <Link href={`/day/${day.date}`} className="block mx-4">
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: blur,
          transition: "opacity 0.18s ease, transform 0.18s ease, filter 0.18s ease",
          height: CARD_H,
          ...shadowStyle,
        }}
        className={[
          "flex items-center gap-3 rounded-xl border px-4",
          borderClass,
        ].join(" ")}
      >
        {/* Date column */}
        <div className="flex-shrink-0 w-10 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
            {weekday}
          </p>
          <p
            className={[
              "text-xl font-bold leading-none mt-0.5",
              isToday && isActive
                ? "text-green-700"
                : isActive
                ? "text-blue-700"
                : "text-gray-400",
            ].join(" ")}
          >
            {dayNum}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{month}</p>
        </div>

        {/* Title + location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={[
                "text-base leading-none",
                !isActive && "opacity-50",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
          <p
            className={[
              "text-xs truncate mt-0.5",
              isActive ? "text-gray-500" : "text-gray-400",
            ].join(" ")}
          >
            {day.location}
          </p>
        </div>

        {/* Badge + chevron */}
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
  const today = getToday();
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);

  const initialIndex = useMemo(() => {
    if (progress.status === "active" && progress.currentDayNumber !== null) {
      return progress.currentDayNumber - 1;
    }
    if (progress.status === "past") return tripDays.length - 1;
    return 0;
  }, [progress]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // outerRef measures the visible container height for precise spacer calc.
  const outerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // spacerH: how many px to pad before card-0 and after last card so that
  // card-i centers at scrollTop = i * STRIDE.
  const [spacerH, setSpacerH] = useState(0);

  // Step 1: measure container, compute spacer (before first paint).
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () =>
      setSpacerH(Math.max(0, Math.floor(el.clientHeight / 2 - CARD_H / 2)));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Step 2: once spacer is known, jump scroll to initial day (before paint).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || spacerH === 0) return;
    el.scrollTop = initialIndex * STRIDE;
    setActiveIndex(initialIndex);
  }, [initialIndex, spacerH]);

  // Step 3: track active index as the user scrolls.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        const idx = Math.round(el.scrollTop / STRIDE);
        setActiveIndex(Math.max(0, Math.min(tripDays.length - 1, idx)));
      });
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  function scrollToToday() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: initialIndex * STRIDE, behavior: "smooth" });
    setActiveIndex(initialIndex);
  }

  const showTodayButton =
    progress.status === "active" && activeIndex !== initialIndex;

  // Gradient colour matching the page background (gray-50)
  const BG = "rgb(249 250 251)";

  return (
    <div ref={outerRef} className="relative" style={{ height: "62svh" }}>
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: "28%",
          background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: "28%",
          background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        }}
      />

      {/* Focus-zone highlight ring — sits at exact vertical centre */}
      <div
        className="absolute inset-x-4 z-10 pointer-events-none rounded-2xl"
        style={{
          top: `calc(50% - ${CARD_H / 2}px)`,
          height: CARD_H,
          background: "rgba(240, 253, 244, 0.4)",
          boxShadow: "inset 0 0 0 1px rgba(134, 239, 172, 0.5)",
        }}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-scroll overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          // hide scrollbar cross-browser
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Top spacer — exact px so card-0 snaps to center */}
        <div style={{ height: spacerH, flexShrink: 0 }} />

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
                dayIndex={i}
              />
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ height: spacerH, flexShrink: 0 }} />
      </div>

      {/* Floating "Vandaag" button — only during trip when scrolled away */}
      {showTodayButton && (
        <button
          onClick={scrollToToday}
          className="absolute bottom-4 left-1/2 z-20 flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg active:bg-green-700 transition-colors"
          style={{ transform: "translateX(-50%)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            <path
              d="M8 1v3M8 12v3M1 8h3M12 8h3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Vandaag
        </button>
      )}
    </div>
  );
}
