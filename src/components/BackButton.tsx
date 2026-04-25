"use client";

import { useRouter } from "next/navigation";

/**
 * Back button for the day-detail page.
 *
 * Uses router.back() so the browser's history stack is traversed — the
 * homepage renders from bfcache (instant, no re-fetch) with the wheel /
 * list exactly where the user left it.
 *
 * Falls back to router.push("/") if there is no history entry (e.g. user
 * landed directly on the day URL via a share link).
 */
export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
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
    </button>
  );
}
