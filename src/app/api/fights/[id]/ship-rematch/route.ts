import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shipRematch } from "@/lib/fights";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { ownerKey?: string };
    const ownerKey = String(body.ownerKey ?? "").trim();
    if (!ownerKey) {
      return NextResponse.json({ error: "ownerKey is required" }, { status: 400 });
    }
    const result = await shipRematch({ fightId: id, ownerKey });
    return NextResponse.json({
      rematchUrl: result.rematchUrl,
      rematchChoice: result.rematchChoice,
      challengerTargetId: result.fight.challengerTargetId,
      learningLine: result.summary.learningLine,
    });
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === "FORBIDDEN") {
      return NextResponse.json({ error: "Invalid owner key" }, { status: 403 });
    }
    const status = err.message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
