import { NavTrigger } from "@/components/NavTrigger";

export const metadata = { title: "Huurauto — Korea Reis" };

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

export default function CarPage() {
  return (
    <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 16px))" }}>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Huurauto</h1>
        <p className="text-gray-500 text-sm mt-1">2 mei – 11 mei · Seoul Yongsan</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Reservering */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">Reserveringsdetails</p>
          <Hr />
          <Row label="Bookingnummer" value={<span className="font-mono font-semibold">720784480</span>} />
          <Row label="Auto" value="Kia K3 of vergelijkbaar" />
        </Card>

        {/* Ophalen */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800">Ophalen</p>
            <NavTrigger name="Autoverhuur Seoul Yongsan" query="Seoul Yongsan Car Rental" />
          </div>
          <Hr />
          <Row label="Datum" value="2 mei 2026" />
          <Row label="Tijd" value="09:30" />
          <Row label="Locatie" value="Seoul Yongsan" />
        </Card>

        {/* Inleveren */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800">Inleveren</p>
            <NavTrigger name="Autoverhuur Seoul Yongsan" query="Seoul Yongsan Car Rental" />
          </div>
          <Hr />
          <Row label="Datum" value="11 mei 2026" />
          <Row label="Tijd" value="17:30" />
          <Row label="Locatie" value="Seoul Yongsan" />
        </Card>

        {/* Aandachtspunten */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">Aandachtspunten</p>
          <Hr />
          <p className="text-sm text-gray-600 leading-relaxed">
            Controleer rijbewijs, internationale rijbewijsverklaring en verzekering bij ophalen.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Bij parkeren Gem Stay Busan: geen grote auto&apos;s, geen elektrische voertuigen
            (mechanisch parkeersysteem, 7.700 KRW/nacht).
          </p>
        </Card>
      </div>
    </div>
  );
}
