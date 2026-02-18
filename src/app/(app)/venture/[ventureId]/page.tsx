"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";
import { allWorkflows, getTotalRequiredQuestions } from "@/lib/questions";
import { getAssetRequirementsForVenture } from "@/app/actions/ventures";
import DriveFiles from "@/components/google-drive/DriveFiles";
import VentureConnectionsDisplay from "@/components/connections/VentureConnections";
import { useVenture } from "@/lib/hooks/use-fellow-ventures";

interface ResponseRow {
  asset_number: number;
  question_id: string;
}

interface CompletionRow {
  asset_number: number;
  is_complete: boolean;
}

export default function VentureOverviewPage() {
  const { ventureId } = useParams<{ ventureId: string }>();
  const ventureQuery = useVenture(ventureId ?? null);
  const venture = ventureQuery.data ?? null;

  const [responseCounts, setResponseCounts] = useState<Record<number, number>>({});
  const [completions, setCompletions] = useState<Record<number, boolean>>({});
  const [requirements, setRequirements] = useState<Record<number, boolean>>({});
  const [progressLoading, setProgressLoading] = useState(true);

  // Load responses, completions, requirements (venture itself is cached via useVenture)
  useEffect(() => {
    if (!ventureId) return;
    let cancelled = false;
    async function loadProgress() {
      try {
        const supabase = createClient();
        const [respRes, compRes, reqRes] = await Promise.all([
          supabase
            .from("responses")
            .select("asset_number, question_id")
            .eq("venture_id", ventureId),
          supabase
            .from("asset_completion")
            .select("asset_number, is_complete")
            .eq("venture_id", ventureId),
          getAssetRequirementsForVenture(ventureId).catch(() => ({})),
        ]);

        if (cancelled) return;
        const respData = respRes.data;
        if (respData) {
          const counts: Record<number, number> = {};
          respData.forEach((r: ResponseRow) => {
            counts[r.asset_number] = (counts[r.asset_number] || 0) + 1;
          });
          setResponseCounts(counts);
        }
        const compData = compRes.data;
        if (compData) {
          const comps: Record<number, boolean> = {};
          compData.forEach((c: CompletionRow) => {
            comps[c.asset_number] = c.is_complete;
          });
          setCompletions(comps);
        }
        setRequirements(reqRes as Record<number, boolean>);
      } catch (err) {
        if (!cancelled) console.error("Failed to load venture progress:", err);
      } finally {
        if (!cancelled) setProgressLoading(false);
      }
    }
    loadProgress();
    return () => { cancelled = true; };
  }, [ventureId]);

  const loadingVenture = ventureQuery.isLoading && !venture;

  if (loadingVenture) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading venture...</div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Venture not found</h2>
        <Link href="/dashboard" className="text-accent text-sm hover:underline mt-2 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate overall progress
  const totalAssets = allWorkflows.length;
  const completedAssets = Object.values(completions).filter(Boolean).length;
  const overallPercent = totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0;

  // Determine "working edge" — the earliest stage with incomplete assets
  const workingEdgeStageId = stages.find((stage) =>
    stage.assets.some((a) => !completions[a.number])
  )?.id || null;

  return (
    <div className="space-y-6">
      {/* Header — shown immediately from cache when navigating back */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium">{venture.name}</h1>
            {venture.description && (
              <p className="text-muted mt-1">{venture.description}</p>
            )}
          </div>
          {venture.industry && (
            <span className="text-xs px-2 py-1 bg-accent/10 text-accent font-medium" style={{ borderRadius: 2 }}>
              {venture.industry}
            </span>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <VentureConnectionsDisplay ventureId={venture.id} />

      {/* Google Drive Files */}
      <DriveFiles ventureId={venture.id} googleDriveUrl={venture.googleDriveUrl} />

      {/* Overall Progress — may still be loading when venture is from cache */}
      {progressLoading ? (
        <div className="bg-surface border border-border p-5 flex items-center gap-3" style={{ borderRadius: 2 }}>
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" aria-hidden />
          <span className="text-sm text-muted">Loading progress…</span>
        </div>
      ) : (
        <>
      <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted">
            {completedAssets}/{totalAssets} assets complete
          </span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-3">
          <div
            className="bg-accent rounded-full h-3 transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-muted">{overallPercent}%</span>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const stageAssets = stage.assets;
          const stageCompleted = stageAssets.filter(
            (a) => completions[a.number]
          ).length;
          const stageTotal = stageAssets.length;
          const stagePercent =
            stageTotal > 0
              ? Math.round((stageCompleted / stageTotal) * 100)
              : 0;
          const isWorkingEdge = stage.id === workingEdgeStageId;

          return (
            <div
              key={stage.id}
              className={`bg-surface border overflow-hidden ${
                isWorkingEdge ? "border-accent/40" : "border-border"
              }`}
              style={{ borderRadius: 2 }}
            >
              {/* Stage header */}
              <div className={`p-5 border-b ${isWorkingEdge ? "border-accent/20" : "border-border"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium ${
                      stagePercent === 100
                        ? "bg-accent text-white"
                        : isWorkingEdge
                        ? "bg-accent text-white"
                        : "bg-accent/10 text-accent"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {stagePercent === 100 ? "✓" : stage.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{stage.title}</h3>
                      {isWorkingEdge && (
                        <span
                          className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-accent/10 text-accent"
                          style={{ borderRadius: 2 }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">{stage.subtitle}</p>
                  </div>
                  <span className="text-sm text-muted">
                    {stageCompleted}/{stageTotal}
                  </span>
                </div>
                <div className="w-full bg-border/50 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-accent rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${stagePercent}%` }}
                  />
                </div>
                {/* Stage narrative — only for working edge */}
                {isWorkingEdge && (
                  <p className="text-xs text-muted mt-3 leading-relaxed">{stage.description}</p>
                )}
              </div>

              {/* Assets */}
              <div className="divide-y divide-border">
                {stageAssets.map((asset) => {
                  const workflow = allWorkflows.find(
                    (w) => w.assetNumber === asset.number
                  );
                  const totalQ = workflow
                    ? getTotalRequiredQuestions(workflow)
                    : 0;
                  const answeredQ = responseCounts[asset.number] || 0;
                  const isComplete = completions[asset.number] || false;
                  const hasStarted = answeredQ > 0;
                  // Default to required if not specified in requirements map
                  const isOptional = requirements[asset.number] === false;

                  return (
                    <Link
                      key={asset.number}
                      href={`/venture/${ventureId}/asset/${asset.number}`}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-background/50 transition-colors ${
                        isOptional && !isComplete && !hasStarted ? "opacity-70" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${
                          isComplete
                            ? "bg-accent text-white"
                            : hasStarted
                            ? "bg-accent/10 text-accent"
                            : "bg-border/50 text-muted"
                        }`}
                        style={{ borderRadius: 2 }}
                      >
                        {isComplete ? "✓" : `#${asset.number}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm truncate">
                            {asset.title}
                          </span>
                          {isOptional && (
                            <span className="text-[9px] font-medium px-1 py-0.5 bg-border/50 text-muted flex-shrink-0" style={{ borderRadius: 2 }}>
                              Optional
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {asset.purpose}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isComplete ? (
                          <span className="text-xs px-2 py-1 bg-accent/10 text-accent font-medium" style={{ borderRadius: 2 }}>
                            Complete
                          </span>
                        ) : hasStarted ? (
                          <span className="text-xs px-2 py-1 bg-gold/10 text-gold font-medium" style={{ borderRadius: 2 }}>
                            In Progress
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-border/50 text-muted" style={{ borderRadius: 2 }}>
                            Start
                          </span>
                        )}
                        <span className="text-xs text-muted">
                          {answeredQ}/{totalQ}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
