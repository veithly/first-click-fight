import { getDb } from "./db";
import { newEventId } from "./ids";
import type { UsageEvent, UsageEventName } from "./types";

export interface RecordUsageInput {
  sessionId: string;
  eventName: UsageEventName;
  fightId?: string | null;
  cardSlug?: string | null;
  payload?: Record<string, unknown> | null;
}

export async function recordUsageEvent(input: RecordUsageInput): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO usage_events (id, fight_id, card_slug, session_id, event_name, payload, created_at)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .bind(
      newEventId(),
      input.fightId ?? null,
      input.cardSlug ?? null,
      input.sessionId,
      input.eventName,
      input.payload ? JSON.stringify(input.payload) : null,
      Date.now(),
    )
    .run();
}

interface UsageEventDbRow {
  id: string;
  fight_id: string | null;
  card_slug: string | null;
  session_id: string;
  event_name: string;
  payload: string | null;
  created_at: number;
}

export async function listUsageEvents(fightId: string): Promise<UsageEvent[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT id, fight_id, card_slug, session_id, event_name, payload, created_at
       FROM usage_events WHERE fight_id = ? ORDER BY created_at ASC`,
    )
    .bind(fightId)
    .all<UsageEventDbRow>();
  return (results ?? []).map((r) => ({
    id: r.id,
    fightId: r.fight_id,
    cardSlug: r.card_slug,
    sessionId: r.session_id,
    eventName: r.event_name as UsageEventName,
    payload: r.payload ? (JSON.parse(r.payload) as Record<string, unknown>) : null,
    createdAt: r.created_at,
  }));
}

export function countByEvent(events: UsageEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.eventName] = (counts[e.eventName] ?? 0) + 1;
  return counts;
}
