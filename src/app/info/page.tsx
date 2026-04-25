import { BackButton } from "@/components/BackButton";
import { flights, hotels } from "@/data/trip";

export const metadata = { title: "Reisdocumenten & praktische info — Korea Reis" };

// ─── small helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {children}
    </section>
  );
}

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

function Divider() {
  return <hr className="border-gray-100" />;
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function InfoPage() {
  const { CZ0346, CZ0315, CZ0316, CZ0345 } = flights;

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <BackButton />
      </header>

      <div className="px-4 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reisdocumenten</h1>
        <p className="text-gray-500 text-sm mt-1">Praktische info & reserveringen</p>
      </div>

      <div className="px-4 space-y-8">

        {/* ── 1. Vluchten ── */}
        <Section title="Vluchten">
          <p className="text-xs text-gray-400 -mt-1">PNR: <span className="font-mono font-semibold text-gray-600">PL9C9K</span></p>

          {/* Heenvlucht */}
          <Card>
            <p className="text-sm font-semibold text-gray-800">Heenvlucht — Amsterdam → Seoul</p>
            <p className="text-xs text-gray-400">28–29 april 2026</p>
            <Divider />
            <Row label="Vlucht" value={CZ0346.flightNumber} />
            <Row label="Route" value={`${CZ0346.from.city} (${CZ0346.from.code}) → ${CZ0346.to.city} (${CZ0346.to.code})`} />
            <Row label="Vertrek" value={`${CZ0346.departureTime} (28 apr)`} />
            <Row label="Aankomst" value={`${CZ0346.arrivalTime} (29 apr)`} />
            <Row label="Duur" value={CZ0346.duration} />
            <Row label="Terminal" value={`Schiphol Terminal ${CZ0346.terminalDeparture}`} />
            <Row label="Bagage" value={CZ0346.baggage?.join(", ") ?? "—"} />
            <Divider />
            <Row
              label="Overstap"
              value={
                <span className="text-amber-600 font-medium">
                  {CZ0315.layoverAfter ?? "—"}
                </span>
              }
            />
            <Divider />
            <Row label="Vlucht" value={CZ0315.flightNumber} />
            <Row label="Route" value={`${CZ0315.from.city} (${CZ0315.from.code}) → ${CZ0315.to.city} (${CZ0315.to.code})`} />
            <Row label="Vertrek" value={`${CZ0315.departureTime} (29 apr)`} />
            <Row label="Aankomst" value={`${CZ0315.arrivalTime} (29 apr)`} />
            <Row label="Duur" value={CZ0315.duration} />
            <Row label="Terminal aankomst" value={`Incheon Terminal ${CZ0315.terminalArrival}`} />
          </Card>

          {/* Terugvlucht */}
          <Card>
            <p className="text-sm font-semibold text-gray-800">Terugvlucht — Seoul → Amsterdam</p>
            <p className="text-xs text-gray-400">12 mei 2026</p>
            <Divider />
            <Row label="Vlucht" value={CZ0316.flightNumber} />
            <Row label="Route" value={`${CZ0316.from.city} (${CZ0316.from.code}) → ${CZ0316.to.city} (${CZ0316.to.code})`} />
            <Row label="Vertrek" value={`${CZ0316.departureTime} — Incheon Terminal ${CZ0316.terminalDeparture}`} />
            <Row label="Aankomst" value={CZ0316.arrivalTime} />
            <Row label="Duur" value={CZ0316.duration} />
            <Divider />
            <Row
              label="Overstap"
              value={
                <span className="text-amber-600 font-medium">
                  {CZ0345.layoverAfter ?? "—"}
                </span>
              }
            />
            <Divider />
            <Row label="Vlucht" value={CZ0345.flightNumber} />
            <Row label="Route" value={`${CZ0345.from.city} (${CZ0345.from.code}) → ${CZ0345.to.city} (${CZ0345.to.code})`} />
            <Row label="Vertrek" value={CZ0345.departureTime} />
            <Row label="Aankomst" value={`${CZ0345.arrivalTime} (12 mei)`} />
            <Row label="Duur" value={CZ0345.duration} />
          </Card>
        </Section>

        {/* ── 2. Hotels ── */}
        <Section title="Hotels">
          {[
            {
              h: hotels.gracery_seoul,
              city: "Seoul",
              freeCancel: "Controleer boekingsbevestiging",
            },
            {
              h: hotels.sokcho,
              city: "Sokcho",
              freeCancel: "Controleer boekingsbevestiging",
            },
            {
              h: hotels.jukheon,
              city: "Andong",
              freeCancel: "Controleer boekingsbevestiging",
            },
            {
              h: hotels.gem_stay,
              city: "Busan",
              freeCancel: "Controleer boekingsbevestiging",
            },
            {
              h: hotels.best_western_jeonju,
              city: "Jeonju",
              freeCancel: "Controleer boekingsbevestiging",
            },
            {
              h: hotels.weco_insadong,
              city: "Seoul",
              freeCancel: "Controleer boekingsbevestiging",
            },
          ].map(({ h, city }) => (
            <Card key={h.id}>
              <p className="text-sm font-semibold text-gray-800">{h.name}</p>
              <p className="text-xs text-gray-400">{city}</p>
              <Divider />
              <Row label="Adres" value={h.address} />
              {h.checkIn && <Row label="Check-in" value={h.checkIn} />}
              {h.checkOut && <Row label="Check-out" value={h.checkOut} />}
              {h.parking && <Row label="Parkeren" value={h.parking} />}
              {h.notes && h.notes.length > 0 && (
                <Row
                  label="Info"
                  value={
                    <span className="text-right">
                      {h.notes.map((n, i) => (
                        <span key={i} className="block">{n}</span>
                      ))}
                    </span>
                  }
                />
              )}
            </Card>
          ))}
        </Section>

        {/* ── 3. Huurauto ── */}
        <Section title="Huurauto">
          <Card>
            <p className="text-sm font-semibold text-gray-800">Huurauto</p>
            <Divider />
            <Row label="Bookingnummer" value={<span className="font-mono font-semibold">720784480</span>} />
            <Row label="Auto" value="Kia K3 of vergelijkbaar" />
            <Row label="Ophalen" value="2 mei 2026, 09:30" />
            <Row label="Ophaallocatie" value="Seoul Yongsan" />
            <Row label="Inleveren" value="11 mei 2026, 17:30" />
            <Row label="Inleverlocatie" value="Seoul Yongsan" />
            <Divider />
            <p className="text-xs text-gray-400 leading-relaxed">
              Controleer rijbewijs, internationale rijbewijsverklaring en verzekering bij ophalen.
              Bij drukte bij parkeren Gem Stay Busan: geen grote auto&apos;s, geen elektrische voertuigen.
            </p>
            <a
              href={`https://www.google.com/maps/search/Seoul+Yongsan+Car+Rental`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-medium text-blue-700 active:bg-blue-100"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Navigeer naar ophaallocatie
            </a>
          </Card>
        </Section>

        {/* ── 4. Overig ── */}
        <Section title="Overig">
          <Card>
            <p className="text-sm font-semibold text-gray-800">E-Life Limo — Privétransfer</p>
            <p className="text-xs text-gray-400">Aankomst Seoul, 29 april 2026</p>
            <Divider />
            <Row label="Route" value="Incheon Terminal 1 → Hotel Gracery Seoul" />
            <Row label="Wachttijd" value="± 45 min na landing" />
            <Row
              label="Vluchttracking"
              value={
                <span className="text-green-700 font-medium">Actief — chauffeur past aan bij vertraging</span>
              }
            />
            <Row label="Bordje" value="Naam staat op bordje in aankomsthal" />
          </Card>

          <Card>
            <p className="text-sm font-semibold text-gray-800">Haeundae Sky Capsule</p>
            <p className="text-xs text-gray-400">Busan, 7 mei 2026</p>
            <Divider />
            <Row label="Route" value="Mipo → Cheongsapo (kustlijn)" />
            <Row label="Tijdslot voorkeur" value="12:00–14:00" />
            <Row
              label="Reservering"
              value={
                <span className="text-amber-600 font-medium">Reserveren via officiële website</span>
              }
            />
            <Row label="Terug" value="Taxi of Beach Train" />
            <a
              href="https://www.skybeachtrain.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-medium text-blue-700 active:bg-blue-100"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h10M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Officiële reserveringssite
            </a>
          </Card>
        </Section>

      </div>
    </div>
  );
}
