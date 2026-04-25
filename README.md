# Zuid-Korea Rondreis 2026

Mobile-first reisapp voor een Zuid-Korea rondreis van 28 april t/m 12 mei 2026. Gebouwd met Next.js 15, TypeScript en Tailwind CSS.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & start

```bash
npm run build
npm run start
```

## Railway deployment

1. Push naar GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/JOUWGEBRUIKER/korea-trip.git
   git push -u origin main
   ```

2. Ga naar [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**

3. Selecteer de repository. Railway detecteert automatisch Next.js via Nixpacks.

4. Voeg environment variables toe via **Variables** (zie hieronder).

5. Deploy start automatisch. Railway geeft een publieke URL.

## Environment variables

Kopieer `.env.example` naar `.env.local` voor lokaal gebruik:

```bash
cp .env.example .env.local
```

| Variable | Beschrijving | Standaard |
|---|---|---|
| `FLIGHT_API_PROVIDER` | `mock`, `amadeus`, `aviationstack` of `cirium` | `mock` |
| `AMADEUS_API_KEY` | Amadeus API key | — |
| `AMADEUS_API_SECRET` | Amadeus API secret | — |
| `AVIATIONSTACK_API_KEY` | AviationStack API key | — |
| `CIRIUM_APP_ID` | Cirium App ID | — |
| `CIRIUM_APP_KEY` | Cirium App Key | — |

## Live vluchtstatus aanzetten

### Optie 1: AviationStack (eenvoudigst)

1. Maak een gratis account aan op [aviationstack.com](https://aviationstack.com)
2. Kopieer je API key
3. Stel in `.env.local`:
   ```
   FLIGHT_API_PROVIDER=aviationstack
   AVIATIONSTACK_API_KEY=jouw_key_hier
   ```

### Optie 2: Amadeus

1. Maak een account aan op [developers.amadeus.com](https://developers.amadeus.com)
2. Maak een app aan en kopieer key + secret
3. Stel in `.env.local`:
   ```
   FLIGHT_API_PROVIDER=amadeus
   AMADEUS_API_KEY=jouw_key
   AMADEUS_API_SECRET=jouw_secret
   ```

### Mockdata (standaard)

Zonder API key werkt de app volledig met gesimuleerde vluchtdata op basis van de geplande tijden uit `src/data/trip.ts`. De app breekt nooit — bij een API-fout valt hij terug op statische vluchtinformatie.

## Flight API endpoint

```
GET /api/flights/status?flightNumber=CZ0346&date=2026-04-28&from=AMS&to=PKX
```

## Projectstructuur

```
src/
├── app/
│   ├── api/flights/status/route.ts   # Server-side flight status API
│   ├── day/[date]/page.tsx            # Dagdetailpagina
│   ├── hotels/[id]/page.tsx           # Hotelpagina
│   ├── transport/[id]/page.tsx        # Vervoerspagina
│   ├── activities/[id]/page.tsx       # Activiteitenpagina
│   ├── layout.tsx
│   └── page.tsx                       # Homepage met volledige timeline
├── components/
│   ├── TripOverview.tsx
│   ├── DayCard.tsx
│   ├── DayDetail.tsx
│   ├── HotelCard.tsx
│   ├── TransportCard.tsx
│   ├── ActivityCard.tsx
│   ├── MapButtons.tsx                 # Naver + Kakao navigatieknoppen
│   ├── FlightStatusCard.tsx           # Live vluchtstatus component
│   ├── InfoBlock.tsx
│   ├── WarningBlock.tsx
│   └── StatusBadge.tsx
├── data/
│   └── trip.ts                        # Alle reisdata
└── lib/
    └── flights/
        ├── types.ts                   # TypeScript types
        ├── provider.ts                # Provider selectie
        ├── mockProvider.ts            # Mock data
        └── amadeusProvider.ts         # Amadeus integratie
```
