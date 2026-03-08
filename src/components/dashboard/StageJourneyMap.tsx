"use client";

import type { PathwayStage } from "@/app/actions/diagnosis";

export default function StageJourneyMap({
  pathway,
}: {
  pathway: PathwayStage[];
}) {
  if (!pathway.length) return null;

  return (
    <div
      className="bg-surface border border-border p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase text-[10px] mb-4 text-muted">
        Your journey
      </div>
      <div className="space-y-3">
        {pathway.map((stage) => (
          <div
            key={stage.stageNumber}
            className={`flex items-center gap-3 ${
              stage.isCurrent ? "text-foreground" : "text-muted"
            }`}
          >
            <div className="w-24 shrink-0 text-xs font-medium">
              Stage {stage.stageNumber}
            </div>
            <div
              className="h-1.5 flex-1 min-w-0 max-w-[140px] bg-border/50 overflow-hidden"
              style={{ borderRadius: 2 }}
            >
              <div
                className="h-full bg-accent transition-all"
                style={{
                  width: `${stage.progress}%`,
                  borderRadius: 2,
                }}
              />
            </div>
            <div className="flex gap-0.5 shrink-0">
              {Array.from({ length: stage.totalAssets }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-4 h-4 border text-[10px] flex items-center justify-center ${
                    i < stage.completedAssets
                      ? "bg-accent border-accent text-white"
                      : "border-border bg-background"
                  }`}
                  style={{ borderRadius: 2 }}
                  title={
                    i < stage.completedAssets ? "Complete" : "Not started"
                  }
                >
                  {i < stage.completedAssets ? "✓" : ""}
                </span>
              ))}
            </div>
            {stage.isCurrent && (
              <span className="text-[10px] text-accent font-medium shrink-0">
                ← you
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
