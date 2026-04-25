import { hotels } from "@/data/trip";

export const metadata = { title: "Hotels — Korea Reis" };

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

const hotelList = [
  { h: hotels.gracery_seoul, city: "Seoul", nights: "29 apr – 2 mei" },
  { h: hotels.sokcho, city: "Sokcho", nights: "2 mei – 5 mei" },
  { h: hotels.jukheon, city: "Andong", nights: "5 mei – 6 mei" },
  { h: hotels.gem_stay, city: "Busan", nights: "6 mei – 8 mei" },
  { h: hotels.best_western_jeonju, city: "Jeonju", nights: "8 mei – 10 mei" },
  { h: hotels.weco_insadong, city: "Seoul", nights: "10 mei – 12 mei" },
];

export default function HotelsPage() {
  return (
    <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 16px))" }}>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
        <p className="text-gray-500 text-sm mt-1">6 verblijven · 14 nachten</p>
      </div>

      <div className="px-4 space-y-4">
        {hotelList.map(({ h, city, nights }) => (
          <Card key={h.id}>
            <div>
              <p className="text-sm font-semibold text-gray-800">{h.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {city} · {nights}
              </p>
            </div>
            <Hr />
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
                      <span key={i} className="block">
                        {n}
                      </span>
                    ))}
                  </span>
                }
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
