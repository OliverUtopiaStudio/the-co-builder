"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LifecycleStage,
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_COLORS,
} from "@/lib/onboarding";

// ─── Types ──────────────────────────────────────────────────────────

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  lifecycle_stage: LifecycleStage;
  created_at: string;
}

interface StageCounts {
  total: number;
  onboarding: number;
  building: number;
  spin_out: number;
  graduated: number;
}

interface StipendSummary {
  totalBudget: number;
  totalReleased: number;
}

// ─── Component ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stageCounts, setStageCounts] = useState<StageCounts>({
    total: 0,
    onboarding: 0,
    building: 0,
    spin_out: 0,
    graduated: 0,
  });
  const [stipend, setStipend] = useState<StipendSummary>({
    totalBudget: 0,
    totalReleased: 0,
  });
  const [recentFellows, setRecentFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // Fetch all fellows with lifecycle_stage
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("id, full_name, email, lifecycle_stage, created_at")
          .eq("role", "fellow")
          .order("created_at", { ascending: false });

        if (fellowData) {
          const counts: StageCounts = {
            total: fellowData.length,
            onboarding: 0,
            building: 0,
            spin_out: 0,
            graduated: 0,
          };

          for (const f of fellowData) {
            const stage = f.lifecycle_stage as LifecycleStage;
            if (stage in counts) {
              counts[stage]++;
            }
          }

          setStageCounts(counts);
          setRecentFellows(fellowData.slice(0, 5) as Fellow[]);
        }

        // Stipend summary: total budget = fellows x $5,000
        const fellowCount = fellowData?.length ?? 0;
        const totalBudget = fellowCount * 5000;

        // Sum released stipend payments
        const { data: releasedData } = await supabase
          .from("stipend_milestones")
          .select("amount")
          .not("fellow_id", "is", null)
          .not("payment_released", "is", null);

        const totalReleased = (releasedData ?? []).reduce(
          (sum, row) => sum + (row.amount ?? 0),
          0
        );

        setStipend({ totalBudget, totalReleased });
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Loading state ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading dashboard...</div>
      </div>
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────

  const stageStats: {
    key: LifecycleStage | "total";
    label: string;
    value: number;
  }[] = [
    { key: "total", label: "Total Fellows", value: stageCounts.total },
    { key: "onboarding", label: "Onboarding", value: stageCounts.onboarding },
    { key: "building", label: "Building", value: stageCounts.building },
    { key: "spin_out", label: "Spin-Out", value: stageCounts.spin_out },
    { key: "graduated", label: "Graduated", value: stageCounts.graduated },
  ];

  const budgetPct =
    stipend.totalBudget > 0
      ? Math.round((stipend.totalReleased / stipend.totalBudget) * 100)
      : 0;

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-muted text-sm mt-1">
          Manage fellows, stipends, and Co-Build progress
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stageStats.map((stat) => (
          <div
            key={stat.key}
            className="bg-surface border border-border p-5"
            style={{ borderRadius: 2 }}
          >
            <div className="text-3xl font-medium text-accent">
              {stat.value}
            </div>
            <div
              className="label-uppercase mt-2"
              style={{ fontSize: 10 }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Stipend summary ──────────────────────────────────────── */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="label-uppercase mb-4">Stipend Summary</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-medium">
              ${stipend.totalBudget.toLocaleString()}
            </div>
            <div className="text-muted text-xs mt-1">
              Total budget committed
            </div>
          </div>
          <div>
            <div className="text-2xl font-medium text-accent">
              ${stipend.totalReleased.toLocaleString()}
            </div>
            <div className="text-muted text-xs mt-1">Released so far</div>
          </div>
          <div>
            <div className="text-2xl font-medium">
              ${(stipend.totalBudget - stipend.totalReleased).toLocaleString()}
            </div>
            <div className="text-muted text-xs mt-1">Remaining</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div
            className="w-full bg-border h-2 overflow-hidden"
            style={{ borderRadius: 2 }}
          >
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${budgetPct}%`, borderRadius: 2 }}
            />
          </div>
          <div className="text-muted text-xs mt-1">{budgetPct}% released</div>
        </div>
      </div>

      {/* ── Recent fellows ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="label-uppercase">Recent Fellows</div>
          <Link
            href="/admin/fellows"
            className="text-sm text-accent hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        {recentFellows.length === 0 ? (
          <div
            className="bg-surface border border-border p-8 text-center"
            style={{ borderRadius: 2 }}
          >
            <p className="text-muted text-sm">
              No fellows have signed up yet.
            </p>
          </div>
        ) : (
          <div
            className="bg-surface border border-border divide-y divide-border"
            style={{ borderRadius: 2 }}
          >
            {recentFellows.map((fellow) => {
              const stage = fellow.lifecycle_stage as LifecycleStage;
              const badgeColors =
                LIFECYCLE_STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-600";
              const badgeLabel =
                LIFECYCLE_STAGE_LABELS[stage] ?? stage;

              return (
                <Link
                  key={fellow.id}
                  href={`/admin/fellows/${fellow.id}`}
                  className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {fellow.full_name}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {fellow.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 ${badgeColors}`}
                      style={{ borderRadius: 2 }}
                    >
                      {badgeLabel}
                    </span>
                    <div className="text-xs text-muted">
                      {new Date(fellow.created_at).toLocaleDateString()}
                    </div>
                    <span className="text-muted">&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div>
        <div className="label-uppercase mb-4">Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/fellows"
            className="bg-surface border border-border px-5 py-3 text-sm font-medium hover:border-accent transition-colors"
            style={{ borderRadius: 2 }}
          >
            View All Fellows &rarr;
          </Link>
          <Link
            href="/admin/stipends"
            className="bg-surface border border-border px-5 py-3 text-sm font-medium hover:border-accent transition-colors"
            style={{ borderRadius: 2 }}
          >
            Manage Stipends &rarr;
          </Link>
          <Link
            href="/admin/framework"
            className="bg-surface border border-border px-5 py-3 text-sm font-medium hover:border-accent transition-colors"
            style={{ borderRadius: 2 }}
          >
            Framework Editor &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
