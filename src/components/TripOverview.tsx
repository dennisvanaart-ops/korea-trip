import { TripHero } from "./TripHero";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Root homepage layout.
 *
 * Uses 100dvh so the page never scrolls at the body level.
 * TripNavigation (and the wheel inside it) fills whatever height
 * remains after hero + status card — the wheel container is then
 * measured by ResizeObserver so the focus card lands at exact center.
 */
export function TripOverview() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* ── Static top section ────────────────────────── */}
      <TripHero />
      <TripStatusCard />

      {/* ── Dynamic wheel section — fills the rest ────── */}
      <TripNavigation />
    </div>
  );
}
