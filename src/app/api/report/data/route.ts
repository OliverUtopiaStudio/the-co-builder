import { NextRequest, NextResponse } from "next/server";
import { isValidReportToken, REPORT_COOKIE_NAME } from "@/lib/report-auth";
import { createClient } from "@/lib/supabase/server";
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

async function checkInternalAuth(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const [fellow] = await db
      .select({ role: fellows.role })
      .from(fellows)
      .where(eq(fellows.authUserId, user.id))
      .limit(1);

    return fellow?.role === "admin" || fellow?.role === "studio";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const isInternal = await checkInternalAuth();
  // Password gate removed — stakeholder view is public, internal view requires auth

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

  const result: Record<string, unknown> = { config: configMap, isInternal };

  // 2. Pre-fetch shared data for internal users (avoids duplicate queries across sections)
  let sharedPodMap = new Map<string, { name: string; color: string | null }>();
  let sharedVentures: Array<{
    id: string;
    name: string;
    podAlignmentScore: string | null;
    isActive: boolean;
    fellowId: string;
  }> = [];
  let sharedImpactFellows: Array<{
    id: string;
    podId: string | null;
    qatarImpactRating: number | null;
    globalPotentialRating: number | null;
    lifecycleStage: string | null;
  }> = [];

  if (isInternal) {
    const needsPods = visibleKeys.has("pods") || visibleKeys.has("fellows") || visibleKeys.has("impact");
    const needsVentures = visibleKeys.has("fellows") || visibleKeys.has("impact");
    const needsFellowRatings = visibleKeys.has("fellows") || visibleKeys.has("impact");

    if (needsPods) {
      const allPodNames = await db
        .select({ id: pods.id, name: pods.name, color: pods.color })
        .from(pods);
      sharedPodMap = new Map(allPodNames.map((p) => [p.id, { name: p.name, color: p.color }]));
    }

    if (needsVentures) {
      sharedVentures = await db
        .select({
          id: ventures.id,
          name: ventures.name,
          podAlignmentScore: ventures.podAlignmentScore,
          isActive: ventures.isActive,
          fellowId: ventures.fellowId,
        })
        .from(ventures);
    }

    if (needsFellowRatings) {
      sharedImpactFellows = await db
        .select({
          id: fellows.id,
          podId: fellows.podId,
          qatarImpactRating: fellows.qatarImpactRating,
          globalPotentialRating: fellows.globalPotentialRating,
          lifecycleStage: fellows.lifecycleStage,
        })
        .from(fellows)
        .where(eq(fellows.role, "fellow"));
    }
  }

  // 3. Fetch visible sections
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
    const countMap = new Map(fellowCounts.map((fc) => [fc.podId, fc.count]));

    let podData = allPods.map((pod) => ({
      id: pod.id,
      name: pod.name,
      tagline: pod.tagline,
      color: pod.color,
      clusters: pod.clusters,
      displayOrder: pod.displayOrder,
      fellowCount: countMap.get(pod.id) || 0,
      ...(isInternal && {
        thesis: pod.thesis,
        marketGap: pod.marketGap,
        targetArchetype: pod.targetArchetype,
        optimalFellowProfile: pod.optimalFellowProfile,
        currentJourneyStage: pod.currentJourneyStage,
        corporatePartners: pod.corporatePartners,
        coInvestors: pod.coInvestors,
      }),
    }));

    if (!isInternal) {
      const podCfg = configMap["pods"];
      if (
        podCfg?.highlightMode === "highlighted_only" &&
        Array.isArray(podCfg.highlightedIds) &&
        (podCfg.highlightedIds as string[]).length > 0
      ) {
        const hl = new Set(podCfg.highlightedIds as string[]);
        podData = podData.filter((p) => hl.has(p.id));
      }
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
        podId: fellows.podId,
        equityPercentage: fellows.equityPercentage,
        globalPotentialRating: fellows.globalPotentialRating,
        qatarImpactRating: fellows.qatarImpactRating,
        experienceProfile: fellows.experienceProfile,
        background: fellows.background,
        selectionRationale: fellows.selectionRationale,
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

    // Build per-fellow venture map from shared data
    const venturesByFellow = new Map<string, Array<{ name: string; alignmentScore: string | null; isActive: boolean }>>();
    if (isInternal) {
      for (const v of sharedVentures) {
        const list = venturesByFellow.get(v.fellowId) || [];
        list.push({ name: v.name, alignmentScore: v.podAlignmentScore, isActive: v.isActive });
        venturesByFellow.set(v.fellowId, list);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fellowResult = fellowData.map((f: any) => {
      if (isInternal) {
        return {
          ...f,
          ventureCount: vCountMap.get(f.id) ?? 0,
          podName: f.podId ? sharedPodMap.get(f.podId)?.name ?? null : null,
          podColor: f.podId ? sharedPodMap.get(f.podId)?.color ?? null : null,
          ventures: venturesByFellow.get(f.id) || [],
        };
      }
      // Stakeholder view: only return public fields
      return {
        id: f.id,
        fullName: f.fullName,
        avatarUrl: f.avatarUrl,
        bio: f.bio,
        linkedinUrl: f.linkedinUrl,
        domain: f.domain,
        lifecycleStage: f.lifecycleStage,
        ventureCount: vCountMap.get(f.id) ?? 0,
      };
    });

    if (!isInternal) {
      const fellowCfg = configMap["fellows"];
      if (
        fellowCfg?.highlightMode === "highlighted_only" &&
        Array.isArray(fellowCfg.highlightedIds) &&
        (fellowCfg.highlightedIds as string[]).length > 0
      ) {
        const hl = new Set(fellowCfg.highlightedIds as string[]);
        fellowResult = fellowResult.filter((f: any) => hl.has(f.id));
      }
    }
    result.fellows = fellowResult;
  }

  if (visibleKeys.has("pipeline")) {
    const pipelineData = await db
      .select()
      .from(ashbyPipeline)
      .orderBy(ashbyPipeline.displayOrder);

    if (isInternal) {
      result.pipeline = pipelineData.map((role) => ({
        ...role,
        conversionRates: {
          leadsToReview: role.leads != null && role.leads > 0 && role.review != null ? Math.round((role.review / role.leads) * 100) : null,
          reviewToScreening: role.review != null && role.review > 0 && role.screening != null ? Math.round((role.screening / role.review) * 100) : null,
          screeningToInterview: role.screening != null && role.screening > 0 && role.interview != null ? Math.round((role.interview / role.screening) * 100) : null,
          interviewToOffer: role.interview != null && role.interview > 0 && role.offer != null ? Math.round((role.offer / role.interview) * 100) : null,
          offerToHired: role.offer != null && role.offer > 0 && role.hired != null ? Math.round((role.hired / role.offer) * 100) : null,
          overallConversion: role.applicants != null && role.applicants > 0 && role.hired != null ? Math.round((role.hired / role.applicants) * 100) : null,
        },
      }));
    } else {
      result.pipeline = pipelineData;
    }
  }

  if (visibleKeys.has("impact")) {
    // Use shared fellows data if available (internal), otherwise fetch minimal set
    const impactFellows = isInternal
      ? sharedImpactFellows
      : await db
          .select({
            id: fellows.id,
            podId: fellows.podId,
            qatarImpactRating: fellows.qatarImpactRating,
            globalPotentialRating: fellows.globalPotentialRating,
            lifecycleStage: fellows.lifecycleStage,
          })
          .from(fellows)
          .where(eq(fellows.role, "fellow"));

    // Use shared ventures if available (internal), otherwise fetch minimal set
    const impactVentures = isInternal
      ? sharedVentures
      : await db
          .select({
            id: ventures.id,
            name: ventures.name,
            podAlignmentScore: ventures.podAlignmentScore,
            isActive: ventures.isActive,
            fellowId: ventures.fellowId,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const impactData: Record<string, any> = {
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

    if (isInternal) {
      // Per-pod breakdown (using shared data)
      const podEntries = Array.from(sharedPodMap.entries());
      impactData.podBreakdown = podEntries.map(([podId, pod]) => {
        const podFellows = impactFellows.filter((f) => f.podId === podId);
        const qr = podFellows.map((f) => f.qatarImpactRating).filter((r): r is number => r !== null);
        const gr = podFellows.map((f) => f.globalPotentialRating).filter((r): r is number => r !== null);
        return {
          podId,
          podName: pod.name,
          podColor: pod.color,
          fellowCount: podFellows.length,
          avgQatarImpact: qr.length > 0 ? Math.round((qr.reduce((a, b) => a + b, 0) / qr.length) * 10) / 10 : null,
          avgGlobalPotential: gr.length > 0 ? Math.round((gr.reduce((a, b) => a + b, 0) / gr.length) * 10) / 10 : null,
        };
      });

      // Venture details (using shared data)
      impactData.ventureDetails = sharedVentures;

      // Rating distribution (5 buckets of 20: 0-19, 20-39, 40-59, 60-79, 80-100)
      const bucketize = (ratings: number[]) => {
        const buckets = [0, 0, 0, 0, 0];
        for (const r of ratings) {
          const idx = Math.min(Math.floor(r / 20), 4);
          buckets[idx]++;
        }
        return buckets;
      };

      impactData.ratingDistribution = {
        qatar: bucketize(qatarRatings),
        global: bucketize(globalRatings),
      };
    }

    result.impact = impactData;
  }

  return NextResponse.json(result);
}
