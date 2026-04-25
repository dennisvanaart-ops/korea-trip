export type ImageCandidate = {
  url: string;
  source: string;
  title?: string;
  widthPx?: number;
  heightPx?: number;
};

export type ValidatedCandidate = {
  url: string;
  source: string;
  title?: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  isGeneric: boolean;
  matchesLocation: boolean;
};

export type ImageItemResult = {
  id: string;
  name: string;
  type: "hotel" | "activity" | "transport";
  preferredFilename: string;
  candidates: ValidatedCandidate[];
  /** Index into candidates that is the best pick, or null if none is confident enough */
  recommendedIndex: number | null;
  /** True when no high-confidence candidate was found */
  needsHumanReview: boolean;
};
