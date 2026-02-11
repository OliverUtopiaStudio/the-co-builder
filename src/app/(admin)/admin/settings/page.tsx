"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";

interface Requirement {
  asset_number: number;
  is_required: boolean;
}

export default function AdminSettingsPage() {
  const [requirements, setRequirements] = useState<Map<number, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("asset_requirements")
          .select("asset_number, is_required")
          .is("venture_id", null);

        const map = new Map<number, boolean>();
        if (data) {
          data.forEach((r: Requirement) => map.set(r.asset_number, r.is_required));
        }
        setRequirements(map);
      } catch (err) {
        console.error("Failed to load requirements:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleRequirement(assetNumber: number) {
    const currentValue = requirements.get(assetNumber) ?? true;
    const newValue = !currentValue;

    setSaving(assetNumber);
    try {
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("asset_requirements")
        .select("id")
        .is("venture_id", null)
        .eq("asset_number", assetNumber)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from("asset_requirements")
          .update({ is_required: newValue, updated_at: new Date().toISOString() })
          .eq("id", existing[0].id);
      } else {
        await supabase
          .from("asset_requirements")
          .insert({ asset_number: assetNumber, is_required: newValue });
      }

      setRequirements((prev) => {
        const next = new Map(prev);
        next.set(assetNumber, newValue);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle requirement:", err);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">Asset Requirements</h1>
        <p className="text-muted text-sm mt-1">
          Toggle which assets are required for fellows to complete. All assets are required by default.
        </p>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-surface border border-border" style={{ borderRadius: 2 }}>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 bg-accent/10 flex items-center justify-center font-semibold text-accent text-xs"
                  style={{ borderRadius: 2 }}
                >
                  {stage.number}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{stage.title}</h3>
                  <p className="text-xs text-muted">{stage.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {stage.assets.map((asset) => {
                const isRequired = requirements.get(asset.number) ?? true;
                const isSaving = saving === asset.number;

                return (
                  <div key={asset.number} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 bg-accent/10 text-accent flex items-center justify-center text-[10px] font-semibold"
                        style={{ borderRadius: 2 }}
                      >
                        {asset.number}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{asset.title}</div>
                        <div className="text-xs text-muted">{asset.purpose}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleRequirement(asset.number)}
                      disabled={isSaving}
                      className={`relative inline-flex h-5 w-9 items-center transition-colors ${
                        isRequired ? "bg-accent" : "bg-border"
                      } ${isSaving ? "opacity-50" : ""}`}
                      style={{ borderRadius: 2 }}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
                          isRequired ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                        style={{ borderRadius: 1 }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border p-4 text-xs text-muted" style={{ borderRadius: 2 }}>
        These are global defaults. All assets are required unless toggled off here.
      </div>
    </div>
  );
}
