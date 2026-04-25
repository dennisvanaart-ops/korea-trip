export type FlightStatus =
  | "scheduled"
  | "on_time"
  | "delayed"
  | "cancelled"
  | "boarding"
  | "departed"
  | "arrived"
  | "unknown";

export interface FlightStatusData {
  flightNumber: string;
  date: string;
  from: string;
  to: string;
  status: FlightStatus;
  scheduledDeparture: string;
  estimatedDeparture?: string;
  actualDeparture?: string;
  scheduledArrival: string;
  estimatedArrival?: string;
  actualArrival?: string;
  terminalDeparture?: string;
  gateDeparture?: string;
  terminalArrival?: string;
  gateArrival?: string;
  baggageBelt?: string;
  lastUpdated: string;
  error?: string;
}

export interface FlightStatusRequest {
  flightNumber: string;
  date: string;
  from: string;
  to: string;
}

export interface FlightProvider {
  getStatus(req: FlightStatusRequest): Promise<FlightStatusData>;
}
