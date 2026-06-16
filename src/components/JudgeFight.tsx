"use client";

import { useState } from "react";
import { ProductScreenArena } from "@/components/ProductScreenArena";
import { trackNovus } from "@/lib/novus";
import type { ProductScreen } from "@/lib/types";

export function JudgeFight({
  fightId,
  screen,
  src,
}: {
  fightId: string;
  screen: ProductScreen;
  src: "desktop" | "qr";
}) {
  const [point, setPoint] = useState<{ nx: number; ny: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPlayClick(nx: number, ny: number) {
    if (busy) return;
    setPoint({ nx, ny });
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/fights/${fightId}/clicks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nx, ny, src }),
      });
      const data = (await res.json()) as { cardSlug?: string; error?: string };
      if (!res.ok || !data.cardSlug) throw new Error(data.error ?? "Could not score click");
      trackNovus("fcf_first_action_clicked", { fightId, cardSlug: data.cardSlug, src });
      // Hard navigation to the result card: it is a shareable destination, so a
      // fresh server render guarantees correct click counts and avoids leaving a
      // soft-navigation RSC stream open behind the reveal.
      window.location.assign(`/card/${data.cardSlug}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      setPoint(null);
    }
  }

  return (
    <div className="stack">
      <div className="panel" style={{ textAlign: "center" }}>
        <p className="eyebrow" style={{ color: "var(--brand-accent-hex)" }}>
          Round 1
        </p>
        <h1 className="h-section" data-testid="judge-prompt">
          Where would you click first?
        </h1>
        <p className="muted" style={{ marginTop: 6 }}>
          One click. No wrong answer. Your first move is the data.
        </p>
      </div>

      <ProductScreenArena
        screen={screen}
        mode="play"
        clickPoint={point}
        busy={busy}
        onPlayClick={onPlayClick}
      />

      <div aria-live="polite" style={{ minHeight: 28 }}>
        {busy && (
          <p className="notice" data-testid="scoring">
            Scoring first click…
          </p>
        )}
        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
