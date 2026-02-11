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
          // Get venture counts per fellow
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
        <div className="text-muted">Loading fellows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Fellows</h1>
        <p className="text-muted mt-1">{fellows.length} fellow{fellows.length !== 1 ? "s" : ""} registered</p>
      </div>

      {fellows.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-muted">No fellows have signed up yet.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {fellows.map((fellow) => (
            <Link
              key={fellow.id}
              href={`/admin/fellows/${fellow.id}`}
              className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                  {fellow.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{fellow.full_name}</div>
                  <div className="text-sm text-muted">{fellow.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-muted">
                  {fellow.ventureCount} venture{fellow.ventureCount !== 1 ? "s" : ""}
                </div>
                <div className="text-muted">
                  Joined {new Date(fellow.created_at).toLocaleDateString()}
                </div>
                <span className="text-muted">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
