import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { createFight } from "@/lib/fights";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      screenId?: string;
      intendedTargetId?: string;
    };
    const screenId = String(body.screenId ?? "").trim();
    const intendedTargetId = String(body.intendedTargetId ?? "").trim();
    if (!screenId || !intendedTargetId) {
      return NextResponse.json(
        { error: "screenId and intendedTargetId are required" },
        { status: 400 },
      );
    }
    const sessionId = await getOrCreateSessionId();
    const result = await createFight({ screenId, intendedTargetId, sessionId });
    return NextResponse.json({
      fightId: result.fight.id,
      ownerKey: result.ownerKey,
      fightUrl: result.fightUrl,
      intendedTargetId: result.fight.intendedTargetId,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
