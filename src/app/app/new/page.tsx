import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { BuilderMarkScreen } from "@/components/BuilderMarkScreen";
import { SEED_SCREENS } from "@/lib/screens";

export const metadata: Metadata = {
  title: "Mark your CTA · First-Click Fight",
};

export default function NewFightPage() {
  return (
    <main
      className="page"
      data-visual-lane="ringside-product-lab"
      data-hero-composition="product-ring-ko-card-route-ribbon"
    >
      <TopBar crumb="new fight" />
      <section className="section" style={{ marginTop: 8 }}>
        <div className="section-head">
          <p className="eyebrow">Builder setup</p>
          <h1 className="h-section">Mark the first action you expect.</h1>
        </div>
        <BuilderMarkScreen screens={SEED_SCREENS} />
      </section>
    </main>
  );
}
