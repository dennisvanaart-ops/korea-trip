"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    setSpinning(true);

    if (isStandalone()) {
      // iOS standalone: hard reload is the only reliable option
      window.location.reload();
      return;
    }

    // Regular browser: soft refresh via router, fallback to hard reload
    try {
      router.refresh();
      setTimeout(() => {
        setSpinning(false);
        setLastUpdated(formatTime(new Date()));
      }, 600);
    } catch {
      window.location.reload();
    }
  }, [router]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRefresh}
        aria-label="Pagina verversen"
        className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1.5 text-white/90 text-xs font-medium active:bg-white/30 transition-colors"
      >
        <svg
          width="13"
          height="13"
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
        Ververs
      </button>
      {lastUpdated && (
        <p className="text-white/60 text-[10px] pr-1">
          Bijgewerkt om {lastUpdated}
        </p>
      )}
    </div>
  );
}
