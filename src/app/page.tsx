import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";
import { ProductScreenArena } from "@/components/ProductScreenArena";
import { TryDemoButton } from "@/components/TryDemoButton";
import { SEED_SCREENS } from "@/lib/screens";

export default function HomePage() {
  const demoScreen = SEED_SCREENS[0];

  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">First-run clarity in one click</p>
          <h1 className="h-hero" data-hero-text>
            Score first clicks, ship a 30-second rematch.
          </h1>
          <p className="lede">
            Mark the CTA you expect. A stranger clicks where they would start. The card scores
            it against your intention and ships the next visitor a clearer route.
          </p>
          <div className="btn-row">
            <Link href="/app/new" className="btn btn--ko btn--lg" data-cta-primary>
              Start a fight
            </Link>
            <TryDemoButton />
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
            No login. Your click changes real saved state and a live route.
          </p>
        </div>

        <div className="hero-arena">
          <ProductScreenArena screen={demoScreen} mode="preview" intendedTargetId="t_start" />
        </div>
      </section>

      <section className="how-strip" id="how" data-how-it-works>
        <div>
          <span className="step-num">1</span>
          <strong>Mark expected CTA</strong>
          <p>Pick a seeded screen and mark the first action you expect.</p>
        </div>
        <div>
          <span className="step-num">2</span>
          <strong>A stranger clicks first</strong>
          <p>Their first official click is saved and scored into a KO card.</p>
        </div>
        <div>
          <span className="step-num">3</span>
          <strong>Ship the rematch</strong>
          <p>Usage promotes a clearer route for the next visitor to see.</p>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div className="panel">
            <h2 className="h-section">Why a fight, not a survey?</h2>
            <p className="lede" style={{ marginTop: 12 }}>
              Friends over-explain your screen. Analytics arrive after launch. First-Click
              Fight captures a fresh stranger&apos;s very first click, turns it into a card you
              can reopen, and changes what the next visitor sees.
            </p>
            <p className="learning-line" style={{ marginTop: 16 }}>
              &quot;I thought the CTA was obvious until strangers knocked it out.&quot;
            </p>
          </div>
          <div className="panel panel--paper">
            <h3 className="h-section" style={{ fontSize: 22 }}>
              What you can inspect
            </h3>
            <ul style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              <li>A replayable Clarity KO Card with the exact click.</li>
              <li>The rematch route in a second browser or phone.</li>
              <li>The usage-learning log that drives the decision.</li>
            </ul>
            <Link
              href="/app/new"
              className="btn btn--route"
              style={{ marginTop: 18 }}
              data-next-step-cta
            >
              Mark your screen
            </Link>
          </div>
        </div>
      </section>

      <footer className="foot">
        <span>First-Click Fight · World Product Day: Everyone Ships Now</span>
        <span className="mono">scores first clicks · ships rematches</span>
      </footer>
    </main>
  );
}
