"use client";

import { useEffect, useState, useTransition } from "react";
import { getKPIs, updateKPI, refreshKPIsFromData } from "@/app/actions/studio";

type KPIMetric = {
  id: string;
  key: string;
  label: string;
  target: number;
  current: number;
  pipelineNotes: string | null;
  displayOrder: number | null;
  updatedAt: Date | string;
};

type Tab = "scoreboard" | "strategy";

export default function StudioOverviewPage() {
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function loadKPIs() {
      try {
        console.log("[StudioPage] Loading KPIs...");
        setLoading(true);
        setError(null);
        const data = await getKPIs();
        console.log("[StudioPage] KPIs loaded:", data?.length || 0);
        if (!cancelled) {
          // Handle date serialization - convert string dates to Date objects if needed
          const processedData = (data || []).map((kpi: any) => ({
            ...kpi,
            updatedAt: kpi.updatedAt instanceof Date ? kpi.updatedAt : new Date(kpi.updatedAt),
          }));
          setKpis(processedData as KPIMetric[]);
          setLoading(false);
          console.log("[StudioPage] State updated");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[StudioPage] Failed to load KPIs:", error);
          setError(error instanceof Error ? error.message : "Failed to load KPIs");
          setLoading(false);
        }
      }
    }
    
    loadKPIs();
    
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(kpi: KPIMetric) {
    setEditingKey(kpi.key);
    setEditValue(String(kpi.current));
    setEditNotes(kpi.pipelineNotes || "");
  }

  function saveEdit(key: string) {
    startTransition(async () => {
      await updateKPI(key, {
        current: Number(editValue),
        pipelineNotes: editNotes || undefined,
      });
      const updated = await getKPIs();
      setKpis(updated as KPIMetric[]);
      setEditingKey(null);
    });
  }

  async function handleRefreshFromData() {
    setRefreshing(true);
    try {
      const result = await refreshKPIsFromData();
      if (result.success) {
        const updated = await getKPIs();
        setKpis(updated as KPIMetric[]);
        setLastRefresh(`Updated ${result.updated.length} KPIs from live data`);
        setTimeout(() => setLastRefresh(null), 4000);
      }
    } catch (err) {
      console.error("Failed to refresh KPIs:", err);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="text-muted text-sm">Loading KPIs...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="text-red-600 font-semibold mb-2">Error loading KPIs</div>
        <div className="text-sm text-muted mb-4">{error}</div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            getKPIs()
              .then((data) => {
                setKpis(data as KPIMetric[]);
                setLoading(false);
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load KPIs");
                setLoading(false);
              });
          }}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
          style={{ borderRadius: 2 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCurrent = kpis.length > 0 ? kpis.slice(0, 7).reduce((s, k) => s + k.current, 0) : 0;
  const totalTarget = kpis.length > 0 ? kpis.slice(0, 7).reduce((s, k) => s + k.target, 0) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="label-uppercase text-muted mb-2">Studio OS</div>
        <h1 className="text-2xl font-medium text-foreground">
          {activeTab === "scoreboard" ? "KPI Scoreboard" : "Our Strategy"}
        </h1>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 border border-border bg-surface overflow-hidden mb-8"
        style={{ borderRadius: 2 }}
      >
        <button
          onClick={() => setActiveTab("scoreboard")}
          className={`px-6 py-3 text-sm transition-colors ${
            activeTab === "scoreboard"
              ? "bg-accent text-white font-medium"
              : "text-muted hover:bg-background/50"
          }`}
        >
          KPI Scoreboard
        </button>
        <button
          onClick={() => setActiveTab("strategy")}
          className={`px-6 py-3 text-sm transition-colors ${
            activeTab === "strategy"
              ? "bg-accent text-white font-medium"
              : "text-muted hover:bg-background/50"
          }`}
        >
          Our Strategy
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "scoreboard" && (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6" style={{ borderRadius: 2 }}>
              <div className="text-red-700 font-semibold text-sm mb-1">Error loading KPIs</div>
              <div className="text-xs text-red-600 mb-3">{error}</div>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  getKPIs()
                    .then((data) => {
                      setKpis(data as KPIMetric[]);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err instanceof Error ? err.message : "Failed to load KPIs");
                      setLoading(false);
                    });
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                style={{ borderRadius: 2 }}
              >
                Retry
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm text-muted">
              Year 1 targets — {totalCurrent}/{totalTarget} metrics achieved across {kpis.length} KPIs
            </p>
            <button
              onClick={handleRefreshFromData}
              disabled={refreshing}
              className="text-xs px-3 py-1.5 border border-border hover:border-accent text-foreground font-medium transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh from data"}
            </button>
            {lastRefresh && (
              <span className="text-xs text-green-600">{lastRefresh}</span>
            )}
          </div>

          {/* KPI Grid */}
          {kpis.length === 0 && !error && (
            <div className="bg-surface border border-border p-8 text-center" style={{ borderRadius: 2 }}>
              <p className="text-muted text-sm mb-2">No KPIs found</p>
              <p className="text-xs text-muted">KPIs will appear here once they are configured.</p>
            </div>
          )}
          
          {kpis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpis.map((kpi) => {
              const progress = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
              const isEditing = editingKey === kpi.key;

              return (
                <div
                  key={kpi.key}
                  className="bg-surface border border-border p-5"
                  style={{ borderRadius: 2 }}
                >
                  {/* Label */}
                  <div className="label-uppercase text-muted mb-3 text-[10px]">{kpi.label}</div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1.5 bg-background border border-border text-foreground text-lg font-semibold focus:outline-none focus:border-accent"
                          style={{ borderRadius: 2 }}
                          autoFocus
                        />
                        <span className="text-muted text-sm">/ {kpi.target}</span>
                      </div>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Pipeline notes..."
                        className="w-full px-2 py-1.5 bg-background border border-border text-foreground text-xs focus:outline-none focus:border-accent resize-none"
                        style={{ borderRadius: 2 }}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(kpi.key)}
                          disabled={isPending}
                          className="px-3 py-1 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                          style={{ borderRadius: 2 }}
                        >
                          {isPending ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-1 text-xs text-muted hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer group"
                      onClick={() => startEdit(kpi)}
                    >
                      {/* Value */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-3xl font-semibold text-foreground">
                          {kpi.key === "equity" ? kpi.current.toFixed(1) : kpi.current}
                        </span>
                        <span className="text-sm text-muted">
                          / {kpi.target}{kpi.key === "equity" ? "M" : ""}
                        </span>
                        <span className="ml-auto text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-background overflow-hidden mb-3" style={{ borderRadius: 1 }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress >= 100 ? "#2E7D32" : "#CC5536",
                            borderRadius: 1,
                          }}
                        />
                      </div>

                      {/* Progress % */}
                      <div className="text-xs text-muted mb-2">
                        {progress}% of target
                      </div>

                      {/* Pipeline notes */}
                      {kpi.pipelineNotes && (
                        <div className="text-[11px] text-muted leading-relaxed border-t border-border pt-2 mt-2">
                          {kpi.pipelineNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </>
      )}

      {activeTab === "strategy" && (
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
            <p className="text-sm text-foreground leading-relaxed">
              The Studio&apos;s Model is a continuous model that tailors the Fellow (EIRs) co-build 
              based on their needs, case by case.
            </p>
          </div>

          {/* Strategy Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/10 flex items-center justify-center font-semibold text-accent shrink-0" style={{ borderRadius: 2 }}>
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    Problem Oriented Deep Dives (PODs)
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    We narrow our focus using <strong className="text-foreground">Problem Oriented Deep Dives (PODs)</strong> to create 
                    thesis areas that require risk capital and present high-return areas for the funds + Qatar ecosystem impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/10 flex items-center justify-center font-semibold text-accent shrink-0" style={{ borderRadius: 2 }}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    Domain/Industry Expert Fellows (EIRs)
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    We then source for <strong className="text-foreground">Domain/Industry expert Fellows (EIRs)</strong> who have deep 
                    problem knowledge, insight to high barrier spaces and access to potential customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/10 flex items-center justify-center font-semibold text-accent shrink-0" style={{ borderRadius: 2 }}>
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    Tailored Co-Build
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    We then <strong className="text-foreground">tailor each Fellow (EIR&apos;s) co-build</strong> based on what their 
                    AI Native Product and Go-to-market needs are to become an investable company with customer traction and a strategy 
                    for capital raise and potential exit routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
