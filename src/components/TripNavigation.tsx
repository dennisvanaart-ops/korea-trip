"use client";

import { useState } from "react";
import { TripDayWheel } from "./TripDayWheel";
import { TripTimeline } from "./TripTimeline";

type View = "wheel" | "list";

/**
 * Fills the remaining height below hero + status card.
 *
 * Structure:
 *   flex flex-col flex-1 min-h-0
 *     ├── header row          (flex-shrink-0)
 *     └── content area        (flex-1 min-h-0 overflow-y-auto overscroll-contain)
 *           ├── TripDayWheel  (height:100%, own internal snap-scroll)
 *           └── TripTimeline  (natural height, scrolls via content area)
 */
export function TripNavigation() {
  const [view, setView] = useState<View>("wheel");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header row — always visible */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
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
       * Content area:
       * - flex-1 min-h-0: fills remaining height, can shrink below content size
       * - overflow-y-auto: scrolls when list is active
       * - overscroll-contain: wheel's internal scroll won't bubble up to body
       *
       * When wheel is active, TripDayWheel fills this area via height:100%
       * and manages its own snap-scroll — this layer has nothing to scroll.
       * When list is active, TripTimeline grows naturally and this layer scrolls.
       */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {view === "wheel" ? <TripDayWheel /> : <TripTimeline />}
      </div>
    </div>
  );
}
