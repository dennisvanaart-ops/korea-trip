/**
 * Static catalogue of every image the app needs.
 * Each item maps 1-to-1 with a filename in public/images/.
 *
 * searchQueries are ordered best → fallback:
 *   [0] most specific (name + city)
 *   [1] alternative phrasing
 *   [2] broader fallback
 */

export type ItemType = "hotel" | "activity" | "transport";

export type SearchStrategy =
  | "wikimedia"   // landmarks, nature, transport — Wikimedia only
  | "web"         // cafés, restaurants, small hotels — web search + og:image only
  | "both";       // try both (good for hotels, well-known food spots)

export interface TripItem {
  /** Matches the key in image-map.json (without the category prefix) */
  id: string;
  name: string;
  type: ItemType;
  city: string;
  /** Korean or English aliases that must appear in a good image title */
  locationHints: string[];
  searchQueries: string[];
  /** Heuristic: true when a non-branded generic shot is acceptable (e.g. airline) */
  genericOk: boolean;
  /** Controls which search backends are used */
  searchStrategy: SearchStrategy;
}

export const ITEMS: TripItem[] = [
  // ── Hotels ──────────────────────────────────────────────────────────────────
  {
    id: "gracery_seoul",
    name: "Hotel Gracery Seoul",
    type: "hotel",
    city: "Seoul",
    locationHints: ["Gracery", "Myeongdong", "Seoul"],
    searchQueries: [
      "Hotel Gracery Seoul",
      "Gracery Seoul Myeongdong hotel exterior",
      "Myeongdong hotel Seoul street",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "sokcho",
    name: "More Than Hotel Sokcho",
    type: "hotel",
    city: "Sokcho",
    locationHints: ["Sokcho", "속초", "More Than"],
    searchQueries: [
      "More Than Hotel Sokcho beach",
      "속초해변점 속초",
      "Sokcho beachfront hotel Korea",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "jukheon",
    name: "Jukheon Traditional House",
    type: "hotel",
    city: "Andong",
    locationHints: ["Jukheon", "죽헌", "Andong", "hanok"],
    searchQueries: [
      "Jukheon Traditional House Andong",
      "죽헌 고택 안동",
      "Andong hanok guesthouse traditional house",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "gem_stay",
    name: "Gem Stay Seomyeon",
    type: "hotel",
    city: "Busan",
    locationHints: ["Gem Stay", "Seomyeon", "Busan"],
    searchQueries: [
      "Gem Stay Seomyeon Busan",
      "Seomyeon Busan hotel",
      "Busan Seomyeon accommodation",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "best_western_jeonju",
    name: "Best Western Plus Jeonju",
    type: "hotel",
    city: "Jeonju",
    locationHints: ["Best Western", "Jeonju", "전주"],
    searchQueries: [
      "Best Western Plus Jeonju Korea",
      "Jeonju hotel exterior",
      "전주 호텔",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "weco_insadong",
    name: "WECO Stay Insadong",
    type: "hotel",
    city: "Seoul",
    locationHints: ["WECO", "Insadong", "인사동"],
    searchQueries: [
      "WECO Stay Insadong Seoul",
      "Insadong boutique hotel Seoul",
      "인사동 호텔 서울",
    ],
    genericOk: false,
    searchStrategy: "both",
  },

  // ── Activities ───────────────────────────────────────────────────────────────
  {
    id: "onion_anguk",
    name: "Onion Anguk",
    type: "activity",
    city: "Seoul",
    locationHints: ["Onion", "Anguk", "안국"],
    searchQueries: [
      "Onion Anguk cafe Seoul",
      "Onion 안국 카페",
      "Anguk bakery cafe Seoul",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "gyeongbokgung_palace",
    name: "Gyeongbokgung Palace",
    type: "activity",
    city: "Seoul",
    locationHints: ["Gyeongbokgung", "경복궁", "palace", "Seoul"],
    searchQueries: [
      "Gyeongbokgung Palace Seoul",
      "경복궁 서울",
      "Gyeongbokgung main gate Gwanghwamun",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "bukchon_hanok",
    name: "Bukchon Hanok Village",
    type: "activity",
    city: "Seoul",
    locationHints: ["Bukchon", "북촌", "hanok", "Seoul"],
    searchQueries: [
      "Bukchon Hanok Village Seoul",
      "북촌 한옥마을 서울",
      "Bukchon alley traditional houses",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "gwangjang_market",
    name: "Gwangjang Market",
    type: "activity",
    city: "Seoul",
    locationHints: ["Gwangjang", "광장시장", "market", "Seoul"],
    searchQueries: [
      "Gwangjang Market Seoul food",
      "광장시장 서울",
      "Gwangjang traditional market stalls",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "mangwon_market",
    name: "Mangwon Market",
    type: "activity",
    city: "Seoul",
    locationHints: ["Mangwon", "망원시장", "market"],
    searchQueries: [
      "Mangwon Market Seoul",
      "망원시장 서울",
      "Mangwon local market Korea",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "cheonggyecheon",
    name: "Cheonggyecheon Stream",
    type: "activity",
    city: "Seoul",
    locationHints: ["Cheonggyecheon", "청계천", "stream", "Seoul"],
    searchQueries: [
      "Cheonggyecheon stream Seoul",
      "청계천 서울",
      "Cheonggyecheon waterway night",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "ikseon_dong",
    name: "Ikseon-dong Alley",
    type: "activity",
    city: "Seoul",
    locationHints: ["Ikseon", "익선동", "Seoul"],
    searchQueries: [
      "Ikseon-dong Seoul alley",
      "익선동 서울",
      "Ikseon dong traditional alley cafe",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "insadong_street",
    name: "Insadong",
    type: "activity",
    city: "Seoul",
    locationHints: ["Insadong", "인사동", "Seoul"],
    searchQueries: [
      "Insadong street Seoul",
      "인사동 서울 거리",
      "Insadong art shops traditional",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "solsot_restaurant",
    name: "Solsot Restaurant",
    type: "activity",
    city: "Seoul",
    locationHints: ["Solsot", "솔솟", "restaurant"],
    searchQueries: [
      "Solsot restaurant Seoul",
      "솔솟 서울",
      "Korean traditional restaurant interior Seoul",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "center_coffee",
    name: "Center Coffee",
    type: "activity",
    city: "Seoul",
    locationHints: ["Center Coffee", "센터커피", "Seoul"],
    searchQueries: [
      "Center Coffee Seoul cafe",
      "센터커피 서울",
      "Seoul specialty coffee shop minimalist",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "lowkey_coffee",
    name: "Lowkey Coffee",
    type: "activity",
    city: "Seoul",
    locationHints: ["Lowkey", "로우키", "coffee", "Seoul"],
    searchQueries: [
      "Lowkey Coffee Seoul",
      "로우키 커피 서울",
      "Seoul third-wave coffee roastery interior",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "coffee_libre",
    name: "Coffee Libre",
    type: "activity",
    city: "Seoul",
    locationHints: ["Coffee Libre", "커피리브레", "Seoul"],
    searchQueries: [
      "Coffee Libre Seoul",
      "커피리브레 서울",
      "Seoul specialty roastery cafe",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "better_roasting_lab",
    name: "Better Roasting Lab",
    type: "activity",
    city: "Seoul",
    locationHints: ["Better Roasting", "베터로스팅", "Seoul"],
    searchQueries: [
      "Better Roasting Lab Seoul",
      "베터로스팅 서울",
      "Seoul coffee roasting lab",
    ],
    genericOk: false,
    searchStrategy: "web",
  },
  {
    id: "seoraksan_park",
    name: "Seoraksan National Park",
    type: "activity",
    city: "Sokcho",
    locationHints: ["Seoraksan", "설악산", "national park"],
    searchQueries: [
      "Seoraksan National Park Korea",
      "설악산 국립공원",
      "Seoraksan mountain peak autumn",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "seoraksan_cable_car",
    name: "Seoraksan Cable Car",
    type: "activity",
    city: "Sokcho",
    locationHints: ["Seoraksan", "설악산", "cable car", "ropeway"],
    searchQueries: [
      "Seoraksan cable car ropeway",
      "설악산 케이블카",
      "Seoraksan gondola mountain view",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "hahoe_village",
    name: "Hahoe Folk Village",
    type: "activity",
    city: "Andong",
    locationHints: ["Hahoe", "하회마을", "Andong", "folk village"],
    searchQueries: [
      "Hahoe Folk Village Andong Korea",
      "하회마을 안동",
      "Andong UNESCO folk village",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "sky_capsule_busan",
    name: "Sky Capsule Haeundae",
    type: "activity",
    city: "Busan",
    locationHints: ["Sky Capsule", "스카이캡슐", "Haeundae", "Busan"],
    searchQueries: [
      "Sky Capsule Haeundae Busan",
      "스카이캡슐 해운대 부산",
      "Haeundae sky capsule pink train coastal",
    ],
    genericOk: false,
    searchStrategy: "both",
  },
  {
    id: "haeundae_beach",
    name: "Haeundae Beach",
    type: "activity",
    city: "Busan",
    locationHints: ["Haeundae", "해운대", "beach", "Busan"],
    searchQueries: [
      "Haeundae Beach Busan Korea",
      "해운대 해수욕장 부산",
      "Haeundae beach skyline",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "jeonju_hanok",
    name: "Jeonju Hanok Village",
    type: "activity",
    city: "Jeonju",
    locationHints: ["Jeonju", "전주", "hanok", "village"],
    searchQueries: [
      "Jeonju Hanok Village Korea",
      "전주 한옥마을",
      "Jeonju traditional village rooftops",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "gyeonggijeon_shrine",
    name: "Gyeonggijeon Shrine",
    type: "activity",
    city: "Jeonju",
    locationHints: ["Gyeonggijeon", "경기전", "Jeonju", "shrine"],
    searchQueries: [
      "Gyeonggijeon shrine Jeonju",
      "경기전 전주",
      "Jeonju royal portrait shrine",
    ],
    genericOk: false,
    searchStrategy: "wikimedia",
  },
  {
    id: "jeonju_bibimbap",
    name: "Jeonju Bibimbap",
    type: "activity",
    city: "Jeonju",
    locationHints: ["bibimbap", "비빔밥", "Jeonju", "전주"],
    searchQueries: [
      "Jeonju bibimbap dish",
      "전주비빔밥",
      "bibimbap stone bowl Korean food Jeonju",
    ],
    genericOk: true,
    searchStrategy: "wikimedia", // food dish — a good generic shot is acceptable
  },

  // ── Transport ────────────────────────────────────────────────────────────────
  {
    id: "china_southern",
    name: "China Southern Airlines",
    type: "transport",
    city: "Beijing",
    locationHints: ["China Southern", "CZ", "南方航空"],
    searchQueries: [
      "China Southern Airlines Boeing 787",
      "China Southern aircraft livery CZ",
      "南方航空 飞机",
    ],
    genericOk: true,
    searchStrategy: "wikimedia", // any CZ-liveried plane is fine
  },
  {
    id: "airport_transfer",
    name: "Incheon International Airport",
    type: "transport",
    city: "Seoul",
    locationHints: ["Incheon", "ICN", "인천공항", "airport"],
    searchQueries: [
      "Incheon International Airport interior",
      "인천국제공항",
      "Incheon airport departure hall",
    ],
    genericOk: true,
    searchStrategy: "wikimedia",
  },
  {
    id: "kia_k3",
    name: "Kia K3",
    type: "transport",
    city: "Korea",
    locationHints: ["Kia", "K3", "기아"],
    searchQueries: [
      "Kia K3 sedan white",
      "Kia K3 YD exterior",
      "Kia Cerato K3 Korea",
    ],
    genericOk: true,
    searchStrategy: "wikimedia",
  },
];

/** Map from item id → preferred filename in public/images/ */
export function preferredFilename(item: TripItem): string {
  const slug = item.id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const prefix = item.type === "hotel"
    ? "hotel_"
    : item.type === "activity"
    ? "activity_"
    : "transport_";
  return `${prefix}${slug}.jpg`;
}
