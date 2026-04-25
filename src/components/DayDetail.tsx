import type { TripDay } from "@/data/trip";
import { HotelCard } from "./HotelCard";
import { TransportCard } from "./TransportCard";
import { ActivityCard } from "./ActivityCard";
import { InfoBlock } from "./InfoBlock";

interface Props {
  day: TripDay;
}

export function DayDetail({ day }: Props) {
  return (
    <div className="space-y-6">
      {day.description && (
        <p className="text-base text-gray-600 leading-relaxed">{day.description}</p>
      )}

      {day.notes && day.notes.length > 0 && (
        <div className="space-y-2">
          {day.notes.map((note, i) => (
            <InfoBlock key={i}>{note}</InfoBlock>
          ))}
        </div>
      )}

      {day.transport && day.transport.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Vervoer
          </h2>
          <div className="space-y-4">
            {day.transport.map((t) => (
              <TransportCard key={t.id} transport={t} />
            ))}
          </div>
        </section>
      )}

      {day.hotel && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Verblijf
          </h2>
          <HotelCard hotel={day.hotel} compact />
        </section>
      )}

      {day.activities && day.activities.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Activiteiten
          </h2>
          <div className="space-y-4">
            {day.activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
