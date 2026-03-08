"use client";

import type { PathwayStage } from "@/app/actions/diagnosis";

export default function StageJourneyMap({
  pathway,
  embedded,
}: {
  pathway: PathwayStage[];
  /** When true, omit outer card and "Your journey" label (e.g. inside TailoredCoBuild) */
  embedded?: boolean;
}) {
  if (!pathway.length) return null;

  const content = (
    <div className="space-y-3">
        {pathway.map((stage) => (
          <div
            key={stage.stageNumber}
            className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 ${
              stage.isCurrent ? "text-foreground" : "text-muted"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-14 sm:w-24 shrink-0 text-xs font-medium">
                Stage {stage.stageNumber}
              </div>
              <div
                className="h-1.5 flex-1 min-w-0 max-w-[120px] sm:max-w-[140px] bg-border/50 overflow-hidden"
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
              {stage.isCurrent && (
                <span className="text-[10px] text-accent font-medium shrink-0">
                  ← you
                </span>
              )}
            </div>
            <div className="flex gap-0.5 overflow-x-auto pb-1 sm:pb-0 sm:overflow-visible shrink-0 min-w-0">
              {Array.from({ length: stage.totalAssets }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 border text-[8px] sm:text-[10px] flex items-center justify-center flex-shrink-0 ${
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
          </div>
        ))}
      </div>
  );

  if (embedded) return content;

  return (
    <div
      className="bg-surface border border-border p-4 sm:p-5 overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase text-[10px] mb-4 text-muted">
        Your journey
      </div>
      {content}
    </div>
  );
}
