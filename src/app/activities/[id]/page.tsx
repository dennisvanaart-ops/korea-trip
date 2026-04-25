import { notFound } from "next/navigation";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import { ActivityCard } from "@/components/ActivityCard";

interface Props {
  params: Promise<{ id: string }>;
}

function getAllActivities() {
  return tripDays.flatMap((d) => d.activities ?? []);
}

export function generateStaticParams() {
  return getAllActivities().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const activity = getAllActivities().find((a) => a.id === id);
  if (!activity) return {};
  return { title: `${activity.name} — Korea Reis` };
}

export default async function ActivityPage({ params }: Props) {
  const { id } = await params;
  const activity = getAllActivities().find((a) => a.id === id);
  if (!activity) notFound();

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
          Terug
        </Link>
      </header>

      <div className="px-4 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Activiteit</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{activity.name}</h1>
      </div>

      <div className="px-4">
        <ActivityCard activity={activity} />
      </div>
    </div>
  );
}
