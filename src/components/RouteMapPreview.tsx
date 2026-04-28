"use client";

import { useMemo } from "react";
import { ROUTE_POINTS, getVisibleRoutePoints } from "@/lib/tripHelpers";
import type { TripStatus } from "@/lib/tripProgress";

/**
 * Map background: /maps/korea-map.jpg
 *   512×512 px, OSM zoom-6 tiles (x=54-55, y=24-25), centered on Korea.
 *
 * Container: aspect-ratio 2:1, object-fit cover.
 * This crops the square image to show y=[128,384] of the original 512px height.
 *
 * Marker positions are pre-computed for this crop:
 *   left%  = pixel_x / 512 * 100
 *   top%   = (pixel_y − 128) / 256 * 100
 *
 * SVG overlay: viewBox="0 0 512 256" matches the cropped pixel space.
 */

// Pixel coordinates on the 512×512 map image (zoom-6, origin = tile(54,24))
const MAP_PIXEL: Record<string, { x: number; y: number }> = {
  "seoul-1": { x: 146.9, y: 200.7 },
  "sokcho":  { x: 220.4, y: 163.8 },
  "andong":  { x: 226.6, y: 257.7 },
  "busan":   { x: 242.4, y: 335.7 },
  "jeonju":  { x: 154.6, y: 299.6 },
  "seoul-2": { x: 146.9, y: 200.7 },
};

// Vertical crop constants for aspect-ratio 2:1 container
const Y_OFFSET = 128; // pixels clipped from top in original image
const Y_RANGE  = 256; // visible height in original image pixels (512 * 0.5)

function toContainerPct(px: { x: number; y: number }) {
  return {
    left: px.x / 512 * 100,
    top:  (px.y - Y_OFFSET) / Y_RANGE * 100,
  };
}

// SVG coordinates: direct mapping into the visible region (512×256 space)
function toSvg(px: { x: number; y: number }) {
  return { x: px.x, y: px.y - Y_OFFSET };
}

interface Props {
  status: TripStatus;
  currentDayIndex: number;
  onMarkerTap?: (pointId: string) => void;
}

export function RouteMapPreview({ status, currentDayIndex, onMarkerTap }: Props) {
  const visible = useMemo(
    () => getVisibleRoutePoints(status, currentDayIndex),
    [status, currentDayIndex],
  );

  const visibleById = useMemo(
    () => new Map(visible.map((vp) => [vp.id, vp])),
    [visible],
  );

  // Enrich ROUTE_POINTS with visibility + SVG/container positions
  const points = ROUTE_POINTS.map((rp) => {
    const px = MAP_PIXEL[rp.id] ?? { x: 0, y: 256 };
    const vis = visibleById.get(rp.id);
    return {
      ...rp,
      px,
      pct: toContainerPct(px),
      svg: toSvg(px),
      visible: !!vis,
      isCurrent: vis?.isCurrent ?? false,
      isFaded: vis?.isFaded ?? false,
    };
  });

  // Route segments between consecutive visible points
  const segments: Array<{
    x1: number; y1: number; x2: number; y2: number; faded: boolean;
  }> = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a.visible || !b.visible) continue;
    segments.push({
      x1: a.svg.x, y1: a.svg.y,
      x2: b.svg.x, y2: b.svg.y,
      faded: a.isFaded || b.isFaded,
    });
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
      style={{ aspectRatio: "2 / 1" }}
    >
      {/* ── Real map background ───────────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/maps/korea-map.jpg"
        alt="Kaartachtergrond Zuid-Korea"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ userSelect: "none", pointerEvents: "none" }}
        draggable={false}
      />

      {/* ── Subtle vignette overlay ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* ── SVG: route lines ─────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 512 256"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1} y1={seg.y1}
            x2={seg.x2} y2={seg.y2}
            stroke={seg.faded ? "rgba(148,163,184,0.55)" : "rgba(59,130,246,0.75)"}
            strokeWidth={seg.faded ? 3 : 4}
            strokeDasharray={seg.faded ? "8 6" : undefined}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* ── Markers ──────────────────────────────────────────────────────── */}
      {points.map((p) => {
        if (!p.visible) return null;
        // Skip out-of-crop markers (outside visible y band)
        if (p.pct.top < -10 || p.pct.top > 110) return null;

        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.pct.left}%`,
              top: `${p.pct.top}%`,
              transform: "translate(-50%, -50%)",
              cursor: onMarkerTap ? "pointer" : "default",
              opacity: p.isFaded ? 0.45 : 1,
            }}
            onClick={() => onMarkerTap?.(p.id)}
          >
            {/* Pulse ring for current location */}
            {p.isCurrent && (
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  width: 22, height: 22,
                  top: -5, left: -5,
                  background: "rgba(22,163,74,0.35)",
                }}
              />
            )}

            {/* Marker pin */}
            <div
              className={[
                "flex items-center justify-center rounded-full shadow-md border-2 border-white",
                p.isCurrent
                  ? "bg-green-500 w-4 h-4"
                  : p.isFaded
                  ? "bg-slate-300 w-3 h-3"
                  : "bg-blue-500 w-3 h-3",
              ].join(" ")}
            />

            {/* Label — only for current and non-faded */}
            {!p.isFaded && (
              <div
                className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 whitespace-nowrap"
                style={{ pointerEvents: "none" }}
              >
                <span
                  className={[
                    "rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-none shadow-sm",
                    p.isCurrent
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-white/90 text-blue-800 border border-blue-100",
                  ].join(" ")}
                >
                  {p.name}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
