"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFellowsList } from "@/app/actions/fellows";

type FellowWithVenture = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  domain: string | null;
  lifecycleStage: string;
  venture: {
    id: string;
    name: string;
    currentStage: string | null;
    industry: string | null;
  } | null;
};

const STAGE_LABELS: Record<string, string> = {
  "00": "Invention Gate",
  "01": "Problem Deep Dive",
  "02": "Customer & Validation",
  "03": "Solution Design",
  "04": "Build & Test",
  "05": "Launch",
};

export default function FellowsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [fellowsData, setFellowsData] = useState<{
    fellows: FellowWithVenture[];
    currentFellowId: string;
    isStudio: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFellowsList()
      .then((data) => {
        setFellowsData(data as typeof fellowsData);
        setLoading(false);

        // Fellow users: redirect to their own page
        if (!data.isStudio && data.fellows.length === 1) {
          router.replace(`/fellows/${data.fellows[0].id}`);
        }
      })
      .catch(() => {
        setError("Unable to load fellows. Please sign in and try again.");
        setLoading(false);
      });
  }, [router]);

  const filtered = useMemo(() => {
    if (!fellowsData) return [];
    if (!search.trim()) return fellowsData.fellows;
    const q = search.toLowerCase();
    return fellowsData.fellows.filter(
      (f) =>
        f.fullName.toLowerCase().includes(q) ||
        f.venture?.name.toLowerCase().includes(q) ||
        f.domain?.toLowerCase().includes(q)
    );
  }, [search, fellowsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading fellows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="bg-surface border border-border p-8 text-center max-w-md"
          style={{ borderRadius: 2 }}
        >
          <p className="text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Fellows</h1>
          <p className="text-muted text-sm mt-1">
            Click into a fellow to view their plan, to-dos, and key assets.
          </p>
        </div>
        {fellowsData?.isStudio && (
          <Link
            href="/fellows/manage"
            className="px-4 py-2 text-sm border border-border hover:bg-surface transition-colors"
            style={{ borderRadius: 2 }}
          >
            Manage Fellows
          </Link>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name, venture, or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
          style={{ borderRadius: 2 }}
        />
      </div>

      {/* Fellow grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-surface border border-border p-12 text-center"
          style={{ borderRadius: 2 }}
        >
          <p className="text-muted text-sm">No fellows match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fellow) => (
            <Link
              key={fellow.id}
              href={`/fellows/${fellow.id}`}
              className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent text-sm font-medium shrink-0"
                  style={{ borderRadius: 2 }}
                >
                  {fellow.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {fellow.fullName}
                  </h3>
                  {fellow.venture ? (
                    <p className="text-muted text-xs mt-0.5 truncate">
                      {fellow.venture.name}
                    </p>
                  ) : (
                    <p className="text-muted/50 text-xs mt-0.5 italic">
                      No venture yet
                    </p>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {fellow.domain && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 bg-border/50 text-muted"
                      style={{ borderRadius: 2 }}
                    >
                      {fellow.domain}
                    </span>
                  )}
                  {fellow.venture?.currentStage && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent"
                      style={{ borderRadius: 2 }}
                    >
                      Stage {fellow.venture.currentStage}
                      {STAGE_LABELS[fellow.venture.currentStage]
                        ? ` — ${STAGE_LABELS[fellow.venture.currentStage]}`
                        : ""}
                    </span>
                  )}
                </div>
                <span className="text-xs text-accent font-medium">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
