import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlistItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  const { ventureId } = await params;

  if (!ventureId) {
    return NextResponse.json({ error: "ventureId is required" }, { status: 400 });
  }

  const items = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.ventureId, ventureId))
    .orderBy(playlistItems.position);

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      type: item.type as "asset" | "module" | "link",
      position: item.position,
      assetNumber: item.assetNumber,
      title: item.title,
      description: item.description,
      url: item.url,
    })),
  });
}

