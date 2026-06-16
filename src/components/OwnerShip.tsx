"use client";

import { useState } from "react";
import { NavLink as Link } from "@/components/NavLink";
import { trackNovus } from "@/lib/novus";
import type { RematchChoice } from "@/lib/types";

interface ShipResponse {
  rematchUrl: string;
  rematchChoice: RematchChoice;
  learningLine: string;
  error?: string;
}

export function OwnerShip({
  fightId,
  ownerKey,
  alreadyShipped,
  shippedChoice,
}: {
  fightId: string;
  ownerKey: string;
  alreadyShipped: boolean;
  shippedChoice: RematchChoice | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipResponse | null>(null);

  const shipped = alreadyShipped || !!result;
  const choice = result?.rematchChoice ?? shippedChoice;

  async function ship() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/fights/${fightId}/ship-rematch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ownerKey }),
      });
      const data = (await res.json()) as ShipResponse;
      if (!res.ok) throw new Error(data.error ?? "Could not ship rematch");
      trackNovus("fcf_rematch_shipped", { fightId, rematchChoice: data.rematchChoice });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (shipped) {
    return (
      <div className="stack" data-testid="rematch-shipped">
        <span className="state-badge">rematch shipped</span>
        <p style={{ margin: 0, fontWeight: 800 }}>
          Route decision:{" "}
          {choice === "challenger_promoted"
            ? "challenger promoted (the most-clicked target is now first)"
            : "intended defended (your CTA held up)"}
        </p>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <Link href={`/rematch/${fightId}`} className="btn btn--route" data-testid="open-rematch">
            Open the rematch route
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <button
        type="button"
        className="btn btn--ko btn--lg"
        onClick={ship}
        disabled={busy}
        data-testid="ship-rematch"
      >
        {busy ? "Shipping rematch…" : "Ship rematch"}
      </button>
      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
