import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";
import { OwnerShip } from "@/components/OwnerShip";
import { getCardView, buildUsageSummary, verifyOwnerKeyForFight } from "@/lib/fights";

export const dynamic = "force-dynamic";

export default async function OwnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ cardSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { cardSlug } = await params;
  const sp = await searchParams;
  const ownerKey = typeof sp.k === "string" ? sp.k : "";
  const view = await getCardView(cardSlug);

  const valid = view && ownerKey ? await verifyOwnerKeyForFight(view.fight.id, ownerKey) : false;

  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar crumb="owner controls" />
      <section className="section" style={{ marginTop: 8 }}>
        {!view ? (
          <div className="panel" data-testid="owner-missing">
            <h1 className="h-section">Card not found.</h1>
            <Link href="/app/new" className="btn btn--ko" style={{ marginTop: 12 }}>
              Start a fight
            </Link>
          </div>
        ) : !valid ? (
          <div className="panel notice--error" data-testid="owner-locked">
            <span className="state-badge" style={{ background: "var(--brand-accent-hex)" }}>
              owner key required
            </span>
            <h1 className="h-section" style={{ marginTop: 12 }}>
              Only the builder can ship the rematch.
            </h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Open this from the builder screen where you created the fight, or use the owner link
              with its <span className="mono">?k=</span> key.
            </p>
            <Link href={`/card/${cardSlug}`} className="btn" style={{ marginTop: 12 }}>
              View the public card
            </Link>
          </div>
        ) : (
          <OwnerPanel cardSlug={cardSlug} fightId={view.fight.id} ownerKey={ownerKey} />
        )}
      </section>
    </main>
  );
}

async function OwnerPanel({
  cardSlug,
  fightId,
  ownerKey,
}: {
  cardSlug: string;
  fightId: string;
  ownerKey: string;
}) {
  const summary = await buildUsageSummary(fightId);
  const { getFight } = await import("@/lib/fights");
  const fight = await getFight(fightId);
  const maxCount = Math.max(1, ...summary.tallies.map((t) => t.count));

  return (
    <div className="grid-2">
      <div className="stack">
        <div className="panel">
          <p className="eyebrow">Learning from usage</p>
          <h1 className="h-section">What the first clicks told you.</h1>
          <p className="learning-line" style={{ marginTop: 14 }} data-testid="owner-learning">
            {summary.learningLine}
          </p>
          <p className="muted" style={{ marginTop: 10 }}>
            Recommendation:{" "}
            <strong>
              {summary.recommendation === "challenger_promoted"
                ? `promote "${summary.winnerLabel}"`
                : "keep your intended CTA"}
            </strong>
          </p>
        </div>

        <div className="panel panel--paper">
          <strong style={{ fontSize: 16 }}>First-click tally</strong>
          <table className="usage-table" style={{ marginTop: 12 }} data-testid="usage-tally">
            <thead>
              <tr>
                <th>Target</th>
                <th>Clicks</th>
                <th style={{ width: "40%" }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {summary.tallies.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No clicks yet.
                  </td>
                </tr>
              )}
              {summary.tallies.map((t) => (
                <tr key={t.targetId ?? "empty"}>
                  <td>
                    {t.label}
                    {t.isIntended && <span className="mono muted"> (intended)</span>}
                  </td>
                  <td>{t.count}</td>
                  <td>
                    <span
                      className={`tally-bar ${t.isIntended ? "tally-bar--intended" : ""}`}
                      style={{ display: "block", width: `${(t.count / maxCount) * 100}%` }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2 className="h-section" style={{ fontSize: 24 }}>
          Ship the rematch route
        </h2>
        <p className="muted" style={{ margin: "10px 0 18px" }}>
          Shipping updates the live <span className="mono">/rematch/{fightId}</span> route the next
          visitor sees.
        </p>
        <OwnerShip
          fightId={fightId}
          ownerKey={ownerKey}
          alreadyShipped={fight?.status === "rematch_shipped"}
          shippedChoice={fight?.rematchChoice ?? null}
        />
        <p style={{ marginTop: 18 }}>
          <Link href={`/card/${cardSlug}`} className="mono">
            ← back to public card
          </Link>
        </p>
      </div>
    </div>
  );
}
