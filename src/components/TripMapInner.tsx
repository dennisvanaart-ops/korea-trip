"use client";

/**
 * TripMapInner — actual Leaflet implementation.
 *
 * IMPORTANT: Import via TripMap.tsx (next/dynamic ssr:false), not directly.
 *
 * Two-effect pattern:
 *  1. Init effect (once per mount): imports Leaflet, creates map + tiles,
 *     draws initial layers, fits bounds, calls invalidateSize().
 *  2. Update effect (on activeDayIndex change): redraws only route layers
 *     and refits bounds for the active day — no map recreation.
 *
 * Bounds are computed dynamically:
 *  - Compact / travel day:   departure point + destination point
 *  - Compact / staying day:  current point + next upcoming point
 *  - Fullscreen:             all route points
 */

import { useEffect, useRef } from "react";
import type { TripPoint, TripSegment } from "@/lib/tripSegments";
import { getActiveTripPoint } from "@/lib/tripSegments";

export interface TripMapProps {
  points: TripPoint[];
  segments: TripSegment[];
  activeDayIndex: number;
  /** true = compact preview (disabled interactions, dynamic day bounds) */
  compact?: boolean;
  /** Called when user taps the compact map — opens fullscreen */
  onExpand?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isKorea(p: TripPoint) {
  return p.lat >= 33 && p.lat <= 40 && p.lng >= 124 && p.lng <= 132;
}

/**
 * Compute the viewport bounds for a given active day.
 *
 * Compact mode (preview):
 *  – Travel day (first day at this point): show fromPoint + toPoint (the segment)
 *  – Staying day (mid-stay): show current + next point ("what's coming")
 *  – Single point only: create a fixed-size bounding box around it
 *
 * Full mode: always show all route points.
 */
function computeBoundsForDay(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  points: TripPoint[],
  activeDayIndex: number,
  compact: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null {
  if (points.length === 0) return null;

  if (!compact) {
    return L.latLngBounds(points.map((p) => [p.lat, p.lng]));
  }

  // ── Compact: day-aware bounds ──────────────────────────────────────────────
  const activePoint = getActiveTripPoint(points, activeDayIndex);
  if (!activePoint) {
    // Fallback: Korea points, or all points
    const ko = points.filter(isKorea);
    return L.latLngBounds((ko.length > 0 ? ko : points).map((p) => [p.lat, p.lng]));
  }

  const activeIdx = points.findIndex((p) => p.id === activePoint.id);
  const candidates: TripPoint[] = [activePoint];

  const isTravelDay = activePoint.firstDayIndex === activeDayIndex;

  if (isTravelDay && activeIdx > 0) {
    // Show the segment we just traveled: prev point → active point
    candidates.push(points[activeIdx - 1]);
  } else {
    // Staying here — show next stop as forward context
    if (activeIdx < points.length - 1) {
      candidates.push(points[activeIdx + 1]);
    }
  }

  if (candidates.length === 1) {
    const p = candidates[0];
    return L.latLngBounds(
      [p.lat - 0.8, p.lng - 0.8],
      [p.lat + 0.8, p.lng + 0.8],
    );
  }

  return L.latLngBounds(candidates.map((p) => [p.lat, p.lng]));
}

// ─── Route layer drawing ──────────────────────────────────────────────────────

function drawRouteLayers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group: any,
  points: TripPoint[],
  segments: TripSegment[],
  activeDayIndex: number,
  compact: boolean,
) {
  group.clearLayers();

  const activePoint = getActiveTripPoint(points, activeDayIndex);

  // ── Polylines ─────────────────────────────────────────────────────────────
  for (const seg of segments) {
    const from = points.find((p) => p.id === seg.fromPointId);
    const to = points.find((p) => p.id === seg.toPointId);
    if (!from || !to) continue;

    const isFlight = seg.type === "flight";
    L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
      color: isFlight ? "#818cf8" : "#22c55e",
      weight: compact ? 1.5 : 2.5,
      opacity: 0.85,
      dashArray: isFlight ? "8 6" : undefined,
      lineCap: "round",
    }).addTo(group);
  }

  // ── Markers (non-active first so active renders on top) ───────────────────
  const ordered = [...points].sort((a, b) =>
    a.id === activePoint?.id ? 1 : b.id === activePoint?.id ? -1 : 0,
  );

  for (const p of ordered) {
    const isActive = p.id === activePoint?.id;
    const isKR = isKorea(p);

    const radius = isActive ? (compact ? 7 : 9) : compact ? 4 : 5;
    const fillColor = isActive ? "#1e3a8a" : isKR ? "#3b82f6" : "#94a3b8";
    const fillOpacity = isActive ? 1 : isKR ? 0.9 : 0.55;
    const weight = isActive ? 2.5 : 1.5;

    const marker = L.circleMarker([p.lat, p.lng], {
      radius,
      color: "white",
      weight,
      fillColor,
      fillOpacity,
    }).addTo(group);

    // Tooltips
    const showTooltip = isActive || (!compact && isKR) || (!compact && !isKR);
    if (showTooltip) {
      const dayRange =
        p.firstDayIndex === p.lastDayIndex
          ? `Dag ${p.firstDayIndex + 1}`
          : `Dag ${p.firstDayIndex + 1}–${p.lastDayIndex + 1}`;

      let html: string;
      if (isActive) {
        html = `<div class="tw-label tw-label-active"><strong>${p.city}</strong><br><span>${dayRange}</span></div>`;
      } else if (isKR) {
        html = `<div class="tw-label">${p.city}</div>`;
      } else {
        html = `<div class="tw-label tw-label-intl">${p.city}</div>`;
      }

      marker.bindTooltip(html, {
        permanent: isActive || (!compact && isKR),
        direction: "right",
        offset: [radius + 4, 0],
        opacity: 1,
        className: "tw-tooltip-wrap",
      });
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TripMapInner({
  points,
  segments,
  activeDayIndex,
  compact = false,
  onExpand,
}: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs shared between effects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRef = useRef<any>(null);

  // Always-current activeDayIndex — prevents stale closure in async init
  const activeDayRef = useRef(activeDayIndex);
  useEffect(() => { activeDayRef.current = activeDayIndex; }, [activeDayIndex]);

  // ── Init effect (once per mount) ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let sizeTimer: ReturnType<typeof setTimeout>;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: !compact,
        dragging: !compact,
        scrollWheelZoom: compact ? false : "center",
        touchZoom: !compact,
        doubleClickZoom: !compact,
        boxZoom: !compact,
        keyboard: !compact,
        attributionControl: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        opacity: compact ? 0.88 : 0.92,
      }).addTo(map);

      if (!compact) {
        L.control
          .attribution({ prefix: false, position: "bottomright" })
          .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
          .addTo(map);
      }

      const group = L.layerGroup().addTo(map);
      groupRef.current = group;

      drawRouteLayers(L, group, points, segments, activeDayRef.current, compact);

      // Initial bounds for the current active day
      const bounds = computeBoundsForDay(L, points, activeDayRef.current, compact);
      if (bounds) {
        map.fitBounds(bounds.pad(0.22), { animate: false, maxZoom: compact ? 10 : 14 });
      }

      // Safety: let the layout settle, then invalidate Leaflet's size cache
      sizeTimer = setTimeout(() => {
        if (!cancelled && mapRef.current) mapRef.current.invalidateSize();
      }, 150);
    })();

    return () => {
      cancelled = true;
      clearTimeout(sizeTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        groupRef.current = null;
        LRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]); // only re-init on mode change; points/segments are stable

  // ── Update effect (on activeDayIndex change) ──────────────────────────────
  useEffect(() => {
    if (!LRef.current || !mapRef.current || !groupRef.current) return;

    drawRouteLayers(LRef.current, groupRef.current, points, segments, activeDayIndex, compact);

    // Refit viewport for the new active day
    const bounds = computeBoundsForDay(LRef.current, points, activeDayIndex, compact);
    if (bounds) {
      mapRef.current.fitBounds(bounds.pad(0.22), {
        animate: false, // instant — prevents jank during scroll
        maxZoom: compact ? 10 : 14,
      });
    }
  }, [activeDayIndex, points, segments, compact]);

  return (
    <div className="relative w-full h-full">
      {/* Leaflet attaches to this div */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Compact overlay: intercepts all pointer events → opens fullscreen.
          This prevents scroll-hijack by Leaflet on mobile. */}
      {compact && (
        <div
          className="absolute inset-0 z-[800] touch-none"
          style={{ cursor: onExpand ? "pointer" : "default" }}
          onClick={onExpand}
          onTouchEnd={(e) => {
            e.preventDefault();
            onExpand?.();
          }}
        />
      )}

      {/* Expand hint (compact only) */}
      {compact && onExpand && (
        <div
          className="absolute bottom-2 right-2 z-[801] flex items-center gap-1 rounded pointer-events-none"
          style={{ background: "rgba(0,0,0,0.42)", padding: "2px 7px" }}
        >
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] font-semibold text-white leading-none">Kaart</span>
        </div>
      )}
    </div>
  );
}
