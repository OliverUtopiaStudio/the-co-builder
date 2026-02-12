"use client";

import Link from "next/link";
import type { DiagnosisResult } from "@/app/actions/diagnosis";

interface TodaysFocusProps {
  diagnosis: DiagnosisResult | null;
  ventureId: string | null;
}

export default function TodaysFocus({ diagnosis, ventureId }: TodaysFocusProps) {
  const currentAsset = diagnosis?.criticalActions[0];
  const upcomingMilestones = diagnosis
    ? [
        {
          label: "Stipend Milestone #1",
          status: "3 assets away",
          type: "stipend" as const,
        },
        {
          label: "Stage Gate Review",
          status: "Next week",
          type: "gate" as const,
        },
      ]
    : [];

  return (
    <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
      <div className="label-uppercase mb-4">Today&apos;s Focus</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Asset */}
        <div className="bg-background p-4" style={{ borderRadius: 2 }}>
          <div className="text-sm font-medium mb-2">Current Asset</div>
          {currentAsset ? (
            <>
              <div className="text-sm font-semibold mb-1">
                Asset #{currentAsset.assetNumber}
              </div>
              <div className="text-xs text-muted mb-3 line-clamp-2">
                {currentAsset.title}
              </div>
              <div className="text-xs text-muted mb-2">
                Progress: In progress
              </div>
              {ventureId && (
                <Link
                  href={`/venture/${ventureId}/asset/${currentAsset.assetNumber}`}
                  className="text-accent text-xs font-medium hover:underline"
                >
                  Continue →
                </Link>
              )}
            </>
          ) : (
            <div className="text-xs text-muted">No active asset</div>
          )}
        </div>

        {/* Studio Updates */}
        <div className="bg-background p-4" style={{ borderRadius: 2 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Studio Updates</div>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5" style={{ borderRadius: 2 }}>
              0 new
            </span>
          </div>
          <div className="text-xs text-muted mb-3">
            No new activity from your studio team
          </div>
          <Link
            href="/dashboard#activity"
            className="text-accent text-xs font-medium hover:underline"
          >
            View all activity →
          </Link>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-background p-4" style={{ borderRadius: 2 }}>
          <div className="text-sm font-medium mb-2">Upcoming Milestones</div>
          {upcomingMilestones.length > 0 ? (
            <div className="space-y-2">
              {upcomingMilestones.map((milestone, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-medium">{milestone.label}</div>
                  <div className="text-muted">{milestone.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted">No upcoming milestones</div>
          )}
          <Link
            href="/dashboard#milestones"
            className="text-accent text-xs font-medium hover:underline mt-2 inline-block"
          >
            View timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
