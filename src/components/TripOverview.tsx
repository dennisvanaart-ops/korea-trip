import { tripDays, TRIP_TITLE, TRIP_DURATION } from "@/data/trip";
import { DayCard } from "./DayCard";

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

      <div className="px-4 space-y-2 pb-12">
        {tripDays.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
