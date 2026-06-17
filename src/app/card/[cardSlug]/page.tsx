import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";
import { ProductScreenArena } from "@/components/ProductScreenArena";
import { ReplayStamp } from "@/components/ReplayStamp";
import { UsageBeacon } from "@/components/UsageBeacon";
import { CardOwnerCta } from "@/components/CardOwnerCta";
import { SharePanel } from "@/components/SharePanel";
import { getCardView, buildUsageSummary, baseUrl } from "@/lib/fights";
import { targetLabel } from "@/lib/screens";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: Promise<{ cardSlug: string }> }) {
  const { cardSlug } = await params;
  const view = await getCardView(cardSlug);

  if (!view) {
    return (
      <main className="page" data-visual-lane="ringside-product-lab">
        <TopBar crumb="card" />
        <section className="section">
          <div className="panel" data-testid="card-missing">
            <span className="state-badge" style={{ background: "var(--brand-accent-hex)" }}>
              card not found
            </span>
            <h1 className="h-section" style={{ marginTop: 12 }}>
              No card at that link.
            </h1>
            <Link href="/app/new" className="btn btn--ko" style={{ marginTop: 14 }}>
              Start a fight
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { card, fight, click, screen } = view;
  const summary = await buildUsageSummary(fight.id);
  const intendedLabel = targetLabel(screen, card.intendedTargetId);
  const actualLabel = targetLabel(screen, card.actualTargetId);
  const shipped = fight.status === "rematch_shipped";
  const afterLabel = shipped ? targetLabel(screen, fight.challengerTargetId) : intendedLabel;
  const base = await baseUrl();
  const ko = card.result === "CTA_KNOCKED_OUT";

  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar crumb={`card ${cardSlug}`} />
      <UsageBeacon
        event="fcf_result_inspected"
        fightId={fight.id}
        cardSlug={cardSlug}
        properties={{ result: card.result, screenId: screen.id, screenName: screen.name }}
      />

      <section className="section" style={{ marginTop: 8 }}>
        <div className="grid-2">
          <div className="stack">
            <ProductScreenArena
              screen={screen}
              mode="result"
              intendedTargetId={card.intendedTargetId}
              actualTargetId={card.actualTargetId}
              clickPoint={click ? { nx: click.nx, ny: click.ny } : null}
            />
            <div className="route-ribbon" data-testid="route-ribbon">
              <span className="route-chip">{intendedLabel}</span>
              <span className="arrow">{shipped ? "→ rematch →" : "→ pending →"}</span>
              <span className={`route-chip ${shipped ? "route-chip--after" : ""}`}>{afterLabel}</span>
            </div>
            <p className="learning-line" data-testid="learning-line">
              {summary.learningLine}
            </p>
          </div>

          <div className="ko-card" data-testid="clarity-ko-card">
            <div className="card-head">
              <span className="card-slug">card {card.slug}</span>
              <span className="state-badge">saved</span>
            </div>
            <ReplayStamp result={card.result} fightId={fight.id} cardSlug={cardSlug} />
            <dl className="card-dl" style={{ marginTop: 18 }}>
              <div>
                <dt>Screen</dt>
                <dd>{screen.name}</dd>
              </div>
              <div>
                <dt>Intended CTA</dt>
                <dd>{intendedLabel}</dd>
              </div>
              <div>
                <dt>First click</dt>
                <dd style={{ color: ko ? "var(--brand-accent-hex)" : "var(--brand-success)" }}>
                  {actualLabel}
                </dd>
              </div>
              <div>
                <dt>First clicks so far</dt>
                <dd>{summary.totalOfficialClicks}</dd>
              </div>
            </dl>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <CardOwnerCta fightId={fight.id} cardSlug={cardSlug} />
              {shipped && (
                <Link href={`/rematch/${fight.id}`} className="btn btn--route" data-testid="open-rematch">
                  See the rematch route
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="panel panel--paper section">
          <SharePanel
            url={`${base}/card/${cardSlug}`}
            label="Share this card"
            hint="Send the result to a teammate, or post it with an honest caption."
            fightId={fight.id}
            cardSlug={cardSlug}
            shareContext="card"
          />
        </div>
      </section>
    </main>
  );
}
