"use client";

import Link from "next/link";
import { stages, type Stage, type Asset } from "@/lib/data";
import { getNextStepRecommendations } from "@/lib/guidance/next-step";

interface AssetNavigationProps {
  currentAssetNumber: number;
  ventureId: string;
  currentStageNumber: string;
  completedAssets: Set<number>;
  assetRequirements: Record<number, boolean>;
}

export default function AssetNavigation({
  currentAssetNumber,
  ventureId,
  currentStageNumber,
  completedAssets,
  assetRequirements,
}: AssetNavigationProps) {
  // Find current asset and stage
  let currentAsset: Asset | null = null;
  let currentStage: Stage | null = null;
  let assetIndexInStage = -1;

  for (const stage of stages) {
    const assetIndex = stage.assets.findIndex((a) => a.number === currentAssetNumber);
    if (assetIndex >= 0) {
      currentAsset = stage.assets[assetIndex];
      currentStage = stage;
      assetIndexInStage = assetIndex;
      break;
    }
  }

  if (!currentAsset || !currentStage) return null;

  // Get previous/next assets in same stage
  const prevAssetInStage =
    assetIndexInStage > 0 ? currentStage.assets[assetIndexInStage - 1] : null;
  const nextAssetInStage =
    assetIndexInStage < currentStage.assets.length - 1
      ? currentStage.assets[assetIndexInStage + 1]
      : null;

  // Get previous/next stages
  const currentStageIndex = stages.findIndex((s) => s.number === currentStageNumber);
  const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;
  const nextStage =
    currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  // Check stage accessibility (current + previous only)
  const isPrevStageAccessible = prevStage !== null;
  const isNextStageAccessible = false; // Future stages not accessible

  // Get previous asset (could be in previous stage if at start of current stage)
  let prevAsset: Asset | null = null;
  if (prevAssetInStage) {
    prevAsset = prevAssetInStage;
  } else if (isPrevStageAccessible && prevStage && prevStage.assets.length > 0) {
    prevAsset = prevStage.assets[prevStage.assets.length - 1];
  }

  // Get next asset (only in current stage, respecting stage boundaries)
  const nextAsset = nextAssetInStage;

  // Check if assets are accessible (simplified check - can be enhanced)
  // For now, allow navigation to previous assets and next assets in current stage
  const isPrevAccessible = prevAsset !== null;
  const isNextAccessible = nextAsset !== null;

  // Calculate stage progress
  const stageAssets = currentStage.assets.filter((a) => assetRequirements[a.number]);
  const completedInStage = stageAssets.filter((a) => completedAssets.has(a.number)).length;
  const stageProgress = stageAssets.length > 0 ? (completedInStage / stageAssets.length) * 100 : 0;

  return (
    <div className="bg-surface border border-border p-4 mb-6" style={{ borderRadius: 2 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href={`/venture/${ventureId}`} className="hover:text-accent transition-colors">
          Venture
        </Link>
        <span>/</span>
        <Link
          href={`/venture/${ventureId}/stage/${currentStage.number}`}
          className="hover:text-accent transition-colors"
        >
          {currentStage.title}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          Asset #{currentAssetNumber}: {currentAsset.title}
        </span>
      </div>

      {/* Stage Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted mb-1">
          <span>Stage Progress</span>
          <span>
            {completedInStage}/{stageAssets.length} assets complete
          </span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-2">
          <div
            className="bg-accent rounded-full h-2 transition-all duration-500"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {prevAsset ? (
            <Link
              href={`/venture/${ventureId}/asset/${prevAsset.number}`}
              className={`block p-3 border ${
                isPrevAccessible
                  ? "border-border hover:border-accent/30 bg-background"
                  : "border-border/50 bg-background/50 opacity-50 cursor-not-allowed"
              } transition-all`}
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Previous Asset</div>
              <div className="text-sm font-medium">
                Asset #{prevAsset.number}: {prevAsset.title}
              </div>
            </Link>
          ) : (
            <div className="p-3 border border-border/50 bg-background/50 opacity-50" style={{ borderRadius: 2 }}>
              <div className="text-xs text-muted">No previous asset</div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {nextAsset ? (
            <Link
              href={`/venture/${ventureId}/asset/${nextAsset.number}`}
              className={`block p-3 border ${
                isNextAccessible
                  ? "border-border hover:border-accent/30 bg-background"
                  : "border-border/50 bg-background/50 opacity-50 cursor-not-allowed"
              } transition-all text-right`}
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Next Asset</div>
              <div className="text-sm font-medium">
                Asset #{nextAsset.number}: {nextAsset.title}
              </div>
            </Link>
          ) : (
            <div className="p-3 border border-border/50 bg-background/50 opacity-50 text-right" style={{ borderRadius: 2 }}>
              <div className="text-xs text-muted">No next asset in current stage</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
