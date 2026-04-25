import type { FlightProvider, FlightStatusData, FlightStatusRequest } from "./types";

async function getAmadeusToken(apiKey: string, apiSecret: string): Promise<string> {
  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });
  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export function createAmadeusProvider(apiKey: string, apiSecret: string): FlightProvider {
  return {
    async getStatus(req: FlightStatusRequest): Promise<FlightStatusData> {
      const token = await getAmadeusToken(apiKey, apiSecret);

      const params = new URLSearchParams({
        carrierCode: req.flightNumber.slice(0, 2),
        flightNumber: req.flightNumber.slice(2),
        scheduledDepartureDate: req.date,
      });

      const res = await fetch(
        `https://test.api.amadeus.com/v2/schedule/flights?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`Amadeus API error: ${res.status}`);

      const json = await res.json();
      const flight = json.data?.[0];

      if (!flight) throw new Error("Flight not found");

      const dep = flight.flightDesignator;
      const leg = flight.flightPoints?.[0];
      const arr = flight.flightPoints?.[1];

      return {
        flightNumber: req.flightNumber.toUpperCase(),
        date: req.date,
        from: req.from,
        to: req.to,
        status: "scheduled",
        scheduledDeparture: leg?.departure?.timings?.[0]?.value?.slice(11, 16) ?? "--:--",
        scheduledArrival: arr?.arrival?.timings?.[0]?.value?.slice(11, 16) ?? "--:--",
        terminalDeparture: leg?.departure?.terminal?.code,
        terminalArrival: arr?.arrival?.terminal?.code,
        lastUpdated: new Date().toISOString(),
      };
    },
  };
}
