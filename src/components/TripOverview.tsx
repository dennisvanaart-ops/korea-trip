"use client";

import { useEffect, useState } from "react";
import { useTripState } from "@/lib/useTripState";
import { TripStateContext } from "@/lib/TripStateContext";
import { TripHeaderButton } from "./TripHeaderButton";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Root of the homepage layout.
 *
 * Owns TripStateContext so all descendants share:
 *  – today / progress / todayIndex / refresh
 *  – activeDayIndex / setActiveDayIndex  ← scroll-synced active day
 *
 * activeDayIndex is managed here (not in TripNavigation) so that
 * TripStatusCard can also read it without prop-drilling.
 *
 * ┌─────────────────────────────┐  flex-shrink-0
 * │  TripHeaderButton           │
 * │  TripStatusCard             │  shows weather for activeDayIndex
 * ├─────────────────────────────┤  flex-1  min-h-0
 * │  TripNavigation             │  updates activeDayIndex on scroll
 * └─────────────────────────────┘
 */
export function TripOverview() {
  const tripState = useTripState();

  // Initialise to today's day index (or 0 when trip is upcoming/past)
  const [activeDayIndex, setActiveDayIndex] = useState(
    () => Math.max(0, tripState.todayIndex),
  );

  // Reset when the trip date changes (midnight tick or manual refresh)
  useEffect(() => {
    setActiveDayIndex(Math.max(0, tripState.todayIndex));
  }, [tripState.todayIndex]); // todayIndex is memoized — only changes on real refresh

  const contextValue = {
    ...tripState,
    activeDayIndex,
    setActiveDayIndex,
  };

  return (
    <TripStateContext.Provider value={contextValue}>
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "calc(100dvh - 56px - env(safe-area-inset-bottom, 0px))" }}
      >
        {/* ── Fixed top ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <TripHeaderButton />
          <TripStatusCard />
        </div>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <TripNavigation />
      </div>
    </TripStateContext.Provider>
  );
}
