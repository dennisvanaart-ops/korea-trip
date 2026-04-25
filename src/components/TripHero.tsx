"use client";

import Image from "next/image";
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

      {/* Refresh button — top right */}
      <div className="absolute top-3 right-4 z-10">
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
