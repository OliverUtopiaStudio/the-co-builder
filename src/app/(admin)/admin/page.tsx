"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface Stats {
  fellows: number;
  ventures: number;
  completedAssets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ fellows: 0, ventures: 0, completedAssets: 0 });
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        const { data: fellowData } = await supabase
          .from("fellows")
          .select("id, full_name, email, created_at")
          .eq("role", "fellow")
          .order("created_at", { ascending: false });

        if (fellowData) {
          setFellows(fellowData);
          setStats((s) => ({ ...s, fellows: fellowData.length }));
        }

        const { count: ventureCount } = await supabase
          .from("ventures")
          .select("*", { count: "exact", head: true });

        setStats((s) => ({ ...s, ventures: ventureCount || 0 }));

        const { count: completedCount } = await supabase
          .from("asset_completion")
          .select("*", { count: "exact", head: true })
          .eq("is_complete", true);

        setStats((s) => ({ ...s, completedAssets: completedCount || 0 }));
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-muted text-sm mt-1">Manage fellows and their Co-Build progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { value: stats.fellows, label: "Fellows" },
          { value: stats.ventures, label: "Ventures" },
          { value: stats.completedAssets, label: "Assets Completed" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
            <div className="text-3xl font-medium text-accent">{stat.value}</div>
            <div className="label-uppercase mt-2" style={{ fontSize: 10 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Fellows List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="label-uppercase">Fellows</div>
          <Link
            href="/admin/fellows"
            className="text-sm text-accent hover:underline"
          >
            View all →
          </Link>
        </div>

        {fellows.length === 0 ? (
          <div className="bg-surface border border-border p-8 text-center" style={{ borderRadius: 2 }}>
            <p className="text-muted text-sm">No fellows have signed up yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border divide-y divide-border" style={{ borderRadius: 2 }}>
            {fellows.slice(0, 10).map((fellow) => (
              <Link
                key={fellow.id}
                href={`/admin/fellows/${fellow.id}`}
                className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{fellow.full_name}</div>
                  <div className="text-xs text-muted mt-0.5">{fellow.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted">
                    {new Date(fellow.created_at).toLocaleDateString()}
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
