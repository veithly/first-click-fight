import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCardView } from "@/lib/fights";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const view = await getCardView(slug);
  if (!view) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  return NextResponse.json({
    card: view.card,
    fight: { id: view.fight.id, status: view.fight.status, rematchChoice: view.fight.rematchChoice },
    click: view.click,
    screen: { id: view.screen.id, name: view.screen.name, kind: view.screen.kind },
  });
}
