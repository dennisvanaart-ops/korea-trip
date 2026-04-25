"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import type { TripDay } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";

// Base dimensions — all cards use the same snap stride so math stays simple.
// The active card looks bigger via horizontal margin & shadow, not height.
const CARD_H = 80;
const GAP = 10;
const STRIDE = CARD_H + GAP; // 90px per snap stop

function WheelCard({
  day,
  distance,
  isToday,
  dayIndex,
  onNavigate,
}: {
  day: TripDay;
  distance: number;
  isToday: boolean;
  dayIndex: number;
  onNavigate: () => void;
}) {
  const dateObj = new Date(`${day.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  const isActive = distance === 0;

  // Subtle wheel: gentle falloff, no blur
  const opacity =
    distance === 0 ? 1 : distance === 1 ? 0.58 : distance === 2 ? 0.28 : 0.14;
  const scale =
    distance === 0 ? 1 : distance === 1 ? 0.96 : 0.93;

  // Active card: slightly wider (less horizontal margin)
  const mx = isActive ? "mx-3" : "mx-5";

  let borderClass: string;
  let shadowStyle: React.CSSProperties = {};

  if (isActive) {
    if (isToday) {
      borderClass = "border-green-300 bg-green-50/90";
      shadowStyle = { boxShadow: "0 3px 12px 0 rgba(134,239,172,0.40)" };
    } else {
      borderClass = "border-blue-200 bg-white";
      shadowStyle = { boxShadow: "0 3px 12px 0 rgba(191,219,254,0.45)" };
    }
  } else {
    borderClass = "border-gray-200 bg-gray-50/70";
  }

  return (
    <Link href={`/day/${day.date}`} className={`block ${mx}`} onClick={onNavigate}>
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          transition: "opacity 0.16s ease, transform 0.16s ease",
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
              className={["text-base leading-none", !isActive && "opacity-40"]
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

  // Priority: sessionStorage saved index → today's index → 0
  const initialIndex = useMemo(() => {
    const saved = getNavigationState().wheelActiveIndex;
    if (saved !== undefined && saved >= 0 && saved < tripDays.length) return saved;
    if (progress.status === "active" && progress.currentDayNumber !== null) {
      return progress.currentDayNumber - 1;
    }
    if (progress.status === "past") return tripDays.length - 1;
    return 0;
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const outerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // spacerH centres the focus card at ~47% of the container height
  // (slightly above center feels more natural on a phone)
  const [spacerH, setSpacerH] = useState(0);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () => {
      // 47% gives a focus position that reads as "center" but sits very
      // slightly higher — removes the feeling of the card being low.
      const focusOffset = Math.floor(el.clientHeight * 0.47 - CARD_H / 2);
      setSpacerH(Math.max(0, focusOffset));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || spacerH === 0) return;
    el.scrollTop = initialIndex * STRIDE;
    setActiveIndex(initialIndex);
  }, [initialIndex, spacerH]);

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

  const BG = "rgb(249 250 251)";

  // Focus band top position matches the spacer calculation
  const focusBandTop = spacerH > 0 ? spacerH : undefined;

  return (
    <div ref={outerRef} className="relative" style={{ height: "100%" }}>
      {/* Top fade — less aggressive so cards appear closer to top */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: "22%",
          background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: "22%",
          background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        }}
      />

      {/* Subtle focus band — only visible once spacer is computed */}
      {focusBandTop !== undefined && (
        <div
          className="absolute inset-x-0 z-0 pointer-events-none"
          style={{
            top: focusBandTop,
            height: CARD_H,
            background: "rgba(248, 250, 252, 0.6)",
            borderTop: "1px solid rgba(203, 213, 225, 0.35)",
            borderBottom: "1px solid rgba(203, 213, 225, 0.35)",
          }}
        />
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-scroll overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div style={{ height: spacerH }} />

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
                onNavigate={() =>
                  saveNavigationState({
                    selectedDate: day.date,
                    sourceView: "wheel",
                    wheelActiveIndex: i,
                  })
                }
              />
            </div>
          );
        })}

        <div style={{ height: spacerH }} />
      </div>

      {/* "Vandaag" jump button */}
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
