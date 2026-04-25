import Link from "next/link";
import type { TripDay } from "@/data/trip";

interface Props {
  day: TripDay;
  isToday?: boolean;
}

export function DayCard({ day, isToday = false }: Props) {
  const dateObj = new Date(`${day.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  return (
    <Link href={`/day/${day.date}`} className="block" id={isToday ? "today-card" : undefined}>
      <div
        className={[
          "flex items-start gap-4 rounded-xl border shadow-sm px-4 py-4 active:bg-gray-50",
          isToday
            ? "bg-green-50 border-green-300 ring-1 ring-green-200"
            : "bg-white border-gray-200",
        ].join(" ")}
      >
        <div className="flex-shrink-0 w-12 text-center">
          {isToday ? (
            <p className="text-xs font-bold uppercase tracking-wide text-green-600">Vandaag</p>
          ) : (
            <p className="text-xs text-gray-400 uppercase tracking-wide">{weekday}</p>
          )}
          <p
            className={[
              "text-2xl font-bold leading-tight",
              isToday ? "text-green-700" : "text-gray-900",
            ].join(" ")}
          >
            {dayNum}
          </p>
          <p className={["text-xs", isToday ? "text-green-500" : "text-gray-400"].join(" ")}>
            {month}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{day.emoji}</span>
            <p
              className={[
                "text-base font-semibold truncate",
                isToday ? "text-green-900" : "text-gray-900",
              ].join(" ")}
            >
              {day.title}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{day.location}</p>
          {day.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{day.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {isToday && (
              <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-800">
                Vandaag
              </span>
            )}
            {day.hotel && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Hotel
              </span>
            )}
            {day.transport && day.transport.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                Vervoer
              </span>
            )}
            {day.activities && day.activities.length > 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                {day.activities.length} activiteit{day.activities.length !== 1 ? "en" : ""}
              </span>
            )}
          </div>
        </div>

        <div className={["flex-shrink-0", isToday ? "text-green-400" : "text-gray-300"].join(" ")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
