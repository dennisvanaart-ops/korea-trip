import { TripHeaderButton } from "./TripHeaderButton";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Homepage layout — two fixed zones:
 *
 *   ┌─────────────────────────────┐  ← flex-shrink-0
 *   │  TripHeaderButton           │    compact header row (~52px)
 *   │  TripStatusCard             │    compact status card (~76px)
 *   ├─────────────────────────────┤  ← flex-1  min-h-0
 *   │  TripNavigation             │     scrolls internally
 *   │    header row (Rol/Lijst)   │
 *   │    RouteMapPreview (lijst)  │
 *   │    TripDayWheel  ← or list  │
 *   └─────────────────────────────┘
 *
 * The outer container is locked to 100dvh and never scrolls.
 * Header + status card stay visible at all times.
 * The large TripHero has been removed — thumbnail lives in TripHeaderButton.
 */
export function TripOverview() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100dvh - 56px - env(safe-area-inset-bottom, 0px))" }}
    >
      {/* ── Static top — never moves ──────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <TripHeaderButton />
        <TripStatusCard />
      </div>

      {/* ── Scrollable content zone ───────────────────────────────────────── */}
      <TripNavigation />
    </div>
  );
}
