import type { CardResult, ProductScreen, ScreenTarget } from "./types";

export interface HitResult {
  target: ScreenTarget | null;
}

/** Hit-tests a normalized click (0..100) against the screen's target boxes. */
export function hitTest(screen: ProductScreen, nx: number, ny: number): HitResult {
  const candidates = screen.targets.filter(
    (t) => Math.abs(nx - t.x) <= t.w / 2 && Math.abs(ny - t.y) <= t.h / 2,
  );
  if (candidates.length === 0) return { target: null };
  // If a click lands inside overlapping boxes, choose the nearest center.
  candidates.sort((a, b) => dist2(nx, ny, a) - dist2(nx, ny, b));
  return { target: candidates[0] };
}

function dist2(nx: number, ny: number, t: ScreenTarget): number {
  return (nx - t.x) ** 2 + (ny - t.y) ** 2;
}

export function scoreResult(intendedTargetId: string, actualTargetId: string | null): CardResult {
  return actualTargetId === intendedTargetId ? "CTA_DEFENDED" : "CTA_KNOCKED_OUT";
}

export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
