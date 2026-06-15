import { getDb, getEnv } from "./db";
import { newCardSlug, newClickId, newFightId } from "./ids";
import { hashOwnerKey, signOwnerKey, verifyOwnerKey } from "./ownerKey";
import { clampPercent, hitTest, scoreResult } from "./scoring";
import { ensureScreensSeeded, getSeedScreen, targetLabel } from "./screens";
import { countByEvent, listUsageEvents, recordUsageEvent } from "./usage";
import type {
  Card,
  CardResult,
  Click,
  Fight,
  FightStatus,
  ProductScreen,
  RematchChoice,
  TargetTally,
  UsageSummary,
} from "./types";

interface FightDbRow {
  id: string;
  screen_id: string;
  intended_target_id: string;
  owner_session_id: string;
  owner_key_hash: string;
  status: string;
  rematch_choice: string | null;
  challenger_target_id: string | null;
  created_at: number;
  shipped_at: number | null;
}

interface ClickDbRow {
  id: string;
  fight_id: string;
  visitor_session_id: string;
  nx: number;
  ny: number;
  matched_target_id: string | null;
  is_official: number;
  src: string;
  created_at: number;
}

interface CardDbRow {
  slug: string;
  fight_id: string;
  click_id: string;
  result: string;
  intended_target_id: string;
  actual_target_id: string | null;
  created_at: number;
}

function mapFight(r: FightDbRow): Fight {
  return {
    id: r.id,
    screenId: r.screen_id,
    intendedTargetId: r.intended_target_id,
    ownerId: r.owner_session_id,
    ownerSessionId: r.owner_session_id,
    status: r.status as FightStatus,
    rematchChoice: (r.rematch_choice as RematchChoice | null) ?? null,
    challengerTargetId: r.challenger_target_id,
    createdAt: r.created_at,
    shippedAt: r.shipped_at,
  };
}

function mapClick(r: ClickDbRow): Click {
  return {
    id: r.id,
    fightId: r.fight_id,
    visitorSessionId: r.visitor_session_id,
    nx: r.nx,
    ny: r.ny,
    matchedTargetId: r.matched_target_id,
    isOfficial: r.is_official === 1,
    src: r.src,
    createdAt: r.created_at,
  };
}

function mapCard(r: CardDbRow): Card {
  return {
    slug: r.slug,
    fightId: r.fight_id,
    clickId: r.click_id,
    result: r.result as CardResult,
    intendedTargetId: r.intended_target_id,
    actualTargetId: r.actual_target_id,
    createdAt: r.created_at,
  };
}

export async function baseUrl(): Promise<string> {
  const env = await getEnv();
  return (env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4387").replace(/\/$/, "");
}

export interface CreateFightResult {
  fight: Fight;
  ownerKey: string;
  fightUrl: string;
  ownerUrl: string;
}

export async function createFight(input: {
  screenId: string;
  intendedTargetId: string;
  sessionId: string;
}): Promise<CreateFightResult> {
  const screen = getSeedScreen(input.screenId);
  if (!screen) throw new Error(`Unknown screen: ${input.screenId}`);
  if (!screen.targets.some((t) => t.id === input.intendedTargetId)) {
    throw new Error(`Target ${input.intendedTargetId} is not on screen ${input.screenId}`);
  }
  await ensureScreensSeeded();

  const db = await getDb();
  const env = await getEnv();
  const id = newFightId();
  const ownerKey = await signOwnerKey(env.OWNER_KEY_SECRET, id);
  const ownerKeyHash = await hashOwnerKey(ownerKey);
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO fights (id, screen_id, intended_target_id, owner_session_id, owner_key_hash, status, created_at)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .bind(id, input.screenId, input.intendedTargetId, input.sessionId, ownerKeyHash, "live", now)
    .run();

  await recordUsageEvent({
    sessionId: input.sessionId,
    eventName: "fcf_fight_created",
    fightId: id,
    payload: { screenId: input.screenId, intendedTargetId: input.intendedTargetId },
  });

  const base = await baseUrl();
  const fight = await getFight(id);
  return {
    fight: fight!,
    ownerKey,
    fightUrl: `${base}/fight/${id}`,
    ownerUrl: `${base}/fight/${id}?owner=1`,
  };
}

export async function getFight(fightId: string): Promise<Fight | null> {
  const db = await getDb();
  const row = await db.prepare(`SELECT * FROM fights WHERE id = ?`).bind(fightId).first<FightDbRow>();
  return row ? mapFight(row) : null;
}

export async function getFightWithScreen(
  fightId: string,
): Promise<{ fight: Fight; screen: ProductScreen } | null> {
  const fight = await getFight(fightId);
  if (!fight) return null;
  const screen = getSeedScreen(fight.screenId);
  if (!screen) return null;
  return { fight, screen };
}

export async function getOfficialClickForSession(
  fightId: string,
  sessionId: string,
): Promise<Click | null> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT * FROM clicks WHERE fight_id = ? AND visitor_session_id = ? AND is_official = 1 LIMIT 1`,
    )
    .bind(fightId, sessionId)
    .first<ClickDbRow>();
  return row ? mapClick(row) : null;
}

export interface RecordClickResult {
  card: Card;
  click: Click;
  duplicate: boolean;
}

export async function recordFirstClick(input: {
  fightId: string;
  sessionId: string;
  nx: number;
  ny: number;
  src?: string;
}): Promise<RecordClickResult> {
  const withScreen = await getFightWithScreen(input.fightId);
  if (!withScreen) throw new Error("Fight not found");
  const { fight, screen } = withScreen;
  const db = await getDb();

  const existing = await getOfficialClickForSession(input.fightId, input.sessionId);
  if (existing) {
    const card = await getCardByClickId(existing.id);
    if (card) return { card, click: existing, duplicate: true };
  }

  const nx = clampPercent(input.nx);
  const ny = clampPercent(input.ny);
  const { target } = hitTest(screen, nx, ny);
  const matchedId = target?.id ?? null;
  const result = scoreResult(fight.intendedTargetId, matchedId);

  const clickId = newClickId();
  const slug = newCardSlug();
  const now = Date.now();

  await db.batch([
    db
      .prepare(
        `INSERT INTO clicks (id, fight_id, visitor_session_id, nx, ny, matched_target_id, is_official, src, created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      )
      .bind(clickId, input.fightId, input.sessionId, nx, ny, matchedId, 1, input.src ?? "desktop", now),
    db
      .prepare(
        `INSERT INTO cards (slug, fight_id, click_id, result, intended_target_id, actual_target_id, created_at)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .bind(slug, input.fightId, clickId, result, fight.intendedTargetId, matchedId, now),
    db.prepare(`UPDATE fights SET status = 'scored' WHERE id = ? AND status = 'live'`).bind(input.fightId),
  ]);

  await recordUsageEvent({
    sessionId: input.sessionId,
    eventName: "fcf_first_action_clicked",
    fightId: input.fightId,
    cardSlug: slug,
    payload: {
      matchedTargetId: matchedId,
      matchedLabel: targetLabel(screen, matchedId),
      result,
      src: input.src ?? "desktop",
    },
  });

  const click = mapClick({
    id: clickId,
    fight_id: input.fightId,
    visitor_session_id: input.sessionId,
    nx,
    ny,
    matched_target_id: matchedId,
    is_official: 1,
    src: input.src ?? "desktop",
    created_at: now,
  });
  const card = mapCard({
    slug,
    fight_id: input.fightId,
    click_id: clickId,
    result,
    intended_target_id: fight.intendedTargetId,
    actual_target_id: matchedId,
    created_at: now,
  });
  return { card, click, duplicate: false };
}

export async function getCardByClickId(clickId: string): Promise<Card | null> {
  const db = await getDb();
  const row = await db.prepare(`SELECT * FROM cards WHERE click_id = ?`).bind(clickId).first<CardDbRow>();
  return row ? mapCard(row) : null;
}

export interface CardView {
  card: Card;
  fight: Fight;
  click: Click | null;
  screen: ProductScreen;
}

export async function getCardView(slug: string): Promise<CardView | null> {
  const db = await getDb();
  const cardRow = await db.prepare(`SELECT * FROM cards WHERE slug = ?`).bind(slug).first<CardDbRow>();
  if (!cardRow) return null;
  const card = mapCard(cardRow);
  const withScreen = await getFightWithScreen(card.fightId);
  if (!withScreen) return null;
  const clickRow = await db
    .prepare(`SELECT * FROM clicks WHERE id = ?`)
    .bind(card.clickId)
    .first<ClickDbRow>();
  return {
    card,
    fight: withScreen.fight,
    click: clickRow ? mapClick(clickRow) : null,
    screen: withScreen.screen,
  };
}

export interface ShipRematchResult {
  fight: Fight;
  rematchChoice: RematchChoice;
  rematchUrl: string;
  summary: UsageSummary;
}

export async function shipRematch(input: {
  fightId: string;
  ownerKey: string;
}): Promise<ShipRematchResult> {
  const withScreen = await getFightWithScreen(input.fightId);
  if (!withScreen) throw new Error("Fight not found");
  const { fight } = withScreen;

  const db = await getDb();
  const row = await db
    .prepare(`SELECT owner_key_hash FROM fights WHERE id = ?`)
    .bind(input.fightId)
    .first<{ owner_key_hash: string }>();
  const ok = row ? await verifyOwnerKey(input.ownerKey, row.owner_key_hash) : false;
  if (!ok) {
    const err = new Error("Invalid owner key");
    (err as Error & { code?: string }).code = "FORBIDDEN";
    throw err;
  }

  const summary = await buildUsageSummary(input.fightId);
  const rematchChoice = summary.recommendation;
  const challengerTargetId =
    rematchChoice === "challenger_promoted" ? summary.winnerTargetId : fight.intendedTargetId;
  const now = Date.now();

  await db
    .prepare(
      `UPDATE fights SET status = 'rematch_shipped', rematch_choice = ?, challenger_target_id = ?, shipped_at = ? WHERE id = ?`,
    )
    .bind(rematchChoice, challengerTargetId, now, input.fightId)
    .run();

  await recordUsageEvent({
    sessionId: fight.ownerSessionId,
    eventName: "fcf_rematch_shipped",
    fightId: input.fightId,
    payload: { rematchChoice, challengerTargetId },
  });

  const base = await baseUrl();
  const updated = await getFight(input.fightId);
  return {
    fight: updated!,
    rematchChoice,
    rematchUrl: `${base}/rematch/${input.fightId}`,
    summary,
  };
}

export async function buildUsageSummary(fightId: string): Promise<UsageSummary> {
  const withScreen = await getFightWithScreen(fightId);
  if (!withScreen) throw new Error("Fight not found");
  const { fight, screen } = withScreen;
  const db = await getDb();

  const { results } = await db
    .prepare(
      `SELECT matched_target_id AS tid, COUNT(*) AS n
       FROM clicks WHERE fight_id = ? AND is_official = 1
       GROUP BY matched_target_id`,
    )
    .bind(fightId)
    .all<{ tid: string | null; n: number }>();

  const tallyMap = new Map<string | null, number>();
  let total = 0;
  for (const r of results ?? []) {
    tallyMap.set(r.tid, r.n);
    total += r.n;
  }

  const tallies: TargetTally[] = [...tallyMap.entries()]
    .map(([tid, count]) => ({
      targetId: tid,
      label: targetLabel(screen, tid),
      count,
      isIntended: tid === fight.intendedTargetId,
    }))
    .sort((a, b) => b.count - a.count);

  const intendedClicks = tallyMap.get(fight.intendedTargetId) ?? 0;
  let winnerTargetId: string | null = fight.intendedTargetId;
  let winnerCount = intendedClicks;
  for (const t of tallies) {
    if (t.targetId === fight.intendedTargetId) continue;
    if (t.count > winnerCount) {
      winnerCount = t.count;
      winnerTargetId = t.targetId;
    }
  }
  const recommendation: RematchChoice =
    winnerTargetId !== fight.intendedTargetId && winnerCount > intendedClicks
      ? "challenger_promoted"
      : "intended_defended";

  const intendedLabel = targetLabel(screen, fight.intendedTargetId);
  const winnerLabel = targetLabel(screen, winnerTargetId);
  const learningLine =
    recommendation === "challenger_promoted"
      ? `${winnerCount} of ${total} first clicks landed on "${winnerLabel}", not your intended "${intendedLabel}".`
      : total > 0
        ? `Your intended "${intendedLabel}" held up: ${intendedClicks} of ${total} first clicks.`
        : `No first clicks yet. Share the fight link to start learning.`;

  const events = await listUsageEvents(fightId);

  return {
    fightId,
    totalOfficialClicks: total,
    intendedTargetId: fight.intendedTargetId,
    intendedClicks,
    winnerTargetId,
    winnerLabel,
    tallies,
    events,
    eventCounts: countByEvent(events),
    recommendation,
    learningLine,
  };
}

export interface RematchView {
  fight: Fight;
  screen: ProductScreen;
  shipped: boolean;
  promotedTargetId: string;
  beforeLabel: string;
  afterLabel: string;
}

export async function getRematchView(fightId: string): Promise<RematchView | null> {
  const withScreen = await getFightWithScreen(fightId);
  if (!withScreen) return null;
  const { fight, screen } = withScreen;
  const shipped = fight.status === "rematch_shipped";
  const promotedTargetId =
    shipped && fight.challengerTargetId ? fight.challengerTargetId : fight.intendedTargetId;
  return {
    fight,
    screen,
    shipped,
    promotedTargetId,
    beforeLabel: targetLabel(screen, fight.intendedTargetId),
    afterLabel: targetLabel(screen, promotedTargetId),
  };
}

/** Owner check by session (same-browser owner) — owner key param is the share path. */
export async function isOwnerSession(fight: Fight, sessionId: string | null): Promise<boolean> {
  return !!sessionId && fight.ownerId === sessionId;
}

export async function getLatestCardSlug(fightId: string): Promise<string | null> {
  const db = await getDb();
  const row = await db
    .prepare(`SELECT slug FROM cards WHERE fight_id = ? ORDER BY created_at DESC LIMIT 1`)
    .bind(fightId)
    .first<{ slug: string }>();
  return row?.slug ?? null;
}

export async function verifyOwnerKeyForFight(fightId: string, ownerKey: string): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .prepare(`SELECT owner_key_hash FROM fights WHERE id = ?`)
    .bind(fightId)
    .first<{ owner_key_hash: string }>();
  return row ? verifyOwnerKey(ownerKey, row.owner_key_hash) : false;
}
