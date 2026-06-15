"use client";

import { useEffect, useRef, useState } from "react";
import { NavLink as Link } from "@/components/NavLink";
import { SegmentedControl } from "@mantine/core";
import { ProductScreenArena } from "@/components/ProductScreenArena";
import { SharePanel } from "@/components/SharePanel";
import type { ProductScreen } from "@/lib/types";

interface CreatedFight {
  fightId: string;
  ownerKey: string;
  fightUrl: string;
}

interface FightStatus {
  status: string;
  latestCardSlug: string | null;
  totalOfficialClicks: number;
  learningLine: string;
}

export function BuilderMarkScreen({ screens }: { screens: ProductScreen[] }) {
  const [screenId, setScreenId] = useState(screens[0]?.id ?? "");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedFight | null>(null);
  const [status, setStatus] = useState<FightStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const screen = screens.find((s) => s.id === screenId) ?? screens[0];
  const intendedLabel = screen?.targets.find((t) => t.id === targetId)?.label;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!created) return;
    async function poll() {
      try {
        const res = await fetch(`/api/fights/${created!.fightId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as FightStatus;
        setStatus(data);
        if (data.status !== "live" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        /* transient */
      }
    }
    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [created]);

  async function createFight() {
    if (!targetId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ screenId, intendedTargetId: targetId }),
      });
      const data = (await res.json()) as CreatedFight & { error?: string };
      if (!res.ok || !data.fightId) throw new Error(data.error ?? "Could not create fight");
      try {
        localStorage.setItem(`fcf_owner_${data.fightId}`, data.ownerKey);
      } catch {
        /* storage blocked */
      }
      setCreated({ fightId: data.fightId, ownerKey: data.ownerKey, fightUrl: data.fightUrl });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    const scored = status && status.status !== "live";
    const ownerUrl = status?.latestCardSlug
      ? `/card/${status.latestCardSlug}/owner?k=${created.ownerKey}`
      : null;
    return (
      <div className="stack" data-testid="fight-created">
        <div className="panel">
          <span className="state-badge" style={{ background: "var(--brand-primary-hex)" }}>
            fight live
          </span>
          <h2 className="h-section" style={{ marginTop: 12 }}>
            Fight ready. Send it to a stranger.
          </h2>
          <p className="muted" style={{ marginTop: 8 }}>
            You marked <strong>{intendedLabel}</strong> on {screen?.name}. The first official
            click from a fresh visitor will be scored against it.
          </p>
        </div>

        <div className="panel panel--paper">
          <SharePanel url={created.fightUrl} />
          <div className="btn-row">
            <Link href={`/fight/${created.fightId}`} className="btn btn--route" data-testid="open-as-judge">
              Open fight as judge
            </Link>
          </div>
        </div>

        <div className="panel" data-testid="owner-status" aria-live="polite">
          {!scored ? (
            <>
              <strong style={{ fontSize: 18 }}>Waiting for the first click…</strong>
              <p className="muted" style={{ marginTop: 6 }}>
                Open the link in another browser or scan the QR on your phone. This updates live.
              </p>
            </>
          ) : (
            <>
              <span className="state-badge">first click landed</span>
              <p className="learning-line" style={{ marginTop: 12 }}>
                {status?.learningLine}
              </p>
              {ownerUrl && (
                <div className="btn-row">
                  <Link href={ownerUrl} className="btn btn--ko" data-testid="open-owner-controls">
                    Inspect result &amp; ship rematch
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-2">
      <div>
        <div
          className="panel panel--paper"
          style={{ marginBottom: 16 }}
          data-onboarding-example
        >
          <strong style={{ fontSize: 16 }}>1 · Pick a screen</strong>
          <div style={{ marginTop: 12 }}>
            <SegmentedControl
              value={screenId}
              onChange={(v) => {
                setScreenId(v);
                setTargetId(null);
              }}
              data={screens.map((s) => ({ label: s.name, value: s.id }))}
              fullWidth
              data-testid="screen-picker"
            />
          </div>
          <strong style={{ fontSize: 16, display: "block", marginTop: 18 }}>
            2 · Click the CTA you expect strangers to hit first
          </strong>
          {targetId ? (
            <p className="muted" style={{ marginTop: 8 }}>
              Intended first action: <strong>{intendedLabel}</strong>
            </p>
          ) : (
            <p className="muted" data-empty-state style={{ marginTop: 8 }}>
              Choose the CTA you expect first to enable the fight.
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn--ko btn--lg"
          disabled={!targetId || busy}
          onClick={createFight}
          data-testid="builder-create-fight"
          data-cta-primary
        >
          {busy ? "Creating fight…" : "Create fight"}
        </button>
        {error && (
          <p className="notice notice--error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>

      <div>
        <ProductScreenArena
          screen={screen}
          mode="mark"
          selectedTargetId={targetId}
          onSelectTarget={setTargetId}
        />
      </div>
    </div>
  );
}
