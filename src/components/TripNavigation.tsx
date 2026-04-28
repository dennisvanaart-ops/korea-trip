"use client";

import { useEffect, useRef, useState } from "react";
import { TripDayWheel } from "./TripDayWheel";
import { TripTimeline } from "./TripTimeline";
import { RouteMapPreview } from "./RouteMapPreview";
import { MapFullscreen } from "./MapFullscreen";
import { useTripStateContext } from "@/lib/TripStateContext";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import type { SourceView } from "@/lib/navigationState";

/**
 * Main navigation panel.
 *
 * Layout (top to bottom, always visible):
 *   ┌──────────────────────────────────────┐
 *   │  "Dagplanning"   [Rol | Lijst]       │  ← view toggle
 *   │  "Route"                             │
 *   │  RouteMapPreview (clickable → modal) │  ← visible in both views
 *   ├──────────────────────────────────────┤
 *   │  flex-1 overflow-y-auto              │
 *   │    TripDayWheel  ──or──  TripTimeline│
 *   └──────────────────────────────────────┘
 */
export function TripNavigation() {
  const { progress, todayIndex, refreshKey } = useTripStateContext();
  const [view, setView] = useState<SourceView>("wheel");
  const [hydrated, setHydrated] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Active day index — tracks which day is in focus in the scroll/wheel view.
  // Resets to todayIndex whenever the trip state refreshes.
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);
  const prevRefreshKey = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey;
      setActiveDayIndex(todayIndex);
    }
  }, [refreshKey, todayIndex]);

  // Restore last-used view from sessionStorage
  useEffect(() => {
    const saved = getNavigationState().sourceView;
    if (saved === "list" || saved === "wheel") setView(saved);
    setHydrated(true);
  }, []);

  function switchView(v: SourceView) {
    setView(v);
    saveNavigationState({ sourceView: v });
    // Reset active day to today when switching views
    setActiveDayIndex(todayIndex);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Fixed header: toggle + map ────────────────────────────────────── */}
      <div className="flex-shrink-0">

        {/* View toggle row */}
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Dagplanning
          </p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 text-xs">
            <button
              onClick={() => switchView("wheel")}
              className={[
                "px-3 py-1.5 font-medium transition-colors",
                view === "wheel" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
              ].join(" ")}
            >
              Rol
            </button>
            <button
              onClick={() => switchView("list")}
              className={[
                "px-3 py-1.5 font-medium transition-colors",
                view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
              ].join(" ")}
            >
              Lijst
            </button>
          </div>
        </div>

        {/* Route map — always above both views, whole map is clickable */}
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Route
          </p>
          <RouteMapPreview
            status={progress.status}
            activeDayIndex={activeDayIndex}
            onMapClick={() => setMapOpen(true)}
          />
        </div>

      </div>

      {/* ── Scrollable day content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {hydrated && (
          view === "wheel"
            ? <TripDayWheel onFocusChange={setActiveDayIndex} />
            : <TripTimeline onActiveDayChange={setActiveDayIndex} />
        )}
      </div>

      {/* ── Full-screen map modal ─────────────────────────────────────────── */}
      {mapOpen && (
        <MapFullscreen
          status={progress.status}
          currentDayIndex={activeDayIndex}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
