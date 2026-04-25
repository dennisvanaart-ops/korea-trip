"use client";

import { useState } from "react";
import { TripDayWheel } from "./TripDayWheel";
import { TripTimeline } from "./TripTimeline";

type View = "wheel" | "list";

export function TripNavigation() {
  const [view, setView] = useState<View>("wheel");

  return (
    /*
     * flex-1 min-h-0: take all remaining height from TripOverview,
     * allow shrinking below natural content height (required for overflow
     * to work correctly in a flex child).
     */
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header row — fixed height */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Dagplanning
        </p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 text-xs">
          <button
            onClick={() => setView("wheel")}
            className={[
              "px-3 py-1.5 font-medium transition-colors",
              view === "wheel"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500",
            ].join(" ")}
          >
            Rol
          </button>
          <button
            onClick={() => setView("list")}
            className={[
              "px-3 py-1.5 font-medium transition-colors",
              view === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500",
            ].join(" ")}
          >
            Lijst
          </button>
        </div>
      </div>

      {/*
       * Content area — flex-1 min-h-0 so the wheel (or list) fills
       * exactly the remaining space without overflow leaking upward.
       */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === "wheel" ? <TripDayWheel /> : <TripTimeline />}
      </div>
    </div>
  );
}
