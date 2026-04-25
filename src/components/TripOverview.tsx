import { TripHero } from "./TripHero";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

export function TripOverview() {
  return (
    <div>
      <TripHero />
      <TripStatusCard />
      <TripNavigation />
    </div>
  );
}
