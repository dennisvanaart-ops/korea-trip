/**
 * Central helper for building navigation links to external map apps.
 *
 * Priority order for the query term:
 *   1. lat/lng coordinates (most precise — used for Waze + coords-aware URLs)
 *   2. address string
 *   3. query string (search term)
 *   4. bare name as fallback
 */

export interface NavLinkInput {
  /** Display name shown in the modal title */
  name: string;
  /** Free-text search query (e.g. "Hahoe Folk Village Andong") */
  query?: string;
  /** Street address */
  address?: string;
  /** Latitude — enables Waze and coordinate-based links */
  lat?: number;
  /** Longitude — enables Waze and coordinate-based links */
  lng?: number;
  /** Override Naver Maps URL */
  naverUrl?: string;
  /** Override KakaoMap URL */
  kakaoUrl?: string;
}

export interface NavLinks {
  google: string;
  apple: string;
  /** null when no coordinates are available */
  waze: string | null;
  naver: string;
  kakao: string;
}

export function buildNavLinks(input: NavLinkInput): NavLinks {
  const { name, query, address, lat, lng, naverUrl, kakaoUrl } = input;

  // Best available text for search-based URLs
  const searchTerm = (query?.trim() || address?.trim() || name).trim();
  const enc = (s: string) => encodeURIComponent(s);

  // ── Google Maps ──────────────────────────────────────────────────────────────
  let google: string;
  if (lat !== undefined && lng !== undefined) {
    google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else if (address?.trim()) {
    google = `https://www.google.com/maps/search/?api=1&query=${enc(address.trim())}`;
  } else {
    google = `https://www.google.com/maps/search/?api=1&query=${enc(searchTerm)}`;
  }

  // ── Apple Maps ───────────────────────────────────────────────────────────────
  let apple: string;
  if (lat !== undefined && lng !== undefined) {
    apple = `https://maps.apple.com/?ll=${lat},${lng}&q=${enc(name)}`;
  } else if (address?.trim()) {
    apple = `https://maps.apple.com/?address=${enc(address.trim())}&q=${enc(name)}`;
  } else {
    apple = `https://maps.apple.com/?q=${enc(searchTerm)}`;
  }

  // ── Waze (requires coordinates) ───────────────────────────────────────────
  const waze =
    lat !== undefined && lng !== undefined
      ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      : null;

  // ── Naver Maps ───────────────────────────────────────────────────────────────
  const naver = naverUrl ?? `https://map.naver.com/v5/search/${enc(searchTerm)}`;

  // ── KakaoMap ─────────────────────────────────────────────────────────────────
  const kakao = kakaoUrl ?? `https://map.kakao.com/?q=${enc(searchTerm)}`;

  return { google, apple, waze, naver, kakao };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface NavLinkValidationResult {
  passed: boolean;
  results: Array<{ label: string; passed: boolean; detail: string }>;
}

export function validateNavLinks(): NavLinkValidationResult {
  const cases: Array<{
    label: string;
    input: NavLinkInput;
    checks: Array<{ key: keyof NavLinks; expect: string | null | ((v: string | null) => boolean) }>;
  }> = [
    {
      label: "Google Maps with coordinates",
      input: { name: "Gyeongbokgung", lat: 37.5796, lng: 126.977 },
      checks: [
        { key: "google", expect: (v) => v?.includes("37.5796") ?? false },
        { key: "waze", expect: (v) => v?.includes("37.5796") ?? false },
        { key: "apple", expect: (v) => v?.includes("37.5796") ?? false },
      ],
    },
    {
      label: "Google Maps with address",
      input: { name: "Hotel Gracery", address: "12 Sejong-daero 12-gil, Jung-gu, Seoul" },
      checks: [
        { key: "google", expect: (v) => v?.includes("Sejong") ?? false },
        { key: "waze", expect: null },
      ],
    },
    {
      label: "Google Maps with query only",
      input: { name: "Onion Anguk", query: "Onion Anguk Seoul" },
      checks: [
        { key: "google", expect: (v) => v?.includes("Onion+Anguk+Seoul") ?? false },
        { key: "waze", expect: null },
      ],
    },
    {
      label: "Naver override URL is respected",
      input: { name: "Test", query: "test", naverUrl: "https://map.naver.com/v5/custom" },
      checks: [
        { key: "naver", expect: "https://map.naver.com/v5/custom" },
      ],
    },
    {
      label: "Waze is null without coordinates",
      input: { name: "Test", query: "test" },
      checks: [{ key: "waze", expect: null }],
    },
  ];

  const results = cases.flatMap(({ label, input, checks }) => {
    const links = buildNavLinks(input);
    return checks.map(({ key, expect }) => {
      const actual = links[key] as string | null;
      let passed: boolean;
      if (typeof expect === "function") {
        passed = expect(actual);
      } else {
        passed = actual === expect;
      }
      return {
        label: `${label} — ${key}`,
        passed,
        detail: passed ? String(actual) : `expected ${String(expect)}, got ${String(actual)}`,
      };
    });
  });

  return { passed: results.every((r) => r.passed), results };
}
