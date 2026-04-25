"use client";

import { useState } from "react";
import Link from "next/link";
import type { Hotel } from "@/data/trip";
import { NavModal } from "./NavModal";
import { CardImage } from "./CardImage";

interface Props {
  hotel: Hotel;
  compact?: boolean;
}

function NavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function HotelCard({ hotel, compact = false }: Props) {
  const [navOpen, setNavOpen] = useState(false);

  const card = (
    <div className="rounded-2xl bg-white border border-gray-100 shadow overflow-hidden">
      <CardImage src={hotel.imageUrl} alt={hotel.name} />

      <div className="px-4 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hotel</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">{hotel.name}</p>
        </div>
        {!compact && (
          <button
            onClick={() => setNavOpen(true)}
            className="flex-shrink-0 mt-0.5 rounded-xl bg-gray-50 p-2.5 text-gray-500 active:bg-gray-100 transition-colors"
            aria-label={`Navigeer naar ${hotel.name}`}
          >
            <NavIcon />
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-2.5">
        <p className="text-sm text-gray-500">{hotel.address}</p>

        {hotel.checkIn && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">Check-in</span>
            <span className="font-semibold text-gray-800">{hotel.checkIn}</span>
          </div>
        )}

        {hotel.parking && !compact && (
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Parkeren: </span>
            {hotel.parking}
          </p>
        )}

        {hotel.notes && !compact && hotel.notes.length > 0 && (
          <ul className="space-y-1.5">
            {hotel.notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-500 flex gap-2">
                <span className="text-gray-300 select-none mt-px">—</span>
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      {compact ? (
        <Link href={`/hotels/${hotel.id}`} className="block">
          {card}
        </Link>
      ) : (
        card
      )}

      {navOpen && (
        <NavModal
          name={hotel.name}
          query={hotel.query}
          naverUrl={hotel.naverUrl}
          kakaoUrl={hotel.kakaoUrl}
          onClose={() => setNavOpen(false)}
        />
      )}
    </>
  );
}
