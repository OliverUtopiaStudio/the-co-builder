"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
}

export default function DashboardPage() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [fellow, setFellow] = useState<FellowProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch fellow profile
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("full_name, email")
          .eq("auth_user_id", user.id)
          .single();

        if (fellowData) {
          setFellow({ fullName: fellowData.full_name, email: fellowData.email });
        }

        // Fetch ventures
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("*")
          .eq("fellow_id", (await supabase.from("fellows").select("id").eq("auth_user_id", user.id).single()).data?.id)
          .order("created_at", { ascending: false });

        if (ventureData) {
          setVentures(ventureData.map((v: Record<string, unknown>) => ({
            id: v.id as string,
            name: v.name as string,
            description: v.description as string | null,
            industry: v.industry as string | null,
            currentStage: v.current_stage as string | null,
            createdAt: v.created_at as string,
          })));
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome{fellow ? `, ${fellow.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted mt-1">
          Build your AI venture through the 27-asset Co-Build framework
        </p>
      </div>

      {/* Ventures */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Ventures</h2>
          <Link
            href="/venture/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <span>+</span> New Venture
          </Link>
        </div>

        {ventures.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Start Your First Venture</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Create a venture to begin working through the Co-Build framework.
              You&apos;ll complete 27 assets across 7 stages — from invention to spinout.
            </p>
            <Link
              href="/venture/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Create Your Venture
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {ventures.map((venture) => (
              <Link
                key={venture.id}
                href={`/venture/${venture.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{venture.name}</h3>
                    {venture.description && (
                      <p className="text-muted text-sm mt-1 line-clamp-2">
                        {venture.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {venture.industry && (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                          {venture.industry}
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        Stage {venture.currentStage || "00"}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Framework Overview */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">The Co-Build Framework</h2>
        <p className="text-muted text-sm mb-4">
          27 sequenced assets across 13 stages, grouped into 7 phases. Each asset is an
          action-based workflow with specific questions and deliverables.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold text-accent">27</div>
            <div className="text-xs text-muted">Assets</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold text-accent">7</div>
            <div className="text-xs text-muted">Stages</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold text-gold">13</div>
            <div className="text-xs text-muted">Gates</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold text-gold">1</div>
            <div className="text-xs text-muted">Spinout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
