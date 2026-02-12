"use client";

import { useEffect, useState } from "react";
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
  onboarding: "bg-white/10 text-white/80",
  building: "bg-accent/20 text-accent",
  spin_out: "bg-white/15 text-white/90",
  graduated: "bg-white/20 text-white",
};

export default function FellowsPortfolio() {
  const [fellows, setFellows] = useState<PortfolioFellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fellows/portfolio")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load fellows");
        return res.json();
      })
      .then((data) => {
        setFellows(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="mt-16 sm:mt-24">
        <div className="text-[11px] tracking-[2px] uppercase text-white/40 mb-6">
          Our Fellows
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-sm animate-pulse"
              style={{ borderRadius: 2 }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || fellows.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 sm:mt-24">
      <div className="text-[11px] tracking-[2px] uppercase text-white/40 mb-6">
        Our Fellows
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        style={{ borderRadius: 2 }}
      >
        {fellows.map((fellow) => (
          <div
            key={fellow.id}
            className="group flex gap-4 p-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all"
            style={{ borderRadius: 2 }}
          >
            <div className="flex-shrink-0">
              {fellow.avatarUrl ? (
                <img
                  src={fellow.avatarUrl}
                  alt={fellow.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-white/60 text-lg font-medium"
                  style={{ borderRadius: 2 }}
                >
                  {fellow.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium text-sm truncate">
                {fellow.fullName}
              </h3>
              {fellow.domain && (
                <p className="text-white/50 text-xs mt-0.5 truncate">
                  {fellow.domain}
                </p>
              )}
              {fellow.bio && (
                <p className="text-white/60 text-xs mt-2 line-clamp-2">
                  {fellow.bio}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {fellow.lifecycleStage && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wide ${STAGE_COLORS[fellow.lifecycleStage] ?? "bg-white/10 text-white/70"}`}
                    style={{ borderRadius: 2 }}
                  >
                    {LIFECYCLE_STAGE_LABELS[fellow.lifecycleStage as LifecycleStage] ?? fellow.lifecycleStage}
                  </span>
                )}
                {fellow.ventureCount > 0 && (
                  <span className="text-[10px] text-white/40">
                    {fellow.ventureCount} venture{fellow.ventureCount !== 1 ? "s" : ""}
                  </span>
                )}
                {fellow.linkedinUrl && (
                  <a
                    href={fellow.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent hover:underline"
                  >
                    LinkedIn →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
