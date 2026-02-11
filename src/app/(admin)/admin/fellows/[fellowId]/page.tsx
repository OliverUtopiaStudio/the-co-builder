"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  bio: string | null;
  linkedin_url: string | null;
  created_at: string;
}

interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  current_stage: string | null;
  google_drive_url: string | null;
  created_at: string;
  completedAssets: number;
  totalResponses: number;
}

export default function AdminFellowDetailPage() {
  const params = useParams();
  const fellowId = params.fellowId as string;
  const [fellow, setFellow] = useState<Fellow | null>(null);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // Fetch fellow
        const { data: fellowData } = await supabase
          .from("fellows")
          .select("*")
          .eq("id", fellowId)
          .single();

        if (fellowData) setFellow(fellowData);

        // Fetch ventures for this fellow
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("*")
          .eq("fellow_id", fellowId)
          .order("created_at", { ascending: false });

        if (ventureData) {
          const enriched = await Promise.all(
            ventureData.map(async (v) => {
              const { count: completedCount } = await supabase
                .from("asset_completion")
                .select("*", { count: "exact", head: true })
                .eq("venture_id", v.id)
                .eq("is_complete", true);

              const { count: responseCount } = await supabase
                .from("responses")
                .select("*", { count: "exact", head: true })
                .eq("venture_id", v.id);

              return {
                ...v,
                completedAssets: completedCount || 0,
                totalResponses: responseCount || 0,
              };
            })
          );
          setVentures(enriched);
        }
      } catch (err) {
        console.error("Failed to load fellow:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fellowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading fellow details...</div>
      </div>
    );
  }

  if (!fellow) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Fellow not found.</p>
        <Link href="/admin/fellows" className="text-accent hover:underline mt-2 inline-block">
          Back to Fellows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/admin/fellows" className="text-sm text-muted hover:text-foreground">
        ← Back to Fellows
      </Link>

      {/* Fellow Profile */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xl">
            {fellow.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{fellow.full_name}</h1>
            <p className="text-muted">{fellow.email}</p>
            {fellow.bio && <p className="text-sm mt-2">{fellow.bio}</p>}
            {fellow.linkedin_url && (
              <a
                href={fellow.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline mt-1 inline-block"
              >
                LinkedIn Profile
              </a>
            )}
            <p className="text-xs text-muted mt-2">
              Joined {new Date(fellow.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ventures */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Ventures ({ventures.length})
        </h2>

        {ventures.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-muted">This fellow hasn&apos;t created any ventures yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ventures.map((venture) => (
              <Link
                key={venture.id}
                href={`/admin/ventures/${venture.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{venture.name}</h3>
                    {venture.description && (
                      <p className="text-muted text-sm mt-1 line-clamp-2">{venture.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {venture.industry && (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                          {venture.industry}
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        Stage {venture.current_stage || "00"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-accent font-medium">{venture.completedAssets}/27 assets</div>
                    <div className="text-muted">{venture.totalResponses} responses</div>
                    {venture.google_drive_url && (
                      <span className="text-xs text-gold">Drive linked</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{ width: `${(venture.completedAssets / 27) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
