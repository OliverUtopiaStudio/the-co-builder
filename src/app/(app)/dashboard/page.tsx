"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";
import { getMyStipendStatus } from "@/app/actions/stipends";
import { getFellowDiagnosis, type DiagnosisResult } from "@/app/actions/diagnosis";
import VentureDiagnosis from "@/components/diagnosis/VentureDiagnosis";
import PrimaryActionCard from "@/components/dashboard/PrimaryActionCard";
import TodaysFocus from "@/components/dashboard/TodaysFocus";
import StudioActivityFeed from "@/components/dashboard/StudioActivityFeed";
import { useFellow, useVentures, type Venture } from "@/lib/hooks/use-fellow-ventures";

interface NextAssetInfo {
  number: number;
  title: string;
  purpose: string;
  ventureId: string;
  stageName: string;
  stageNumber: string;
  feedsInto: string | null;
  coreQuestion: string | null;
  completedCount: number;
  totalCount: number;
}

interface StipendMilestone {
  id: string;
  milestoneNumber: number;
  title: string;
  description: string | null;
  amount: number;
  milestoneMet: Date | string | null;
  paymentReleased: Date | string | null;
}

interface StipendStatus {
  myMilestones: StipendMilestone[];
  totalBudget: number;
  computeBudget: number;
}

/**
 * Look up asset info from the stages data structure by asset number.
 * Returns enriched data including stage context and downstream connections.
 */
function getAssetInfo(assetNumber: number) {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) {
        return {
          number: asset.number,
          title: asset.title,
          purpose: asset.purpose,
          stageName: stage.title,
          stageNumber: stage.number,
          feedsInto: asset.feedsInto || null,
          coreQuestion: asset.coreQuestion || null,
        };
      }
    }
  }
  return null;
}

/**
 * Get all asset numbers in order from the stages data.
 */
function getAllAssetNumbers(): number[] {
  const numbers: number[] = [];
  for (const stage of stages) {
    for (const asset of stage.assets) {
      numbers.push(asset.number);
    }
  }
  return numbers.sort((a, b) => a - b);
}

export default function DashboardPage() {
  const router = useRouter();
  const fellowQuery = useFellow();
  const fellowId = fellowQuery.data?.id ?? null;
  const venturesQuery = useVentures(fellowId);
  const fellow = fellowQuery.data ?? null;
  const ventures = venturesQuery.data ?? [];

  const [nextAsset, setNextAsset] = useState<NextAssetInfo | null>(null);
  const [allComplete, setAllComplete] = useState(false);
  const [stipendStatus, setStipendStatus] = useState<StipendStatus | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // Redirect to onboarding when lifecycle_stage is "onboarding"
  useEffect(() => {
    if (!fellow) return;
    if (fellow.lifecycleStage === "onboarding") {
      router.push("/onboarding");
    }
  }, [fellow, router]);

  // Load stipend, diagnosis, and next-asset when we have ventures (cached or fresh)
  useEffect(() => {
    let cancelled = false;
    if (ventures.length === 0) {
      setStipendStatus(null);
      setDiagnosis(null);
      return;
    }
    const activeVenture = ventures[0];
    async function loadSecondary() {
      try {
        const [stipendResult, diagnosisResult] = await Promise.all([
          getMyStipendStatus().catch(() => null),
          getFellowDiagnosis().catch(() => null),
        ]);
        if (cancelled) return;
        if (stipendResult) {
          setStipendStatus({
            myMilestones: stipendResult.myMilestones as StipendMilestone[],
            totalBudget: stipendResult.totalBudget,
            computeBudget: stipendResult.computeBudget,
          });
        } else {
          setStipendStatus(null);
        }
        if (diagnosisResult) setDiagnosis(diagnosisResult);
      } catch (err) {
        if (!cancelled) console.error("Failed to load dashboard secondary data:", err);
      }

      const supabase = createClient();
      const { data: completions } = await supabase
        .from("asset_completion")
        .select("asset_number, is_complete")
        .eq("venture_id", activeVenture.id)
        .eq("is_complete", true);
      if (cancelled) return;

      const completedNumbers = new Set(
        (completions || []).map((c: { asset_number: number }) => c.asset_number)
      );
      const allNumbers = getAllAssetNumbers();
      const nextNumber = allNumbers.find((n) => !completedNumbers.has(n));
      if (nextNumber) {
        const info = getAssetInfo(nextNumber);
        if (info)
          setNextAsset({
            ...info,
            ventureId: activeVenture.id,
            completedCount: completedNumbers.size,
            totalCount: allNumbers.length,
          });
      } else {
        setAllComplete(true);
      }
    }
    loadSecondary();
    return () => { cancelled = true; };
  }, [ventures]);

  const loading =
    fellowQuery.isLoading ||
    (!!fellowId && venturesQuery.isLoading && ventures.length === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Dashboard</div>
        <h1 className="text-2xl font-medium">
          Welcome{fellow ? `, ${fellow.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted text-sm mt-1">
          Build your AI venture through the 27-asset Co-Build framework
        </p>
      </div>

      {/* Primary Action Card - Most Prominent */}
      {diagnosis && diagnosis.criticalActions.length > 0 && ventures.length > 0 && (
        <PrimaryActionCard
          action={diagnosis.criticalActions[0]}
          ventureId={diagnosis.ventureId}
          completedCount={diagnosis.completedAssets}
          totalCount={diagnosis.totalAssets}
          experienceProfile={fellow?.experienceProfile ?? null}
        />
      )}

      {/* Today's Focus Section */}
      {ventures.length > 0 && (
        <TodaysFocus
          diagnosis={diagnosis}
          ventureId={ventures[0]?.id || null}
          experienceProfile={fellow?.experienceProfile ?? null}
        />
      )}

      {/* Studio Team Activity Feed */}
      {ventures.length > 0 && <StudioActivityFeed />}

      {/* Comprehensive Diagnosis Feature */}
      {ventures.length > 0 && <VentureDiagnosis />}

      {/* Stipend & Compute */}
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="label-uppercase mb-3">Stipend &amp; Compute</div>
        <div
          className="border-t border-border mt-1 mb-4"
          style={{ borderColor: "var(--border)" }}
        />

        {/* Cash Stipend */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-1">Cash Stipend</h3>
          <p className="text-muted text-sm mb-4">
            $5,000 total ($2,500 &times; 2 milestones)
          </p>

          {stipendStatus && stipendStatus.myMilestones.length > 0 ? (
            <div className="space-y-3">
              {stipendStatus.myMilestones.map((milestone) => {
                let statusLabel: string;
                let statusClass: string;
                if (milestone.paymentReleased) {
                  statusLabel = "Released";
                  statusClass = "bg-green-100 text-green-800";
                } else if (milestone.milestoneMet) {
                  statusLabel = "Met";
                  statusClass = "bg-accent/10 text-accent";
                } else {
                  statusLabel = "Pending";
                  statusClass = "bg-gray-100 text-gray-600";
                }

                return (
                  <div
                    key={milestone.id}
                    className="flex items-start justify-between bg-background p-4"
                    style={{ borderRadius: 2 }}
                  >
                    <div>
                      <div className="font-medium text-sm">
                        Milestone {milestone.milestoneNumber}: {milestone.title}
                      </div>
                      {milestone.milestoneMet && (
                        <div className="text-muted text-xs mt-1">
                          Met: {new Date(milestone.milestoneMet).toLocaleDateString()}
                        </div>
                      )}
                      {milestone.paymentReleased && (
                        <div className="text-muted text-xs mt-0.5">
                          Released: {new Date(milestone.paymentReleased).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 ${statusClass}`}
                      style={{ borderRadius: 2 }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-background p-4 text-sm text-muted" style={{ borderRadius: 2 }}>
              Your stipend milestones haven&apos;t been set up yet. Your studio team will configure these.
            </div>
          )}
        </div>

        {/* Compute Budget */}
        <div>
          <h3 className="text-lg font-medium mb-1">Compute Budget</h3>
          <p className="text-muted text-sm">
            Your compute budget is $4,000 for tools and infrastructure.
          </p>
          <Link
            href="/onboarding"
            className="inline-block text-accent text-sm font-medium mt-2 hover:underline"
          >
            See your onboarding for the recommended allocation &rarr;
          </Link>
        </div>
      </div>

      {/* Ventures */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="label-uppercase">Your Ventures</div>
          <Link
            href="/venture/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            + New Venture
          </Link>
        </div>

        {ventures.length === 0 ? (
          <div className="bg-surface border border-border p-12 text-center" style={{ borderRadius: 2 }}>
            <div className="label-uppercase mb-4">Get Started</div>
            <h3 className="text-lg font-medium mb-2">Start Your First Venture</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Create a venture to begin working through the Co-Build framework.
              You&apos;ll complete 27 assets across 7 stages — from invention to spinout.
            </p>
            <Link
              href="/venture/new"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Create Your Venture →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {ventures.map((venture) => (
              <Link
                key={venture.id}
                href={`/venture/${venture.id}`}
                className="block bg-surface border border-border p-5 hover:border-accent/30 transition-all"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{venture.name}</h3>
                    {venture.description && (
                      <p className="text-muted text-sm mt-1 line-clamp-2">
                        {venture.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {venture.industry && (
                        <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent font-medium" style={{ borderRadius: 2 }}>
                          {venture.industry}
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        Stage {venture.currentStage || "00"}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Framework Overview */}
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="label-uppercase mb-3">Framework Overview</div>
        <h2 className="text-lg font-medium mb-1">The Co-Build Framework</h2>
        <p className="text-muted text-sm mb-5">
          27 sequenced assets across 13 stages, grouped into 7 phases. Each asset is an
          action-based workflow with specific questions and deliverables.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { value: "27", label: "Assets" },
            { value: "7", label: "Stages" },
            { value: "13", label: "Gates" },
            { value: "1", label: "Spinout" },
          ].map((stat) => (
            <div key={stat.label} className="bg-background p-3" style={{ borderRadius: 2 }}>
              <div className="text-2xl font-medium text-accent">{stat.value}</div>
              <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
