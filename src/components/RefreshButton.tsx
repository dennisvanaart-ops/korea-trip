"use client";

import { useCallback, useState } from "react";
import { useTripStateContext } from "@/lib/TripStateContext";

/**
 * Compact refresh button — uses shared TripStateContext so a single
 * refresh() call updates all context consumers simultaneously.
 *
 * Styled for the compact white header (dark icon on light background).
 */
export function RefreshButton() {
  const { refresh } = useTripStateContext();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    refresh();
    // Stop spinner after animation completes
    setTimeout(() => setSpinning(false), 700);
  }, [spinning, refresh]);

  return (
    <button
      onClick={handleRefresh}
      aria-label="Verversen"
      className="p-2 rounded-full text-gray-400 hover:text-gray-600 active:bg-gray-100 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="none"
        className={spinning ? "animate-spin" : ""}
        style={{ animationDuration: "0.7s" }}
      >
        <path
          d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.86 4.4 2.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 5h2.5V2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
