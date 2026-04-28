"use client";

import { useEffect } from "react";
import { ROUTE_POINTS } from "@/lib/tripHelpers";
import type { TripStatus } from "@/lib/tripProgress";

/**
 * Full-screen map modal.
 *
 * Shows the complete route on the Korea map at a larger aspect ratio (4:3),
 * so all cities are visible without cropping.
 *
 * Marker positions for 4:3 container (object-fit cover on 512×512 image):
 *   Visible y range: [64, 448] in the original image (Y_OFFSET=64, Y_RANGE=384)
 *   left% = pixel_x / 512 * 100
 *   top%  = (pixel_y − 64) / 384 * 100
 */

const MAP_PIXEL: Record<string, { x: number; y: number }> = {
  "seoul-1": { x: 146.9, y: 200.7 },
  "sokcho":  { x: 220.4, y: 163.8 },
  "andong":  { x: 226.6, y: 257.7 },
  "busan":   { x: 242.4, y: 335.7 },
  "jeonju":  { x: 154.6, y: 299.6 },
  "seoul-2": { x: 146.9, y: 200.7 },
};

const Y_OFFSET = 64;
const Y_RANGE  = 384;

// Route order for drawing lines
const ROUTE_ORDER = ["seoul-1", "sokcho", "andong", "busan", "jeonju", "seoul-2"];

interface Props {
  status: TripStatus;
  currentDayIndex: number;
  onClose: () => void;
}

export function MapFullscreen({ onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const points = ROUTE_POINTS.map((rp) => {
    const px = MAP_PIXEL[rp.id] ?? { x: 0, y: 256 };
    return {
      ...rp,
      px,
      left: px.x / 512 * 100,
      top: (px.y - Y_OFFSET) / Y_RANGE * 100,
    };
  });

  // Build ordered point lookup for SVG lines
  const byId = Object.fromEntries(points.map((p) => [p.id, p]));

  const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i < ROUTE_ORDER.length - 1; i++) {
    const a = byId[ROUTE_ORDER[i]];
    const b = byId[ROUTE_ORDER[i + 1]];
    if (!a || !b) continue;
    segments.push({
      x1: a.px.x, y1: a.px.y - Y_OFFSET,
      x2: b.px.x, y2: b.px.y - Y_OFFSET,
    });
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card — stop propagation so clicks inside don't close */}
      <div
        className="relative mx-4 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Map container: 4:3 aspect, object-fit cover */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maps/korea-map.jpg"
            alt="Kaartachtergrond Zuid-Korea"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable={false}
          />

          {/* SVG route lines */}
          <svg
            viewBox={`0 0 512 ${Y_RANGE}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            {segments.map((seg, i) => (
              <line
                key={i}
                x1={seg.x1} y1={seg.y1}
                x2={seg.x2} y2={seg.y2}
                stroke="rgba(59,130,246,0.8)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* All city markers */}
          {points.map((p, i) => {
            // Deduplicate Seoul (seoul-1 and seoul-2 are same location)
            if (p.id === "seoul-2") return null;

            return (
              <div
                key={p.id}
                className="absolute"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap"
                  style={{ pointerEvents: "none" }}
                >
                  <div className="bg-white/95 rounded-lg px-2 py-1 shadow-sm border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-800 leading-none">{p.name}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-none">{p.dayLabel}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Routeoverzicht</p>
            <p className="text-xs text-gray-400">Zuid-Korea · 15 daagse rondreis</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 active:bg-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
