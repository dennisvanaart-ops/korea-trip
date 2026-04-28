"use client";

import { useState } from "react";
import Link from "next/link";
import type { Transition } from "@/lib/tripHelpers";
import { RouteNavModal } from "./RouteNavModal";

interface Props {
  transition: Transition;
}

/**
 * Connector shown between two consecutive DayCard components in TripTimeline.
 *
 * - Drive:  tap → opens RouteNavModal with Google Maps / Naver / KakaoMap
 * - Flight: tap → navigates to /flights tab
 */
export function DayTransition({ transition }: Props) {
  const [open, setOpen] = useState(false);

  const canNavigate =
    transition.kind === "drive" &&
    !!transition.origin &&
    !!transition.destination;

  const content = (
    <div
      className={[
        "flex items-center gap-2 py-1.5 px-3 my-0.5 mx-8",
        "rounded-full text-xs font-medium select-none",
        transition.kind === "drive"
          ? "text-gray-500 bg-gray-50 border border-gray-200"
          : "text-blue-600 bg-blue-50 border border-blue-100",
        canNavigate || transition.kind === "flight"
          ? "active:opacity-70 cursor-pointer"
          : "",
      ].join(" ")}
    >
      <span>{transition.icon}</span>
      <span className="truncate">{transition.label}</span>
      {(canNavigate || transition.kind === "flight") && (
        <svg
          className="flex-shrink-0 ml-auto text-gray-300"
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );

  // Flight transition → link to /flights
  if (transition.kind === "flight") {
    return (
      <div className="flex justify-center">
        <Link href="/flights" className="block">
          {content}
        </Link>
      </div>
    );
  }

  // Drive transition → RouteNavModal
  if (canNavigate) {
    return (
      <div className="flex justify-center">
        <button type="button" onClick={() => setOpen(true)} className="block">
          {content}
        </button>

        {open && (
          <RouteNavModal
            origin={transition.origin!}
            destination={transition.destination!}
            label={transition.label}
            duration={transition.duration}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  }

  // Non-interactive connector (travelTime without parseable route)
  return (
    <div className="flex justify-center">
      {content}
    </div>
  );
}
