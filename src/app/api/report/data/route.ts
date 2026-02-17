import { NextRequest, NextResponse } from "next/server";
import { isValidReportToken, REPORT_COOKIE_NAME } from "@/lib/report-auth";
import { db } from "@/db";
import {
  reportConfig,
  kpiMetrics,
  pods,
  fellows,
  ashbyPipeline,
  ventures,
  assetCompletion,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function validateReportAuth(request: NextRequest): boolean {
  const password = process.env.REPORT_PASSWORD;
  if (!password) return false;
  const token = request.cookies.get(REPORT_COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidReportToken(token, password);
}

export async function GET(request: NextRequest) {
  if (!validateReportAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch config
  const config = await db
    .select()
    .from(reportConfig)
    .orderBy(reportConfig.displayOrder);

  const configMap = Object.fromEntries(
    config.map((c) => [c.sectionKey, c])
  );
  const visibleKeys = new Set(
    config.filter((c) => c.visible).map((c) => c.sectionKey)
  );

  const result: Record<string, unknown> = { config: configMap };

  // 2. Fetch visible sections
  if (visibleKeys.has("kpis")) {
    result.kpis = await db
      .select()
      .from(kpiMetrics)
      .orderBy(
        sql`COALESCE(${kpiMetrics.displayOrder}, 999999), ${kpiMetrics.key}`
      );
  }

  if (visibleKeys.has("pods")) {
    const allPods = await db.select().from(pods).orderBy(pods.displayOrder);
    const fellowCounts = await db
      .select({
        podId: fellows.podId,
        count: sql<number>`count(*)::int`,
      })
      .from(fellows)
      .where(sql`${fellows.podId} IS NOT NULL`)
      .groupBy(fellows.podId);
    const countMap = new Map(
      fellowCounts.map((fc) => [fc.podId, fc.count])
    );

    let podData = allPods.map((pod) => ({
      id: pod.id,
      name: pod.name,
      tagline: pod.tagline,
      color: pod.color,
      clusters: pod.clusters,
      displayOrder: pod.displayOrder,
      fellowCount: countMap.get(pod.id) || 0,
    }));

    // Apply highlight filter
    const podCfg = configMap["pods"];
    if (
      podCfg?.highlightMode === "highlighted_only" &&
      Array.isArray(podCfg.highlightedIds) &&
      (podCfg.highlightedIds as string[]).length > 0
    ) {
      const hl = new Set(podCfg.highlightedIds as string[]);
      podData = podData.filter((p) => hl.has(p.id));
    }
    result.pods = podData;
  }

  if (visibleKeys.has("fellows")) {
    const fellowData = await db
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

    const vCounts = await db
      .select({
        fellowId: ventures.fellowId,
        count: sql<number>`count(*)::int`,
      })
      .from(ventures)
      .groupBy(ventures.fellowId);
    const vCountMap = new Map(vCounts.map((c) => [c.fellowId, c.count]));

    let fellowResult = fellowData.map((f) => ({
      ...f,
      ventureCount: vCountMap.get(f.id) ?? 0,
    }));

    // Apply highlight filter
    const fellowCfg = configMap["fellows"];
    if (
      fellowCfg?.highlightMode === "highlighted_only" &&
      Array.isArray(fellowCfg.highlightedIds) &&
      (fellowCfg.highlightedIds as string[]).length > 0
    ) {
      const hl = new Set(fellowCfg.highlightedIds as string[]);
      fellowResult = fellowResult.filter((f) => hl.has(f.id));
    }
    result.fellows = fellowResult;
  }

  if (visibleKeys.has("pipeline")) {
    result.pipeline = await db
      .select()
      .from(ashbyPipeline)
      .orderBy(ashbyPipeline.displayOrder);
  }

  if (visibleKeys.has("impact")) {
    const impactFellows = await db
      .select({
        id: fellows.id,
        qatarImpactRating: fellows.qatarImpactRating,
        globalPotentialRating: fellows.globalPotentialRating,
        lifecycleStage: fellows.lifecycleStage,
      })
      .from(fellows)
      .where(eq(fellows.role, "fellow"));

    const impactVentures = await db
      .select({
        id: ventures.id,
        podAlignmentScore: ventures.podAlignmentScore,
        isActive: ventures.isActive,
      })
      .from(ventures);

    const [completedRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assetCompletion)
      .where(eq(assetCompletion.isComplete, true));

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assetCompletion);

    const qatarRatings = impactFellows
      .map((f) => f.qatarImpactRating)
      .filter((r): r is number => r !== null);
    const globalRatings = impactFellows
      .map((f) => f.globalPotentialRating)
      .filter((r): r is number => r !== null);
    const alignmentScores = impactVentures
      .map((v) => (v.podAlignmentScore ? Number(v.podAlignmentScore) : null))
      .filter((s): s is number => s !== null);

    const avg = (arr: number[]) =>
      arr.length > 0
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
        : 0;

    const lifecycleDistribution = impactFellows.reduce(
      (acc, f) => {
        const stage = f.lifecycleStage || "onboarding";
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAssets = Number(totalRow?.count || 0);
    const completedAssets = Number(completedRow?.count || 0);

    result.impact = {
      avgQatarImpact: avg(qatarRatings),
      avgGlobalPotential: avg(globalRatings),
      avgAlignmentScore: avg(alignmentScores),
      qatarRatingCount: qatarRatings.length,
      globalRatingCount: globalRatings.length,
      alignmentScoreCount: alignmentScores.length,
      totalFellows: impactFellows.length,
      totalVentures: impactVentures.length,
      activeVentures: impactVentures.filter((v) => v.isActive).length,
      assetCompletionRate:
        totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0,
      lifecycleDistribution,
    };
  }

  return NextResponse.json(result);
}
