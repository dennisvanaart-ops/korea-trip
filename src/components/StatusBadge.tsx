import type { FlightStatus } from "@/lib/flights/types";

const labels: Record<FlightStatus, string> = {
  scheduled: "Gepland",
  on_time: "Op tijd",
  delayed: "Vertraagd",
  cancelled: "Geannuleerd",
  boarding: "Boarding",
  departed: "Vertrokken",
  arrived: "Geland",
  unknown: "Onbekend",
};

const styles: Record<FlightStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
  on_time: "bg-green-50 text-green-700 border border-green-200",
  delayed: "bg-orange-50 text-orange-700 border border-orange-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  boarding: "bg-green-50 text-green-700 border border-green-200",
  departed: "bg-gray-100 text-gray-600 border border-gray-200",
  arrived: "bg-gray-100 text-gray-600 border border-gray-200",
  unknown: "bg-gray-100 text-gray-500 border border-gray-200",
};

interface Props {
  status: FlightStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
