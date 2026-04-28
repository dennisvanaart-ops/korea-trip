"use client";

/**
 * Central trip-state hook.
 *
 * Computes today, progress and todayIndex from the current date.
 * Exposes a `refresh()` function that increments `refreshKey`,
 * causing all memos to recompute without a page reload.
 *
 * Auto-refreshes on:
 *  – tab becoming visible (visibilitychange / focus)
 *  – first mount
 *  – midnight (timer)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { tripDays } from "@/data/trip";
import { getToday, getTripProgress } from "@/lib/tripProgress";
import type { TripProgress } from "@/lib/tripProgress";

export interface TripStateValue {
  today: string;
  progress: TripProgress;
  /** 0-based index into tripDays, -1 when not active */
  todayIndex: number;
  /** Increments every refresh — pass as dep to force useMemo recalc */
  refreshKey: number;
  /** Trigger manual refresh (no page reload) */
  refresh: () => void;
}

export function useTripState(): TripStateValue {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Auto-refresh on tab visibility ────────────────────────────────────────
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refresh]);

  // ── Midnight timer ────────────────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 5, // 00:00:05 — just past midnight
    );
    const delay = midnight.getTime() - now.getTime();
    const t = setTimeout(refresh, delay);
    return () => clearTimeout(t);
  }, [refreshKey, refresh]); // reschedule after each refresh

  // ── Derived state ─────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today = useMemo(() => getToday(), [refreshKey]);
  const progress = useMemo(() => getTripProgress(today, tripDays), [today]);
  const todayIndex = useMemo(() => {
    if (progress.status !== "active" || !progress.currentDay) return -1;
    return tripDays.findIndex((d) => d.date === progress.currentDay!.date);
  }, [progress]);

  return { today, progress, todayIndex, refreshKey, refresh };
}
