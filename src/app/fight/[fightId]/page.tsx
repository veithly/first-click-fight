import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";
import { JudgeFight } from "@/components/JudgeFight";
import { TryDemoButton } from "@/components/TryDemoButton";
import { getFightWithScreen } from "@/lib/fights";

export const dynamic = "force-dynamic";

export default async function FightPage({
  params,
  searchParams,
}: {
  params: Promise<{ fightId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { fightId } = await params;
  const sp = await searchParams;
  const src = sp.src === "qr" ? "qr" : "desktop";
  const data = await getFightWithScreen(fightId);

  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar crumb={`fight ${fightId}`} />
      <section className="section" style={{ marginTop: 8 }}>
        {data ? (
          <JudgeFight fightId={fightId} screen={data.screen} src={src} />
        ) : (
          <div className="panel" data-testid="fight-missing">
            <span className="state-badge" style={{ background: "var(--brand-accent-hex)" }}>
              fight not found
            </span>
            <h1 className="h-section" style={{ marginTop: 12 }}>
              That fight link is empty or expired.
            </h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Start a fresh fight, or try a seeded live demo.
            </p>
            <div className="btn-row">
              <Link href="/app/new" className="btn btn--ko">
                Start a fight
              </Link>
              <TryDemoButton className="btn" children="Try a live demo" />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
