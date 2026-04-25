"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RefreshButton } from "./RefreshButton";

export function TripHero() {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(200px, 52vw, 280px)" }}
    >
      {!imgError && (
        <Image
          src="/hero.jpg"
          alt="Dennis & Madelief in Zuid-Korea"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient overlay — darker at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: imgError
            ? "linear-gradient(135deg, #0f2d52 0%, #1a4a80 50%, #0f2d52 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        }}
      />

      {/* Top-right controls */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
        <Link
          href="/info"
          aria-label="Reisdocumenten & praktische info"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm active:bg-white/30 transition-colors"
        >
          {/* Document / passport icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.5" y="1.5" width="9" height="12" rx="1.5" stroke="white" strokeWidth="1.3" />
            <path d="M5 5.5h4M5 7.5h4M5 9.5h2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M11.5 4.5v9a1 1 0 001 1h.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </Link>
        <RefreshButton />
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
        <p className="text-white/70 text-sm font-medium tracking-wide">
          Dennis &amp; Madelief
        </p>
        <p className="text-white text-2xl font-bold leading-tight mt-0.5">
          Zuid-Korea 2026
        </p>
        <p className="text-white/60 text-sm mt-1">28 april – 12 mei</p>
      </div>
    </div>
  );
}
