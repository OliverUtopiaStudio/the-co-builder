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

        // Fetch all fellows (admin RLS allows this)
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("id, full_name, email, created_at")
          .eq("role", "fellow")
          .order("created_at", { ascending: false });

        if (fellowData) {
          setFellows(fellowData);
          setStats((s) => ({ ...s, fellows: fellowData.length }));
        }

        // Fetch venture count
        const { count: ventureCount } = await supabase
          .from("ventures")
          .select("*", { count: "exact", head: true });

        setStats((s) => ({ ...s, ventures: ventureCount || 0 }));

        // Fetch completed assets count
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
        <div className="text-muted">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted mt-1">Manage fellows and their Co-Build progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-accent">{stats.fellows}</div>
          <div className="text-sm text-muted mt-1">Fellows</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-accent">{stats.ventures}</div>
          <div className="text-sm text-muted mt-1">Ventures</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-gold">{stats.completedAssets}</div>
          <div className="text-sm text-muted mt-1">Assets Completed</div>
        </div>
      </div>

      {/* Fellows List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fellows</h2>
          <Link
            href="/admin/fellows"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        {fellows.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-muted">No fellows have signed up yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {fellows.slice(0, 10).map((fellow) => (
              <Link
                key={fellow.id}
                href={`/admin/fellows/${fellow.id}`}
                className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{fellow.full_name}</div>
                  <div className="text-sm text-muted">{fellow.email}</div>
                </div>
                <div className="text-sm text-muted">
                  {new Date(fellow.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
