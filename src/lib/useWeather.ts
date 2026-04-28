"use client";

/**
 * useWeather — fetches current weather from Open-Meteo (no API key required).
 *
 * Features:
 *  – In-memory cache keyed by rounded lat/lng; TTL = 60 minutes
 *  – AbortController to cancel stale fetches on fast input changes
 *  – Returns null when no coordinates provided, on error, or while loading
 *
 * Endpoint:
 *   https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current_weather=true
 */

import { useState, useEffect, useRef } from "react";

export interface WeatherResult {
  temp: number;       // °C, rounded
  icon: string;       // emoji
  code: number;       // WMO weather code (for debugging)
}

// ─── Module-level in-memory cache ────────────────────────────────────────────

interface CacheEntry {
  data: WeatherResult;
  fetchedAt: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 60 minutes
const weatherCache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places so nearby locations share a cache entry
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

// ─── WMO weather code → emoji ─────────────────────────────────────────────────

function codeToEmoji(code: number, isDay: number): string {
  if (code === 0)        return isDay ? "☀️"  : "🌙";
  if (code === 1)        return isDay ? "🌤️" : "🌙";
  if (code === 2)        return "⛅";
  if (code === 3)        return "☁️";
  if (code <= 49)        return "🌫️";  // fog / rime
  if (code <= 57)        return "🌦️";  // drizzle (incl. freezing)
  if (code <= 65)        return "🌧️";  // rain
  if (code <= 67)        return "🌨️";  // freezing rain
  if (code <= 77)        return "❄️";  // snow / snow grains
  if (code <= 82)        return "🌧️";  // rain showers
  if (code <= 86)        return "🌨️";  // snow showers
  if (code <= 99)        return "⛈️";  // thunderstorm
  return "🌡️";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather(
  lat: number | null,
  lng: number | null,
): WeatherResult | null {
  const [result, setResult] = useState<WeatherResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) {
      setResult(null);
      return;
    }

    const key = cacheKey(lat, lng);
    const cached = weatherCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setResult(cached.data);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}&current_weather=true`;

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const cw = json?.current_weather;
        if (!cw || typeof cw.temperature !== "number") return;
        const data: WeatherResult = {
          temp: Math.round(cw.temperature),
          icon: codeToEmoji(cw.weathercode ?? 0, cw.is_day ?? 1),
          code: cw.weathercode ?? 0,
        };
        weatherCache.set(key, { data, fetchedAt: Date.now() });
        setResult(data);
      })
      .catch(() => {
        // Network error or intentional abort — leave previous result in place
      });

    return () => {
      controller.abort();
    };
  }, [lat, lng]);

  return result;
}
