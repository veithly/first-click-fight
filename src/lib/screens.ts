import type { ProductScreen } from "./types";
import { getDb } from "./db";

/**
 * Seeded product screens. These are the "rings" a builder marks and a stranger
 * clicks. Targets are positioned as percentages of the screen so the same
 * geometry drives both client rendering and server-side hit-testing.
 */
export const SEED_SCREENS: ProductScreen[] = [
  {
    id: "saas-landing",
    name: "SaaS landing page",
    kind: "landing",
    width: 1280,
    height: 800,
    eyebrow: "Shipfast",
    headline: "Ship your product in a weekend, not a quarter.",
    subcopy: "The AI build stack to launch fast.",
    targets: [
      { id: "t_start", label: "Start free trial", x: 31, y: 60, w: 26, h: 11, kind: "cta" },
      { id: "t_demo", label: "Watch 2-min demo", x: 64, y: 60, w: 26, h: 11, kind: "secondary" },
      { id: "t_pricing", label: "Pricing", x: 78, y: 11, w: 13, h: 8, kind: "nav" },
      { id: "t_docs", label: "Docs", x: 63, y: 11, w: 10, h: 8, kind: "nav" },
    ],
  },
  {
    id: "first-run-onboarding",
    name: "First-run onboarding",
    kind: "onboarding",
    width: 1280,
    height: 800,
    eyebrow: "Welcome aboard",
    headline: "Let's set up your first workspace.",
    subcopy: "Three steps and your team is live.",
    targets: [
      { id: "t_create", label: "Create workspace", x: 50, y: 54, w: 34, h: 12, kind: "cta" },
      { id: "t_import", label: "Import existing data", x: 50, y: 70, w: 34, h: 10, kind: "secondary" },
      { id: "t_skip", label: "Skip for now", x: 50, y: 85, w: 22, h: 8, kind: "nav" },
      { id: "t_help", label: "Help", x: 89, y: 11, w: 9, h: 8, kind: "nav" },
    ],
  },
  {
    id: "pricing-page",
    name: "Pricing page",
    kind: "pricing",
    width: 1280,
    height: 800,
    eyebrow: "Pricing",
    headline: "Simple plans that scale with your team.",
    subcopy: "Start free. Upgrade when you grow.",
    targets: [
      { id: "t_free", label: "Start free", x: 22, y: 62, w: 22, h: 12, kind: "secondary" },
      { id: "t_pro", label: "Choose Pro", x: 50, y: 62, w: 22, h: 12, kind: "cta" },
      { id: "t_sales", label: "Talk to sales", x: 78, y: 62, w: 22, h: 12, kind: "secondary" },
      { id: "t_compare", label: "Compare all plans", x: 50, y: 84, w: 28, h: 8, kind: "nav" },
    ],
  },
];

const SEED_VERSION = 3; // bump to force a reseed of static screen content

export function getSeedScreen(id: string): ProductScreen | undefined {
  return SEED_SCREENS.find((s) => s.id === id);
}

export function targetLabel(screen: ProductScreen | undefined, targetId: string | null): string {
  if (!screen) return targetId ?? "empty space";
  if (!targetId) return "empty space";
  return screen.targets.find((t) => t.id === targetId)?.label ?? targetId;
}

/** Idempotently upserts the seeded screens into D1. Safe to call on every request. */
export async function ensureScreensSeeded(): Promise<void> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM screens WHERE id = ?")
    .bind(`__seed_v${SEED_VERSION}__`)
    .first<{ n: number }>();
  if (row && row.n > 0) return;

  const now = Date.now();
  const stmts = SEED_SCREENS.map((s) =>
    db
      .prepare(
        `INSERT INTO screens (id, name, kind, width, height, eyebrow, headline, subcopy, targets_json, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, kind=excluded.kind, width=excluded.width, height=excluded.height,
           eyebrow=excluded.eyebrow, headline=excluded.headline, subcopy=excluded.subcopy,
           targets_json=excluded.targets_json`,
      )
      .bind(
        s.id,
        s.name,
        s.kind,
        s.width,
        s.height,
        s.eyebrow,
        s.headline,
        s.subcopy,
        JSON.stringify(s.targets),
        now,
      ),
  );
  // Marker row so we don't re-run the upsert every request.
  stmts.push(
    db
      .prepare(
        `INSERT INTO screens (id, name, kind, width, height, eyebrow, headline, subcopy, targets_json, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO NOTHING`,
      )
      .bind(`__seed_v${SEED_VERSION}__`, "seed-marker", "landing", 0, 0, "", "", "", "[]", now),
  );
  await db.batch(stmts);
}
