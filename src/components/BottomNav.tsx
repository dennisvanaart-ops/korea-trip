"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Dagplanning",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 13h4M7 16.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/flights",
    label: "Vluchten",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 16l-9-5.5V4a2 2 0 00-4 0v6.5L3 16v2l5-1.5V20l-2 1v1.5l4-1 4 1V21l-2-1v-3.5l5 1.5v-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/hotels",
    label: "Hotels",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 20V8l9-5 9 5v12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/car",
    label: "Auto",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12l1.5-4.5h11L19 12M5 12H3v4h2m14-4h2v4h-2m-14 0h14M7 16v1.5M17 16v1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: "/other",
    label: "Overig",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Only show on top-level tab routes
  const tabHrefs = tabs.map((t) => t.href);
  if (!tabHrefs.includes(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-2xl flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                active ? "text-blue-600" : "text-gray-400 active:text-gray-600",
              ].join(" ")}
            >
              {tab.icon}
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
