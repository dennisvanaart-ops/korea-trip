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
 * activeDayIndex and setActiveDayIndex come from TripStateContext
 * (managed by TripOverview) so TripStatusCard can also read them.
 *
 * Layout (top to bottom):
 *   ┌──────────────────────────────────────┐
 *   │  "Dagplanning"   [Rol | Lijst]       │
 *   │  RouteMapPreview (clickable → modal) │  hidden when modal is open
 *   ├──────────────────────────────────────┤
 *   │  flex-1 overflow-y-auto              │
 *   │    TripDayWheel  ──or──  TripTimeline│
 *   └──────────────────────────────────────┘
 */
export function TripNavigation() {
  const {
    progress,
    todayIndex,
    activeDayIndex,
    setActiveDayIndex,
  } = useTripStateContext();

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
    // Jump back to today when the user switches views
    setActiveDayIndex(Math.max(0, todayIndex));
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

        {/* Route map — unmounted when modal is open to avoid two Leaflet instances */}
        {!mapOpen && (
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
        )}

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
