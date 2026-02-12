"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DiagnosisResult } from "@/app/actions/diagnosis";
import { getFellowDiagnosis } from "@/app/actions/diagnosis";

export default function VentureDiagnosis() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathwayExpanded, setPathwayExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getFellowDiagnosis();
        setDiagnosis(result);
      } catch (err) {
        console.error("Failed to load diagnosis:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="text-muted text-sm">Loading diagnosis...</div>
      </div>
    );
  }

  if (!diagnosis) {
    return null;
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDays = (days: number | null) => {
    if (days === null) return "N/A";
    if (days === 0) return "Ready now";
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""}`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) {
        return `${weeks} week${weeks !== 1 ? "s" : ""}`;
      }
      return `${weeks} week${weeks !== 1 ? "s" : ""}, ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
    }
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${months} month${months !== 1 ? "s" : ""}, ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with overall progress */}
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-uppercase mb-2">Pathway to Spinout</div>
            <h2 className="text-xl font-medium">{diagnosis.ventureName}</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-accent">
              {Math.round(diagnosis.overallProgress)}%
            </div>
            <div className="text-xs text-muted">
              {diagnosis.completedAssets}/{diagnosis.totalAssets} assets
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="w-full bg-border/50 h-3 mb-4" style={{ borderRadius: 2 }}>
          <div
            className="h-full bg-accent transition-all"
            style={{
              borderRadius: 2,
              width: `${diagnosis.overallProgress}%`,
            }}
          />
        </div>

        {/* Time to spinout */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-sm text-muted mb-1">Estimated Time to Spinout</div>
            <div className="text-lg font-medium">
              {formatDays(diagnosis.estimatedDaysToSpinout)}
            </div>
          </div>
          {diagnosis.estimatedSpinoutDate && (
            <div className="text-right">
              <div className="text-sm text-muted mb-1">Target Date</div>
              <div className="text-lg font-medium">
                {formatDate(diagnosis.estimatedSpinoutDate)}
              </div>
            </div>
          )}
        </div>

        {/* Velocity indicator */}
        {diagnosis.velocity.assetsPerWeek > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted">
              Current velocity: {diagnosis.velocity.assetsPerWeek.toFixed(1)} assets/week
              {diagnosis.velocity.lastCompletedAt && (
                <span className="ml-2">
                  (last completed: {formatDate(
                    typeof diagnosis.velocity.lastCompletedAt === "string"
                      ? new Date(diagnosis.velocity.lastCompletedAt)
                      : diagnosis.velocity.lastCompletedAt
                  )})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Critical Next Actions */}
      {diagnosis.criticalActions.length > 0 && (
        <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
          <div className="label-uppercase mb-4">Critical Next Actions</div>
          <div className="space-y-4">
            {diagnosis.criticalActions.map((action, idx) => {
              const priorityColors = {
                critical: "bg-red-100 text-red-800 border-red-300",
                high: "bg-orange-100 text-orange-800 border-orange-300",
                medium: "bg-blue-100 text-blue-800 border-blue-300",
              };

              return (
                <div
                  key={action.assetNumber}
                  className="bg-background p-4 border-l-4"
                  style={{
                    borderRadius: 2,
                    borderLeftColor:
                      action.priority === "critical"
                        ? "var(--red-600)"
                        : action.priority === "high"
                        ? "var(--orange-600)"
                        : "var(--blue-600)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 ${priorityColors[action.priority]}`}
                          style={{ borderRadius: 2 }}
                        >
                          {action.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted">
                          Stage {action.stageNumber}: {action.stageName}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">
                        Asset #{action.assetNumber}: {action.title}
                      </h3>
                      <p className="text-sm text-muted mb-2">{action.purpose}</p>
                      <p className="text-xs text-muted italic">{action.reason}</p>
                    </div>
                    {action.estimatedDays && (
                      <div className="text-right ml-4">
                        <div className="text-xs text-muted">Est.</div>
                        <div className="text-sm font-medium">
                          {action.estimatedDays} day{action.estimatedDays !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>

                  {action.blockers && action.blockers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs font-medium text-muted mb-1">Blockers:</div>
                      <ul className="text-xs text-muted list-disc list-inside">
                        {action.blockers.map((blocker, i) => (
                          <li key={i}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href={`/venture/${diagnosis.ventureId}/asset/${action.assetNumber}`}
                    className="inline-block mt-3 text-accent text-sm font-medium hover:underline"
                  >
                    Work on this asset →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pathway Visualization */}
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="label-uppercase">Your Pathway to Spinout</div>
          <button
            onClick={() => setPathwayExpanded(!pathwayExpanded)}
            className="text-xs text-accent hover:underline"
          >
            {pathwayExpanded ? "Collapse" : "Expand"} →
          </button>
        </div>
        <div className={`space-y-4 transition-all ${pathwayExpanded ? "" : "max-h-96 overflow-hidden"}`}>
          {diagnosis.pathway.map((stage, idx) => {
            const isPast = stage.isComplete;
            const isCurrent = stage.isCurrent;
            const isFuture = !isPast && !isCurrent;

            return (
              <div
                key={stage.stageNumber}
                className={`p-4 border-2 transition-all ${
                  isCurrent
                    ? "border-accent bg-accent/5"
                    : isPast
                    ? "border-green-200 bg-green-50"
                    : "border-border bg-background opacity-60"
                }`}
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isPast
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-accent text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isPast ? "✓" : stage.stageNumber}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Stage {stage.stageNumber}: {stage.stageName}
                      </h3>
                      <div className="text-xs text-muted">
                        {stage.completedAssets}/{stage.totalAssets} assets complete
                      </div>
                    </div>
                  </div>
                  {isCurrent && stage.estimatedDaysRemaining && (
                    <div className="text-right">
                      <div className="text-xs text-muted">Est. remaining</div>
                      <div className="text-sm font-medium">
                        {formatDays(stage.estimatedDaysRemaining)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage progress bar */}
                <div className="w-full bg-border/30 h-2 mt-2" style={{ borderRadius: 1 }}>
                  <div
                    className={`h-full transition-all ${
                      isPast ? "bg-green-500" : isCurrent ? "bg-accent" : "bg-gray-300"
                    }`}
                    style={{
                      borderRadius: 1,
                      width: `${stage.progress}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers (including outwith activities) */}
      {diagnosis.blockers.length > 0 && (
        <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
          <div className="label-uppercase mb-4">Blockers & Outwith Activities</div>
          <div className="space-y-3">
            {diagnosis.blockers.map((blocker, idx) => (
              <div
                key={idx}
                className={`p-4 border-l-4 ${
                  blocker.type === "outwith"
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-red-50 border-red-400"
                }`}
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start gap-2">
                  <div className="text-lg">
                    {blocker.type === "outwith" ? "⚠️" : "🚫"}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted mb-1 uppercase">
                      {blocker.type === "outwith" ? "Outwith Activity" : "Blocker"}
                    </div>
                    <p className="text-sm font-medium mb-1">{blocker.description}</p>
                    <p className="text-xs text-muted">{blocker.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
