"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getPipeline, updatePipelineRole } from "@/app/actions/studio";

type PipelineRole = {
  id: string;
  roleTitle: string;
  department: string | null;
  applicants: number | null;
  leads: number | null;
  review: number | null;
  screening: number | null;
  interview: number | null;
  offer: number | null;
  hired: number | null;
  archived: number | null;
  status: string | null;
  priority: string | null;
  ashbyLive: boolean | null;
  displayOrder: number | null;
};

const STAGES = [
  { key: "leads", label: "Leads" },
  { key: "review", label: "Review" },
  { key: "screening", label: "Screen" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
] as const;

export default function PipelinePage() {
  const [roles, setRoles] = useState<PipelineRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPipeline()
      .then((data) => {
        setRoles(data as PipelineRole[]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load pipeline:", error);
        setLoading(false);
        setRoles([]);
      });
  }, []);

  function startEdit(role: PipelineRole) {
    setEditingId(role.id);
    setEditData({
      applicants: role.applicants || 0,
      leads: role.leads || 0,
      review: role.review || 0,
      screening: role.screening || 0,
      interview: role.interview || 0,
      offer: role.offer || 0,
      hired: role.hired || 0,
    });
  }

  function saveEdit(roleId: string) {
    startTransition(async () => {
      await updatePipelineRole(roleId, editData);
      const updated = await getPipeline();
      setRoles(updated as PipelineRole[]);
      setEditingId(null);
    });
  }

  if (loading) {
    return <div className="text-muted text-sm">Loading pipeline...</div>;
  }

  const totalApplicants = roles.reduce((s, r) => s + (r.applicants || 0), 0);
  const totalHired = roles.reduce((s, r) => s + (r.hired || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label-uppercase text-muted mb-2">Studio OS</div>
            <h1 className="text-2xl font-medium text-foreground">Recruitment Pipeline</h1>
            <p className="text-sm text-muted mt-1">
              {totalApplicants} total applicants — {totalHired} hired — {roles.length} roles tracked
            </p>
          </div>
          {totalHired > 0 && (
            <Link
              href="/admin/fellows"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
              style={{ borderRadius: 2 }}
            >
              <span>+</span> Manage Fellows
            </Link>
          )}
        </div>
        {totalHired > 0 && (
          <div className="mt-3 p-3 bg-accent/5 border border-accent/20 text-sm text-accent" style={{ borderRadius: 2 }}>
            {totalHired} candidate{totalHired !== 1 ? "s" : ""} hired — go to{" "}
            <Link href="/admin/fellows" className="underline font-medium">
              Fellows Management
            </Link>{" "}
            to set up their profiles and invite them to The Co-Builder.
          </div>
        )}
      </div>

      {/* Pipeline roles */}
      <div className="space-y-4">
        {roles.map((role) => {
          const isEditing = editingId === role.id;
          const maxStageValue = Math.max(
            role.leads || 0,
            role.review || 0,
            role.screening || 0,
            role.interview || 0,
            role.offer || 0,
            role.hired || 0,
            1
          );

          return (
            <div
              key={role.id}
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              {/* Role header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{role.roleTitle}</h3>
                    {role.ashbyLive && (
                      <span
                        className="text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200"
                        style={{ borderRadius: 2 }}
                      >
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">{role.department}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{role.applicants}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Applicants</div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(role)}
                      className="text-[10px] text-accent hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    <div>
                      <label className="text-[9px] text-muted uppercase tracking-wider block mb-1">Total</label>
                      <input
                        type="number"
                        value={editData.applicants}
                        onChange={(e) => setEditData({ ...editData, applicants: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                        style={{ borderRadius: 2 }}
                      />
                    </div>
                    {STAGES.map((stage) => (
                      <div key={stage.key}>
                        <label className="text-[9px] text-muted uppercase tracking-wider block mb-1">{stage.label}</label>
                        <input
                          type="number"
                          value={editData[stage.key] || 0}
                          onChange={(e) => setEditData({ ...editData, [stage.key]: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                          style={{ borderRadius: 2 }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(role.id)}
                      disabled={isPending}
                      className="px-3 py-1 bg-accent text-white text-xs font-semibold hover:bg-accent/90 disabled:opacity-50"
                      style={{ borderRadius: 2 }}
                    >
                      {isPending ? "..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Funnel visualization */
                <div className="grid grid-cols-6 gap-2">
                  {STAGES.map((stage) => {
                    const value = (role[stage.key as keyof PipelineRole] as number) || 0;
                    const height = maxStageValue > 0 ? Math.max((value / maxStageValue) * 40, 4) : 4;
                    return (
                      <div key={stage.key} className="text-center">
                        <div className="flex items-end justify-center mb-1" style={{ height: 44 }}>
                          <div
                            className="w-full max-w-[40px]"
                            style={{
                              height,
                              backgroundColor: value > 0 ? "#CC5536" : "#E3E1E2",
                              borderRadius: 1,
                              opacity: value > 0 ? 0.7 + (value / maxStageValue) * 0.3 : 0.3,
                            }}
                          />
                        </div>
                        <div className="text-sm font-semibold text-foreground">{value}</div>
                        <div className="text-[9px] text-muted uppercase tracking-wider">{stage.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
