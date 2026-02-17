/**
 * Enhanced Daily Guidance & Next Step Logic
 * 
 * Provides sophisticated "what to work on next" guidance that considers:
 * - Asset prerequisites and dependencies (from feedsInto field)
 * - Stage boundaries (current stage + previous stage only)
 * - Asset requirements (required vs optional)
 * - Critical path identification
 * - Contextual explanations
 */

import { stages, type Asset, type Stage } from "@/lib/data";

export interface AssetDependency {
  assetNumber: number;
  description: string;
}

export interface NextStepRecommendation {
  assetNumber: number;
  title: string;
  purpose: string;
  stageNumber: string;
  stageName: string;
  priority: "critical" | "high" | "medium";
  reason: string;
  whyThisMatters: string[];
  blockers: string[];
  dependencies: number[];
  unlocksAssets: number[];
  estimatedDays: number;
  isBlocked: boolean;
  isInCurrentStage: boolean;
  isInPreviousStage: boolean;
}

/**
 * Parse feedsInto string to extract asset dependencies
 * Example: "Eval targets (#10) → ROI/pricing (#19/#21) → Pilot KPIs (#18)"
 */
function parseFeedsInto(feedsInto: string | undefined): AssetDependency[] {
  if (!feedsInto) return [];

  const dependencies: AssetDependency[] = [];
  // Match patterns like (#10), (#19/#21), etc.
  const assetPattern = /\(#(\d+)(?:\/(\d+))?\)/g;
  let match;

  while ((match = assetPattern.exec(feedsInto)) !== null) {
    const assetNum = parseInt(match[1], 10);
    const secondAssetNum = match[2] ? parseInt(match[2], 10) : null;

    // Extract description before this asset reference
    const beforeMatch = feedsInto.substring(0, match.index);
    const lastArrow = beforeMatch.lastIndexOf("→");
    const description = lastArrow >= 0
      ? beforeMatch.substring(lastArrow + 1).trim()
      : beforeMatch.trim();

    dependencies.push({
      assetNumber: assetNum,
      description: description || `Asset #${assetNum}`,
    });

    if (secondAssetNum) {
      dependencies.push({
        assetNumber: secondAssetNum,
        description: description || `Asset #${secondAssetNum}`,
      });
    }
  }

  return dependencies;
}

/**
 * Build reverse dependency map: which assets depend on this asset?
 */
function buildReverseDependencyMap(): Map<number, number[]> {
  const reverseMap = new Map<number, number[]>();

  for (const stage of stages) {
    for (const asset of stage.assets) {
      const dependencies = parseFeedsInto(asset.feedsInto);
      for (const dep of dependencies) {
        if (!reverseMap.has(dep.assetNumber)) {
          reverseMap.set(dep.assetNumber, []);
        }
        reverseMap.get(dep.assetNumber)!.push(asset.number);
      }
    }
  }

  return reverseMap;
}

/**
 * Get all assets that this asset feeds into (downstream assets)
 */
function getDownstreamAssets(assetNumber: number): number[] {
  const reverseMap = buildReverseDependencyMap();
  return reverseMap.get(assetNumber) || [];
}

/**
 * Get prerequisites for an asset (assets it depends on)
 */
function getPrerequisites(asset: Asset): number[] {
  const dependencies = parseFeedsInto(asset.feedsInto);
  return dependencies.map((d) => d.assetNumber);
}

/**
 * Check if an asset is accessible based on stage boundaries
 * Fellows can only access: current stage + previous stage
 */
function isAssetAccessible(
  assetNumber: number,
  currentStageNumber: string
): { accessible: boolean; isInCurrentStage: boolean; isInPreviousStage: boolean } {
  const assetStage = getStageForAsset(assetNumber);
  if (!assetStage) {
    return { accessible: false, isInCurrentStage: false, isInPreviousStage: false };
  }

  const currentStageIndex = stages.findIndex((s) => s.number === currentStageNumber);
  const assetStageIndex = stages.findIndex((s) => s.number === assetStage.number);

  if (currentStageIndex === -1 || assetStageIndex === -1) {
    return { accessible: false, isInCurrentStage: false, isInPreviousStage: false };
  }

  const isInCurrentStage = assetStageIndex === currentStageIndex;
  const isInPreviousStage = assetStageIndex === currentStageIndex - 1;
  const accessible = isInCurrentStage || isInPreviousStage;

  return { accessible, isInCurrentStage, isInPreviousStage };
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
 * Generate contextual explanation for why an asset matters
 */
function generateWhyThisMatters(
  asset: Asset,
  completedAssets: Set<number>,
  assetRequirements: Record<number, boolean>
): string[] {
  const explanations: string[] = [];

  // Use feedsInto to explain downstream impact
  const downstreamAssets = getDownstreamAssets(asset.number);
  if (downstreamAssets.length > 0) {
    const incompleteDownstream = downstreamAssets.filter(
      (num) => !completedAssets.has(num) && assetRequirements[num]
    );
    if (incompleteDownstream.length > 0) {
      if (incompleteDownstream.length === 1) {
        const downstreamAsset = incompleteDownstream[0];
        const downstreamStage = getStageForAsset(downstreamAsset);
        explanations.push(
          `Builds the evidence base for Asset #${downstreamAsset}${downstreamStage ? ` (${downstreamStage.title})` : ""}`
        );
      } else {
        explanations.push(
          `Unlocks ${incompleteDownstream.length} downstream assets: ${incompleteDownstream.slice(0, 3).map((n) => `#${n}`).join(", ")}${incompleteDownstream.length > 3 ? "..." : ""}`
        );
      }
    }
  }

  // Add purpose-based explanation
  if (asset.purpose) {
    explanations.push(asset.purpose);
  }

  // Stage gate explanation
  const assetStage = getStageForAsset(asset.number);
  if (assetStage && assetStage.gateDecision) {
    const stageAssets = assetStage.assets.filter((a) => assetRequirements[a.number]);
    const completedInStage = stageAssets.filter((a) => completedAssets.has(a.number)).length;
    const remainingInStage = stageAssets.length - completedInStage;
    
    if (remainingInStage <= 2 && remainingInStage > 0) {
      explanations.push(
        `Required to advance to ${getNextStage(assetStage.number)?.title || "next stage"}`
      );
    }
  }

  return explanations.length > 0 ? explanations : ["Next step in your venture journey"];
}

/**
 * Get next stage after current stage
 */
function getNextStage(currentStageNumber: string): Stage | null {
  const currentIndex = stages.findIndex((s) => s.number === currentStageNumber);
  if (currentIndex >= 0 && currentIndex < stages.length - 1) {
    return stages[currentIndex + 1];
  }
  return null;
}

/**
 * Identify blocked assets (prerequisites not met)
 */
function identifyBlockers(
  asset: Asset,
  completedAssets: Set<number>,
  assetRequirements: Record<number, boolean>
): string[] {
  const blockers: string[] = [];
  const prerequisites = getPrerequisites(asset);

  for (const prereqNum of prerequisites) {
    if (!completedAssets.has(prereqNum) && assetRequirements[prereqNum]) {
      const prereqAsset = getAssetByNumber(prereqNum);
      blockers.push(
        `Complete Asset #${prereqNum}${prereqAsset ? ` (${prereqAsset.title})` : ""} first`
      );
    }
  }

  // Sequential dependency check (simplified)
  // Assets generally need previous assets in same stage completed
  const assetStage = getStageForAsset(asset.number);
  if (assetStage) {
    const stageAssets = assetStage.assets.filter((a) => assetRequirements[a.number]);
    const assetIndex = stageAssets.findIndex((a) => a.number === asset.number);
    
    if (assetIndex > 0) {
      const previousAsset = stageAssets[assetIndex - 1];
      if (!completedAssets.has(previousAsset.number)) {
        blockers.push(`Complete Asset #${previousAsset.number} (${previousAsset.title}) first`);
      }
    }
  }

  return blockers;
}

/**
 * Get asset by number
 */
function getAssetByNumber(assetNumber: number): Asset | null {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) {
        return asset;
      }
    }
  }
  return null;
}

/**
 * Calculate priority based on multiple factors
 */
function calculatePriority(
  asset: Asset,
  completedAssets: Set<number>,
  currentStageNumber: string,
  assetRequirements: Record<number, boolean>
): "critical" | "high" | "medium" {
  // Foundation assets (Stage 00) are always critical
  if (asset.number <= 2) {
    return "critical";
  }

  // Stage gate assets are high priority
  const assetStage = getStageForAsset(asset.number);
  if (assetStage) {
    const stageAssets = assetStage.assets.filter((a) => assetRequirements[a.number]);
    const completedInStage = stageAssets.filter((a) => completedAssets.has(a.number)).length;
    const remainingInStage = stageAssets.length - completedInStage;
    
    if (remainingInStage <= 2 && remainingInStage > 0) {
      return "high"; // Close to stage completion
    }
  }

  // Assets that unlock many downstream assets are high priority
  const downstreamAssets = getDownstreamAssets(asset.number);
  const incompleteDownstream = downstreamAssets.filter(
    (num) => !completedAssets.has(num) && assetRequirements[num]
  );
  if (incompleteDownstream.length >= 3) {
    return "high";
  }

  // Investment readiness assets (late stage) are high priority
  if (asset.number >= 23) {
    return "high";
  }

  return "medium";
}

/**
 * Estimate days to complete an asset
 */
function estimateAssetDays(assetNumber: number): number {
  const estimates: Record<number, number> = {
    1: 3, 2: 2, 3: 5, 4: 4, 5: 3, 6: 3, 7: 4, 8: 5, 9: 4, 10: 6,
    11: 4, 12: 5, 13: 4, 14: 4, 15: 5, 16: 4, 17: 5, 18: 7, 19: 6, 20: 4,
    21: 5, 22: 5, 23: 4, 24: 6, 25: 5, 26: 7, 27: 4,
  };
  return estimates[assetNumber] || 5;
}

/**
 * Get enhanced next step recommendations
 */
export function getNextStepRecommendations(
  completedAssets: Set<number>,
  currentStageNumber: string,
  assetRequirements: Record<number, boolean>,
  limit: number = 5
): NextStepRecommendation[] {
  const recommendations: NextStepRecommendation[] = [];
  const processed = new Set<number>();

  // Get all assets in order
  const allAssets: Asset[] = [];
  for (const stage of stages) {
    allAssets.push(...stage.assets);
  }

  for (const asset of allAssets) {
    // Skip if already completed or processed
    if (completedAssets.has(asset.number) || processed.has(asset.number)) {
      continue;
    }

    // Skip optional assets
    if (!assetRequirements[asset.number]) {
      continue;
    }

    // Check stage accessibility
    const accessibility = isAssetAccessible(asset.number, currentStageNumber);
    if (!accessibility.accessible) {
      continue;
    }

    // Check for blockers
    const blockers = identifyBlockers(asset, completedAssets, assetRequirements);
    const isBlocked = blockers.length > 0;

    // Calculate priority
    const priority = calculatePriority(
      asset,
      completedAssets,
      currentStageNumber,
      assetRequirements
    );

    // Generate contextual explanations
    const whyThisMatters = generateWhyThisMatters(asset, completedAssets, assetRequirements);

    // Get dependencies and downstream assets
    const dependencies = getPrerequisites(asset);
    const unlocksAssets = getDownstreamAssets(asset.number).filter(
      (num) => !completedAssets.has(num) && assetRequirements[num]
    );

    const assetStage = getStageForAsset(asset.number);
    if (!assetStage) continue;

    // Generate reason
    let reason = "";
    if (isBlocked) {
      reason = `Blocked: ${blockers[0]}`;
    } else if (unlocksAssets.length > 0) {
      reason = `Unlocks ${unlocksAssets.length} downstream asset${unlocksAssets.length > 1 ? "s" : ""}`;
    } else if (priority === "critical") {
      reason = "Foundation asset - must complete before proceeding";
    } else {
      reason = "Next in sequence";
    }

    recommendations.push({
      assetNumber: asset.number,
      title: asset.title,
      purpose: asset.purpose,
      stageNumber: assetStage.number,
      stageName: assetStage.title,
      priority,
      reason,
      whyThisMatters,
      blockers,
      dependencies,
      unlocksAssets,
      estimatedDays: estimateAssetDays(asset.number),
      isBlocked,
      isInCurrentStage: accessibility.isInCurrentStage,
      isInPreviousStage: accessibility.isInPreviousStage,
    });

    processed.add(asset.number);

    // Prioritize unblocked assets
    if (recommendations.length >= limit * 2) {
      break;
    }
  }

  // Sort by priority and blocked status
  recommendations.sort((a, b) => {
    // Unblocked assets first
    if (a.isBlocked !== b.isBlocked) {
      return a.isBlocked ? 1 : -1;
    }

    // Then by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Then by number of downstream assets unlocked
    if (a.unlocksAssets.length !== b.unlocksAssets.length) {
      return b.unlocksAssets.length - a.unlocksAssets.length;
    }

    // Finally by asset number
    return a.assetNumber - b.assetNumber;
  });

  return recommendations.slice(0, limit);
}
