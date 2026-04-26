"use client";

import { useState } from "react";
import { NavModal } from "./NavModal";
import type { NavLinkInput } from "@/lib/navLinks";

type Props = NavLinkInput & { className?: string };

/**
 * Lightweight trigger button that can be dropped into server-component pages.
 * Renders nothing if there is no usable location data.
 */
export function NavTrigger({ className = "", ...linkInput }: Props) {
  const [open, setOpen] = useState(false);

  // Don't render if there's no location to navigate to
  const hasLocation =
    (linkInput.query && linkInput.query.trim().length > 1) ||
    (linkInput.address && linkInput.address.trim().length > 1) ||
    linkInput.lat !== undefined;

  if (!hasLocation) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100",
          "px-3 py-2 text-xs font-medium text-blue-700 active:bg-blue-100 transition-colors",
          className,
        ].join(" ")}
      >
        {/* Pin icon */}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        Navigeren
      </button>

      {open && <NavModal {...linkInput} onClose={() => setOpen(false)} />}
    </>
  );
}
