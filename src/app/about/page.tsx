import type { Metadata } from "next";
import { NavLink as Link } from "@/components/NavLink";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "How it works · First-Click Fight",
  description:
    "First-Click Fight turns a stranger's very first click into a scored Clarity KO Card and a 30-second rematch, with a usage-learning log you can inspect.",
};

export default function AboutPage() {
  return (
    <main className="page" data-visual-lane="ringside-product-lab">
      <TopBar crumb="how it works" />

      <section className="section">
        <p className="eyebrow">How First-Click Fight works</p>
        <h1 className="h-section" style={{ maxWidth: "18ch", marginTop: 8 }}>
          One stranger&apos;s first click, scored and shipped.
        </h1>
        <p className="lede" style={{ marginTop: 16, maxWidth: "62ch" }}>
          You think your call-to-action is obvious. The only honest test is where a fresh
          visitor actually clicks first. First-Click Fight captures that single click, scores it
          against the action you intended, and turns it into a card you can replay and a rematch
          route the next visitor sees.
        </p>
      </section>

      <section className="how-strip" data-how-it-works>
        <div>
          <span className="step-num">1</span>
          <strong>Mark the expected CTA</strong>
          <p>Pick a seeded product screen and mark the first action you expect strangers to take.</p>
        </div>
        <div>
          <span className="step-num">2</span>
          <strong>A stranger clicks first</strong>
          <p>Their very first official click is saved to a database and scored into a Clarity KO Card.</p>
        </div>
        <div>
          <span className="step-num">3</span>
          <strong>Ship the rematch</strong>
          <p>The usage log promotes a clearer route, and the next visitor sees the updated screen.</p>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div className="panel">
            <h2 className="h-section" style={{ fontSize: 22 }}>
              What changes in real state
            </h2>
            <ul style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              <li>A fight row records the screen and the CTA you intended.</li>
              <li>The stranger&apos;s first click is stored with its coordinates and verdict.</li>
              <li>A Clarity KO Card is minted with a shareable slug.</li>
              <li>Every step appends a usage event that drives the rematch decision.</li>
            </ul>
          </div>
          <div className="panel panel--paper">
            <h2 className="h-section" style={{ fontSize: 22 }}>
              What you can inspect
            </h2>
            <p style={{ marginTop: 12 }}>
              The decision is not a black box. Open the live usage-learning log for any fight and
              read the exact tallies and recommendation:
            </p>
            <pre className="code-line" style={{ marginTop: 12 }}>
              GET /api/usage?fightId=&lt;id&gt;
            </pre>
            <p className="learning-line" style={{ marginTop: 16 }}>
              The same log is what a usage-analytics partner like Novus reads to learn what to ship
              next.
            </p>
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 28 }}>
          <Link href="/app/new" className="btn btn--ko btn--lg" data-cta-primary>
            Start a fight
          </Link>
          <Link href="/" className="btn btn--route">
            Back home
          </Link>
        </div>
      </section>

      <footer className="foot">
        <span>First-Click Fight · World Product Day: Everyone Ships Now</span>
        <span className="mono">scores first clicks · ships rematches</span>
      </footer>
    </main>
  );
}
