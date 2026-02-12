"use server";

import { db } from "@/db";
import { assetCompletion, ventures, fellows, assetRequirements } from "@/db/schema";
import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { stages, type Asset, type Stage } from "@/lib/data";

export interface CriticalAction {
  assetNumber: number;
  title: string;
  purpose: string;
  stageNumber: string;
  stageName: string;
  priority: "critical" | "high" | "medium";
  reason: string;
  blockers?: string[];
  dependencies?: number[];
  estimatedDays?: number;
}

export interface PathwayStage {
  stageNumber: string;
  stageName: string;
  completedAssets: number;
  totalAssets: number;
  progress: number;
  isComplete: boolean;
  isCurrent: boolean;
  estimatedDaysRemaining?: number;
}

export interface DiagnosisResult {
  ventureId: string;
  ventureName: string;
  currentStage: string;
  overallProgress: number;
  completedAssets: number;
  totalAssets: number;
  criticalActions: CriticalAction[];
  pathway: PathwayStage[];
  estimatedDaysToSpinout: number | null;
  estimatedSpinoutDate: Date | null;
  velocity: {
    assetsPerWeek: number;
    lastCompletedAt: Date | null;
  };
  blockers: {
    type: "asset" | "outwith";
    description: string;
    action: string;
  }[];
}

/**
 * Get asset requirements for a venture (required vs optional)
 */
async function getAssetRequirements(ventureId: string): Promise<Record<number, boolean>> {
  // Get global defaults
  const globalReqs = await db
    .select()
    .from(assetRequirements)
    .where(isNull(assetRequirements.ventureId));

  // Get per-venture overrides
  const ventureReqs = await db
    .select()
    .from(assetRequirements)
    .where(eq(assetRequirements.ventureId, ventureId));

  const reqMap: Record<number, boolean> = {};
  // Default all assets to required
  for (let i = 1; i <= 27; i++) {
    reqMap[i] = true;
  }
  // Apply global defaults
  for (const req of globalReqs) {
    reqMap[req.assetNumber] = req.isRequired;
  }
  // Override with venture-specific
  for (const req of ventureReqs) {
    reqMap[req.assetNumber] = req.isRequired;
  }

  return reqMap;
}

/**
 * Calculate velocity based on completion history
 */
function calculateVelocity(completions: { assetNumber: number; completedAt: Date | null }[]): {
  assetsPerWeek: number;
  lastCompletedAt: Date | null;
} {
  const completed = completions.filter((c) => c.completedAt !== null);
  if (completed.length === 0) {
    return { assetsPerWeek: 0, lastCompletedAt: null };
  }

  // Sort by completion date
  const sorted = completed
    .map((c) => ({
      assetNumber: c.assetNumber,
      completedAt: c.completedAt as Date,
    }))
    .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

  const firstCompleted = sorted[0].completedAt;
  const lastCompleted = sorted[sorted.length - 1].completedAt;
  const daysDiff = (lastCompleted.getTime() - firstCompleted.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 0) {
    // All completed on same day or single asset
    return { assetsPerWeek: sorted.length, lastCompletedAt: lastCompleted };
  }

  const weeks = daysDiff / 7;
  const assetsPerWeek = weeks > 0 ? sorted.length / weeks : sorted.length;

  return {
    assetsPerWeek: Math.max(0.1, assetsPerWeek), // Minimum 0.1 to avoid division by zero
    lastCompletedAt: lastCompleted,
  };
}

/**
 * Estimate days to complete an asset based on its complexity
 */
function estimateAssetDays(assetNumber: number): number {
  // Rough estimates based on asset complexity
  const estimates: Record<number, number> = {
    1: 3, // Risk Capital + Invention One-Pager
    2: 2, // Category Ambition Gate
    3: 5, // Problem Deep Dive
    4: 4, // Workflow Map
    5: 3, // ICP Definition
    6: 3, // Kill Switches
    7: 4, // Competitive Landscape
    8: 5, // Data Map
    9: 4, // Solution Architecture
    10: 6, // Eval Plan
    11: 4, // Technical Architecture
    12: 5, // Data Rights + Moat
    13: 4, // Security Architecture
    14: 4, // Competitive Positioning
    15: 5, // PRD
    16: 4, // Design Partner Strategy
    17: 5, // Pilot Plan
    18: 7, // Productized Pilot
    19: 6, // Eval Results
    20: 4, // Sales Pack
    21: 5, // Pricing + Unit Economics
    22: 5, // Roadmap
    23: 4, // Operating Model
    24: 6, // Investor Pack
    25: 5, // Capital Plan
    26: 7, // Spinout Legal Pack (can be blocker)
    27: 4, // Exit Map
  };

  return estimates[assetNumber] || 5; // Default 5 days
}

/**
 * Identify critical next actions considering dependencies
 */
function identifyCriticalActions(
  completedAssets: Set<number>,
  assetRequirements: Record<number, boolean>,
  allAssets: Asset[]
): CriticalAction[] {
  const criticalActions: CriticalAction[] = [];
  const processed = new Set<number>();

  // Find the first incomplete required asset
  for (const asset of allAssets) {
    if (completedAssets.has(asset.number) || processed.has(asset.number)) {
      continue;
    }

    // Skip optional assets for critical path
    if (!assetRequirements[asset.number]) {
      continue;
    }

    // Check if prerequisites are met (simplified: sequential for now)
    const previousAsset = asset.number > 1 ? asset.number - 1 : null;
    const hasPrerequisites =
      previousAsset === null || completedAssets.has(previousAsset);

    if (!hasPrerequisites) {
      // This is a blocker - need to complete previous assets first
      continue;
    }

    // Determine priority
    let priority: "critical" | "high" | "medium" = "medium";
    let reason = "";

    if (asset.number <= 2) {
      priority = "critical";
      reason = "Foundation assets - must complete before proceeding";
    } else if (asset.number <= 8) {
      priority = "high";
      reason = "Early stage - builds core evidence base";
    } else if (asset.number >= 23) {
      priority = "high";
      reason = "Investment readiness - required for spinout";
    } else {
      priority = "medium";
      reason = "Next in sequence";
    }

    // Check for specific blockers
    const blockers: string[] = [];
    if (asset.number === 26 && !completedAssets.has(24)) {
      blockers.push("Complete Investor Pack (#24) first");
    }
    if (asset.number === 27 && !completedAssets.has(26)) {
      blockers.push("Complete Spinout Legal Pack (#26) first");
    }

    criticalActions.push({
      assetNumber: asset.number,
      title: asset.title,
      purpose: asset.purpose,
      stageNumber: getStageForAsset(asset.number)?.number || "00",
      stageName: getStageForAsset(asset.number)?.title || "Unknown",
      priority,
      reason,
      blockers: blockers.length > 0 ? blockers : undefined,
      estimatedDays: estimateAssetDays(asset.number),
    });

    processed.add(asset.number);

    // Limit to top 3 critical actions
    if (criticalActions.length >= 3) {
      break;
    }
  }

  return criticalActions;
}

/**
 * Get stage info for an asset number
 */
function getStageForAsset(assetNumber: number): Stage | null {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) {
        return stage;
      }
    }
  }
  return null;
}

/**
 * Build pathway visualization
 */
function buildPathway(
  completedAssets: Set<number>,
  assetRequirements: Record<number, boolean>,
  velocity: { assetsPerWeek: number; lastCompletedAt: Date | null }
): PathwayStage[] {
  const pathway: PathwayStage[] = [];

  for (const stage of stages) {
    const stageAssets = stage.assets.filter((a) => assetRequirements[a.number]);
    const completedInStage = stageAssets.filter((a) => completedAssets.has(a.number)).length;
    const totalInStage = stageAssets.length;
    const progress = totalInStage > 0 ? (completedInStage / totalInStage) * 100 : 0;
    const isComplete = completedInStage === totalInStage && totalInStage > 0;

    // Find current stage (first incomplete stage)
    let isCurrent = false;
    if (!isComplete) {
      const previousStagesComplete = stages
        .slice(0, stages.indexOf(stage))
        .every((s) => {
          const sAssets = s.assets.filter((a) => assetRequirements[a.number]);
          const sCompleted = sAssets.filter((a) => completedAssets.has(a.number)).length;
          return sCompleted === sAssets.length && sAssets.length > 0;
        });
      isCurrent = previousStagesComplete;
    }

    // Estimate days remaining for this stage
    let estimatedDaysRemaining: number | undefined;
    if (!isComplete && velocity.assetsPerWeek > 0) {
      const remainingAssets = totalInStage - completedInStage;
      const weeksRemaining = remainingAssets / velocity.assetsPerWeek;
      estimatedDaysRemaining = Math.ceil(weeksRemaining * 7);
    }

    pathway.push({
      stageNumber: stage.number,
      stageName: stage.title,
      completedAssets: completedInStage,
      totalAssets: totalInStage,
      progress,
      isComplete,
      isCurrent,
      estimatedDaysRemaining,
    });
  }

  return pathway;
}

/**
 * Estimate time to spinout
 */
function estimateTimeToSpinout(
  completedAssets: number,
  totalRequiredAssets: number,
  velocity: { assetsPerWeek: number; lastCompletedAt: Date | null }
): { days: number | null; date: Date | null } {
  if (velocity.assetsPerWeek === 0) {
    return { days: null, date: null };
  }

  const remainingAssets = totalRequiredAssets - completedAssets;
  if (remainingAssets <= 0) {
    return { days: 0, date: new Date() };
  }

  const weeksRemaining = remainingAssets / velocity.assetsPerWeek;
  const daysRemaining = Math.ceil(weeksRemaining * 7);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);

  return { days: daysRemaining, date: estimatedDate };
}

/**
 * Get diagnosis for a venture
 */
export async function getVentureDiagnosis(ventureId: string): Promise<DiagnosisResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify access and get venture
  const [ventureResult] = await db
    .select({
      venture: ventures,
    })
    .from(ventures)
    .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
    .where(and(eq(ventures.id, ventureId), eq(fellows.authUserId, user.id)))
    .limit(1);

  if (!ventureResult) {
    return null;
  }

  const venture = ventureResult.venture;

  // Get asset completions
  const completions = await db
    .select()
    .from(assetCompletion)
    .where(eq(assetCompletion.ventureId, ventureId));

  const completedAssets = new Set(
    completions.filter((c) => c.isComplete).map((c) => c.assetNumber)
  );

  // Get asset requirements
  const assetRequirements = await getAssetRequirements(ventureId);

  // Calculate required assets count
  const totalRequiredAssets = Object.values(assetRequirements).filter((req) => req).length;
  const completedRequiredAssets = Array.from(completedAssets).filter(
    (num) => assetRequirements[num]
  ).length;

  // Calculate velocity
  const velocity = calculateVelocity(
    completions.map((c) => ({
      assetNumber: c.assetNumber,
      completedAt: c.completedAt ? new Date(c.completedAt) : null,
    }))
  );

  // Get all assets in order
  const allAssets: Asset[] = [];
  for (const stage of stages) {
    allAssets.push(...stage.assets);
  }

  // Identify critical actions
  const criticalActions = identifyCriticalActions(
    completedAssets,
    assetRequirements,
    allAssets
  );

  // Build pathway
  const pathway = buildPathway(completedAssets, assetRequirements, velocity);

  // Estimate time to spinout
  const spinoutEstimate = estimateTimeToSpinout(
    completedRequiredAssets,
    totalRequiredAssets,
    velocity
  );

  // Identify blockers (outwith activities)
  const blockers: { type: "asset" | "outwith"; description: string; action: string }[] = [];

  // Check for legal/administrative blockers
  if (completedRequiredAssets >= 20 && !completedAssets.has(26)) {
    blockers.push({
      type: "outwith",
      description: "Legal setup required for spinout",
      action: "Complete Spinout Legal Pack (Asset #26) - may require legal counsel",
    });
  }

  // Check for investment readiness blockers
  if (completedRequiredAssets >= 18 && !completedAssets.has(24)) {
    blockers.push({
      type: "outwith",
      description: "Investment materials needed",
      action: "Complete Investor Pack + Data Room (Asset #24)",
    });
  }

  // Find current stage
  const currentStageInfo = pathway.find((s) => s.isCurrent) || pathway[pathway.length - 1];
  const currentStage = currentStageInfo?.stageNumber || "00";

  return {
    ventureId,
    ventureName: venture.name,
    currentStage,
    overallProgress: totalRequiredAssets > 0 ? (completedRequiredAssets / totalRequiredAssets) * 100 : 0,
    completedAssets: completedRequiredAssets,
    totalAssets: totalRequiredAssets,
    criticalActions,
    pathway,
    estimatedDaysToSpinout: spinoutEstimate.days,
    estimatedSpinoutDate: spinoutEstimate.date,
    velocity,
    blockers,
  };
}

/**
 * Get diagnosis for fellow's primary venture (most recent active)
 */
export async function getFellowDiagnosis(): Promise<DiagnosisResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow) {
    return null;
  }

  // Get most recent active venture
  const [venture] = await db
    .select()
    .from(ventures)
    .where(and(eq(ventures.fellowId, fellow.id), eq(ventures.isActive, true)))
    .orderBy(desc(ventures.createdAt))
    .limit(1);

  if (!venture) {
    return null;
  }

  return getVentureDiagnosis(venture.id);
}
