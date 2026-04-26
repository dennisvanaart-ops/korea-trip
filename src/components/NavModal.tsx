"use client";

import { useEffect } from "react";
import { buildNavLinks } from "@/lib/navLinks";
import type { NavLinkInput } from "@/lib/navLinks";

type Props = NavLinkInput & { onClose: () => void };

// ─── Icon components ──────────────────────────────────────────────────────────

function GoogleMapsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <circle cx="12" cy="9" r="2.5" fill="white" />
    </svg>
  );
}

function AppleMapsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000" />
      <path
        d="M12 6C9.24 6 7 8.24 7 11c0 3.5 5 9 5 9s5-5.5 5-9c0-2.76-2.24-5-5-5z"
        fill="white"
      />
      <circle cx="12" cy="11" r="1.8" fill="#000" />
    </svg>
  );
}

function WazeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="12" cy="10" r="8" fill="#33CCFF" />
      <circle cx="9.5" cy="9" r="1.2" fill="white" />
      <circle cx="14.5" cy="9" r="1.2" fill="white" />
      <path d="M9 12.5c.8 1 5.2 1 6 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#03C75A" />
      <path d="M8 16V8l8 8V8" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FEE500" />
      <path
        d="M12 6C8.13 6 5 8.36 5 11.2c0 1.8 1.1 3.4 2.77 4.36l-.66 2.95 3.27-2.13c.53.07 1.07.12 1.62.12 3.87 0 7-2.36 7-5.3S15.87 6 12 6z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

// ─── NavButton ─────────────────────────────────────────────────────────────────

function NavButton({
  href,
  icon,
  label,
  sublabel,
  variant = "default",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  variant?: "primary" | "default";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-75 transition-opacity",
        variant === "primary"
          ? "bg-blue-600 text-white"
          : "border border-gray-200 bg-gray-50 text-gray-800",
      ].join(" ")}
    >
      {icon}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold leading-snug">{label}</span>
        {sublabel && (
          <span
            className={[
              "block text-xs leading-tight",
              variant === "primary" ? "text-blue-100" : "text-gray-400",
            ].join(" ")}
          >
            {sublabel}
          </span>
        )}
      </span>
      <svg
        className={variant === "primary" ? "text-blue-300" : "text-gray-300"}
        width="14"
        height="14"
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
    </a>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function NavModal({ onClose, ...linkInput }: Props) {
  const links = buildNavLinks(linkInput);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-4">
          <p className="text-base font-bold text-gray-900 mt-2 leading-snug">{linkInput.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Navigeren</p>

          <div className="space-y-2">
            {/* Primary: Google Maps */}
            <NavButton
              href={links.google}
              icon={<GoogleMapsIcon />}
              label="Google Maps"
              sublabel={linkInput.lat ? "Coördinaten" : linkInput.address ? "Adres" : "Zoekterm"}
              variant="primary"
            />

            {/* Apple Maps */}
            <NavButton
              href={links.apple}
              icon={<AppleMapsIcon />}
              label="Apple Maps"
            />

            {/* Waze — only if coordinates available */}
            {links.waze && (
              <NavButton
                href={links.waze}
                icon={<WazeIcon />}
                label="Waze"
                sublabel="Navigeren op coördinaten"
              />
            )}

            {/* Korea: Naver Maps */}
            <NavButton
              href={links.naver}
              icon={<NaverIcon />}
              label="Naver Maps"
              sublabel="Beste kaart in Korea"
            />

            {/* Korea: KakaoMap */}
            <NavButton
              href={links.kakao}
              icon={<KakaoIcon />}
              label="KakaoMap"
            />
          </div>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-500 active:bg-gray-50"
          >
            Sluiten
          </button>
        </div>
      </div>
    </>
  );
}
