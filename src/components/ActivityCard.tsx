"use client";

import { useState } from "react";
import type { Activity } from "@/data/trip";
import { NavModal } from "./NavModal";
import { InfoBlock } from "./InfoBlock";
import { CardImage } from "./CardImage";

const typeLabel: Record<Activity["type"], string> = {
  food: "Eten",
  coffee: "Koffie",
  sightseeing: "Bezienswaardigheid",
  shopping: "Winkelen",
  outdoor: "Buiten",
  market: "Markt",
  other: "Activiteit",
};

interface Props {
  activity: Activity;
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

export function ActivityCard({ activity }: Props) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl bg-white border border-gray-100 shadow overflow-hidden">
        {activity.imageUrl && (
          <CardImage src={activity.imageUrl} alt={activity.name} />
        )}

        <div className="px-4 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              {typeLabel[activity.type]}
              {activity.reservation && (
                <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 normal-case tracking-normal">
                  Reservering
                </span>
              )}
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">
              {activity.name}
            </p>
          </div>

          <button
            onClick={() => setNavOpen(true)}
            className="flex-shrink-0 mt-0.5 rounded-xl bg-green-50 p-2.5 text-green-700 active:bg-green-100 transition-colors"
            aria-label={`Navigeer naar ${activity.name}`}
          >
            <NavIcon />
          </button>
        </div>

        <div className="px-4 py-4 space-y-3">
          {activity.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {activity.description}
            </p>
          )}

          {activity.timeSlot && (
            <InfoBlock>Tijdslot: {activity.timeSlot}</InfoBlock>
          )}

          {activity.notes && activity.notes.length > 0 && (
            <ul className="space-y-1.5">
              {activity.notes.map((n, i) => (
                <li key={i} className="text-sm text-gray-500 flex gap-2">
                  <span className="text-gray-300 select-none mt-px">—</span>
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {navOpen && (
        <NavModal
          name={activity.name}
          query={activity.query}
          naverUrl={activity.naverUrl}
          kakaoUrl={activity.kakaoUrl}
          onClose={() => setNavOpen(false)}
        />
      )}
    </>
  );
}
