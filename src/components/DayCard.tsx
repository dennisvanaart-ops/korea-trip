import Link from "next/link";
import type { TripDay } from "@/data/trip";

interface Props {
  day: TripDay;
}

export function DayCard({ day }: Props) {
  const dateObj = new Date(day.date);
  const weekday = dateObj.toLocaleDateString("nl-NL", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("nl-NL", { month: "short" });

  return (
    <Link href={`/day/${day.date}`} className="block">
      <div className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-4 active:bg-gray-50">
        <div className="flex-shrink-0 w-12 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{weekday}</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{dayNum}</p>
          <p className="text-xs text-gray-400">{month}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{day.emoji}</span>
            <p className="text-base font-semibold text-gray-900 truncate">{day.title}</p>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{day.location}</p>
          {day.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{day.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
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

        <div className="flex-shrink-0 text-gray-300">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}
