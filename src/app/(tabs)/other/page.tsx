export const metadata = { title: "Overig — Korea Reis" };

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

export default function OtherPage() {
  return (
    <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 16px))" }}>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Overig</h1>
        <p className="text-gray-500 text-sm mt-1">Transfer, activiteiten & reserveringen</p>
      </div>

      <div className="px-4 space-y-4">
        {/* E-Life Limo */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">E-Life Limo — Privétransfer</p>
          <p className="text-xs text-gray-400">Aankomst Seoul · 29 april 2026</p>
          <Hr />
          <Row label="Route" value="Incheon Terminal 1 → Hotel Gracery Seoul" />
          <Row label="Wachttijd" value="± 45 min na landing" />
          <Row
            label="Vluchttracking"
            value={
              <span className="text-green-700 font-medium">
                Actief — chauffeur past aan bij vertraging
              </span>
            }
          />
          <Row label="Bordje" value="Naam staat op bordje in aankomsthal" />
        </Card>

        {/* Sky Capsule */}
        <Card>
          <p className="text-sm font-semibold text-gray-800">Haeundae Sky Capsule</p>
          <p className="text-xs text-gray-400">Busan · 7 mei 2026</p>
          <Hr />
          <Row label="Route" value="Mipo → Cheongsapo (kustlijn)" />
          <Row label="Tijdslot voorkeur" value="12:00–14:00" />
          <Row
            label="Reservering"
            value={
              <span className="text-amber-600 font-medium">
                Reserveren via officiële website
              </span>
            }
          />
          <Row label="Terug" value="Taxi of Beach Train" />
          <a
            href="https://www.skybeachtrain.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-medium text-blue-700 active:bg-blue-100"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 8h10M8 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Officiële reserveringssite
          </a>
        </Card>
      </div>
    </div>
  );
}
