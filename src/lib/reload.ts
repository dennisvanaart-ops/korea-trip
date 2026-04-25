/**
 * Robust page reload that works in iOS standalone (PWA) mode.
 * router.refresh() is unreliable in standalone/homescreen mode — always
 * use window.location.reload() for guaranteed fresh state.
 */
export function hardReload(): void {
  if (typeof window === "undefined") return;
  window.location.reload();
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}
