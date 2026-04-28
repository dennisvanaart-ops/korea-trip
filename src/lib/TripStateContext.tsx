"use client";

import { createContext, useContext } from "react";
import type { TripStateValue } from "./useTripState";

/**
 * Shared trip state — provided by TripOverview, consumed by any
 * descendant component (TripHeaderButton, TripStatusCard, TripNavigation,
 * TripTimeline, etc.).
 */
export const TripStateContext = createContext<TripStateValue | null>(null);

/** Hook to consume the trip state context. Throws if called outside the provider. */
export function useTripStateContext(): TripStateValue {
  const ctx = useContext(TripStateContext);
  if (!ctx) {
    throw new Error("useTripStateContext must be called inside <TripOverview>");
  }
  return ctx;
}
