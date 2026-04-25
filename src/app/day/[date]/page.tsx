import { notFound } from "next/navigation";
import Link from "next/link";
import { tripDays, getDayByDate } from "@/data/trip";
import { DayDetail } from "@/components/DayDetail";
import { BackButton } from "@/components/BackButton";

interface Props {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return tripDays.map((d) => ({ date: d.date }));
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  const day = getDayByDate(date);
  if (!day) return {};
  return { title: `${day.title} — Korea Reis` };
}

export default async function DayPage({ params }: Props) {
  const { date } = await params;
  const day = getDayByDate(date);
  if (!day) notFound();

  const idx = tripDays.findIndex((d) => d.date === date);
  const prev = idx > 0 ? tripDays[idx - 1] : null;
  const next = idx < tripDays.length - 1 ? tripDays[idx + 1] : null;

  const dateObj = new Date(day.date);
  const formattedDate = dateObj.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pb-12">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <BackButton />
      </header>

      <div className="px-4 pt-6 pb-4">
        <p className="text-sm text-gray-400 capitalize">{formattedDate}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-3xl">{day.emoji}</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{day.title}</h1>
        </div>
        <p className="text-gray-500 mt-1">{day.location}</p>
        {day.travelTime && (
          <p className="text-xs text-gray-400 mt-0.5">{day.travelTime} rijden</p>
        )}
      </div>

      <div className="px-4">
        <DayDetail day={day} />
      </div>

      {/* ── Bottom navigation ── */}
      <div className="mt-8 px-4 space-y-2 pb-4">
        {/* Prev / next buttons */}
        <div className="flex gap-3">
          {prev && (
            <Link
              href={`/day/${prev.date}`}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 text-center active:bg-gray-50"
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              href={`/day/${next.date}`}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 text-center active:bg-gray-50"
            >
              {next.title} →
            </Link>
          )}
        </div>

        {/* Contextual travel time — shown when the next day is a driving day */}
        {next?.travelTime && day.hotel && next.hotel && (
          <div className="flex items-center gap-2 px-1 pt-0.5">
            <svg
              className="flex-shrink-0 text-gray-300"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12l1.5-4.5h11L19 12M5 12H3v4h2m14-4h2v4h-2m-14 0h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="16.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <p className="text-xs text-gray-400 leading-snug">
              {day.hotel.name} → {next.hotel.name}
              <span className="mx-1">·</span>
              {next.travelTime}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
