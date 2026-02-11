"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";

interface VentureDetail {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  current_stage: string | null;
  google_drive_url: string | null;
  created_at: string;
}

interface FellowInfo {
  full_name: string;
  email: string;
}

interface Response {
  asset_number: number;
  question_id: string;
  value: unknown;
}

interface Completion {
  asset_number: number;
  is_complete: boolean;
}

export default function AdminVentureDetailPage() {
  const params = useParams();
  const ventureId = params.ventureId as string;
  const [venture, setVenture] = useState<VentureDetail | null>(null);
  const [fellow, setFellow] = useState<FellowInfo | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // Fetch venture
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("*")
          .eq("id", ventureId)
          .single();

        if (!ventureData) return;
        setVenture(ventureData);

        // Fetch fellow
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("full_name, email")
          .eq("id", ventureData.fellow_id)
          .single();

        if (fellowData) setFellow(fellowData);

        // Fetch responses
        const { data: responseData } = await supabase
          .from("responses")
          .select("asset_number, question_id, value")
          .eq("venture_id", ventureId);

        if (responseData) setResponses(responseData);

        // Fetch completions
        const { data: completionData } = await supabase
          .from("asset_completion")
          .select("asset_number, is_complete")
          .eq("venture_id", ventureId);

        if (completionData) setCompletions(completionData);
      } catch (err) {
        console.error("Failed to load venture:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ventureId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading venture details...</div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Venture not found.</p>
      </div>
    );
  }

  const completionMap = new Map(completions.map((c) => [c.asset_number, c.is_complete]));
  const responsesByAsset = new Map<number, number>();
  responses.forEach((r) => {
    responsesByAsset.set(r.asset_number, (responsesByAsset.get(r.asset_number) || 0) + 1);
  });

  const totalCompleted = completions.filter((c) => c.is_complete).length;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/admin/fellows" className="text-sm text-muted hover:text-foreground">
        ← Back to Fellows
      </Link>

      {/* Venture Header */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{venture.name}</h1>
            {venture.description && <p className="text-muted mt-1">{venture.description}</p>}
            <div className="flex items-center gap-3 mt-3">
              {venture.industry && (
                <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  {venture.industry}
                </span>
              )}
              <span className="text-xs text-muted">Stage {venture.current_stage || "00"}</span>
            </div>
            {fellow && (
              <p className="text-sm text-muted mt-3">
                Fellow: <span className="text-foreground font-medium">{fellow.full_name}</span> ({fellow.email})
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{totalCompleted}/27</div>
            <div className="text-sm text-muted">assets complete</div>
            {venture.google_drive_url && (
              <a
                href={venture.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline mt-2 inline-block"
              >
                Google Drive Folder
              </a>
            )}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="w-full bg-border rounded-full h-2.5">
            <div
              className="bg-accent rounded-full h-2.5 transition-all"
              style={{ width: `${(totalCompleted / 27) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stages and Assets */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const stageCompleted = stage.assets.filter((a) => completionMap.get(a.number)).length;

          return (
            <div key={stage.id} className="bg-surface border border-border rounded-xl">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                      {stage.number}
                    </div>
                    <div>
                      <h3 className="font-semibold">{stage.title}</h3>
                      <p className="text-xs text-muted">{stage.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted">
                    {stageCompleted}/{stage.assets.length} complete
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {stage.assets.map((asset) => {
                  const isComplete = completionMap.get(asset.number) || false;
                  const answerCount = responsesByAsset.get(asset.number) || 0;

                  return (
                    <div key={asset.number} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isComplete
                              ? "bg-accent text-white"
                              : answerCount > 0
                              ? "bg-gold/10 text-gold"
                              : "bg-background text-muted"
                          }`}
                        >
                          {isComplete ? "✓" : asset.number}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{asset.title}</div>
                          <div className="text-xs text-muted">{asset.purpose}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted">{answerCount} responses</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            isComplete
                              ? "bg-accent/10 text-accent"
                              : answerCount > 0
                              ? "bg-gold/10 text-gold"
                              : "bg-background text-muted"
                          }`}
                        >
                          {isComplete ? "Complete" : answerCount > 0 ? "In Progress" : "Not Started"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
