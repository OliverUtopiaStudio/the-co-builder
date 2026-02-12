import { NextResponse } from "next/server";
import { db } from "@/db";
import { fellows, ventures } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Public API: returns Fellows for the landing page portfolio.
 * Only exposes public-safe fields (no email, auth data, or internal ratings).
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: fellows.id,
        fullName: fellows.fullName,
        avatarUrl: fellows.avatarUrl,
        bio: fellows.bio,
        linkedinUrl: fellows.linkedinUrl,
        domain: fellows.domain,
        lifecycleStage: fellows.lifecycleStage,
      })
      .from(fellows)
      .where(eq(fellows.role, "fellow"))
      .orderBy(fellows.createdAt);

    // Get venture counts per fellow
    const counts = await db
      .select({
        fellowId: ventures.fellowId,
        count: sql<number>`count(*)::int`,
      })
      .from(ventures)
      .groupBy(ventures.fellowId);

    const countMap = new Map(counts.map((c) => [c.fellowId, c.count]));

    const portfolio = rows.map((r) => ({
      ...r,
      ventureCount: countMap.get(r.id) ?? 0,
    }));

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching fellows portfolio:", error);
    return NextResponse.json(
      { error: "Failed to load fellows" },
      { status: 500 }
    );
  }
}
