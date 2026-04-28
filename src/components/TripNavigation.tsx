"use client";

import { useEffect, useState } from "react";
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
 *   │  "Route"         [Volledige kaart →] │
 *   │  RouteMapPreview (shared map)        │  ← visible in both views
 *   ├──────────────────────────────────────┤
 *   │  flex-1 overflow-y-auto              │
 *   │    TripDayWheel  ──or──  TripTimeline│
 *   └──────────────────────────────────────┘
 */
export function TripNavigation() {
  const { progress, todayIndex } = useTripStateContext();
  const [view, setView] = useState<SourceView>("wheel");
  const [hydrated, setHydrated] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Restore last-used view from sessionStorage
  useEffect(() => {
    const saved = getNavigationState().sourceView;
    if (saved === "list" || saved === "wheel") setView(saved);
    setHydrated(true);
  }, []);

  function switchView(v: SourceView) {
    setView(v);
    saveNavigationState({ sourceView: v });
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

        {/* Route map — always above both views */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Route
            </p>
            <button
              onClick={() => setMapOpen(true)}
              className="text-xs font-medium text-blue-600 active:opacity-70"
            >
              Volledige kaart →
            </button>
          </div>
          <RouteMapPreview
            status={progress.status}
            currentDayIndex={todayIndex}
          />
        </div>

      </div>

      {/* ── Scrollable day content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {hydrated && (view === "wheel" ? <TripDayWheel /> : <TripTimeline />)}
      </div>

      {/* ── Full-screen map modal ─────────────────────────────────────────── */}
      {mapOpen && (
        <MapFullscreen
          status={progress.status}
          currentDayIndex={todayIndex}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
