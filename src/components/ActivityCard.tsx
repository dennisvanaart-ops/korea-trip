import type { Activity } from "@/data/trip";
import { MapButtons } from "./MapButtons";
import { InfoBlock } from "./InfoBlock";

const typeLabel: Record<Activity["type"], string> = {
  food: "Eten",
  coffee: "Koffie",
  sightseeing: "Bezienswaardighed",
  shopping: "Winkelen",
  outdoor: "Buiten",
  market: "Markt",
  other: "Activiteit",
};

interface Props {
  activity: Activity;
  showMap?: boolean;
}

export function ActivityCard({ activity, showMap = true }: Props) {
  return (
    <div className="rounded-xl bg-green-50 border border-green-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-green-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
          {typeLabel[activity.type]}
          {activity.reservation && (
            <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
              Reservering
            </span>
          )}
        </p>
        <p className="text-base font-bold text-gray-900 mt-0.5">{activity.name}</p>
      </div>

      <div className="px-4 py-3 space-y-2">
        {activity.description && (
          <p className="text-sm text-gray-700">{activity.description}</p>
        )}

        {activity.timeSlot && (
          <InfoBlock>Tijdslot: {activity.timeSlot}</InfoBlock>
        )}

        {activity.notes && activity.notes.length > 0 && (
          <ul className="space-y-1">
            {activity.notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 select-none">—</span>
                {n}
              </li>
            ))}
          </ul>
        )}

        {showMap && (
          <MapButtons
            name={activity.name}
            query={activity.query}
            naverUrl={activity.naverUrl}
            kakaoUrl={activity.kakaoUrl}
            className="pt-1"
          />
        )}
      </div>
    </div>
  );
}
