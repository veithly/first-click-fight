import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFight, getLatestCardSlug, buildUsageSummary } from "@/lib/fights";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const fight = await getFight(id);
    if (!fight) return NextResponse.json({ error: "Fight not found" }, { status: 404 });
    const latestCardSlug = await getLatestCardSlug(id);
    const summary = await buildUsageSummary(id);
    return NextResponse.json({
      fightId: id,
      status: fight.status,
      latestCardSlug,
      totalOfficialClicks: summary.totalOfficialClicks,
      recommendation: summary.recommendation,
      learningLine: summary.learningLine,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
