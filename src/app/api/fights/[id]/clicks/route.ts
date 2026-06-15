import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { recordFirstClick, baseUrl } from "@/lib/fights";

export const dynamic = "force-dynamic";

// Simple per-session abuse guard: max 20 click attempts/session/hour (in-memory best effort).
const attempts = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const slot = attempts.get(key);
  if (!slot || now > slot.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  slot.count += 1;
  return slot.count > 20;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { nx?: number; ny?: number; src?: string };
    const nx = Number(body.nx);
    const ny = Number(body.ny);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) {
      return NextResponse.json({ error: "nx and ny (0..100) are required" }, { status: 400 });
    }
    const sessionId = await getOrCreateSessionId();
    if (rateLimited(`${id}:${sessionId}`)) {
      return NextResponse.json({ error: "Too many clicks. Try again later." }, { status: 429 });
    }
    const src = body.src === "qr" ? "qr" : "desktop";
    const result = await recordFirstClick({ fightId: id, sessionId, nx, ny, src });
    const base = await baseUrl();
    return NextResponse.json({
      cardSlug: result.card.slug,
      cardUrl: `${base}/card/${result.card.slug}`,
      result: result.card.result,
      actualTargetId: result.card.actualTargetId,
      duplicate: result.duplicate,
    });
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
