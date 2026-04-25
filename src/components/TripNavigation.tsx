"use client";

import { useEffect, useState } from "react";
import { TripDayWheel } from "./TripDayWheel";
import { TripTimeline } from "./TripTimeline";
import { getNavigationState, saveNavigationState } from "@/lib/navigationState";
import type { SourceView } from "@/lib/navigationState";

export function TripNavigation() {
  // Read last-used view from sessionStorage so switching back from a day
  // detail lands in the same tab the user left from.
  const [view, setView] = useState<SourceView>("wheel");
  const [hydrated, setHydrated] = useState(false);

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
      {/* Header row — always visible */}
      <div className="flex-shrink-0 space-y-0">
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

      </div>

      {/*
       * Content area — flex-1 min-h-0 so wheel fills remaining height.
       * Don't render until hydrated so the view matches sessionStorage.
       */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {hydrated && (view === "wheel" ? <TripDayWheel /> : <TripTimeline />)}
      </div>
    </div>
  );
}
