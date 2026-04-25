"use client";

import { useEffect, useRef, useState } from "react";
import type { FlightStatusData } from "@/lib/flights/types";
import { StatusBadge } from "./StatusBadge";
import { WarningBlock } from "./WarningBlock";
import type { Flight } from "@/data/trip";

type DataSource = "live" | "cached" | "static";

const FETCH_TIMEOUT_MS = 4000;
const LOADING_CAP_MS = 1000;

interface Props {
  flight: Flight;
}

function cacheKey(flight: Flight) {
  return `flight_status_${flight.flightNumber}_${flight.date}`;
}

function readCache(flight: Flight): FlightStatusData | null {
  try {
    const raw = localStorage.getItem(cacheKey(flight));
    if (!raw) return null;
    return JSON.parse(raw) as FlightStatusData;
  } catch {
    return null;
  }
}

function writeCache(flight: Flight, data: FlightStatusData) {
  try {
    localStorage.setItem(cacheKey(flight), JSON.stringify(data));
  } catch {
    // localStorage niet beschikbaar
  }
}

function staticFallback(flight: Flight): FlightStatusData {
  return {
    flightNumber: flight.flightNumber,
    date: flight.date,
    from: flight.from.code,
    to: flight.to.code,
    status: "scheduled",
    scheduledDeparture: flight.departureTime,
    scheduledArrival: flight.arrivalTime,
    terminalDeparture: flight.terminalDeparture,
    terminalArrival: flight.terminalArrival,
    lastUpdated: new Date().toISOString(),
  };
}

function applyFallback(
  flight: Flight,
  setData: (d: FlightStatusData) => void,
  setSource: (s: DataSource) => void
) {
  const cached = readCache(flight);
  if (cached) {
    console.log(`[FlightStatus] Cache gebruikt voor ${flight.flightNumber}`);
    setData(cached);
    setSource("cached");
  } else {
    console.log(`[FlightStatus] Statische fallback voor ${flight.flightNumber}`);
    setData(staticFallback(flight));
    setSource("static");
  }
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SourceBadge({ source }: { source: DataSource }) {
  if (source === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        Live
      </span>
    );
  }
  if (source === "cached") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
        Gecacht
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Offline — statische data
    </span>
  );
}

function ExternalLinks({ flight }: { flight: Flight }) {
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(flight.flightNumber + " flight")}`;
  const airlineUrl = "https://global.csair.com/EN/flight-status/";

  return (
    <div className="flex gap-2 pt-3">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-700 active:bg-gray-50"
      >
        Bekijk op Google
      </a>
      <a
        href={airlineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-700 active:bg-gray-50"
      >
        Bekijk bij airline
      </a>
    </div>
  );
}

export function FlightStatusCard({ flight }: Props) {
  const [data, setData] = useState<FlightStatusData | null>(null);
  const [source, setSource] = useState<DataSource>("static");
  const [loading, setLoading] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const controller = new AbortController();

    function finish(d: FlightStatusData, s: DataSource) {
      if (doneRef.current) return;
      doneRef.current = true;
      clearTimeout(fetchTimeout);
      clearTimeout(loadingCap);
      setData(d);
      setSource(s);
      setLoading(false);
    }

    // Hard abort after FETCH_TIMEOUT_MS
    const fetchTimeout = setTimeout(() => {
      console.log(`[FlightStatus] Fetch timeout (${FETCH_TIMEOUT_MS}ms) — ${flight.flightNumber}`);
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    // Cap the loading spinner at LOADING_CAP_MS regardless
    const loadingCap = setTimeout(() => {
      if (!doneRef.current) {
        console.log(`[FlightStatus] Loading cap bereikt — toon fallback voor ${flight.flightNumber}`);
        const cached = readCache(flight);
        finish(
          cached ?? staticFallback(flight),
          cached ? "cached" : "static"
        );
      }
    }, LOADING_CAP_MS);

    const params = new URLSearchParams({
      flightNumber: flight.flightNumber,
      date: flight.date,
      from: flight.from.code,
      to: flight.to.code,
    });

    console.log(`[FlightStatus] Ophalen: ${flight.flightNumber} (${flight.date})`);

    fetch(`/api/flights/status?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: FlightStatusData) => {
        if (!json || typeof json !== "object") throw new Error("Lege response");
        if (!json.flightNumber) throw new Error("Ongeldige response — geen flightNumber");
        if (json.error) throw new Error(String(json.error));
        console.log(`[FlightStatus] Live data ontvangen voor ${flight.flightNumber}`);
        writeCache(flight, json);
        finish(json, "live");
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") {
          console.log(`[FlightStatus] Fetch afgebroken voor ${flight.flightNumber}`);
        } else {
          console.log(`[FlightStatus] Fetch fout voor ${flight.flightNumber}:`, err.message);
        }
        const cached = readCache(flight);
        finish(cached ?? staticFallback(flight), cached ? "cached" : "static");
      });

    return () => {
      doneRef.current = true;
      clearTimeout(fetchTimeout);
      clearTimeout(loadingCap);
      controller.abort();
    };
  }, [flight.flightNumber, flight.date, flight.from.code, flight.to.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine what to render
  const showData = !loading && data !== null;
  const showFallbackOnly = !loading && data === null;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Vluchtstatus
          </p>
          <p className="text-base font-bold text-gray-900 mt-0.5">
            {flight.flightNumber} &mdash; {flight.from.city} → {flight.to.city}
          </p>
        </div>
        {showData && <StatusBadge status={data!.status} />}
      </div>

      <div className="px-4 py-3">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-2">Status ophalen…</p>
        )}

        {showFallbackOnly && (
          <div className="space-y-3">
            <p className="text-sm text-orange-700">
              Vluchtinformatie niet beschikbaar — bekijk externe bronnen.
            </p>
            <ExternalLinks flight={flight} />
          </div>
        )}

        {showData && (
          <div>
            {source !== "live" && (
              <div className="mb-3 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 text-sm text-orange-700">
                {source === "cached"
                  ? "Live status niet beschikbaar — gecachte data getoond."
                  : "Live status niet beschikbaar — statische vluchtinformatie getoond."}
              </div>
            )}

            <div className="divide-y divide-gray-100">
              <Row label="Gepland vertrek" value={data!.scheduledDeparture} />
              {data!.estimatedDeparture &&
                data!.estimatedDeparture !== data!.scheduledDeparture && (
                  <Row label="Verwacht vertrek" value={data!.estimatedDeparture} />
                )}
              {data!.actualDeparture && (
                <Row label="Werkelijk vertrek" value={data!.actualDeparture} />
              )}
              <Row label="Gepland aankomst" value={data!.scheduledArrival} />
              {data!.estimatedArrival &&
                data!.estimatedArrival !== data!.scheduledArrival && (
                  <Row label="Verwacht aankomst" value={data!.estimatedArrival} />
                )}
              {data!.actualArrival && (
                <Row label="Werkelijk aankomst" value={data!.actualArrival} />
              )}
              {data!.terminalDeparture && (
                <Row label="Terminal vertrek" value={data!.terminalDeparture} />
              )}
              {data!.gateDeparture && (
                <Row label="Gate vertrek" value={data!.gateDeparture} />
              )}
              {data!.terminalArrival && (
                <Row label="Terminal aankomst" value={data!.terminalArrival} />
              )}
              {data!.gateArrival && (
                <Row label="Gate aankomst" value={data!.gateArrival} />
              )}
              {data!.baggageBelt && (
                <Row label="Bagageband" value={data!.baggageBelt} />
              )}
            </div>

            <WarningBlock className="mt-3">
              Gate-informatie wordt vaak pas kort voor vertrek gepubliceerd.
            </WarningBlock>

            <div className="mt-2 flex items-center justify-between">
              <SourceBadge source={source} />
              <p className="text-xs text-gray-400">
                Bijgewerkt:{" "}
                {new Date(data!.lastUpdated).toLocaleTimeString("nl-NL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <ExternalLinks flight={flight} />
          </div>
        )}
      </div>
    </div>
  );
}
