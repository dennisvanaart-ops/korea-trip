"use client";

import { TripMap } from "./TripMap";
import { TRIP_ROUTE } from "@/lib/tripSegments";
import type { TripStatus } from "@/lib/tripProgress";

interface Props {
  status: TripStatus;
  /** Active day index — follows the wheel/list scroll */
  activeDayIndex: number;
  /** Called when the user taps the map — use to open fullscreen */
  onMapClick?: () => void;
}

/**
 * Compact route map (2:1 aspect ratio).
 *
 * Renders an interactive Leaflet/OpenStreetMap tile map centred on Korea.
 * Entire map is a tappable surface that opens the fullscreen modal.
 * All Leaflet interactions are disabled in compact mode to avoid
 * interfering with page scroll.
 */
export function RouteMapPreview({ activeDayIndex, onMapClick }: Props) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
      style={{ aspectRatio: "2 / 1" }}
    >
      <TripMap
        points={TRIP_ROUTE.points}
        segments={TRIP_ROUTE.segments}
        activeDayIndex={activeDayIndex}
        compact
        onExpand={onMapClick}
      />
    </div>
  );
}
