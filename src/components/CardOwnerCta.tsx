"use client";

import { useEffect, useState } from "react";
import { NavLink as Link } from "@/components/NavLink";

export function CardOwnerCta({ fightId, cardSlug }: { fightId: string; cardSlug: string }) {
  const [ownerKey, setOwnerKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      setOwnerKey(localStorage.getItem(`fcf_owner_${fightId}`));
    } catch {
      setOwnerKey(null);
    }
  }, [fightId]);

  if (!ownerKey) return null;

  return (
    <Link
      href={`/card/${cardSlug}/owner?k=${encodeURIComponent(ownerKey)}`}
      className="btn btn--ko"
      data-testid="owner-cta"
    >
      You own this — ship the rematch
    </Link>
  );
}
