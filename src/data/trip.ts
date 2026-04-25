export type ActivityType =
  | "food"
  | "coffee"
  | "sightseeing"
  | "shopping"
  | "outdoor"
  | "market"
  | "other";

export interface MapLocation {
  name: string;
  address?: string;
  query: string;
  naverUrl?: string;
  kakaoUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  description?: string;
  address?: string;
  query: string;
  notes?: string[];
  reservation?: boolean;
  timeSlot?: string;
  naverUrl?: string;
  kakaoUrl?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  query: string;
  checkIn?: string;
  checkOut?: string;
  parking?: string;
  notes?: string[];
  naverUrl?: string;
  kakaoUrl?: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface Flight {
  flightNumber: string;
  airline: string;
  from: Airport;
  to: Airport;
  date: string;
  departureTime: string;
  arrivalTime: string;
  arrivalDate?: string;
  duration: string;
  cabin: string;
  baggage?: string[];
  layoverAfter?: string;
  terminalDeparture?: string;
  terminalArrival?: string;
}

export type TransportType = "flight" | "transfer" | "car_rental" | "car_return";

export interface Transport {
  id: string;
  type: TransportType;
  title: string;
  flight?: Flight;
  description?: string;
  notes?: string[];
  address?: string;
  query?: string;
}

export interface TripDay {
  date: string;
  dayNumber: number;
  title: string;
  location: string;
  emoji: string;
  description?: string;
  hotel?: Hotel;
  transport?: Transport[];
  activities?: Activity[];
  notes?: string[];
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

export const hotels: Record<string, Hotel> = {
  gracery_seoul: {
    id: "gracery_seoul",
    name: "Hotel Gracery Seoul",
    address: "12 Sejong-daero 12-gil, Jung-gu, Seoul",
    query: "Hotel Gracery Seoul",
    checkIn: "29 april",
    checkOut: "2 mei",
    parking: "Ongeveer 20.000 KRW (±€14) per dag — auto nog niet nodig bij aankomst.",
    notes: ["Centraal gelegen in Jung-gu", "Vlakbij Myeongdong"],
  },
  sokcho: {
    id: "sokcho",
    name: "모어댄 속초해변점",
    address: "Sokcho, Gangwon-do, Zuid-Korea",
    query: "모어댄 속초해변점 속초",
    checkIn: "2 mei",
    checkOut: "5 mei",
    notes: ["Aan het strand van Sokcho"],
  },
  jukheon: {
    id: "jukheon",
    name: "Jukheon Traditional House",
    address: "Andong, Gyeongsangbuk-do, Zuid-Korea",
    query: "Jukheon Traditional House Andong",
    checkIn: "5 mei 16:00–23:00",
    checkOut: "7 mei",
    parking: "Beperkt/lokaal parkeren",
    notes: [
      "Traditioneel hanok verblijf",
      "Check-in tussen 16:00 en 23:00",
      "Unieke ervaring in historisch pand",
    ],
  },
  gem_stay: {
    id: "gem_stay",
    name: "Gem Stay Seomyeon",
    address: "Seomyeon, Busanjin-gu, Busan",
    query: "Gem Stay Seomyeon Busan",
    checkIn: "7 mei",
    checkOut: "8 mei",
    parking:
      "7.700 KRW (±€5,40) per nacht — beperkt, mechanisch systeem. Geen grote auto's, geen elektrische voertuigen.",
    notes: ["Self check-in"],
  },
  best_western_jeonju: {
    id: "best_western_jeonju",
    name: "Best Western Plus Jeonju",
    address: "41 Hyeonmu 1-gil, Wansan-gu, Jeonju",
    query: "Best Western Plus Jeonju",
    checkIn: "8 mei",
    checkOut: "10 mei",
    parking: "Ondergronds parkeren, buiten bij drukte",
    notes: ["Ontbijt inbegrepen", "Café, fitness, wasserette", "Rooftop garden", "Fietsverhuur"],
  },
  weco_insadong: {
    id: "weco_insadong",
    name: "WECO Stay Insadong",
    address: "Insadong, Jongno-gu, Seoul",
    query: "WECO Stay Insadong Seoul",
    checkIn: "10 mei",
    checkOut: "12 mei",
    parking: "Beperkt parkeren in de buurt",
    notes: ["In het hart van Insadong"],
  },
};

// ─── Flights ──────────────────────────────────────────────────────────────────

export const flights: Record<string, Flight> = {
  CZ0346: {
    flightNumber: "CZ0346",
    airline: "China Southern",
    from: { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam" },
    to: { code: "PKX", name: "Beijing Daxing", city: "Beijing" },
    date: "2026-04-28",
    departureTime: "21:40",
    arrivalTime: "13:25",
    arrivalDate: "2026-04-29",
    duration: "9u45",
    cabin: "Economy",
    baggage: ["Kleine handtas", "Handbagage", "Ruimbagage"],
    terminalDeparture: "D",
  },
  CZ0315: {
    flightNumber: "CZ0315",
    airline: "China Southern",
    from: { code: "PKX", name: "Beijing Daxing", city: "Beijing" },
    to: { code: "ICN", name: "Seoul Incheon", city: "Seoul" },
    date: "2026-04-29",
    departureTime: "18:55",
    arrivalTime: "22:10",
    duration: "2u15",
    cabin: "Economy",
    layoverAfter: "5u30 overstap Beijing",
    terminalArrival: "1",
  },
  CZ0316: {
    flightNumber: "CZ0316",
    airline: "China Southern",
    from: { code: "ICN", name: "Seoul Incheon", city: "Seoul" },
    to: { code: "PKX", name: "Beijing Daxing", city: "Beijing" },
    date: "2026-05-12",
    departureTime: "09:25",
    arrivalTime: "10:25",
    duration: "2u",
    cabin: "Economy",
    terminalDeparture: "1",
  },
  CZ0345: {
    flightNumber: "CZ0345",
    airline: "China Southern",
    from: { code: "PKX", name: "Beijing Daxing", city: "Beijing" },
    to: { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam" },
    date: "2026-05-12",
    departureTime: "14:15",
    arrivalTime: "18:40",
    duration: "10u25",
    cabin: "Economy",
    layoverAfter: "3u50 overstap Beijing",
  },
};

// ─── Trip days ────────────────────────────────────────────────────────────────

export const tripDays: TripDay[] = [
  {
    date: "2026-04-28",
    dayNumber: 1,
    title: "Vertrek Amsterdam",
    location: "Amsterdam → Beijing",
    emoji: "✈️",
    description: "Avondvlucht naar Beijing, overstap naar Seoul.",
    transport: [
      {
        id: "flight_CZ0346",
        type: "flight",
        title: "CZ0346 Amsterdam → Beijing",
        flight: flights.CZ0346,
      },
    ],
    notes: ["Vertrek 21:40 — vroeg naar Schiphol", "Terminal D Schiphol"],
  },
  {
    date: "2026-04-29",
    dayNumber: 2,
    title: "Aankomst Seoul",
    location: "Beijing → Seoul",
    emoji: "🇰🇷",
    description: "Overstap Beijing, aankomst Seoul Incheon 22:10. Transfer naar hotel.",
    hotel: hotels.gracery_seoul,
    transport: [
      {
        id: "flight_CZ0315",
        type: "flight",
        title: "CZ0315 Beijing → Seoul",
        flight: flights.CZ0315,
        notes: ["5u30 overstap Beijing Daxing", "Aankomst Incheon Terminal 1"],
      },
      {
        id: "transfer_incheon",
        type: "transfer",
        title: "E-Life Limo — Privétransfer Incheon → Hotel Gracery",
        description:
          "Privétransfer van Incheon International Airport Terminal 1 naar Hotel Gracery Seoul. Chauffeur wacht met naambordje in de aankomsthal.",
        query: "Incheon Airport private transfer Seoul",
        notes: [
          "Vertrek vanuit Terminal 1 aankomsthal",
          "Chauffeur wacht ±45 minuten na landing",
          "Vluchttracking actief — chauffeur past wachttijd aan bij vertraging",
          "Directe rit naar hotel zonder tussenstops",
        ],
      },
    ],
    notes: ["Late aankomst — check-in na middernacht mogelijk"],
  },
  {
    date: "2026-04-30",
    dayNumber: 3,
    title: "Seoul — Paleis & Straatvoedsel",
    location: "Seoul",
    emoji: "🏯",
    hotel: hotels.gracery_seoul,
    activities: [
      {
        id: "onion_anguk",
        name: "Onion Anguk",
        type: "coffee",
        query: "Onion Anguk Seoul",
        description: "Trendy koffiebar in een gerenoveerd gebouw in Anguk.",
      },
      {
        id: "gyeongbokgung",
        name: "Gyeongbokgung Palace",
        type: "sightseeing",
        query: "Gyeongbokgung Palace Seoul",
        description: "Het grootste koninklijke paleis van Korea uit de Joseon-dynastie.",
        notes: ["Hanbok verhuur mogelijk aan de ingang", "Gesloten op dinsdag"],
      },
      {
        id: "bukchon",
        name: "Bukchon Hanok Village",
        type: "sightseeing",
        query: "Bukchon Hanok Village Seoul",
        description: "Historische wijk met traditionele hanok-huizen.",
        notes: ["Rustig in de vroege ochtend"],
      },
      {
        id: "gwangjang_market",
        name: "Gwangjang Market",
        type: "market",
        query: "Gwangjang Market Seoul",
        description: "Beroemde markt voor bindaetteok, mayak gimbap en meer.",
        notes: ["Alternatief: Mangwon Market"],
      },
      {
        id: "cheonggyecheon",
        name: "Cheonggyecheon Stream",
        type: "sightseeing",
        query: "Cheonggyecheon Stream Seoul",
        description: "Herstelde stadsbeek — rustige wandelpromenade in het centrum.",
      },
      {
        id: "ikseon_dong",
        name: "Ikseon-dong Alleyways",
        type: "sightseeing",
        query: "Ikseon-dong Seoul",
        description: "Charmante steegjes met cafés, restaurants en kleine winkels.",
      },
      {
        id: "insadong",
        name: "Insadong",
        type: "shopping",
        query: "Insadong Seoul",
        description: "Winkelstraat met kunst, antiek en lokale souvenirs.",
      },
      {
        id: "myeongdong_kyoja",
        name: "Myeongdong Kyoja",
        type: "food",
        query: "Myeongdong Kyoja Seoul",
        description: "Iconisch restaurant voor kalguksu en mandu.",
        notes: ["Kan druk zijn — wachtrij mogelijk", "Back-up: Wolhwa Sikdang"],
      },
    ],
  },
  {
    date: "2026-05-01",
    dayNumber: 4,
    title: "Seoul — Koffie & Namsan",
    location: "Seoul",
    emoji: "☕",
    hotel: hotels.gracery_seoul,
    activities: [
      {
        id: "downt_espresso",
        name: "Downt Espresso",
        type: "coffee",
        query: "Downt Espresso Seoul",
      },
      {
        id: "artist_bakery",
        name: "Artist Bakery",
        type: "food",
        query: "Artist Bakery Seoul",
        description: "Populaire bakkerij met croissants en brood.",
      },
      {
        id: "namsan_park",
        name: "Namsan Park & N Seoul Tower",
        type: "outdoor",
        query: "Namsan Park Seoul",
        description: "Wandeling door Namsan Park met uitzicht op de stad.",
        notes: ["Kabelbaan mogelijk"],
      },
      {
        id: "solsot",
        name: "Solsot",
        type: "food",
        query: "Solsot Seoul",
      },
      {
        id: "center_coffee",
        name: "Center Coffee",
        type: "coffee",
        query: "Center Coffee Seoul",
      },
      {
        id: "lowkey_coffee",
        name: "Lowkey Coffee",
        type: "coffee",
        query: "Lowkey Coffee Seoul",
      },
      {
        id: "coffee_libre",
        name: "Coffee Libre",
        type: "coffee",
        query: "Coffee Libre Seoul",
        description: "Specialty roaster met meerdere vestigingen in Seoul.",
      },
      {
        id: "better_roasting",
        name: "Better Roasting Lab",
        type: "coffee",
        query: "Better Roasting Lab Seoul",
      },
      {
        id: "juuneedu",
        name: "Juuneedu — Pyjama Winkel",
        type: "shopping",
        query: "Juuneedu Seoul",
        description: "Koreaanse pyjama- en loungewear winkel.",
      },
      {
        id: "dakhanmari",
        name: "Jinkhwa Halmea Winjo Dakhanmari",
        type: "food",
        query: "Jinkhwa Halmea Winjo Dakhanmari Seoul",
        description: "Traditionele dakhanmari — hele kip in bouillon.",
        notes: ["Back-up voor Myeongdong Kyoja"],
      },
    ],
  },
  {
    date: "2026-05-02",
    dayNumber: 5,
    title: "Seoul → Sokcho",
    location: "Seoul → Sokcho",
    emoji: "🚗",
    hotel: hotels.sokcho,
    transport: [
      {
        id: "car_pickup",
        type: "car_rental",
        title: "Auto ophalen — Seoul Yongsan",
        description: "Kia K3 of vergelijkbaar voertuig ophalen.",
        address: "Seoul Yongsan",
        query: "Seoul Yongsan Car Rental",
        notes: ["Ophalen 09:30", "Kia K3 of vergelijkbaar"],
      },
    ],
    notes: [
      "Rijden van Seoul naar Sokcho (~3 uur)",
      "Kustweg langs de Oost-Zeekust is erg mooi",
    ],
  },
  {
    date: "2026-05-03",
    dayNumber: 6,
    title: "Seoraksan",
    location: "Sokcho",
    emoji: "🏔️",
    hotel: hotels.sokcho,
    activities: [
      {
        id: "seoraksan_hike",
        name: "Seoraksan Nationaal Park",
        type: "outdoor",
        query: "Seoraksan National Park",
        description: "Wandeling in een van Koreas mooiste bergparken.",
        notes: ["Vroeg vertrekken om drukte te vermijden"],
      },
      {
        id: "seoraksan_cable",
        name: "Seoraksan Cable Car (optioneel)",
        type: "outdoor",
        query: "Seoraksan Cable Car",
        description: "Kabelbaan naar de toppen van Seoraksan.",
        notes: ["Optioneel bij goed weer", "Wachtrij mogelijk in het weekend"],
      },
    ],
  },
  {
    date: "2026-05-04",
    dayNumber: 7,
    title: "Sokcho — Rust",
    location: "Sokcho",
    emoji: "🌊",
    hotel: hotels.sokcho,
    description: "Rustdag. Lichte wandeling of strandbezoek.",
    activities: [
      {
        id: "sokcho_beach",
        name: "Sokcho Beach",
        type: "outdoor",
        query: "Sokcho Beach",
        description: "Strand van Sokcho — ideaal voor een rustige ochtend.",
      },
    ],
  },
  {
    date: "2026-05-05",
    dayNumber: 8,
    title: "Sokcho → Andong",
    location: "Sokcho → Andong",
    emoji: "🏘️",
    hotel: hotels.jukheon,
    notes: ["Check-in 16:00–23:00 bij Jukheon Traditional House"],
  },
  {
    date: "2026-05-06",
    dayNumber: 9,
    title: "Andong — Hahoe Village",
    location: "Andong",
    emoji: "🎭",
    hotel: hotels.jukheon,
    activities: [
      {
        id: "hahoe_village",
        name: "Hahoe Folk Village",
        type: "sightseeing",
        query: "Hahoe Folk Village Andong",
        description: "UNESCO Werelderfgoedsite — levend dorpje met traditional hanok-huizen.",
        notes: ["Masker-dansen in het weekend mogelijk"],
      },
      {
        id: "hahoe_viewpoint",
        name: "Uitzichtpunt Hahoe",
        type: "outdoor",
        query: "Buyongdae Cliff Andong Hahoe",
        description: "Rots uitzicht over de Nakdong bocht en het dorp.",
      },
    ],
  },
  {
    date: "2026-05-07",
    dayNumber: 10,
    title: "Andong → Busan",
    location: "Andong → Busan",
    emoji: "🌉",
    hotel: hotels.gem_stay,
    activities: [
      {
        id: "sky_capsule",
        name: "Haeundae Sky Capsule",
        type: "sightseeing",
        query: "Haeundae Sky Capsule Busan",
        description:
          "Langzame kleurrijke capsule langs de kust met uitzicht over zee. Route van Mipo naar Cheongsapo langs de Haeundae kustlijn.",
        reservation: true,
        timeSlot: "Voorkeur 12:00–14:00",
        notes: [
          "Start bij Mipo Station",
          "Route: Mipo → Cheongsapo",
          "Reserveren via officiële website",
          "Tijdslot voorkeur 12:00–14:00",
          "Terug via taxi of Beach Train",
        ],
      },
      {
        id: "haeundae_beach",
        name: "Haeundae Beach",
        type: "outdoor",
        query: "Haeundae Beach Busan",
        description: "Het bekendste strand van Korea.",
      },
    ],
    notes: ["Vertrek Andong ~08:00, aankomst Busan ~11:30"],
  },
  {
    date: "2026-05-08",
    dayNumber: 11,
    title: "Busan → Jeonju",
    location: "Busan → Jeonju",
    emoji: "🍚",
    hotel: hotels.best_western_jeonju,
  },
  {
    date: "2026-05-09",
    dayNumber: 12,
    title: "Jeonju Hanok Village",
    location: "Jeonju",
    emoji: "🏮",
    hotel: hotels.best_western_jeonju,
    activities: [
      {
        id: "jeonju_hanok",
        name: "Jeonju Hanok Village",
        type: "sightseeing",
        query: "Jeonju Hanok Village",
        description: "700+ traditionele hanok-huizen, cafés en ateliers.",
      },
      {
        id: "gyeonggijeon",
        name: "Gyeonggijeon Shrine",
        type: "sightseeing",
        query: "Gyeonggijeon Shrine Jeonju",
        description: "Koninklijk portret-heiligdom met bamboepad.",
      },
      {
        id: "jeonju_bibimbap",
        name: "Jeonju Bibimbap",
        type: "food",
        query: "Jeonju Bibimbap restaurant",
        description: "Authentieke bibimbap — de trots van Jeonju.",
      },
    ],
  },
  {
    date: "2026-05-10",
    dayNumber: 13,
    title: "Jeonju → Seoul",
    location: "Jeonju → Seoul",
    emoji: "🏙️",
    hotel: hotels.weco_insadong,
  },
  {
    date: "2026-05-11",
    dayNumber: 14,
    title: "Seoul — Bufferdag",
    location: "Seoul",
    emoji: "🛍️",
    hotel: hotels.weco_insadong,
    transport: [
      {
        id: "car_return",
        type: "car_return",
        title: "Auto inleveren — Seoul Yongsan",
        address: "Seoul Yongsan",
        query: "Seoul Yongsan Car Rental",
        notes: ["Inleveren 17:30"],
      },
    ],
    notes: ["Laatste aankopen", "Auto inleveren 17:30 Yongsan"],
  },
  {
    date: "2026-05-12",
    dayNumber: 15,
    title: "Terugvlucht naar Amsterdam",
    location: "Seoul → Beijing → Amsterdam",
    emoji: "🏠",
    description: "Vroeg vertrek vanuit Incheon, overstap Beijing, aankomst Amsterdam 18:40.",
    transport: [
      {
        id: "flight_CZ0316",
        type: "flight",
        title: "CZ0316 Seoul → Beijing",
        flight: flights.CZ0316,
        notes: ["Vertrek Incheon Terminal 1", "Vroeg aanwezig zijn"],
      },
      {
        id: "flight_CZ0345",
        type: "flight",
        title: "CZ0345 Beijing → Amsterdam",
        flight: flights.CZ0345,
        notes: ["3u50 overstap Beijing Daxing", "Aankomst Amsterdam 18:40"],
      },
    ],
  },
];

export function getDayByDate(date: string): TripDay | undefined {
  return tripDays.find((d) => d.date === date);
}

export function getHotelById(id: string): Hotel | undefined {
  return hotels[id];
}

export const TRIP_START = "2026-04-28";
export const TRIP_END = "2026-05-12";
export const TRIP_TITLE = "Zuid-Korea Rondreis 2026";
export const TRIP_DURATION = "15 dagen";
