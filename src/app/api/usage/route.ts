import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { buildUsageSummary } from "@/lib/fights";
import { recordUsageEvent } from "@/lib/usage";
import type { UsageEventName } from "@/lib/types";

export const dynamic = "force-dynamic";

const VIEW_EVENTS: UsageEventName[] = ["fcf_result_inspected", "fcf_card_replayed", "fcf_rematch_returned"];

export async function GET(req: NextRequest) {
  const fightId = req.nextUrl.searchParams.get("fightId");
  if (!fightId) return NextResponse.json({ error: "fightId is required" }, { status: 400 });
  try {
    const summary = await buildUsageSummary(fightId);
    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      event?: string;
      fightId?: string;
      cardSlug?: string;
    };
    const event = body.event as UsageEventName | undefined;
    if (!event || !VIEW_EVENTS.includes(event)) {
      return NextResponse.json({ error: "Unsupported usage event" }, { status: 400 });
    }
    const sessionId = await getOrCreateSessionId();
    await recordUsageEvent({
      sessionId,
      eventName: event,
      fightId: body.fightId ?? null,
      cardSlug: body.cardSlug ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
