import { notFound } from "next/navigation";
import Link from "next/link";
import { hotels } from "@/data/trip";
import { MapButtons } from "@/components/MapButtons";
import { InfoBlock } from "@/components/InfoBlock";
import { WarningBlock } from "@/components/WarningBlock";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(hotels).map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const hotel = hotels[id];
  if (!hotel) return {};
  return { title: `${hotel.name} — Korea Reis` };
}

export default async function HotelPage({ params }: Props) {
  const { id } = await params;
  const hotel = hotels[id];
  if (!hotel) notFound();

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
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Hotel</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{hotel.name}</h1>
        <p className="text-gray-500 mt-1">{hotel.address}</p>
      </div>

      <div className="px-4 space-y-4">
        {(hotel.checkIn || hotel.checkOut) && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3 space-y-2">
            {hotel.checkIn && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check-in</span>
                <span className="font-medium">{hotel.checkIn}</span>
              </div>
            )}
            {hotel.checkOut && (
              <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                <span className="text-gray-500">Check-out</span>
                <span className="font-medium">{hotel.checkOut}</span>
              </div>
            )}
          </div>
        )}

        {hotel.parking && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Parkeren
            </p>
            <p className="text-sm text-gray-700">{hotel.parking}</p>
          </div>
        )}

        {hotel.notes && hotel.notes.length > 0 && (
          <div className="space-y-2">
            {hotel.notes.map((note, i) => (
              <InfoBlock key={i}>{note}</InfoBlock>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Navigatie
          </p>
          <MapButtons
            name={hotel.name}
            query={hotel.query}
            naverUrl={hotel.naverUrl}
            kakaoUrl={hotel.kakaoUrl}
          />
        </div>
      </div>
    </div>
  );
}
