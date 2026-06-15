import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * App-wide link wrapper with prefetch disabled. Links still resolve instantly
 * on click; we just skip speculative RSC prefetches, which keeps navigation
 * deterministic and avoids a burst of aborted background requests on fast
 * navigation. Pass `prefetch` explicitly to opt back in per link.
 */
export function NavLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />;
}
