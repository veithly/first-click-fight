import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";
import { ProductScreenArena } from "@/components/ProductScreenArena";
import { UsageBeacon } from "@/components/UsageBeacon";
import { getRematchView, getLatestCardSlug } from "@/lib/fights";

export const dynamic = "force-dynamic";

export default async function RematchPage({ params }: { params: Promise<{ fightId: string }> }) {
  const { fightId } = await params;
  const view = await getRematchView(fightId);

  if (!view) {
    return (
      <main className="page" data-visual-lane="ringside-product-lab">
        <TopBar crumb="rematch" />
        <section className="section">
          <div className="panel" data-testid="rematch-missing">
            <h1 className="h-section">No rematch route here.</h1>
            <Link href="/app/new" className="btn btn--ko" style={{ marginTop: 12 }}>
              Start a fight
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const latestCard = await getLatestCardSlug(fightId);
  const changed = view.shipped && view.promotedTargetId !== view.fight.intendedTargetId;

  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar crumb={`rematch ${fightId}`} />
      <UsageBeacon
        event="fcf_rematch_returned"
        fightId={fightId}
        properties={{
          shipped: view.shipped,
          promotedTargetId: view.promotedTargetId,
          rematchChoice: view.fight.rematchChoice,
          beforeLabel: view.beforeLabel,
          afterLabel: view.afterLabel,
        }}
      />

      <section className="section" style={{ marginTop: 8 }}>
        <div className="section-head">
          <p className="eyebrow">Next visitor route</p>
          <h1 className="h-section" data-testid="rematch-heading">
            {view.shipped ? "This is what the next visitor sees." : "Rematch not shipped yet."}
          </h1>
        </div>

        <div className="grid-2">
          <ProductScreenArena
            screen={view.screen}
            mode="rematch"
            promotedTargetId={view.promotedTargetId}
          />

          <div className="stack">
            <div className="route-ribbon" data-testid="rematch-ribbon">
              <span className="route-chip">{view.beforeLabel}</span>
              <span className="arrow">→</span>
              <span className="route-chip route-chip--after" data-testid="rematch-after">
                {view.afterLabel}
              </span>
            </div>
            <div className="panel">
              {view.shipped ? (
                changed ? (
                  <p style={{ margin: 0, fontWeight: 800 }}>
                    The most-clicked target <strong>{view.afterLabel}</strong> is now promoted as the
                    first action, because strangers reached for it before the original CTA.
                  </p>
                ) : (
                  <p style={{ margin: 0, fontWeight: 800 }}>
                    Your intended CTA <strong>{view.afterLabel}</strong> defended its spot, so the
                    route stays the same — now backed by real first-click data.
                  </p>
                )
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  The owner has not shipped a rematch yet. Once they do, this route updates live.
                </p>
              )}
            </div>
            {latestCard && (
              <Link href={`/card/${latestCard}`} className="btn btn--route" data-testid="rematch-open-card">
                Open the KO card
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
