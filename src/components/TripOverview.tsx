"use client";

import { useTripState } from "@/lib/useTripState";
import { TripStateContext } from "@/lib/TripStateContext";
import { TripHeaderButton } from "./TripHeaderButton";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Root of the homepage layout.
 *
 * Owns the shared TripStateContext so all descendants can:
 *  – Read today / progress / todayIndex without duplicating getToday() calls
 *  – Call refresh() to trigger a coordinated, non-reloading state update
 *
 * ┌─────────────────────────────┐  flex-shrink-0
 * │  TripHeaderButton           │  compact header + refresh button
 * │  TripStatusCard             │  current-day status strip
 * ├─────────────────────────────┤  flex-1  min-h-0
 * │  TripNavigation             │  map + toggle + day wheel/list
 * └─────────────────────────────┘
 */
export function TripOverview() {
  const tripState = useTripState();

  return (
    <TripStateContext.Provider value={tripState}>
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
