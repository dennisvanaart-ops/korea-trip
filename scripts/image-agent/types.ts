export type SourceType =
  | "wikimedia"   // Wikimedia Commons — often CC-licensed
  | "official"    // Direct from venue's own website (og:image)
  | "booking"     // Booking.com / hotel listing
  | "naver"       // Naver Map / Naver Blog
  | "instagram"   // Instagram embed / og:image
  | "google"      // Google Maps / Business photo
  | "blog"        // Travel blog / review site
  | "other";      // Unknown origin

export type ImageCandidate = {
  url: string;
  source: string;
  sourceType: SourceType;
  title?: string;
  widthPx?: number;
  heightPx?: number;
  pageUrl?: string; // page the image was found on (for attribution)
};

export type ValidatedCandidate = {
  url: string;
  source: string;
  sourceType: SourceType;
  title?: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  isGeneric: boolean;
  matchesLocation: boolean;
  /**
   * Guidance on usage rights.
   * Wikimedia CC-licensed images are safe; all others need verification.
   */
  licenseOrUsageNote: string;
};

export type ImageItemResult = {
  id: string;
  name: string;
  type: string;
  preferredFilename: string;
  candidates: ValidatedCandidate[];
  /** Index into candidates that is the best pick, or null if none qualifies */
  recommendedIndex: number | null;
  /** True when no high-confidence candidate was found */
  needsHumanReview: boolean;
};
