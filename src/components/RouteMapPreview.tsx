"use client";

import { useMemo } from "react";
import { ROUTE_POINTS, getVisibleRoutePoints } from "@/lib/tripHelpers";
import type { TripStatus } from "@/lib/tripProgress";

// ── Geographic projection ────────────────────────────────────────────────────
// SVG canvas
const W = 280;
const H = 180;
// Bounding box — covers all Korean cities with margin
const LNG_MIN = 126.5;
const LNG_MAX = 129.5;
const LAT_MIN = 34.7;
const LAT_MAX = 38.7;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H; // y inverted (north = top)
  return { x, y };
}

// Pre-compute all route point positions once (static data, no deps)
const ALL_POSITIONS = ROUTE_POINTS.map((rp) => ({
  ...rp,
  ...project(rp.lat, rp.lng),
}));

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  status: TripStatus;
  /** Current tripDays index (0-based). -1 when upcoming/past. */
  currentDayIndex: number;
  /** Called when user taps a marker — receives the route-point id */
  onMarkerTap?: (pointId: string) => void;
}

export function RouteMapPreview({ status, currentDayIndex, onMarkerTap }: Props) {
  const visible = useMemo(
    () => getVisibleRoutePoints(status, currentDayIndex),
    [status, currentDayIndex],
  );

  // Build a lookup of visible points keyed by id
  const visibleById = useMemo(
    () => new Map(visible.map((vp) => [vp.id, vp])),
    [visible],
  );

  // Pre-compute per-point visual props
  const points = ALL_POSITIONS.map((p) => {
    const vis = visibleById.get(p.id);
    const pos = { x: p.x, y: p.y };
    return { ...p, pos, visible: !!vis, isCurrent: vis?.isCurrent ?? false, isFaded: vis?.isFaded ?? false };
  });

  // Draw route segments only between consecutive VISIBLE points
  const segments: Array<{ x1: number; y1: number; x2: number; y2: number; faded: boolean }> = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a.visible || !b.visible) continue;
    segments.push({
      x1: a.pos.x,
      y1: a.pos.y,
      x2: b.pos.x,
      y2: b.pos.y,
      faded: a.isFaded || b.isFaded,
    });
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", height: "auto", aspectRatio: `${W}/${H}` }}
        aria-label="Route overzicht Zuid-Korea"
      >
        {/* Subtle grid / background */}
        <rect x="0" y="0" width={W} height={H} fill="#f8fafb" rx="12" />

        {/* Route segments */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={seg.faded ? "#c5d5e8" : "#93c5fd"}
            strokeWidth={seg.faded ? 1.5 : 2}
            strokeDasharray={seg.faded ? "4 4" : undefined}
            strokeLinecap="round"
          />
        ))}

        {/* Markers — render hidden points last so visible ones sit on top */}
        {points.map((p) => {
          if (!p.visible) return null;

          const r = p.isCurrent ? 9 : 6;
          const fill = p.isCurrent
            ? "#16a34a"   // green-600
            : p.isFaded
            ? "#cbd5e1"   // slate-300
            : "#3b82f6";  // blue-500
          const textColor = p.isCurrent || !p.isFaded ? "white" : "#94a3b8";
          const labelBg = p.isCurrent ? "#dcfce7" : "#f0f9ff";
          const labelText = p.isCurrent ? "#15803d" : p.isFaded ? "#94a3b8" : "#1d4ed8";

          return (
            <g
              key={p.id}
              onClick={() => onMarkerTap?.(p.id)}
              style={{ cursor: onMarkerTap ? "pointer" : "default" }}
            >
              {/* Pulse ring for current point */}
              {p.isCurrent && (
                <circle
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={r + 5}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="1.5"
                  opacity="0.35"
                />
              )}

              {/* Marker circle */}
              <circle
                cx={p.pos.x}
                cy={p.pos.y}
                r={r}
                fill={fill}
                opacity={p.isFaded ? 0.45 : 1}
              />

              {/* Marker dot (inner white) for non-current */}
              {!p.isCurrent && !p.isFaded && (
                <circle
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={r - 3}
                  fill="white"
                />
              )}

              {/* City name label */}
              <rect
                x={p.pos.x + r + 2}
                y={p.pos.y - 8}
                width={p.name.length * 5.6 + 8}
                height={14}
                rx="4"
                fill={labelBg}
                opacity={p.isFaded ? 0.6 : 0.92}
              />
              <text
                x={p.pos.x + r + 6}
                y={p.pos.y + 1.5}
                fontSize="8"
                fontWeight={p.isCurrent ? "700" : "500"}
                fill={labelText}
                opacity={p.isFaded ? 0.55 : 1}
              >
                {p.name}
              </text>

              {/* Day range below label */}
              <text
                x={p.pos.x + r + 6}
                y={p.pos.y + 10}
                fontSize="6.5"
                fill={p.isFaded ? "#94a3b8" : "#64748b"}
                opacity={p.isFaded ? 0.5 : 0.8}
              >
                {p.dayLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
