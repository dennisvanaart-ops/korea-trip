"use client";

import { useState } from "react";
import { TripDayWheel } from "./TripDayWheel";
import { TripTimeline } from "./TripTimeline";

type View = "wheel" | "list";

export function TripNavigation() {
  const [view, setView] = useState<View>("wheel");

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2">
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

      {view === "wheel" ? <TripDayWheel /> : <TripTimeline />}
    </div>
  );
}
