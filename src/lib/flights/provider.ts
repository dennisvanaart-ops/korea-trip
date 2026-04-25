import type { FlightProvider } from "./types";
import { mockProvider } from "./mockProvider";
import { createAmadeusProvider } from "./amadeusProvider";

export function getFlightProvider(): FlightProvider {
  const providerName = process.env.FLIGHT_API_PROVIDER ?? "mock";

  if (providerName === "amadeus") {
    const key = process.env.AMADEUS_API_KEY;
    const secret = process.env.AMADEUS_API_SECRET;
    if (key && secret) return createAmadeusProvider(key, secret);
  }

  if (providerName === "aviationstack") {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (apiKey) {
      return {
        async getStatus(req) {
          const params = new URLSearchParams({
            access_key: apiKey,
            flight_iata: req.flightNumber,
            flight_date: req.date,
          });
          const res = await fetch(`http://api.aviationstack.com/v1/flights?${params}`);
          if (!res.ok) throw new Error(`AviationStack error: ${res.status}`);
          const json = await res.json();
          const f = json.data?.[0];
          if (!f) throw new Error("Flight not found");
          return {
            flightNumber: req.flightNumber.toUpperCase(),
            date: req.date,
            from: req.from,
            to: req.to,
            status: f.flight_status ?? "unknown",
            scheduledDeparture: f.departure?.scheduled?.slice(11, 16) ?? "--:--",
            estimatedDeparture: f.departure?.estimated?.slice(11, 16),
            actualDeparture: f.departure?.actual?.slice(11, 16),
            scheduledArrival: f.arrival?.scheduled?.slice(11, 16) ?? "--:--",
            estimatedArrival: f.arrival?.estimated?.slice(11, 16),
            actualArrival: f.arrival?.actual?.slice(11, 16),
            terminalDeparture: f.departure?.terminal,
            gateDeparture: f.departure?.gate,
            terminalArrival: f.arrival?.terminal,
            gateArrival: f.arrival?.gate,
            baggageBelt: f.arrival?.baggage,
            lastUpdated: new Date().toISOString(),
          };
        },
      };
    }
  }

  return mockProvider;
}
