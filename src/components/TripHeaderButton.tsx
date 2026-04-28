"use client";

import Image from "next/image";
import { useState } from "react";
import { RefreshButton } from "./RefreshButton";

/**
 * Compact trip header — replaces the large TripHero.
 *
 * Shows:
 *  - small square thumbnail (hero.jpg)
 *  - trip title + period
 *  - RefreshButton on the right
 *
 * Clicking the card body does nothing (you're already on the overview page).
 */
export function TripHeaderButton() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
        {!imgError ? (
          <Image
            src="/hero.jpg"
            alt="Zuid-Korea"
            fill
            sizes="40px"
            className="object-cover object-center"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center">
            <span className="text-white text-lg">🇰🇷</span>
          </div>
        )}
      </div>

      {/* Title + period */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight truncate">
          Zuid-Korea 2026
        </p>
        <p className="text-xs text-gray-400 mt-0.5">28 apr – 12 mei · 15 dagen</p>
      </div>

      {/* Refresh button */}
      <div className="flex-shrink-0">
        <RefreshButton />
      </div>
    </div>
  );
}
