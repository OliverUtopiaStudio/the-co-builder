"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  getOnboardingProgress,
  LIFECYCLE_STAGE_LABELS,
  EXPERIENCE_PROFILE_LABELS,
} from "@/lib/onboarding";
import type {
  OnboardingStatus,
  LifecycleStage,
  ExperienceProfile,
} from "@/lib/onboarding";

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  lifecycle_stage: LifecycleStage | null;
  experience_profile: ExperienceProfile | null;
  onboarding_status: OnboardingStatus | null;
  ventureCount?: number;
}

const STAGE_BADGE_COLORS: Record<LifecycleStage, string> = {
  onboarding: "bg-blue-100 text-blue-700",
  building: "bg-amber-100 text-amber-700",
  spin_out: "bg-purple-100 text-purple-700",
  graduated: "bg-green-100 text-green-700",
};

const FILTER_TABS: { label: string; value: LifecycleStage | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Building", value: "building" },
  { label: "Spin-Out", value: "spin_out" },
  { label: "Graduated", value: "graduated" },
];

export default function AdminFellowsPage() {
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LifecycleStage | "all">("all");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        const { data: fellowData } = await supabase
          .from("fellows")
          .select(
            "id, full_name, email, created_at, lifecycle_stage, experience_profile, onboarding_status"
          )
          .eq("role", "fellow")
          .order("created_at", { ascending: false });

        if (fellowData) {
          const enriched = await Promise.all(
            fellowData.map(async (f) => {
              const { count } = await supabase
                .from("ventures")
                .select("*", { count: "exact", head: true })
                .eq("fellow_id", f.id);
              return { ...f, ventureCount: count || 0 } as Fellow;
            })
          );
          setFellows(enriched);
        }
      } catch (err) {
        console.error("Failed to load fellows:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stageCounts = fellows.reduce(
    (acc, f) => {
      const stage = f.lifecycle_stage || "onboarding";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredFellows =
    activeFilter === "all"
      ? fellows
      : fellows.filter(
          (f) => (f.lifecycle_stage || "onboarding") === activeFilter
        );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading fellows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">All Fellows</h1>
        <p className="text-muted text-sm mt-1">
          {fellows.length} fellow{fellows.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          className="bg-surface border border-border p-4"
          style={{ borderRadius: 2 }}
        >
          <div className="text-2xl font-medium text-accent">
            {fellows.length}
          </div>
          <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
            Total
          </div>
        </div>
        {(
          ["onboarding", "building", "spin_out", "graduated"] as LifecycleStage[]
        ).map((stage) => (
          <div
            key={stage}
            className="bg-surface border border-border p-4"
            style={{ borderRadius: 2 }}
          >
            <div className="text-2xl font-medium">{stageCounts[stage] || 0}</div>
            <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
              {LIFECYCLE_STAGE_LABELS[stage]}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-0 border border-border bg-surface overflow-hidden"
        style={{ borderRadius: 2 }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2 text-sm transition-colors ${
              activeFilter === tab.value
                ? "bg-accent text-white font-medium"
                : "text-muted hover:bg-background/50"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              {tab.value === "all"
                ? fellows.length
                : stageCounts[tab.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Fellows list */}
      {filteredFellows.length === 0 ? (
        <div
          className="bg-surface border border-border p-12 text-center"
          style={{ borderRadius: 2 }}
        >
          <p className="text-muted text-sm">
            {activeFilter === "all"
              ? "No fellows have signed up yet."
              : `No fellows in ${LIFECYCLE_STAGE_LABELS[activeFilter]} stage.`}
          </p>
        </div>
      ) : (
        <div
          className="bg-surface border border-border divide-y divide-border"
          style={{ borderRadius: 2 }}
        >
          {filteredFellows.map((fellow) => {
            const stage = fellow.lifecycle_stage || "onboarding";
            const progress =
              stage === "onboarding"
                ? getOnboardingProgress(fellow.onboarding_status)
                : null;

            return (
              <Link
                key={fellow.id}
                href={`/admin/fellows/${fellow.id}`}
                className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 bg-accent/10 text-accent flex items-center justify-center font-semibold text-xs shrink-0"
                    style={{ borderRadius: 2 }}
                  >
                    {fellow.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name, email, experience */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {fellow.full_name}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium ${STAGE_BADGE_COLORS[stage]}`}
                        style={{ borderRadius: 2 }}
                      >
                        {LIFECYCLE_STAGE_LABELS[stage]}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {fellow.email}
                    </div>
                    {fellow.experience_profile && (
                      <div className="text-[11px] text-muted mt-0.5">
                        {EXPERIENCE_PROFILE_LABELS[fellow.experience_profile]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: progress, ventures, date */}
                <div className="flex items-center gap-6 text-xs text-muted shrink-0">
                  {progress && (
                    <div>
                      {progress.completed}/{progress.total} steps
                    </div>
                  )}
                  <div>
                    {fellow.ventureCount} venture
                    {fellow.ventureCount !== 1 ? "s" : ""}
                  </div>
                  <div>
                    Joined {new Date(fellow.created_at).toLocaleDateString()}
                  </div>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
