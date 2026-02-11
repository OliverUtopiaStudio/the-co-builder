"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  ventureCount?: number;
}

export default function AdminFellowsPage() {
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
          const enriched = await Promise.all(
            fellowData.map(async (f) => {
              const { count } = await supabase
                .from("ventures")
                .select("*", { count: "exact", head: true })
                .eq("fellow_id", f.id);
              return { ...f, ventureCount: count || 0 };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading fellows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">All Fellows</h1>
        <p className="text-muted text-sm mt-1">{fellows.length} fellow{fellows.length !== 1 ? "s" : ""} registered</p>
      </div>

      {fellows.length === 0 ? (
        <div className="bg-surface border border-border p-12 text-center" style={{ borderRadius: 2 }}>
          <p className="text-muted text-sm">No fellows have signed up yet.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border divide-y divide-border" style={{ borderRadius: 2 }}>
          {fellows.map((fellow) => (
            <Link
              key={fellow.id}
              href={`/admin/fellows/${fellow.id}`}
              className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 bg-accent/10 text-accent flex items-center justify-center font-semibold text-xs"
                  style={{ borderRadius: 2 }}
                >
                  {fellow.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{fellow.full_name}</div>
                  <div className="text-xs text-muted mt-0.5">{fellow.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted">
                <div>
                  {fellow.ventureCount} venture{fellow.ventureCount !== 1 ? "s" : ""}
                </div>
                <div>
                  Joined {new Date(fellow.created_at).toLocaleDateString()}
                </div>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
