import type { FlightProvider, FlightStatusData, FlightStatusRequest } from "./types";

const MOCK_DATA: Record<string, Partial<FlightStatusData>> = {
  CZ0346: {
    scheduledDeparture: "21:40",
    scheduledArrival: "13:25",
    status: "scheduled",
    terminalDeparture: "D",
  },
  CZ0315: {
    scheduledDeparture: "18:55",
    scheduledArrival: "22:10",
    status: "scheduled",
    terminalArrival: "1",
  },
  CZ0316: {
    scheduledDeparture: "09:25",
    scheduledArrival: "10:25",
    status: "scheduled",
    terminalDeparture: "1",
  },
  CZ0345: {
    scheduledDeparture: "14:15",
    scheduledArrival: "18:40",
    status: "scheduled",
  },
};

export const mockProvider: FlightProvider = {
  async getStatus(req: FlightStatusRequest): Promise<FlightStatusData> {
    await new Promise((r) => setTimeout(r, 400));

    const base = MOCK_DATA[req.flightNumber.toUpperCase()] ?? {};

    return {
      flightNumber: req.flightNumber.toUpperCase(),
      date: req.date,
      from: req.from,
      to: req.to,
      status: (base.status as FlightStatusData["status"]) ?? "unknown",
      scheduledDeparture: base.scheduledDeparture ?? "--:--",
      scheduledArrival: base.scheduledArrival ?? "--:--",
      estimatedDeparture: base.estimatedDeparture,
      actualDeparture: base.actualDeparture,
      estimatedArrival: base.estimatedArrival,
      actualArrival: base.actualArrival,
      terminalDeparture: base.terminalDeparture,
      gateDeparture: base.gateDeparture,
      terminalArrival: base.terminalArrival,
      gateArrival: base.gateArrival,
      baggageBelt: base.baggageBelt,
      lastUpdated: new Date().toISOString(),
    };
  },
};
