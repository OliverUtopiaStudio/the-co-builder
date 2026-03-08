"use client";

import type { DiagnosisResult } from "@/app/actions/diagnosis";

const STAGE_LABELS: Record<string, string> = {
  "00": "Invention Gate",
  "01": "Problem Deep Dive",
  "02": "Customer & Validation",
  "03": "Solution Design",
  "04": "Build & Test",
  "05": "Launch",
  "06": "Spinout",
};

export default function ProgressHeader({
  fellowName,
  ventureName,
  diagnosis,
}: {
  fellowName: string;
  ventureName: string;
  diagnosis: DiagnosisResult | null;
}) {
  const stageLabel = diagnosis?.currentStage
    ? STAGE_LABELS[diagnosis.currentStage] ?? `Stage ${diagnosis.currentStage}`
    : "—";
  const completed = diagnosis?.completedAssets ?? 0;
  const total = diagnosis?.totalAssets ?? 27;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const weeks =
    diagnosis?.estimatedDaysToSpinout != null
      ? Math.ceil(diagnosis.estimatedDaysToSpinout / 7)
      : null;

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-medium">Welcome back, {fellowName}</h1>
      <p className="text-muted text-sm mt-1">
        {ventureName}
        {diagnosis?.currentStage != null && (
          <>
            {" · "}
            <span className="text-accent font-medium">
              Stage {diagnosis.currentStage}: {stageLabel}
            </span>
          </>
        )}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-2 flex-1 min-w-[120px] max-w-[240px] bg-border/50 overflow-hidden"
            style={{ borderRadius: 2 }}
          >
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${pct}%`, borderRadius: 2 }}
            />
          </div>
          <span className="text-sm text-muted shrink-0">
            {completed}/{total} assets · {pct}%
          </span>
        </div>
        {weeks != null && weeks > 0 && (
          <span className="text-sm text-muted">
            Est. {weeks} {weeks === 1 ? "week" : "weeks"} to spinout
          </span>
        )}
      </div>
    </div>
  );
}
