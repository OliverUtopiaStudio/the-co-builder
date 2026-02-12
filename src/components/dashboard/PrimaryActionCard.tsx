"use client";

import Link from "next/link";
import type { CriticalAction } from "@/app/actions/diagnosis";

interface PrimaryActionCardProps {
  action: CriticalAction;
  ventureId: string;
  completedCount: number;
  totalCount: number;
}

export default function PrimaryActionCard({
  action,
  ventureId,
  completedCount,
  totalCount,
}: PrimaryActionCardProps) {
  const priorityEmoji = {
    critical: "🔴",
    high: "🟠",
    medium: "🔵",
  };

  const priorityColors = {
    critical: "border-red-300 bg-red-50/50",
    high: "border-orange-300 bg-orange-50/50",
    medium: "border-blue-300 bg-blue-50/50",
  };

  // Extract downstream connections from reason
  const downstreamMatches = action.reason.match(/Asset #(\d+)/g);
  const downstreamAssets = downstreamMatches
    ? downstreamMatches.map((m) => m.replace("Asset #", ""))
    : [];

  return (
    <div
      className={`bg-surface border-2 ${priorityColors[action.priority]} p-6`}
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{priorityEmoji[action.priority]}</span>
            <div className="label-uppercase text-xs">Your Next Action</div>
          </div>
          <h2 className="text-2xl font-semibold mb-1">
            Asset #{action.assetNumber}: {action.title}
          </h2>
          <p className="text-muted text-sm mb-1">
            Stage {action.stageNumber}: {action.stageName}
          </p>
          <p className="text-muted text-sm italic mb-4">{action.purpose}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-xs text-muted mb-1">Progress</div>
          <div className="text-lg font-medium text-accent">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      <div className="bg-background p-4 mb-4" style={{ borderRadius: 2 }}>
        <div className="text-sm font-medium mb-2">Why this matters:</div>
        <ul className="space-y-1 text-sm text-foreground">
          {downstreamAssets.length > 0 && (
            <li>
              → Builds evidence base for Asset #{downstreamAssets[0]}
            </li>
          )}
          {action.reason.includes("required before") && (
            <li>
              → Required before {action.stageName.includes("Stage") ? action.stageName : `Stage ${action.stageNumber}`}
            </li>
          )}
          {action.reason.includes("unlocks") && (
            <li>
              → {action.reason.split("unlocks")[1]?.trim() || "Unlocks next stage"}
            </li>
          )}
          {!downstreamAssets.length && !action.reason.includes("required") && (
            <li>→ {action.reason}</li>
          )}
        </ul>
        {action.estimatedDays && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted">Estimated time:</div>
            <div className="text-sm font-medium">
              {action.estimatedDays} day{action.estimatedDays !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/venture/${ventureId}/asset/${action.assetNumber}`}
          className="flex-1 px-6 py-3 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors text-center"
          style={{ borderRadius: 2 }}
        >
          Start Working on Asset #{action.assetNumber} →
        </Link>
        <Link
          href={`/venture/${ventureId}`}
          className="px-4 py-3 border border-border text-sm font-medium hover:border-accent/30 transition-colors"
          style={{ borderRadius: 2 }}
        >
          View Full Pathway
        </Link>
      </div>
    </div>
  );
}
