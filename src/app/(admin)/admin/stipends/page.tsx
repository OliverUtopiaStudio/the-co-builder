"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllFellows } from "@/app/actions/admin";
import {
  getGlobalMilestones,
  updateGlobalMilestone,
  getAllFellowStipends,
  initFellowStipends,
  markMilestoneMet,
  markPaymentReleased,
  clearMilestoneMet,
  clearPaymentReleased,
} from "@/app/actions/stipends";

// ─── Types ───────────────────────────────────────────────────────

interface GlobalMilestone {
  id: string;
  milestoneNumber: number;
  title: string;
  description: string | null;
  amount: number;
}

interface Fellow {
  id: string;
  fullName: string;
  email: string;
}

interface StipendRecord {
  stipend: {
    id: string;
    fellowId: string | null;
    milestoneNumber: number;
    title: string;
    description: string | null;
    amount: number;
    milestoneMet: string | null;
    paymentReleased: string | null;
  };
  fellow: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface MilestoneEditState {
  title: string;
  description: string;
  amount: string;
}

// ─── Component ───────────────────────────────────────────────────

export default function AdminStipendsPage() {
  const [globalMilestones, setGlobalMilestones] = useState<GlobalMilestone[]>([]);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [stipendRecords, setStipendRecords] = useState<StipendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMilestone, setSavingMilestone] = useState<string | null>(null);
  const [initializingFellow, setInitializingFellow] = useState<string | null>(null);
  const [togglingStipend, setTogglingStipend] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, MilestoneEditState>>({});

  const loadData = useCallback(async () => {
    try {
      const [milestones, allFellows, allStipends] = await Promise.all([
        getGlobalMilestones(),
        getAllFellows(),
        getAllFellowStipends(),
      ]);

      setGlobalMilestones(milestones as GlobalMilestone[]);
      setFellows(
        allFellows.map((f) => ({
          id: f.id,
          fullName: f.fullName,
          email: f.email,
        }))
      );
      setStipendRecords(allStipends as unknown as StipendRecord[]);

      // Initialize edit states for global milestones
      const edits: Record<string, MilestoneEditState> = {};
      for (const m of milestones as GlobalMilestone[]) {
        edits[m.id] = {
          title: m.title,
          description: m.description || "",
          amount: String(m.amount),
        };
      }
      setEditStates(edits);
    } catch (err) {
      console.error("Failed to load stipend data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Handlers ────────────────────────────────────────────────

  async function handleSaveMilestone(milestoneId: string) {
    const edit = editStates[milestoneId];
    if (!edit) return;

    setSavingMilestone(milestoneId);
    try {
      await updateGlobalMilestone(milestoneId, {
        title: edit.title,
        description: edit.description || undefined,
        amount: parseInt(edit.amount, 10) || 0,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to save milestone:", err);
    } finally {
      setSavingMilestone(null);
    }
  }

  async function handleInitFellow(fellowId: string) {
    setInitializingFellow(fellowId);
    try {
      const result = await initFellowStipends(fellowId);
      if (!result.success) {
        console.error(result.error);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to initialize stipends:", err);
    } finally {
      setInitializingFellow(null);
    }
  }

  async function handleToggleMet(stipendId: string, currentlyMet: boolean) {
    setTogglingStipend(stipendId);
    try {
      if (currentlyMet) {
        await clearMilestoneMet(stipendId);
      } else {
        await markMilestoneMet(stipendId);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to toggle milestone met:", err);
    } finally {
      setTogglingStipend(null);
    }
  }

  async function handleToggleReleased(stipendId: string, currentlyReleased: boolean) {
    setTogglingStipend(stipendId);
    try {
      if (currentlyReleased) {
        await clearPaymentReleased(stipendId);
      } else {
        await markPaymentReleased(stipendId);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to toggle payment released:", err);
    } finally {
      setTogglingStipend(null);
    }
  }

  function updateEdit(milestoneId: string, field: keyof MilestoneEditState, value: string) {
    setEditStates((prev) => ({
      ...prev,
      [milestoneId]: { ...prev[milestoneId], [field]: value },
    }));
  }

  // ─── Derived data ────────────────────────────────────────────

  // Build a map: fellowId -> { milestone1, milestone2 }
  const stipendsByFellow = new Map<
    string,
    { fellow: Fellow; milestones: StipendRecord["stipend"][] }
  >();
  for (const record of stipendRecords) {
    const fId = record.fellow.id;
    if (!stipendsByFellow.has(fId)) {
      stipendsByFellow.set(fId, {
        fellow: record.fellow,
        milestones: [],
      });
    }
    stipendsByFellow.get(fId)!.milestones.push(record.stipend);
  }

  // Fellows without stipend records
  const fellowsWithStipends = new Set(stipendsByFellow.keys());
  const fellowsWithoutStipends = fellows.filter((f) => !fellowsWithStipends.has(f.id));

  // Summary stats
  const totalBudget = fellows.length * 5000;
  const totalReleased = stipendRecords.reduce((sum, r) => {
    if (r.stipend.paymentReleased) return sum + r.stipend.amount;
    return sum;
  }, 0);
  const pendingMilestones = stipendRecords.filter(
    (r) => !r.stipend.milestoneMet
  ).length;
  const metButUnreleased = stipendRecords.filter(
    (r) => r.stipend.milestoneMet && !r.stipend.paymentReleased
  ).length;

  // ─── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading stipends...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Admin</div>
        <h1 className="text-2xl font-medium">Stipend Management</h1>
        <p className="text-muted text-sm mt-1">
          Configure milestones and track fellow stipend payments.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
          <div className="text-2xl font-medium text-accent">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
            Total Budget
          </div>
        </div>
        <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
          <div className="text-2xl font-medium text-green-600">
            ${totalReleased.toLocaleString()}
          </div>
          <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
            Released
          </div>
        </div>
        <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
          <div className="text-2xl font-medium">
            {metButUnreleased}
          </div>
          <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
            Awaiting Payment
          </div>
        </div>
        <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
          <div className="text-2xl font-medium text-muted">
            {pendingMilestones}
          </div>
          <div className="label-uppercase mt-1" style={{ fontSize: 10 }}>
            Pending Milestones
          </div>
        </div>
      </div>

      {/* Global Milestone Configuration */}
      <div>
        <div className="label-uppercase mb-3" style={{ fontSize: 10 }}>
          Global Milestone Definitions
        </div>
        <div className="space-y-3">
          {globalMilestones.map((m) => {
            const edit = editStates[m.id];
            const isSaving = savingMilestone === m.id;
            const hasChanges =
              edit &&
              (edit.title !== m.title ||
                edit.description !== (m.description || "") ||
                edit.amount !== String(m.amount));

            return (
              <div
                key={m.id}
                className="bg-surface border border-border p-5"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 bg-accent/10 flex items-center justify-center font-semibold text-accent text-xs"
                    style={{ borderRadius: 2 }}
                  >
                    #{m.milestoneNumber}
                  </div>
                  <span className="text-sm font-medium">Milestone {m.milestoneNumber}</span>
                </div>

                {edit && (
                  <div className="space-y-3">
                    <div>
                      <label className="label-uppercase block mb-1" style={{ fontSize: 10 }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={edit.title}
                        onChange={(e) => updateEdit(m.id, "title", e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
                        style={{ borderRadius: 2 }}
                      />
                    </div>

                    <div>
                      <label className="label-uppercase block mb-1" style={{ fontSize: 10 }}>
                        Description
                      </label>
                      <textarea
                        value={edit.description}
                        onChange={(e) => updateEdit(m.id, "description", e.target.value)}
                        rows={2}
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                        style={{ borderRadius: 2 }}
                      />
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex-1 max-w-[200px]">
                        <label className="label-uppercase block mb-1" style={{ fontSize: 10 }}>
                          Amount ($)
                        </label>
                        <input
                          type="number"
                          value={edit.amount}
                          onChange={(e) => updateEdit(m.id, "amount", e.target.value)}
                          className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
                          style={{ borderRadius: 2 }}
                        />
                      </div>

                      <button
                        onClick={() => handleSaveMilestone(m.id)}
                        disabled={isSaving || !hasChanges}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          hasChanges
                            ? "bg-accent text-white hover:bg-accent/90"
                            : "bg-border text-muted cursor-not-allowed"
                        } ${isSaving ? "opacity-50" : ""}`}
                        style={{ borderRadius: 2 }}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {globalMilestones.length === 0 && (
            <div
              className="bg-surface border border-border p-8 text-center"
              style={{ borderRadius: 2 }}
            >
              <p className="text-muted text-sm">
                No global milestones defined yet. Add them in the database.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fellows Stipend Overview */}
      <div>
        <div className="label-uppercase mb-3" style={{ fontSize: 10 }}>
          Fellows Stipend Overview
        </div>

        {/* Fellows without stipend records */}
        {fellowsWithoutStipends.length > 0 && (
          <div
            className="bg-surface border border-border mb-3"
            style={{ borderRadius: 2 }}
          >
            <div className="p-4 border-b border-border">
              <span className="text-sm font-medium">
                Uninitialized ({fellowsWithoutStipends.length})
              </span>
              <span className="text-xs text-muted ml-2">
                These fellows do not have stipend records yet
              </span>
            </div>
            <div className="divide-y divide-border">
              {fellowsWithoutStipends.map((f) => {
                const isIniting = initializingFellow === f.id;
                return (
                  <div key={f.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 bg-accent/10 text-accent flex items-center justify-center font-semibold text-xs shrink-0"
                        style={{ borderRadius: 2 }}
                      >
                        {f.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{f.fullName}</div>
                        <div className="text-xs text-muted">{f.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInitFellow(f.id)}
                      disabled={isIniting}
                      className={`px-3 py-1.5 text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors ${
                        isIniting ? "opacity-50" : ""
                      }`}
                      style={{ borderRadius: 2 }}
                    >
                      {isIniting ? "Initializing..." : "Initialize"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fellows with stipend records */}
        {Array.from(stipendsByFellow.entries()).length > 0 ? (
          <div
            className="bg-surface border border-border"
            style={{ borderRadius: 2 }}
          >
            <div className="divide-y divide-border">
              {Array.from(stipendsByFellow.entries()).map(([fellowId, data]) => {
                const m1 = data.milestones.find((m) => m.milestoneNumber === 1);
                const m2 = data.milestones.find((m) => m.milestoneNumber === 2);

                return (
                  <div key={fellowId} className="p-4">
                    {/* Fellow header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 bg-accent/10 text-accent flex items-center justify-center font-semibold text-xs shrink-0"
                        style={{ borderRadius: 2 }}
                      >
                        {data.fellow.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{data.fellow.fullName}</div>
                        <div className="text-xs text-muted">{data.fellow.email}</div>
                      </div>
                    </div>

                    {/* Milestone rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                      {[m1, m2].map((milestone, idx) => {
                        if (!milestone) return null;
                        const num = idx + 1;
                        const isMet = !!milestone.milestoneMet;
                        const isReleased = !!milestone.paymentReleased;
                        const isToggling = togglingStipend === milestone.id;

                        return (
                          <div
                            key={milestone.id}
                            className="bg-background border border-border p-3"
                            style={{ borderRadius: 2 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">
                                Milestone #{num} — ${milestone.amount.toLocaleString()}
                              </span>
                              {isReleased && (
                                <span
                                  className="inline-block px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700"
                                  style={{ borderRadius: 2 }}
                                >
                                  Paid
                                </span>
                              )}
                              {isMet && !isReleased && (
                                <span
                                  className="inline-block px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700"
                                  style={{ borderRadius: 2 }}
                                >
                                  Met
                                </span>
                              )}
                              {!isMet && (
                                <span
                                  className="inline-block px-2 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-500"
                                  style={{ borderRadius: 2 }}
                                >
                                  Pending
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-muted mb-2">{milestone.title}</div>

                            {/* Met date */}
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted">
                                Met:{" "}
                                {isMet
                                  ? new Date(milestone.milestoneMet!).toLocaleDateString()
                                  : "—"}
                              </span>
                              <button
                                onClick={() => handleToggleMet(milestone.id, isMet)}
                                disabled={isToggling}
                                className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                  isMet
                                    ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    : "bg-accent/10 text-accent hover:bg-accent/20"
                                } ${isToggling ? "opacity-50" : ""}`}
                                style={{ borderRadius: 2 }}
                              >
                                {isToggling ? "..." : isMet ? "Clear Met" : "Mark Met"}
                              </button>
                            </div>

                            {/* Released date */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted">
                                Released:{" "}
                                {isReleased
                                  ? new Date(milestone.paymentReleased!).toLocaleDateString()
                                  : "—"}
                              </span>
                              <button
                                onClick={() => handleToggleReleased(milestone.id, isReleased)}
                                disabled={isToggling}
                                className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                  isReleased
                                    ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                } ${isToggling ? "opacity-50" : ""}`}
                                style={{ borderRadius: 2 }}
                              >
                                {isToggling
                                  ? "..."
                                  : isReleased
                                  ? "Clear Released"
                                  : "Mark Released"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          fellowsWithoutStipends.length === 0 && (
            <div
              className="bg-surface border border-border p-8 text-center"
              style={{ borderRadius: 2 }}
            >
              <p className="text-muted text-sm">
                No fellows registered yet.
              </p>
            </div>
          )
        )}
      </div>

      {/* Footer note */}
      <div
        className="bg-surface border border-border p-4 text-xs text-muted"
        style={{ borderRadius: 2 }}
      >
        Each fellow receives $5,000 across 2 milestones. Initialize stipend records before tracking payments.
      </div>
    </div>
  );
}
