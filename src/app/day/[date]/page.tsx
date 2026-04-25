import { notFound } from "next/navigation";
import Link from "next/link";
import { tripDays, getDayByDate } from "@/data/trip";
import { DayDetail } from "@/components/DayDetail";

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
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 active:text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 13L5 8l5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Alle dagen
        </Link>
      </header>

      <div className="px-4 pt-6 pb-4">
        <p className="text-sm text-gray-400 capitalize">{formattedDate}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-3xl">{day.emoji}</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{day.title}</h1>
        </div>
        <p className="text-gray-500 mt-1">{day.location}</p>
      </div>

      <div className="px-4">
        <DayDetail day={day} />
      </div>

      <div className="mt-8 px-4 flex gap-3">
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
    </div>
  );
}
