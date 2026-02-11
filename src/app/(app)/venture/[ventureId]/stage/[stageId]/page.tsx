"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";
import { allWorkflows, getTotalRequiredQuestions } from "@/lib/questions";

interface ResponseRow {
  asset_number: number;
  question_id: string;
}

interface CompletionRow {
  asset_number: number;
  is_complete: boolean;
}

export default function StageDetailPage() {
  const { ventureId, stageId } = useParams<{
    ventureId: string;
    stageId: string;
  }>();
  const stage = stages.find((s) => s.id === stageId);
  const [responseCounts, setResponseCounts] = useState<Record<number, number>>({});
  const [completions, setCompletions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!stage) return;
      try {
        const supabase = createClient();
        const assetNumbers = stage.assets.map((a) => a.number);

        const { data: respData } = await supabase
          .from("responses")
          .select("asset_number, question_id")
          .eq("venture_id", ventureId)
          .in("asset_number", assetNumbers);

        if (respData) {
          const counts: Record<number, number> = {};
          respData.forEach((r: ResponseRow) => {
            counts[r.asset_number] = (counts[r.asset_number] || 0) + 1;
          });
          setResponseCounts(counts);
        }

        const { data: compData } = await supabase
          .from("asset_completion")
          .select("asset_number, is_complete")
          .eq("venture_id", ventureId)
          .in("asset_number", assetNumbers);

        if (compData) {
          const comps: Record<number, boolean> = {};
          compData.forEach((c: CompletionRow) => {
            comps[c.asset_number] = c.is_complete;
          });
          setCompletions(comps);
        }
      } catch (err) {
        console.error("Failed to load stage:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ventureId, stageId, stage]);

  if (!stage) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Stage not found</h2>
        <Link
          href={`/venture/${ventureId}`}
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Venture
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading stage...</div>
      </div>
    );
  }

  const stageCompleted = stage.assets.filter(
    (a) => completions[a.number]
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/venture/${ventureId}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          ← Venture Overview
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/10 flex items-center justify-center text-xl font-medium text-accent" style={{ borderRadius: 2 }}>
            {stage.number}
          </div>
          <div>
            <h1 className="text-2xl font-medium">{stage.title}</h1>
            <p className="text-muted">{stage.subtitle}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted">{stage.description}</p>

      {/* Progress */}
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Stage Progress</span>
          <span className="text-sm text-muted">
            {stageCompleted}/{stage.assets.length} assets complete
          </span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-2">
          <div
            className="bg-accent rounded-full h-2 transition-all duration-500"
            style={{
              width: `${
                stage.assets.length > 0
                  ? Math.round(
                      (stageCompleted / stage.assets.length) * 100
                    )
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Assets */}
      <div className="space-y-3">
        {stage.assets.map((asset) => {
          const workflow = allWorkflows.find(
            (w) => w.assetNumber === asset.number
          );
          const totalQ = workflow ? getTotalRequiredQuestions(workflow) : 0;
          const answeredQ = responseCounts[asset.number] || 0;
          const isComplete = completions[asset.number] || false;
          const hasStarted = answeredQ > 0;

          return (
            <Link
              key={asset.number}
              href={`/venture/${ventureId}/asset/${asset.number}`}
              className="block bg-surface border border-border p-5 hover:border-accent/30 hover:shadow-md transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-sm font-medium shrink-0 ${
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{asset.title}</h3>
                    {isComplete ? (
                      <span className="text-xs px-2 py-1 bg-accent/10 text-accent font-medium shrink-0" style={{ borderRadius: 2 }}>
                        Complete
                      </span>
                    ) : hasStarted ? (
                      <span className="text-xs px-2 py-1 bg-gold/10 text-gold font-medium shrink-0" style={{ borderRadius: 2 }}>
                        In Progress
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-border/50 text-muted shrink-0" style={{ borderRadius: 2 }}>
                        Not Started
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">{asset.purpose}</p>
                  {asset.coreQuestion && (
                    <p className="text-xs text-accent mt-2 italic">
                      &ldquo;{asset.coreQuestion}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 bg-border/50 rounded-full h-1.5">
                      <div
                        className="bg-accent rounded-full h-1.5 transition-all duration-300"
                        style={{
                          width: `${
                            totalQ > 0
                              ? Math.min(
                                  100,
                                  Math.round((answeredQ / totalQ) * 100)
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted shrink-0">
                      {answeredQ}/{totalQ}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gate Decision */}
      <div className="bg-gold/5 border border-gold/20 p-5" style={{ borderRadius: 2 }}>
        <div className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
          Gate Decision
        </div>
        <p className="text-sm">{stage.gateDecision}</p>
      </div>
    </div>
  );
}
