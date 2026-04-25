/**
 * navigationState.ts
 *
 * Thin sessionStorage wrapper that remembers where the user was on the
 * homepage before navigating to a day detail page — so the wheel and list
 * can restore to the same position when they come back.
 *
 * sessionStorage is per-tab and survives page navigations within the same
 * session, which is exactly what we need.
 */

export type SourceView = "wheel" | "list";

export interface NavigationState {
  /** ISO date string of the last-visited day card (e.g. "2026-05-02") */
  selectedDate?: string;
  /** Which tab was active when the user left the homepage */
  sourceView?: SourceView;
  /** scrollTop of the list container when the user clicked a list card */
  listScrollY?: number;
  /** activeIndex of the wheel when the user clicked a wheel card */
  wheelActiveIndex?: number;
}

const K = {
  selectedDate:    "trip:selectedDate",
  sourceView:      "trip:sourceView",
  listScrollY:     "trip:listScrollY",
  wheelActiveIndex:"trip:wheelActiveIndex",
} as const;

function ss(): Storage | null {
  if (typeof window === "undefined") return null;
  try { return window.sessionStorage; } catch { return null; }
}

export function saveNavigationState(state: Partial<NavigationState>): void {
  const store = ss();
  if (!store) return;
  if (state.selectedDate    !== undefined) store.setItem(K.selectedDate,     state.selectedDate);
  if (state.sourceView      !== undefined) store.setItem(K.sourceView,       state.sourceView);
  if (state.listScrollY     !== undefined) store.setItem(K.listScrollY,      String(state.listScrollY));
  if (state.wheelActiveIndex !== undefined) store.setItem(K.wheelActiveIndex, String(state.wheelActiveIndex));
}

export function getNavigationState(): NavigationState {
  const store = ss();
  if (!store) return {};
  const raw = {
    selectedDate:     store.getItem(K.selectedDate)    ?? undefined,
    sourceView:       store.getItem(K.sourceView)      ?? undefined,
    listScrollY:      store.getItem(K.listScrollY)     ?? undefined,
    wheelActiveIndex: store.getItem(K.wheelActiveIndex) ?? undefined,
  };
  return {
    selectedDate:     raw.selectedDate,
    sourceView:       raw.sourceView as SourceView | undefined,
    listScrollY:      raw.listScrollY     !== undefined ? Number(raw.listScrollY)     : undefined,
    wheelActiveIndex: raw.wheelActiveIndex !== undefined ? Number(raw.wheelActiveIndex) : undefined,
  };
}

export function clearNavigationState(): void {
  const store = ss();
  if (!store) return;
  Object.values(K).forEach((k) => store.removeItem(k));
}
