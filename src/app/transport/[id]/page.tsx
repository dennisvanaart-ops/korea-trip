import { notFound } from "next/navigation";
import Link from "next/link";
import { tripDays } from "@/data/trip";
import { TransportCard } from "@/components/TransportCard";

interface Props {
  params: Promise<{ id: string }>;
}

function getAllTransport() {
  return tripDays.flatMap((d) => d.transport ?? []);
}

export function generateStaticParams() {
  return getAllTransport().map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const transport = getAllTransport().find((t) => t.id === id);
  if (!transport) return {};
  return { title: `${transport.title} — Korea Reis` };
}

export default async function TransportPage({ params }: Props) {
  const { id } = await params;
  const transport = getAllTransport().find((t) => t.id === id);
  if (!transport) notFound();

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
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vervoer</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{transport.title}</h1>
      </div>

      <div className="px-4">
        <TransportCard transport={transport} />
      </div>
    </div>
  );
}
