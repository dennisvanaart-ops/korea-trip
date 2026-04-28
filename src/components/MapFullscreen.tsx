"use client";

import { useEffect } from "react";
import { TripMap } from "./TripMap";
import { TRIP_ROUTE } from "@/lib/tripSegments";
import type { TripStatus } from "@/lib/tripProgress";

interface Props {
  status: TripStatus;
  currentDayIndex: number;
  onClose: () => void;
}

/**
 * Full-screen interactive map modal.
 *
 * Covers the entire viewport with a solid white background — no transparent
 * backdrop, no z-fighting with the preview map (which is unmounted while
 * this modal is open; see TripNavigation).
 *
 * Shows the complete Amsterdam → Beijing → Korea → Amsterdam route.
 * Flight segments: dashed indigo.  Drive segments: solid green.
 */
export function MapFullscreen({ currentDayIndex, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-white"
      // No backdrop-click close: the entire surface is the map
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <div>
          <p className="text-sm font-semibold text-gray-900">Volledige route</p>
          <p className="text-xs text-gray-400">Amsterdam · Beijing · Korea · Amsterdam</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 active:bg-gray-200 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Sluiten
        </button>
      </div>

      {/* ── Map (fills all remaining height) ───────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <TripMap
          points={TRIP_ROUTE.points}
          segments={TRIP_ROUTE.segments}
          activeDayIndex={currentDayIndex}
          compact={false}
        />
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-1.5">
          <svg width="24" height="6" viewBox="0 0 24 6">
            <line x1="0" y1="3" x2="24" y2="3"
              stroke="#818cf8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] text-gray-500 font-medium">Vlucht</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="6" viewBox="0 0 24 6">
            <line x1="0" y1="3" x2="24" y2="3"
              stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] text-gray-500 font-medium">Auto</span>
        </div>
        <div className="ml-auto text-[10px] text-gray-400">
          {TRIP_ROUTE.points.length} bestemmingen · {TRIP_ROUTE.segments.length} segmenten
        </div>
      </div>
    </div>
  );
}
