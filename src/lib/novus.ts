import type { UsageEventName } from "@/lib/types";

type PendoLike = {
  track?: (event: string, properties?: Record<string, unknown>) => void;
};

/**
 * Mirror a first-party usage event into Novus by Pendo via the Pendo Web SDK
 * (pendo.track). It is a safe no-op until the SDK is loaded by NovusScript,
 * which only happens when NEXT_PUBLIC_NOVUS_APP_ID is set. The same semantic
 * events drive the first-party D1 usage_events loop, so the rematch decision is
 * inspectable both in GET /api/usage and in the Novus dashboard.
 */
export function trackNovus(event: UsageEventName, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const pendo = (window as unknown as { pendo?: PendoLike }).pendo;
  try {
    pendo?.track?.(event, properties ?? {});
  } catch {
    /* analytics must never break the product */
  }
}
