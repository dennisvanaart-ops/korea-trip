"use client";

import { useEffect } from "react";
import { buildNavLinks } from "@/lib/navLinks";
import type { NavLinkInput } from "@/lib/navLinks";

type Props = NavLinkInput & { onClose: () => void };

function NavItem({
  href,
  label,
  sublabel,
  primary,
  icon,
}: {
  href: string;
  label: string;
  sublabel?: string;
  primary?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-75 transition-opacity",
        primary
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
              "block text-xs leading-tight mt-0.5",
              primary ? "text-blue-200" : "text-gray-400",
            ].join(" ")}
          >
            {sublabel}
          </span>
        )}
      </span>
      <svg
        className={primary ? "text-blue-300" : "text-gray-300"}
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function NavModal({ onClose, ...linkInput }: Props) {
  const links = buildNavLinks(linkInput);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-4">
          <p className="text-base font-bold text-gray-900 mt-2 leading-snug">{linkInput.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Navigeren</p>

          <div className="space-y-2">
            {/* Google Maps — primary */}
            <NavItem
              href={links.google}
              label="Google Maps"
              sublabel={linkInput.lat !== undefined ? "op coördinaten" : linkInput.address ? "op adres" : undefined}
              primary
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
              }
            />

            {/* Naver Maps */}
            <NavItem
              href={links.naver}
              label="Naver Map"
              sublabel="Beste kaart in Korea"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#03C75A" />
                  <path d="M8 16V8l8 8V8" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              }
            />

            {/* KakaoMap */}
            <NavItem
              href={links.kakao}
              label="KakaoMap"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#FEE500" />
                  <path
                    d="M12 6C8.13 6 5 8.36 5 11.2c0 1.8 1.1 3.4 2.77 4.36l-.66 2.95 3.27-2.13c.53.07 1.07.12 1.62.12 3.87 0 7-2.36 7-5.3S15.87 6 12 6z"
                    fill="#3A1D1D"
                  />
                </svg>
              }
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
