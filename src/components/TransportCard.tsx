"use client";

import { useState } from "react";
import type { Transport } from "@/data/trip";
import { FlightStatusCard } from "./FlightStatusCard";
import { InfoBlock } from "./InfoBlock";
import { NavModal } from "./NavModal";
import { CardImage } from "./CardImage";

interface Props {
  transport: Transport;
}

function typeLabel(type: Transport["type"]) {
  switch (type) {
    case "flight":
      return "Vlucht";
    case "transfer":
      return "Transfer";
    case "car_rental":
      return "Auto ophalen";
    case "car_return":
      return "Auto inleveren";
  }
}

function NavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function TransportCard({ transport }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const hasNav = !transport.flight && !!transport.query;

  return (
    <>
      <div className="rounded-2xl bg-white border border-gray-100 shadow overflow-hidden">
        {transport.imageUrl && (
          <CardImage src={transport.imageUrl} alt={transport.title} />
        )}

        <div className="px-4 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
              {typeLabel(transport.type)}
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">
              {transport.title}
            </p>
          </div>
          {hasNav && (
            <button
              onClick={() => setNavOpen(true)}
              className="flex-shrink-0 mt-0.5 rounded-xl bg-blue-50 p-2.5 text-blue-600 active:bg-blue-100 transition-colors"
              aria-label={`Navigeer naar ${transport.title}`}
            >
              <NavIcon />
            </button>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          {transport.flight && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Van</p>
                  <p className="font-bold text-gray-900">{transport.flight.from.code}</p>
                  <p className="text-gray-500 text-xs">{transport.flight.from.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Naar</p>
                  <p className="font-bold text-gray-900">{transport.flight.to.code}</p>
                  <p className="text-gray-500 text-xs">{transport.flight.to.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Vertrek</p>
                  <p className="font-bold text-gray-900">{transport.flight.departureTime}</p>
                  <p className="text-gray-500 text-xs">{transport.flight.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Aankomst</p>
                  <p className="font-bold text-gray-900">{transport.flight.arrivalTime}</p>
                  {transport.flight.arrivalDate && (
                    <p className="text-gray-500 text-xs">{transport.flight.arrivalDate}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Duur</p>
                  <p className="font-semibold text-gray-900">{transport.flight.duration}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Klasse</p>
                  <p className="font-semibold text-gray-900">{transport.flight.cabin}</p>
                </div>
              </div>

              {transport.flight.baggage && (
                <div className="text-sm">
                  <p className="text-gray-400 text-xs mb-1.5">Bagage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {transport.flight.baggage.map((b, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {transport.flight.layoverAfter && (
                <InfoBlock>{transport.flight.layoverAfter}</InfoBlock>
              )}

              {(transport.flight.terminalDeparture ||
                transport.flight.terminalArrival) && (
                <div className="flex gap-4 text-sm">
                  {transport.flight.terminalDeparture && (
                    <span>
                      <span className="text-gray-400">Terminal vertrek: </span>
                      <span className="font-semibold text-gray-800">
                        {transport.flight.terminalDeparture}
                      </span>
                    </span>
                  )}
                  {transport.flight.terminalArrival && (
                    <span>
                      <span className="text-gray-400">Terminal aankomst: </span>
                      <span className="font-semibold text-gray-800">
                        {transport.flight.terminalArrival}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <FlightStatusCard flight={transport.flight} />
            </>
          )}

          {transport.description && !transport.flight && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {transport.description}
            </p>
          )}

          {transport.notes && transport.notes.length > 0 && (
            <ul className="space-y-1.5">
              {transport.notes.map((n, i) => (
                <li key={i} className="text-sm text-gray-500 flex gap-2">
                  <span className="text-gray-300 select-none mt-px">—</span>
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {navOpen && transport.query && (
        <NavModal
          name={transport.title}
          query={transport.query}
          onClose={() => setNavOpen(false)}
        />
      )}
    </>
  );
}
