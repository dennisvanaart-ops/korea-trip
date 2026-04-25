import { flights } from "@/data/trip";

export const metadata = { title: "Vluchten — Korea Reis" };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2 shadow-sm">
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}

function Hr() {
  return <hr className="border-gray-100" />;
}

export default function FlightsPage() {
  const { CZ0346, CZ0315, CZ0316, CZ0345 } = flights;

  return (
    <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 16px))" }}>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Vluchten</h1>
        <p className="text-gray-500 text-sm mt-1">
          PNR:{" "}
          <span className="font-mono font-semibold text-gray-700">PL9C9K</span>
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Heenvlucht */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">Heenvlucht — Amsterdam → Seoul</p>
          <p className="text-xs text-gray-400">28–29 april 2026</p>
          <Hr />
          <Row label="Vlucht" value={CZ0346.flightNumber} />
          <Row
            label="Route"
            value={`${CZ0346.from.city} (${CZ0346.from.code}) → ${CZ0346.to.city} (${CZ0346.to.code})`}
          />
          <Row label="Vertrek" value={`${CZ0346.departureTime} (28 apr)`} />
          <Row label="Aankomst" value={`${CZ0346.arrivalTime} (29 apr)`} />
          <Row label="Duur" value={CZ0346.duration} />
          <Row label="Terminal" value={`Schiphol Terminal ${CZ0346.terminalDeparture}`} />
          <Row label="Bagage" value={CZ0346.baggage?.join(", ") ?? "—"} />
          <Hr />
          <Row
            label="Overstap"
            value={<span className="text-amber-600 font-medium">{CZ0315.layoverAfter}</span>}
          />
          <Hr />
          <Row label="Vlucht" value={CZ0315.flightNumber} />
          <Row
            label="Route"
            value={`${CZ0315.from.city} (${CZ0315.from.code}) → ${CZ0315.to.city} (${CZ0315.to.code})`}
          />
          <Row label="Vertrek" value={`${CZ0315.departureTime} (29 apr)`} />
          <Row label="Aankomst" value={`${CZ0315.arrivalTime} (29 apr)`} />
          <Row label="Duur" value={CZ0315.duration} />
          <Row
            label="Terminal aankomst"
            value={`Incheon Terminal ${CZ0315.terminalArrival}`}
          />
        </Card>

        {/* Terugvlucht */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">Terugvlucht — Seoul → Amsterdam</p>
          <p className="text-xs text-gray-400">12 mei 2026</p>
          <Hr />
          <Row label="Vlucht" value={CZ0316.flightNumber} />
          <Row
            label="Route"
            value={`${CZ0316.from.city} (${CZ0316.from.code}) → ${CZ0316.to.city} (${CZ0316.to.code})`}
          />
          <Row
            label="Vertrek"
            value={`${CZ0316.departureTime} — Incheon Terminal ${CZ0316.terminalDeparture}`}
          />
          <Row label="Aankomst" value={CZ0316.arrivalTime} />
          <Row label="Duur" value={CZ0316.duration} />
          <Hr />
          <Row
            label="Overstap"
            value={<span className="text-amber-600 font-medium">{CZ0345.layoverAfter}</span>}
          />
          <Hr />
          <Row label="Vlucht" value={CZ0345.flightNumber} />
          <Row
            label="Route"
            value={`${CZ0345.from.city} (${CZ0345.from.code}) → ${CZ0345.to.city} (${CZ0345.to.code})`}
          />
          <Row label="Vertrek" value={CZ0345.departureTime} />
          <Row label="Aankomst" value={`${CZ0345.arrivalTime} (12 mei)`} />
          <Row label="Duur" value={CZ0345.duration} />
        </Card>
      </div>
    </div>
  );
}
