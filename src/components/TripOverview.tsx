import { TripHero } from "./TripHero";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

/**
 * Root homepage layout.
 *
 * Normal document flow — the page scrolls naturally.
 * TripDayWheel has its own fixed-height scroll container so its internal
 * snap-scroll is isolated from the page scroll.
 */
export function TripOverview() {
  return (
    <div className="min-h-screen">
      <TripHero />
      <TripStatusCard />
      <TripNavigation />
    </div>
  );
}
