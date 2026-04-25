import Link from "next/link";
import type { Hotel } from "@/data/trip";
import { MapButtons } from "./MapButtons";

interface Props {
  hotel: Hotel;
  compact?: boolean;
}

export function HotelCard({ hotel, compact = false }: Props) {
  const card = (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hotel</p>
        <p className="text-base font-bold text-gray-900 mt-0.5">{hotel.name}</p>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-sm text-gray-600">{hotel.address}</p>
        {hotel.checkIn && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">Check-in</span>
            <span className="font-medium">{hotel.checkIn}</span>
          </div>
        )}
        {hotel.parking && !compact && (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Parkeren: </span>
            {hotel.parking}
          </p>
        )}
        {hotel.notes && !compact && hotel.notes.length > 0 && (
          <ul className="space-y-1">
            {hotel.notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 select-none">—</span>
                {n}
              </li>
            ))}
          </ul>
        )}
        {!compact && (
          <MapButtons
            name={hotel.name}
            query={hotel.query}
            naverUrl={hotel.naverUrl}
            kakaoUrl={hotel.kakaoUrl}
            className="pt-1"
          />
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <Link href={`/hotels/${hotel.id}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
