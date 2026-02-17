"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LifecycleStage } from "@/lib/onboarding";
import { LIFECYCLE_STAGE_LABELS } from "@/lib/onboarding";

export interface PortfolioFellow {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  domain: string | null;
  lifecycleStage: LifecycleStage | null;
  ventureCount: number;
}

const STAGE_COLORS: Record<string, string> = {
  onboarding: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  spin_out: "bg-accent/15 text-accent",
  graduated: "bg-accent/20 text-accent",
};

export default function ReportPage() {
  const [fellows, setFellows] = useState<PortfolioFellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fellows/portfolio")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load fellows");
        return res.json();
      })
      .then(setFellows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-medium mb-2">Fellow Portfolio</h1>
          <p className="text-muted text-sm">
            View our cohort of Co-Build fellows and their ventures
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 bg-surface border border-border animate-pulse"
              style={{ borderRadius: 2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium mb-2">Fellow Portfolio</h1>
          <p className="text-muted text-sm">
            View our cohort of Co-Build fellows and their ventures
          </p>
        </div>
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-300"
          style={{ borderRadius: 2 }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium mb-2">Fellow Portfolio</h1>
        <p className="text-muted text-sm">
          View our cohort of Co-Build fellows and their ventures
        </p>
      </div>

      {fellows.length === 0 ? (
        <div
          className="bg-surface border border-border p-12 text-center text-muted"
          style={{ borderRadius: 2 }}
        >
          No fellows in the portfolio yet.
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          style={{ borderRadius: 2 }}
        >
          {fellows.map((fellow) => (
            <Link
              key={fellow.id}
              href={`/report/${fellow.id}`}
              className="block bg-surface border border-border p-5 hover:border-accent/30 transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {fellow.avatarUrl ? (
                    <img
                      src={fellow.avatarUrl}
                      alt={fellow.fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-medium"
                      style={{ borderRadius: 2 }}
                    >
                      {fellow.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground truncate">
                    {fellow.fullName}
                  </h3>
                  {fellow.domain && (
                    <p className="text-muted text-xs mt-0.5 truncate">
                      {fellow.domain}
                    </p>
                  )}
                  {fellow.bio && (
                    <p className="text-muted text-sm mt-2 line-clamp-2">
                      {fellow.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {fellow.lifecycleStage && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-medium ${
                          STAGE_COLORS[fellow.lifecycleStage] ?? "bg-border/50 text-muted"
                        }`}
                        style={{ borderRadius: 2 }}
                      >
                        {LIFECYCLE_STAGE_LABELS[fellow.lifecycleStage as LifecycleStage] ?? fellow.lifecycleStage}
                      </span>
                    )}
                    {fellow.ventureCount > 0 && (
                      <span className="text-xs text-muted">
                        {fellow.ventureCount} venture{fellow.ventureCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {fellow.linkedinUrl && (
                      <a
                        href={fellow.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
