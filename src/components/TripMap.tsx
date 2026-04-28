"use client";

/**
 * TripMap — dynamic wrapper around TripMapInner.
 *
 * Leaflet accesses `window` on import, which breaks Next.js SSR.
 * We use next/dynamic with ssr:false to ensure it only runs in the browser.
 *
 * The Leaflet CSS is imported here (top-level client component) so Next.js
 * includes it in the page bundle regardless of dynamic load timing.
 */

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { TripMapProps } from "./TripMapInner";

const TripMapInner = dynamic(
  () => import("./TripMapInner").then((m) => m.TripMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full bg-slate-100 animate-pulse rounded-xl"
        aria-label="Kaart laden…"
      />
    ),
  },
);

export function TripMap(props: TripMapProps) {
  return <TripMapInner {...props} />;
}
