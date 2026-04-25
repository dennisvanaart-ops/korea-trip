import type { Transport } from "@/data/trip";
import { FlightStatusCard } from "./FlightStatusCard";
import { InfoBlock } from "./InfoBlock";
import { MapButtons } from "./MapButtons";

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

export function TransportCard({ transport }: Props) {
  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
          {typeLabel(transport.type)}
        </p>
        <p className="text-base font-bold text-gray-900 mt-0.5">{transport.title}</p>
      </div>

      <div className="px-4 py-3 space-y-3">
        {transport.flight && (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Van</p>
                <p className="font-semibold">
                  {transport.flight.from.code}
                </p>
                <p className="text-gray-600 text-xs">{transport.flight.from.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Naar</p>
                <p className="font-semibold">{transport.flight.to.code}</p>
                <p className="text-gray-600 text-xs">{transport.flight.to.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Vertrek</p>
                <p className="font-semibold">{transport.flight.departureTime}</p>
                <p className="text-gray-600 text-xs">{transport.flight.date}</p>
              </div>
              <div>
                <p className="text-gray-500">Aankomst</p>
                <p className="font-semibold">{transport.flight.arrivalTime}</p>
                {transport.flight.arrivalDate && (
                  <p className="text-gray-600 text-xs">{transport.flight.arrivalDate}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500">Duur</p>
                <p className="font-semibold">{transport.flight.duration}</p>
              </div>
              <div>
                <p className="text-gray-500">Klasse</p>
                <p className="font-semibold">{transport.flight.cabin}</p>
              </div>
            </div>

            {transport.flight.baggage && (
              <div className="text-sm">
                <p className="text-gray-500 mb-1">Bagage</p>
                <div className="flex flex-wrap gap-1">
                  {transport.flight.baggage.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs text-blue-700"
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

            {(transport.flight.terminalDeparture || transport.flight.terminalArrival) && (
              <div className="flex gap-4 text-sm">
                {transport.flight.terminalDeparture && (
                  <span>
                    <span className="text-gray-500">Terminal vertrek: </span>
                    <span className="font-medium">{transport.flight.terminalDeparture}</span>
                  </span>
                )}
                {transport.flight.terminalArrival && (
                  <span>
                    <span className="text-gray-500">Terminal aankomst: </span>
                    <span className="font-medium">{transport.flight.terminalArrival}</span>
                  </span>
                )}
              </div>
            )}

            <FlightStatusCard flight={transport.flight} />
          </>
        )}

        {transport.description && !transport.flight && (
          <p className="text-sm text-gray-700">{transport.description}</p>
        )}

        {transport.query && !transport.flight && (
          <MapButtons name={transport.title} query={transport.query} />
        )}

        {transport.notes && transport.notes.length > 0 && (
          <ul className="space-y-1">
            {transport.notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 select-none">—</span>
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
