"use client";

/**
 * TripMapInner — actual Leaflet implementation.
 *
 * IMPORTANT: This file is never imported directly. Use TripMap.tsx, which
 * wraps this with next/dynamic { ssr: false } to avoid Leaflet's window access
 * during server rendering.
 *
 * Two-effect pattern:
 *  1. Init effect (runs once): async-imports Leaflet, creates the map,
 *     draws tiles + initial route layers, fits bounds.
 *  2. Update effect (runs on activeDayIndex change): redraws only the
 *     route layers (markers + polylines) without recreating the base map.
 *     This keeps tile caching intact and avoids jank.
 */

import { useEffect, useRef } from "react";
import type { TripPoint, TripSegment } from "@/lib/tripSegments";
import { getActiveTripPoint } from "@/lib/tripSegments";

export interface TripMapProps {
  points: TripPoint[];
  segments: TripSegment[];
  activeDayIndex: number;
  /** true = compact preview (disabled interactions, Korea-only bounds) */
  compact?: boolean;
  /** Called when user taps the compact map — opens fullscreen */
  onExpand?: () => void;
}

// ─── Layer drawing ─────────────────────────────────────────────────────────────

function isKorea(p: TripPoint) {
  return p.lat >= 33 && p.lat <= 40 && p.lng >= 124 && p.lng <= 132;
}

function drawRouteLayers(
  L: typeof import("leaflet"),
  group: import("leaflet").LayerGroup,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L as any).polyline([[from.lat, from.lng], [to.lat, to.lng]], {
      color: isFlight ? "#818cf8" : "#22c55e",
      weight: compact ? 1.5 : 2.5,
      opacity: 0.85,
      dashArray: isFlight ? "8 6" : undefined,
      lineCap: "round",
    }).addTo(group);
  }

  // ── Markers ───────────────────────────────────────────────────────────────
  // Draw non-active first so active marker renders on top
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marker = (L as any).circleMarker([p.lat, p.lng], {
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

  // Refs shared between the two effects
  const mapRef = useRef<import("leaflet").Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<typeof import("leaflet") | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRef = useRef<import("leaflet").LayerGroup | null>(null);

  // Always-current view of activeDayIndex (avoids stale closure in init async)
  const activeDayRef = useRef(activeDayIndex);
  useEffect(() => { activeDayRef.current = activeDayIndex; }, [activeDayIndex]);

  // ── Init effect (runs once per mount) ─────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      // Dynamically import Leaflet — only runs in the browser
      const L = (await import("leaflet")).default as typeof import("leaflet");
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

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        opacity: compact ? 0.88 : 0.92,
      }).addTo(map);

      // Attribution (fullscreen only)
      if (!compact) {
        L.control
          .attribution({ prefix: false, position: "bottomright" })
          .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
          .addTo(map);
      }

      // Route layer group
      const group = L.layerGroup().addTo(map);
      groupRef.current = group;

      // Draw initial route with the current (possibly stale) activeDayIndex
      drawRouteLayers(L, group, points, segments, activeDayRef.current, compact);

      // Fit bounds
      const boundPts = compact ? points.filter(isKorea) : points;
      const usedPts = boundPts.length > 0 ? boundPts : points;
      if (usedPts.length > 0) {
        const bounds = L.latLngBounds(usedPts.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.18), { animate: false });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        groupRef.current = null;
        LRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]); // Only re-init when compact mode changes

  // ── Update effect (runs on activeDayIndex change) ─────────────────────────
  useEffect(() => {
    if (!LRef.current || !mapRef.current || !groupRef.current) return;
    drawRouteLayers(LRef.current, groupRef.current, points, segments, activeDayIndex, compact);
  }, [activeDayIndex, points, segments, compact]);

  return (
    <div className="relative w-full h-full">
      {/* Leaflet attaches to this div */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Compact overlay: intercepts all pointer events → opens fullscreen */}
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
          style={{
            background: "rgba(0,0,0,0.42)",
            padding: "2px 7px",
          }}
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
