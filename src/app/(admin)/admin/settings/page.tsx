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
    const currentValue = requirements.get(assetNumber) ?? true; // default required
    const newValue = !currentValue;

    setSaving(assetNumber);
    try {
      const supabase = createClient();

      // Check if a global requirement exists for this asset
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
        <div className="text-muted">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Asset Requirements</h1>
        <p className="text-muted mt-1">
          Toggle which assets are required for fellows to complete. All assets are required by default.
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-surface border border-border rounded-xl">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                  {stage.number}
                </div>
                <div>
                  <h3 className="font-semibold">{stage.title}</h3>
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
                      <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isRequired ? "bg-accent" : "bg-border"
                      } ${isSaving ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isRequired ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 text-sm text-muted">
        These are global defaults. All assets are required unless toggled off here.
      </div>
    </div>
  );
}
