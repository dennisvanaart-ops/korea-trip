import { TripHero } from "./TripHero";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Homepage layout — two fixed zones:
 *
 *   ┌─────────────────────────────┐  ← flex-shrink-0
 *   │  TripHero                   │
 *   │  TripStatusCard             │
 *   ├─────────────────────────────┤  ← flex-1  min-h-0
 *   │  TripNavigation             │     (scrolls internally)
 *   │    header row               │
 *   │    TripDayWheel  ← or list  │
 *   └─────────────────────────────┘
 *
 * The outer container is locked to 100dvh and never scrolls.
 * Hero + status card stay visible at all times.
 */
export function TripOverview() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* ── Static top — never moves ─────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <TripHero />
        <TripStatusCard />
      </div>

      {/* ── Scrollable content zone ──────────────────────────────────────── */}
      <TripNavigation />
    </div>
  );
}
