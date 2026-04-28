"use client";

import { createContext, useContext } from "react";
import type { TripStateValue } from "./useTripState";

/**
 * Extended context value: adds the scroll-synced active day index
 * (managed by TripOverview, updated by TripNavigation, read by TripStatusCard).
 */
export interface TripContextValue extends TripStateValue {
  /** Day index currently focused in the wheel/list — follows scroll position */
  activeDayIndex: number;
  /** Setter for activeDayIndex — called by TripNavigation on scroll/snap */
  setActiveDayIndex: (idx: number) => void;
}

export const TripStateContext = createContext<TripContextValue | null>(null);

/** Hook to consume the trip state context. Throws if called outside the provider. */
export function useTripStateContext(): TripContextValue {
  const ctx = useContext(TripStateContext);
  if (!ctx) {
    throw new Error("useTripStateContext must be called inside <TripOverview>");
  }
  return ctx;
}
