"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";

interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  createdAt: string;
}

interface FellowProfile {
  fullName: string;
  email: string;
  lifecycleStage: string;
}

interface NextAssetInfo {
  number: number;
  title: string;
  purpose: string;
  ventureId: string;
}

/**
 * Look up asset info from the stages data structure by asset number.
 */
function getAssetInfo(assetNumber: number) {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) {
        return { number: asset.number, title: asset.title, purpose: asset.purpose };
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
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [fellow, setFellow] = useState<FellowProfile | null>(null);
  const [nextAsset, setNextAsset] = useState<NextAssetInfo | null>(null);
  const [allComplete, setAllComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch fellow profile including lifecycle_stage
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("id, full_name, email, lifecycle_stage")
          .eq("auth_user_id", user.id)
          .single();

        if (!fellowData) return;

        // Redirect to onboarding if lifecycle_stage is "onboarding"
        if (fellowData.lifecycle_stage === "onboarding") {
          router.push("/onboarding");
          return;
        }

        setFellow({
          fullName: fellowData.full_name,
          email: fellowData.email,
          lifecycleStage: fellowData.lifecycle_stage,
        });

        const fellowId = fellowData.id;

        // Fetch ventures
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("*")
          .eq("fellow_id", fellowId)
          .order("created_at", { ascending: false });

        if (ventureData) {
          const mapped = ventureData.map((v: Record<string, unknown>) => ({
            id: v.id as string,
            name: v.name as string,
            description: v.description as string | null,
            industry: v.industry as string | null,
            currentStage: v.current_stage as string | null,
            createdAt: v.created_at as string,
          }));
          setVentures(mapped);

          // Determine "next asset" for the first (most recent) venture
          if (mapped.length > 0) {
            const activeVenture = mapped[0];

            const { data: completions } = await supabase
              .from("asset_completion")
              .select("asset_number, is_complete")
              .eq("venture_id", activeVenture.id)
              .eq("is_complete", true);

            const completedNumbers = new Set(
              (completions || []).map((c: { asset_number: number }) => c.asset_number)
            );

            const allNumbers = getAllAssetNumbers();

            // Find the first asset number not in the completed set
            const nextNumber = allNumbers.find((n) => !completedNumbers.has(n));

            if (nextNumber) {
              const info = getAssetInfo(nextNumber);
              if (info) {
                setNextAsset({
                  ...info,
                  ventureId: activeVenture.id,
                });
              }
            } else {
              // All assets are complete
              setAllComplete(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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

      {/* What to work on next */}
      {ventures.length > 0 && (
        <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
          <div className="label-uppercase mb-3">Next Step</div>
          <div
            className="border-t border-border mt-1 mb-4"
            style={{ borderColor: "var(--border)" }}
          />
          {allComplete ? (
            <div>
              <h3 className="text-lg font-medium mb-2">
                All 27 assets complete
              </h3>
              <p className="text-muted text-sm">
                Talk to your studio team about spin-out readiness.
              </p>
            </div>
          ) : nextAsset ? (
            <div>
              <h3 className="text-lg font-medium mb-1">
                Asset #{nextAsset.number}: {nextAsset.title}
              </h3>
              <p className="text-muted text-sm mb-4">{nextAsset.purpose}</p>
              <Link
                href={`/venture/${nextAsset.ventureId}/asset/${nextAsset.number}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
                style={{ borderRadius: 2 }}
              >
                Start Asset →
              </Link>
            </div>
          ) : null}
        </div>
      )}

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
