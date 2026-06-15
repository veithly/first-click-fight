"use client";

import { useEffect, useRef } from "react";
import type { UsageEventName } from "@/lib/types";

export function UsageBeacon({
  event,
  fightId,
  cardSlug,
}: {
  event: Extract<UsageEventName, "fcf_result_inspected" | "fcf_rematch_returned">;
  fightId: string;
  cardSlug?: string;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/usage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, fightId, cardSlug }),
      keepalive: true,
    }).catch(() => {});
  }, [event, fightId, cardSlug]);
  return null;
}
