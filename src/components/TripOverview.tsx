import { TRIP_TITLE, TRIP_DURATION } from "@/data/trip";
import { TripStatusCard } from "./TripStatusCard";
import { TripNavigation } from "./TripNavigation";

export function TripOverview() {
  return (
    <div>
      <header className="px-4 pt-8 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Reisschema
        </p>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{TRIP_TITLE}</h1>
        <p className="text-gray-500 mt-1">
          28 april – 12 mei 2026 &middot; {TRIP_DURATION}
        </p>
      </header>

      <TripStatusCard />
      <TripNavigation />
    </div>
  );
}
