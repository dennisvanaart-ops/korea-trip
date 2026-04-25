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
        <Card>
          <p className="text-sm font-semibold text-gray-800">Reserveringsdetails</p>
          <Hr />
          <Row
            label="Bookingnummer"
            value={<span className="font-mono font-semibold">720784480</span>}
          />
          <Row label="Auto" value="Kia K3 of vergelijkbaar" />
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-800">Ophalen</p>
          <Hr />
          <Row label="Datum" value="2 mei 2026" />
          <Row label="Tijd" value="09:30" />
          <Row label="Locatie" value="Seoul Yongsan" />
          <a
            href="https://www.google.com/maps/search/Seoul+Yongsan+Car+Rental"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-medium text-blue-700 active:bg-blue-100"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Navigeer naar ophaallocatie
          </a>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-800">Inleveren</p>
          <Hr />
          <Row label="Datum" value="11 mei 2026" />
          <Row label="Tijd" value="17:30" />
          <Row label="Locatie" value="Seoul Yongsan" />
        </Card>

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
