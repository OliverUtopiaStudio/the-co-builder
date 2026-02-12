"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getPodLaunch,
  updatePreLaunchChecks,
  togglePreLaunchTask,
  toggleLaunchTask,
  advancePodLaunchPhase,
  updatePodLaunchMetrics,
  updateSprintKPIs,
  updateRoleKPIs,
  upsertDealTimeline,
  advanceDealStage,
  updateOperationalRhythm,
  logOperationalWeek,
  updateMilestone,
  // v1 compat
  updatePodLaunchPreWork,
} from "@/app/actions/studio";
import { DEAL_STAGE_TEMPLATES, POD_CYCLE_STAGES } from "@/data/pod-launch-templates";

// ─── Types ─────────────────────────────────────────────────────────

type DayTask = { id: string; title: string; description: string | null; completed: boolean; completedAt: string | null; notes: string | null };
type DaySlot = { dayLabel: string; tasks: { pod_lead: DayTask; fund: DayTask; studio: DayTask } };
type WeekTasks = { weekLabel: string; days: { monday: DaySlot; tuesday: DaySlot; wednesday: DaySlot; thursday: DaySlot; friday: DaySlot } };
type SprintKPIs = Record<string, { target: number; current: number }>;
type SprintV2 = { sprintNumber: number; label: string; startDate: string | null; endDate: string | null; status: string; week1: WeekTasks; week2: WeekTasks; kpis: SprintKPIs; summary: string | null };
type PreLaunchTask = { id: string; title: string; owner: string; completed: boolean; completedAt: string | null; notes: string | null };
type PreLaunch = { checks: Record<string, unknown>; weekMinus1: { tasks: PreLaunchTask[]; completedAt: string | null }; week0: { tasks: PreLaunchTask[]; completedAt: string | null }; notes: string | null; completedAt: string | null };
type MetricKPI = { target: number; current: number; unit: string };
type RoleKPIs = Record<string, Record<string, MetricKPI>>;
type DealStage = { name: string; durationLabel: string; status: string; startedAt: string | null; completedAt: string | null; notes: string | null };
type DealTimeline = { id: string; dealType: string; dealName: string; currentStageIndex: number; stages: DealStage[]; createdAt: string };
type OpRhythm = { 
  mode: string; 
  weeklySchedule: Record<string, { focus: string; description: string }>; 
  weekLog: Array<{ 
    weekNumber: number; 
    startDate: string; 
    notes: string; 
    mode: string;
    metrics?: {
      dealsSourced?: number;
      dealsAdvanced?: number;
      partnersContacted?: number;
      fellowsInterviewed?: number;
      coInvestorsIntroduced?: number;
    };
  }>;
  dailyTasks?: Record<string, Record<string, { id: string; title: string; completed: boolean; notes?: string }>>;
  monthlyMetrics?: Array<{
    month: string;
    dealsSourced: number;
    dealsClosed: number;
    fellowsEmbedded: number;
    partnersEngaged: number;
    coInvestorsMapped: number;
    modeDistribution: { live: number; learn: number; farm: number };
  }>;
};
type Milestone = { id: string; label: string; description: string; status: string; targetDate: string | null; completedAt: string | null };
type ImplTimeline = { milestones: Milestone[] };

type LaunchDetail = {
  launch: {
    id: string; podId: string; name: string; status: string; currentPhase: string;
    phaseStartedAt: Date | null; preWork: unknown; sprint1: unknown; sprint2: unknown;
    preLaunch: unknown; sprints: unknown; operationalRhythm: unknown; roleKpis: unknown;
    dealTimelines: unknown; implementationTimeline: unknown; schemaVersion: number;
    targetMetrics: unknown; startedAt: Date | null; operationalAt: Date | null;
    createdAt: Date; updatedAt: Date;
  };
  podName: string; podColor: string | null; podDisplayOrder: number | null;
  podThesis: string | null; podClusters: unknown; podTargetArchetype: string | null;
};

// ─── Constants ─────────────────────────────────────────────────────

const PHASES_V2 = [
  { key: "pre_launch", label: "Pre-Launch", description: "Week -1 & 0 — Team & tools setup" },
  { key: "sprint_1", label: "Sprint 1", description: "Foundation & activation" },
  { key: "sprint_2", label: "Sprint 2", description: "Construction & conversion" },
  { key: "operational", label: "Operational", description: "Pod is live and compounding" },
] as const;

const TABS = ["Overview", "Sprints", "Deal Pipeline", "Operations", "KPIs", "Analytics"] as const;
type TabKey = typeof TABS[number];

const OWNER_STYLES: Record<string, { color: string; label: string }> = {
  pod_lead: { color: "#CC5536", label: "Pod Lead" },
  fund: { color: "#1976D2", label: "Fund" },
  studio: { color: "#7B1FA2", label: "Studio" },
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const DAY_LABELS = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri" };

const PRE_LAUNCH_CHECKS = [
  { key: "thesisValidated", label: "Thesis validated" },
  { key: "archetypeDefined", label: "Archetype defined" },
  { key: "podLeadIdentified", label: "Pod lead identified" },
  { key: "corporatePartnersMapped", label: "Corporate partners mapped" },
  { key: "coInvestorsMapped", label: "Co-investors mapped" },
  { key: "clustersDefined", label: "Clusters defined" },
  { key: "toolsConfigured", label: "Tools & CRM configured" },
  { key: "communicationSetup", label: "Communication channels set up" },
];

const MODE_STYLES = {
  live: { color: "#DC2626", bg: "#DC262610", label: "LIVE" },
  learn: { color: "#1976D2", bg: "#1976D210", label: "LEARN" },
  farm: { color: "#16a34a", bg: "#16a34a10", label: "FARM" },
};

// ─── Helpers ───────────────────────────────────────────────────────

function phaseIndex(phase: string): number {
  const map: Record<string, number> = { pre_launch: 0, sprint_1: 1, sprint_2: 2, post_sprint: 3, operational: 3 };
  return map[phase] ?? -1;
}

function getSprints(data: unknown): SprintV2[] {
  const arr = data as SprintV2[] | null;
  return Array.isArray(arr) ? arr : [];
}

function getPreLaunch(data: unknown): PreLaunch | null {
  const pl = data as PreLaunch | null;
  if (!pl?.checks) return null;
  return pl;
}

function countDayTasksCompleted(sprint: SprintV2): { total: number; completed: number } {
  let total = 0, completed = 0;
  for (const wk of [sprint.week1, sprint.week2]) {
    if (!wk?.days) continue;
    for (const day of DAYS) {
      const slot = wk.days[day];
      if (!slot?.tasks) continue;
      for (const ws of ["pod_lead", "fund", "studio"] as const) {
        total++;
        if (slot.tasks[ws]?.completed) completed++;
      }
    }
  }
  return { total, completed };
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function PodLaunchDetailPage() {
  const { launchId } = useParams<{ launchId: string }>();
  const [data, setData] = useState<LaunchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [selectedSprint, setSelectedSprint] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<"week1" | "week2">("week1");
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [editingRoleKpis, setEditingRoleKpis] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metricDraft, setMetricDraft] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [roleKpiDraft, setRoleKpiDraft] = useState<any>(null);
  // Deal form
  const [showDealForm, setShowDealForm] = useState(false);
  const [newDealType, setNewDealType] = useState<"co_build_fellow" | "pre_seed_vc" | "seed_vc">("co_build_fellow");
  const [newDealName, setNewDealName] = useState("");
  // Op rhythm
  const [weekNote, setWeekNote] = useState("");
  const [weekMode, setWeekMode] = useState<"live" | "learn" | "farm">("live");

  function reload() {
    if (!launchId) return;
    getPodLaunch(launchId).then((r) => setData(r as LaunchDetail | null));
  }

  useEffect(() => {
    if (launchId) {
      getPodLaunch(launchId).then((r) => { setData(r as LaunchDetail | null); setLoading(false); });
    }
  }, [launchId]);

  if (loading) return <div className="text-muted text-sm">Loading launch...</div>;
  if (!data) return <div className="text-muted text-sm">Launch not found.</div>;

  const { launch, podName, podColor, podDisplayOrder } = data;
  const isV2 = launch.schemaVersion === 2;
  const sprints = getSprints(launch.sprints);
  const preLaunch = getPreLaunch(launch.preLaunch);
  const metrics = (launch.targetMetrics || {}) as Record<string, { target: number; current: number; tier1Count?: number }>;
  const roleKpis = (launch.roleKpis || {}) as RoleKPIs;
  const deals = (launch.dealTimelines || []) as DealTimeline[];
  const opRhythm = (launch.operationalRhythm || {}) as OpRhythm;
  const implTimeline = (launch.implementationTimeline || {}) as ImplTimeline;
  const currentPhaseIdx = phaseIndex(launch.currentPhase);

  // ─── Handlers ──────────────────────────────────────────────────

  function handleAdvance() {
    startTransition(async () => { await advancePodLaunchPhase(launch.id); reload(); });
  }

  function handleToggleDayTask(sprintIdx: number, weekKey: "week1" | "week2", day: typeof DAYS[number], ws: "pod_lead" | "fund" | "studio", completed: boolean) {
    startTransition(async () => { await toggleLaunchTask(launch.id, sprintIdx, weekKey, day, ws, completed); reload(); });
  }

  function handleTogglePreLaunchTask(weekKey: "weekMinus1" | "week0", taskId: string, completed: boolean) {
    startTransition(async () => { await togglePreLaunchTask(launch.id, weekKey, taskId, completed); reload(); });
  }

  function handleToggleCheck(key: string) {
    if (!preLaunch) return;
    startTransition(async () => {
      const updated = { ...preLaunch.checks, [key]: !preLaunch.checks[key] };
      await updatePreLaunchChecks(launch.id, updated);
      reload();
    });
  }

  function handlePodLeadName(name: string) {
    if (!preLaunch) return;
    startTransition(async () => {
      await updatePreLaunchChecks(launch.id, { ...preLaunch.checks, podLeadName: name, podLeadIdentified: name.trim().length > 0 });
      reload();
    });
  }

  function handleSaveMetrics() {
    if (!metricDraft) return;
    startTransition(async () => { await updatePodLaunchMetrics(launch.id, metricDraft); setEditingMetrics(false); setMetricDraft(null); reload(); });
  }

  function handleSaveRoleKpis() {
    if (!roleKpiDraft) return;
    startTransition(async () => { await updateRoleKPIs(launch.id, roleKpiDraft); setEditingRoleKpis(false); setRoleKpiDraft(null); reload(); });
  }

  function handleSaveSprintKPIs(sprintIdx: number, kpis: Record<string, { target?: number; current?: number }>) {
    startTransition(async () => { await updateSprintKPIs(launch.id, sprintIdx, kpis); reload(); });
  }

  function handleAddDeal() {
    if (!newDealName.trim()) return;
    startTransition(async () => {
      await upsertDealTimeline(launch.id, { dealType: newDealType, dealName: newDealName });
      setShowDealForm(false); setNewDealName(""); reload();
    });
  }

  function handleAdvanceDealStage(dealId: string, stageIdx: number) {
    startTransition(async () => { await advanceDealStage(launch.id, dealId, stageIdx, "completed"); reload(); });
  }

  function handleLogWeek() {
    if (!weekNote.trim()) return;
    startTransition(async () => { await logOperationalWeek(launch.id, weekNote, weekMode); setWeekNote(""); reload(); });
  }

  function handleMilestone(milestoneId: string, status: "pending" | "active" | "completed") {
    startTransition(async () => { await updateMilestone(launch.id, milestoneId, status); reload(); });
  }

  function handleModeChange(mode: "live" | "learn" | "farm") {
    startTransition(async () => {
      const updated = { ...opRhythm, mode };
      await updateOperationalRhythm(launch.id, updated);
      reload();
    });
  }

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/studio/pod-launch" className="text-xs text-accent hover:underline">← Back to Pod Launches</Link>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: podColor || "#CC5536", borderRadius: 2 }}>{podDisplayOrder}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-medium text-foreground">{launch.name}</h1>
          <p className="text-sm text-muted mt-0.5">{podName}</p>
        </div>
        {isV2 && <span className="text-[8px] font-bold text-muted border border-border px-1.5 py-0.5 uppercase tracking-wider" style={{ borderRadius: 2 }}>v2</span>}
      </div>

      {/* Phase Navigator */}
      <div className="bg-surface border border-border p-5 mb-4" style={{ borderRadius: 2 }}>
        <div className="flex items-stretch gap-2">
          {PHASES_V2.map((p, i) => {
            const isComplete = i < currentPhaseIdx || launch.status === "operational";
            const isCurrent = i === currentPhaseIdx && launch.status !== "operational";
            return (
              <div key={p.key} className="flex items-center flex-1">
                <div className="flex-1 p-3 border transition-colors" style={{ borderRadius: 2, borderColor: isCurrent ? podColor || "#CC5536" : isComplete ? "#16a34a" : "#E3E1E2", backgroundColor: isCurrent ? `${podColor || "#CC5536"}08` : isComplete ? "#f0fdf4" : "transparent" }}>
                  <div className="text-[9px] font-bold tracking-[0.5px] uppercase mb-1" style={{ color: isComplete && !isCurrent ? "#16a34a" : isCurrent ? podColor || "#CC5536" : "#8F898B" }}>
                    {isComplete && !isCurrent ? "✓ " : ""}{p.label}
                  </div>
                  <div className="text-[10px] text-muted">{p.description}</div>
                </div>
                {i < PHASES_V2.length - 1 && <div className="px-1 text-muted text-xs">→</div>}
              </div>
            );
          })}
        </div>
        {!["operational", "cancelled", "paused"].includes(launch.status) && (
          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleAdvance} disabled={isPending} className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50" style={{ borderRadius: 2 }}>
              {isPending ? "Advancing..." : `Complete ${PHASES_V2[currentPhaseIdx]?.label || "Phase"} & Advance →`}
            </button>
            <span className="text-xs text-muted">Moves to {PHASES_V2[currentPhaseIdx + 1]?.label || "Operational"}</span>
          </div>
        )}
        {launch.status === "operational" && (
          <div className="mt-4 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium" style={{ borderRadius: 2 }}>
            Pod is operational — thesis infrastructure is live and compounding.
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ TAB: Overview ═══ */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Pod Cycle Visualization */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-muted mb-4 text-[10px]">Pod Cycle</div>
            <div className="flex items-center gap-1">
              {POD_CYCLE_STAGES.map((stage, i) => {
                const isActive = (launch.currentPhase === "pre_launch" && stage.key === "define") ||
                  (launch.currentPhase === "sprint_1" && (stage.key === "source" || stage.key === "evaluate")) ||
                  (launch.currentPhase === "sprint_2" && (stage.key === "evaluate" || stage.key === "build")) ||
                  (launch.status === "operational" && stage.key === "scale");
                return (
                  <div key={stage.key} className="flex items-center flex-1">
                    <div className="flex-1 text-center p-3 border" style={{ borderRadius: 2, borderColor: isActive ? podColor || "#CC5536" : "#E3E1E2", backgroundColor: isActive ? `${podColor || "#CC5536"}10` : "transparent" }}>
                      <div className="text-[10px] font-bold uppercase" style={{ color: isActive ? podColor || "#CC5536" : "#8F898B" }}>{stage.label}</div>
                      <div className="text-[9px] text-muted mt-0.5">{stage.description}</div>
                    </div>
                    {i < POD_CYCLE_STAGES.length - 1 && <div className="px-0.5 text-muted text-[10px]">→</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Implementation Timeline */}
          {implTimeline.milestones && implTimeline.milestones.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Implementation Timeline</div>
              <div className="flex items-start gap-2">
                {implTimeline.milestones.map((ms, i) => (
                  <div key={ms.id} className="flex items-center flex-1">
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      const next = ms.status === "pending" ? "active" : ms.status === "active" ? "completed" : "pending";
                      handleMilestone(ms.id, next);
                    }}>
                      <div className="text-[9px] font-bold uppercase mb-1" style={{ color: ms.status === "completed" ? "#16a34a" : ms.status === "active" ? podColor || "#CC5536" : "#8F898B" }}>
                        {ms.status === "completed" ? "✓ " : ""}{ms.label}
                      </div>
                      <div className="text-[9px] text-muted">{ms.description}</div>
                      {ms.completedAt && (
                        <div className="text-[8px] text-muted mt-0.5">Completed {new Date(ms.completedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    {i < implTimeline.milestones.length - 1 && <div className="px-0.5 text-muted text-[8px]">→</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Operational State Summary (when operational) */}
          {launch.status === "operational" && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Operational State Summary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Mode */}
                <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                  <div className="text-[9px] text-muted uppercase mb-1">Current Mode</div>
                  <div className="flex items-center gap-2">
                    {(["live", "learn", "farm"] as const).map((m) => {
                      const ms = MODE_STYLES[m];
                      if (opRhythm.mode !== m) return null;
                      return (
                        <div key={m} className="flex items-center gap-1.5">
                          <div className="w-2 h-2" style={{ backgroundColor: ms.color, borderRadius: 1 }} />
                          <span className="text-xs font-semibold uppercase" style={{ color: ms.color }}>{ms.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[9px] text-muted mt-2">
                    {opRhythm.mode === "live" && "Active deal sourcing & partner engagement"}
                    {opRhythm.mode === "learn" && "Learning phase — optimizing channels & processes"}
                    {opRhythm.mode === "farm" && "Farming phase — deepening relationships & portfolio"}
                  </div>
                </div>
                {/* Weeks Logged */}
                <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                  <div className="text-[9px] text-muted uppercase mb-1">Operational History</div>
                  <div className="text-lg font-semibold text-foreground">{opRhythm.weekLog?.length || 0}</div>
                  <div className="text-[9px] text-muted">weeks logged</div>
                  {launch.operationalAt && (
                    <div className="text-[9px] text-muted mt-1">
                      Operational since {new Date(launch.operationalAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Target Metrics + Pod Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="label-uppercase text-muted text-[10px]">Target State</div>
                <button onClick={() => { setEditingMetrics(!editingMetrics); if (!editingMetrics) setMetricDraft(JSON.parse(JSON.stringify(metrics))); }} className="text-[10px] text-accent hover:underline">
                  {editingMetrics ? "Cancel" : "Edit"}
                </button>
              </div>
              {!editingMetrics ? (
                <div className="space-y-3">
                  {Object.entries(metrics).map(([key, val]) => {
                    if (typeof val === "boolean") return <div key={key} className="flex items-center justify-between"><span className="text-xs text-muted">{key}</span><span className={`text-xs font-semibold ${val ? "text-green-600" : "text-muted"}`}>{val ? "Yes" : "No"}</span></div>;
                    if (!val || typeof val !== "object") return null;
                    const pct = val.target > 0 ? Math.min((val.current / val.target) * 100, 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="text-xs font-semibold text-foreground">{val.current}<span className="text-muted font-normal">/{val.target}</span></span>
                        </div>
                        <div className="h-1.5 bg-background overflow-hidden" style={{ borderRadius: 1 }}>
                          <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: podColor || "#CC5536", borderRadius: 1 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : metricDraft && (
                <div className="space-y-2">
                  {Object.entries(metricDraft).map(([key, val]) => {
                    if (typeof val === "boolean") return null;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mv = val as any;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted w-24 truncate">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <input type="number" value={mv.current} onChange={(e) => setMetricDraft({ ...metricDraft, [key]: { ...mv, current: Number(e.target.value) } })} className="w-12 px-1 py-0.5 bg-background border border-border text-xs text-center" style={{ borderRadius: 2 }} />
                        <span className="text-[10px] text-muted">/</span>
                        <input type="number" value={mv.target} onChange={(e) => setMetricDraft({ ...metricDraft, [key]: { ...mv, target: Number(e.target.value) } })} className="w-12 px-1 py-0.5 bg-background border border-border text-xs text-center" style={{ borderRadius: 2 }} />
                      </div>
                    );
                  })}
                  <button onClick={handleSaveMetrics} disabled={isPending} className="w-full px-3 py-1.5 bg-accent text-white text-xs font-semibold mt-2" style={{ borderRadius: 2 }}>
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </section>

            {data.podThesis && (
              <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                <div className="label-uppercase text-muted mb-2 text-[10px]">Pod Thesis</div>
                <p className="text-xs text-foreground leading-relaxed line-clamp-8">{data.podThesis}</p>
                <Link href={`/studio/pods/${launch.podId}`} className="text-[10px] text-accent hover:underline mt-2 inline-block">View Full Pod →</Link>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: Sprints ═══ */}
      {activeTab === "Sprints" && sprints.length > 0 && (
        <div className="space-y-4">
          {/* Sprint Selector */}
          <div className="flex items-center gap-2">
            {sprints.map((s, i) => (
              <button key={i} onClick={() => { setSelectedSprint(i); setSelectedWeek("week1"); }} className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${selectedSprint === i ? "border-accent text-accent bg-accent/5" : "border-border text-muted hover:text-foreground"}`} style={{ borderRadius: 2 }}>
                {s.status === "completed" ? "✓ " : ""}{s.label}
              </button>
            ))}
          </div>

          {(() => {
            const sprint = sprints[selectedSprint];
            if (!sprint) return null;
            const progress = countDayTasksCompleted(sprint);
            const isCurrent = (selectedSprint === 0 && launch.currentPhase === "sprint_1") || (selectedSprint === 1 && launch.currentPhase === "sprint_2");

            return (
              <>
                {/* Sprint KPIs */}
                <section className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="label-uppercase text-muted text-[10px]">Sprint {sprint.sprintNumber} KPIs — {progress.completed}/{progress.total} tasks</div>
                    <div className="text-[10px] text-muted">{sprint.status === "completed" ? "✓ Complete" : sprint.status === "active" ? "Active" : "Pending"}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(sprint.kpis || {}).map(([key, val]) => {
                      const pct = val.target > 0 ? Math.min((val.current / val.target) * 100, 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-muted truncate">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className="text-[10px] font-semibold">{val.current}/{val.target}</span>
                          </div>
                          <div className="h-1 bg-background overflow-hidden" style={{ borderRadius: 1 }}>
                            <div className="h-full" style={{ width: `${pct}%`, backgroundColor: podColor || "#CC5536", borderRadius: 1 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isCurrent && (
                    <button onClick={() => {
                      const draft: Record<string, { target?: number; current?: number }> = {};
                      // Simple increment — user can customize later
                      for (const [k, v] of Object.entries(sprint.kpis || {})) { draft[k] = { current: v.current }; }
                      // For now, show a simple prompt-like UI later. Just allow saving.
                    }} className="text-[9px] text-accent hover:underline mt-2">Edit KPIs →</button>
                  )}
                </section>

                {/* Week Selector */}
                <div className="flex items-center gap-2">
                  {(["week1", "week2"] as const).map((wk) => {
                    const weekData = sprint[wk];
                    return (
                      <button key={wk} onClick={() => setSelectedWeek(wk)} className={`px-3 py-1.5 text-xs font-medium transition-colors border ${selectedWeek === wk ? "border-accent text-accent bg-accent/5" : "border-border text-muted"}`} style={{ borderRadius: 2 }}>
                        {weekData?.weekLabel || wk}
                      </button>
                    );
                  })}
                </div>

                {/* Daily Task Grid */}
                {(() => {
                  const week = sprint[selectedWeek];
                  if (!week?.days) return <div className="text-muted text-sm">No data for this week.</div>;
                  return (
                    <div className="overflow-x-auto">
                      <div className="grid gap-2" style={{ gridTemplateColumns: "80px repeat(5, 1fr)", minWidth: 800 }}>
                        {/* Header row — day labels */}
                        <div />
                        {DAYS.map((day) => {
                          const slot = week.days[day];
                          return (
                            <div key={day} className="text-center">
                              <div className="text-[10px] font-bold text-foreground uppercase">{DAY_LABELS[day]}</div>
                              <div className="text-[8px] text-muted">{slot?.dayLabel || ""}</div>
                            </div>
                          );
                        })}

                        {/* Workstream rows */}
                        {(["pod_lead", "fund", "studio"] as const).map((ws) => {
                          const style = OWNER_STYLES[ws];
                          return (
                            <div key={ws} className="contents">
                              {/* Row label */}
                              <div className="flex items-center gap-1.5 pr-2">
                                <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: style.color, borderRadius: 1 }} />
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{style.label}</span>
                              </div>
                              {/* Day cells */}
                              {DAYS.map((day) => {
                                const slot = week.days[day];
                                const t = slot?.tasks?.[ws];
                                if (!t) return <div key={day} className="p-2 border border-border/50 bg-background/50" style={{ borderRadius: 2 }} />;
                                const canClick = isCurrent && sprint.status !== "completed";
                                return (
                                  <div
                                    key={day}
                                    className={`p-2 border transition-colors ${canClick ? "cursor-pointer hover:border-accent/40" : ""}`}
                                    style={{ borderRadius: 2, borderColor: t.completed ? "#16a34a40" : "#E3E1E2", backgroundColor: t.completed ? "#f0fdf408" : "transparent", borderLeftWidth: 3, borderLeftColor: t.completed ? "#16a34a" : style.color }}
                                    onClick={() => { if (canClick) handleToggleDayTask(selectedSprint, selectedWeek, day, ws, !t.completed); }}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      <input type="checkbox" checked={t.completed} readOnly className="mt-0.5 accent-[#16a34a]" style={{ pointerEvents: "none" }} />
                                      <span className={`text-[10px] leading-tight ${t.completed ? "text-muted line-through" : "text-foreground"}`}>{t.title}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </div>
      )}

      {/* ═══ TAB: Deal Pipeline ═══ */}
      {activeTab === "Deal Pipeline" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="label-uppercase text-muted text-[10px]">Deal Timelines ({deals.length})</div>
            <button onClick={() => setShowDealForm(!showDealForm)} className="px-3 py-1.5 bg-accent text-white text-xs font-semibold" style={{ borderRadius: 2 }}>+ Add Deal</button>
          </div>

          {showDealForm && (
            <div className="bg-surface border border-accent/20 p-4" style={{ borderRadius: 2 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select value={newDealType} onChange={(e) => setNewDealType(e.target.value as typeof newDealType)} className="px-3 py-2 bg-background border border-border text-sm" style={{ borderRadius: 2 }}>
                  <option value="co_build_fellow">Co-Build Fellow (12-18mo)</option>
                  <option value="pre_seed_vc">Pre-Seed VC (3-6mo)</option>
                  <option value="seed_vc">Seed VC (6-12mo)</option>
                </select>
                <input type="text" value={newDealName} onChange={(e) => setNewDealName(e.target.value)} placeholder="Deal / person name..." className="px-3 py-2 bg-background border border-border text-sm" style={{ borderRadius: 2 }} />
                <div className="flex gap-2">
                  <button onClick={handleAddDeal} disabled={!newDealName.trim() || isPending} className="px-4 py-2 bg-accent text-white text-xs font-semibold disabled:opacity-50" style={{ borderRadius: 2 }}>Add</button>
                  <button onClick={() => setShowDealForm(false)} className="px-3 py-2 text-xs text-muted">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {deals.length === 0 && !showDealForm && (
            <div className="text-center py-12 text-muted text-sm">No deals tracked yet. Add your first deal to track its lifecycle.</div>
          )}

          {deals.map((deal) => {
            const template = DEAL_STAGE_TEMPLATES[deal.dealType as keyof typeof DEAL_STAGE_TEMPLATES];
            return (
              <div key={deal.id} className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{deal.dealName}</h3>
                    <span className="text-[10px] text-muted">{template?.label || deal.dealType} · {template?.totalDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {deal.stages.map((stage, si) => (
                    <div key={si} className="flex items-center flex-1">
                      <div
                        className={`flex-1 p-2 text-center border cursor-pointer transition-colors ${stage.status === "completed" ? "border-green-300 bg-green-50" : stage.status === "active" ? "border-accent/40 bg-accent/5" : "border-border"}`}
                        style={{ borderRadius: 2 }}
                        onClick={() => { if (stage.status === "active") handleAdvanceDealStage(deal.id, si); }}
                      >
                        <div className="text-[9px] font-semibold" style={{ color: stage.status === "completed" ? "#16a34a" : stage.status === "active" ? podColor || "#CC5536" : "#8F898B" }}>
                          {stage.status === "completed" ? "✓ " : ""}{stage.name}
                        </div>
                        <div className="text-[8px] text-muted">{stage.durationLabel}</div>
                      </div>
                      {si < deal.stages.length - 1 && <div className="px-0.5 text-muted text-[8px]">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ TAB: Operations ═══ */}
      {activeTab === "Operations" && (
        <div className="space-y-6">
          {/* Operational Health Dashboard (when operational) */}
          {launch.status === "operational" && (
            <>
              {/* Health Metrics */}
              <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                <div className="label-uppercase text-muted mb-4 text-[10px]">Operational Health Dashboard</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Deal Flow Health */}
                  <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                    <div className="text-[9px] text-muted uppercase mb-1">Deal Flow</div>
                    <div className="text-lg font-semibold text-foreground">{metrics.dealsInPipeline?.current || 0}</div>
                    <div className="text-[9px] text-muted">/{metrics.dealsInPipeline?.target || 0} target</div>
                    <div className="h-1 bg-border mt-2 overflow-hidden" style={{ borderRadius: 1 }}>
                      <div className="h-full bg-accent" style={{ width: `${Math.min(((metrics.dealsInPipeline?.current || 0) / (metrics.dealsInPipeline?.target || 1)) * 100, 100)}%`, borderRadius: 1 }} />
                    </div>
                  </div>
                  {/* Fellow Pipeline Health */}
                  <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                    <div className="text-[9px] text-muted uppercase mb-1">Fellows</div>
                    <div className="text-lg font-semibold text-foreground">{metrics.fellowsEmbedded?.current || 0}</div>
                    <div className="text-[9px] text-muted">/{metrics.fellowsEmbedded?.target || 0} target</div>
                    <div className="h-1 bg-border mt-2 overflow-hidden" style={{ borderRadius: 1 }}>
                      <div className="h-full bg-accent" style={{ width: `${Math.min(((metrics.fellowsEmbedded?.current || 0) / (metrics.fellowsEmbedded?.target || 1)) * 100, 100)}%`, borderRadius: 1 }} />
                    </div>
                  </div>
                  {/* Partner Engagement Health */}
                  <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                    <div className="text-[9px] text-muted uppercase mb-1">Partners</div>
                    <div className="text-lg font-semibold text-foreground">{metrics.corporatePartnersEngaged?.current || 0}</div>
                    <div className="text-[9px] text-muted">/{metrics.corporatePartnersEngaged?.target || 0} engaged</div>
                    <div className="h-1 bg-border mt-2 overflow-hidden" style={{ borderRadius: 1 }}>
                      <div className="h-full bg-accent" style={{ width: `${Math.min(((metrics.corporatePartnersEngaged?.current || 0) / (metrics.corporatePartnersEngaged?.target || 1)) * 100, 100)}%`, borderRadius: 1 }} />
                    </div>
                  </div>
                  {/* Operational Weeks */}
                  <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                    <div className="text-[9px] text-muted uppercase mb-1">Weeks Operational</div>
                    <div className="text-lg font-semibold text-foreground">{opRhythm.weekLog?.length || 0}</div>
                    <div className="text-[9px] text-muted">{launch.operationalAt ? `Since ${new Date(launch.operationalAt).toLocaleDateString()}` : "Not started"}</div>
                  </div>
                </div>
              </section>

              {/* Active Deals Summary */}
              {deals.length > 0 && (
                <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                  <div className="label-uppercase text-muted mb-3 text-[10px]">Active Deal Pipeline</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {deals.filter((d) => d.stages.some((s) => s.status === "active" || s.status === "completed")).slice(0, 6).map((deal) => {
                      const activeStage = deal.stages[deal.currentStageIndex];
                      const progress = ((deal.currentStageIndex + 1) / deal.stages.length) * 100;
                      return (
                        <div key={deal.id} className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                          <div className="text-xs font-semibold text-foreground mb-1 truncate">{deal.dealName}</div>
                          <div className="text-[9px] text-muted mb-2">{activeStage?.name || "Pending"}</div>
                          <div className="h-1 bg-border overflow-hidden" style={{ borderRadius: 1 }}>
                            <div className="h-full bg-accent" style={{ width: `${progress}%`, borderRadius: 1 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {deals.length > 6 && (
                    <Link href="#deal-pipeline" className="text-[10px] text-accent hover:underline mt-3 inline-block">View all {deals.length} deals →</Link>
                  )}
                </section>
              )}
            </>
          )}

          {/* Pre-Launch Section */}
          {preLaunch && ["pre_launch", "planning"].includes(launch.currentPhase) && (
            <>
              {/* Checklist */}
              <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                <div className="label-uppercase text-muted mb-4 text-[10px]">Pre-Launch Checklist</div>
                <div className="space-y-2">
                  {PRE_LAUNCH_CHECKS.map((item) => {
                    if (item.key === "podLeadIdentified") {
                      return (
                        <div key={item.key} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                          <input type="checkbox" checked={!!preLaunch.checks.podLeadIdentified} readOnly className="mt-1 accent-[#CC5536]" />
                          <div className="flex-1">
                            <div className="text-sm text-foreground font-medium">{item.label}</div>
                            <input type="text" defaultValue={(preLaunch.checks.podLeadName as string) || ""} placeholder="Enter pod lead name..." onBlur={(e) => handlePodLeadName(e.target.value)} className="w-full max-w-xs px-2 py-1 bg-background border border-border text-xs mt-1" style={{ borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    }
                    const val = preLaunch.checks[item.key];
                    return (
                      <div key={item.key} className="flex items-center gap-3 py-2 border-b border-border last:border-0 cursor-pointer" onClick={() => handleToggleCheck(item.key)}>
                        <input type="checkbox" checked={!!val} readOnly className="accent-[#CC5536]" />
                        <span className={`text-sm ${val ? "text-muted line-through" : "text-foreground"}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Week -1 and Week 0 Tasks */}
              {(["weekMinus1", "week0"] as const).map((weekKey) => {
                const week = preLaunch[weekKey];
                if (!week?.tasks?.length) return null;
                return (
                  <section key={weekKey} className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                    <div className="label-uppercase text-muted mb-3 text-[10px]">{weekKey === "weekMinus1" ? "Week -1 — Team & Resource Allocation" : "Week 0 — Tools & Systems Setup"}</div>
                    <div className="space-y-2">
                      {week.tasks.map((t) => {
                        const ownerStyle = OWNER_STYLES[t.owner] || OWNER_STYLES.pod_lead;
                        return (
                          <div key={t.id} className="flex items-start gap-3 py-1.5 cursor-pointer" onClick={() => handleTogglePreLaunchTask(weekKey, t.id, !t.completed)}>
                            <input type="checkbox" checked={t.completed} readOnly className="mt-0.5 accent-[#16a34a]" />
                            <div className="flex-1">
                              <span className={`text-xs ${t.completed ? "text-muted line-through" : "text-foreground"}`}>{t.title}</span>
                            </div>
                            <span className="text-[8px] font-bold uppercase" style={{ color: ownerStyle.color }}>{ownerStyle.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {/* Pre-launch summary (when past pre-launch) */}
          {!["pre_launch", "planning"].includes(launch.currentPhase) && preLaunch?.completedAt && (
            <section className="bg-surface border border-border p-5 opacity-70" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-2 text-[10px]">Pre-Launch ✓</div>
              <div className="text-xs text-muted">Completed {new Date(preLaunch.completedAt).toLocaleDateString()}</div>
            </section>
          )}

          {/* Operational Rhythm (shown in operational phase) */}
          {launch.status === "operational" && opRhythm.weeklySchedule && (
            <>
              <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="label-uppercase text-muted text-[10px]">Weekly Operational Rhythm</div>
                  <div className="flex items-center gap-1">
                    {(["live", "learn", "farm"] as const).map((m) => {
                      const ms = MODE_STYLES[m];
                      return (
                        <button key={m} onClick={() => handleModeChange(m)} className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border transition-colors ${opRhythm.mode === m ? "" : "opacity-40"}`} style={{ borderRadius: 2, color: ms.color, backgroundColor: opRhythm.mode === m ? ms.bg : "transparent", borderColor: ms.color }}>
                          {ms.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                    {DAYS.map((day) => {
                      const sched = opRhythm.weeklySchedule?.[day];
                      if (!sched) return null;
                      const dayTasks = (opRhythm.dailyTasks?.[day] || {});
                      const completedCount = Object.values(dayTasks).filter((t: unknown) => (t as { completed?: boolean })?.completed).length;
                      const totalCount = Object.keys(dayTasks).length || 0;
                      return (
                        <div key={day} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-[10px] font-bold uppercase text-muted w-8">{DAY_LABELS[day]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold text-foreground">{sched.focus}</div>
                              {totalCount > 0 && (
                                <span className="text-[9px] text-muted">({completedCount}/{totalCount})</span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted">{sched.description}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Current Week Operational Tasks */}
              <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
                <div className="label-uppercase text-muted mb-4 text-[10px]">Current Week — Operational Tasks</div>
                <div className="text-xs text-muted mb-4">
                  Track daily operational activities across Pod Lead, Fund, and Studio workstreams
                </div>
                <div className="overflow-x-auto">
                  <div className="grid gap-2" style={{ gridTemplateColumns: "100px repeat(5, 1fr)", minWidth: 900 }}>
                    {/* Header row */}
                    <div />
                    {DAYS.map((day) => (
                      <div key={day} className="text-center">
                        <div className="text-[10px] font-bold text-foreground uppercase">{DAY_LABELS[day]}</div>
                        <div className="text-[8px] text-muted">{new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1 + DAYS.indexOf(day))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    ))}
                    {/* Workstream rows */}
                    {(["pod_lead", "fund", "studio"] as const).map((ws) => {
                      const style = OWNER_STYLES[ws];
                      const dayTasks = (opRhythm.dailyTasks as Record<string, Record<string, { id: string; title: string; completed: boolean; notes?: string }>>) || {};
                      return (
                        <div key={ws} className="contents">
                          <div className="flex items-center gap-1.5 pr-2">
                            <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: style.color, borderRadius: 1 }} />
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{style.label}</span>
                          </div>
                          {DAYS.map((day) => {
                            const sched = opRhythm.weeklySchedule?.[day];
                            const task = dayTasks[day]?.[ws];
                            return (
                              <div
                                key={day}
                                className="p-2 border border-border/50 bg-background/50 min-h-[60px] cursor-pointer hover:border-accent/40 transition-colors"
                                style={{ borderRadius: 2, borderLeftWidth: task?.completed ? 3 : 1, borderLeftColor: task?.completed ? "#16a34a" : style.color }}
                                onClick={() => {
                                  // Toggle task completion
                                  const updated = { ...opRhythm };
                                  if (!updated.dailyTasks) updated.dailyTasks = {};
                                  if (!updated.dailyTasks[day]) updated.dailyTasks[day] = {};
                                  if (!updated.dailyTasks[day][ws]) {
                                    updated.dailyTasks[day][ws] = {
                                      id: `op-${day}-${ws}`,
                                      title: sched?.focus || `${style.label} task`,
                                      completed: false,
                                    };
                                  }
                                  updated.dailyTasks[day][ws].completed = !updated.dailyTasks[day][ws].completed;
                                  startTransition(async () => {
                                    await updateOperationalRhythm(launch.id, updated);
                                    reload();
                                  });
                                }}
                              >
                                {task ? (
                                  <div className="flex items-start gap-1.5">
                                    <input type="checkbox" checked={task.completed} readOnly className="mt-0.5 accent-[#16a34a]" style={{ pointerEvents: "none" }} />
                                    <span className={`text-[9px] leading-tight ${task.completed ? "text-muted line-through" : "text-foreground"}`}>
                                      {task.title}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[9px] text-muted italic">Click to add task</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Log a week */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="label-uppercase text-muted mb-2 text-[10px]">Log Completed Week</div>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={weekNote} onChange={(e) => setWeekNote(e.target.value)} placeholder="Week summary notes..." className="flex-1 px-3 py-1.5 bg-background border border-border text-xs" style={{ borderRadius: 2 }} />
                  <select value={weekMode} onChange={(e) => setWeekMode(e.target.value as typeof weekMode)} className="px-2 py-1.5 bg-background border border-border text-xs" style={{ borderRadius: 2 }}>
                    <option value="live">Live</option>
                    <option value="learn">Learn</option>
                    <option value="farm">Farm</option>
                  </select>
                  <button onClick={handleLogWeek} disabled={!weekNote.trim() || isPending} className="px-3 py-1.5 bg-accent text-white text-xs font-semibold disabled:opacity-50" style={{ borderRadius: 2 }}>Log</button>
                </div>
                {opRhythm.weekLog && opRhythm.weekLog.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-muted uppercase mb-1">Week History</div>
                    {opRhythm.weekLog.slice().reverse().slice(0, 8).map((wl, i) => {
                      const ms = MODE_STYLES[wl.mode as keyof typeof MODE_STYLES];
                      return (
                        <div key={i} className="flex items-start gap-2 p-2 bg-background border border-border" style={{ borderRadius: 2 }}>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-foreground text-[10px]">Week {wl.weekNumber}</span>
                            <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 border" style={{ color: ms?.color || "#8F898B", borderColor: ms?.color || "#8F898B", borderRadius: 1 }}>{wl.mode}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-foreground">{wl.notes}</div>
                            <div className="text-[8px] text-muted mt-0.5">{new Date(wl.startDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      );
                    })}
                    {opRhythm.weekLog.length > 8 && (
                      <div className="text-[9px] text-muted text-center">+ {opRhythm.weekLog.length - 8} more weeks</div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══ TAB: KPIs ═══ */}
      {activeTab === "KPIs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="label-uppercase text-muted text-[10px]">Per-Role KPIs</div>
            <button onClick={() => { setEditingRoleKpis(!editingRoleKpis); if (!editingRoleKpis) setRoleKpiDraft(JSON.parse(JSON.stringify(roleKpis))); }} className="text-[10px] text-accent hover:underline">
              {editingRoleKpis ? "Cancel" : "Edit"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["pod_lead", "fund", "studio"] as const).map((role) => {
              const style = OWNER_STYLES[role];
              const kpis = editingRoleKpis ? roleKpiDraft?.[role] : roleKpis[role];
              if (!kpis) return null;
              return (
                <section key={role} className="bg-surface border p-4" style={{ borderRadius: 2, borderColor: style.color + "30" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: style.color, borderRadius: 1 }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{style.label}</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(kpis).map(([key, val]) => {
                      const kpi = val as MetricKPI;
                      const pct = kpi.target > 0 ? Math.min((kpi.current / kpi.target) * 100, 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                            {!editingRoleKpis ? (
                              <span className="text-[10px] font-semibold">{kpi.current}<span className="text-muted font-normal">/{kpi.target} {kpi.unit}</span></span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="number" value={kpi.current} onChange={(e) => {
                                  const draft = { ...roleKpiDraft };
                                  draft[role] = { ...draft[role], [key]: { ...kpi, current: Number(e.target.value) } };
                                  setRoleKpiDraft(draft);
                                }} className="w-10 px-1 py-0.5 bg-background border border-border text-[10px] text-center" style={{ borderRadius: 2 }} />
                                <span className="text-[9px] text-muted">/</span>
                                <input type="number" value={kpi.target} onChange={(e) => {
                                  const draft = { ...roleKpiDraft };
                                  draft[role] = { ...draft[role], [key]: { ...kpi, target: Number(e.target.value) } };
                                  setRoleKpiDraft(draft);
                                }} className="w-10 px-1 py-0.5 bg-background border border-border text-[10px] text-center" style={{ borderRadius: 2 }} />
                              </div>
                            )}
                          </div>
                          {!editingRoleKpis && (
                            <div className="h-1 bg-background overflow-hidden" style={{ borderRadius: 1 }}>
                              <div className="h-full" style={{ width: `${pct}%`, backgroundColor: style.color, borderRadius: 1 }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          {editingRoleKpis && (
            <button onClick={handleSaveRoleKpis} disabled={isPending} className="px-4 py-2 bg-accent text-white text-xs font-semibold" style={{ borderRadius: 2 }}>
              {isPending ? "Saving..." : "Save Role KPIs"}
            </button>
          )}
        </div>
      )}

      {/* ═══ TAB: Analytics ═══ */}
      {activeTab === "Analytics" && launch.status === "operational" && (
        <div className="space-y-6">
          {/* Monthly Metrics */}
          {opRhythm.monthlyMetrics && opRhythm.monthlyMetrics.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Monthly Operational Metrics</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-[10px] text-muted uppercase">Month</th>
                      <th className="text-right py-2 text-[10px] text-muted uppercase">Deals Sourced</th>
                      <th className="text-right py-2 text-[10px] text-muted uppercase">Deals Closed</th>
                      <th className="text-right py-2 text-[10px] text-muted uppercase">Fellows Embedded</th>
                      <th className="text-right py-2 text-[10px] text-muted uppercase">Partners Engaged</th>
                      <th className="text-right py-2 text-[10px] text-muted uppercase">Mode Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opRhythm.monthlyMetrics.slice().reverse().map((mm, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 font-medium">{new Date(mm.month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                        <td className="py-2 text-right">{mm.dealsSourced}</td>
                        <td className="py-2 text-right">{mm.dealsClosed}</td>
                        <td className="py-2 text-right">{mm.fellowsEmbedded}</td>
                        <td className="py-2 text-right">{mm.partnersEngaged}</td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {mm.modeDistribution.live > 0 && <span className="text-[9px] px-1 py-0.5 border" style={{ color: MODE_STYLES.live.color, borderColor: MODE_STYLES.live.color, borderRadius: 1 }}>L:{mm.modeDistribution.live}</span>}
                            {mm.modeDistribution.learn > 0 && <span className="text-[9px] px-1 py-0.5 border" style={{ color: MODE_STYLES.learn.color, borderColor: MODE_STYLES.learn.color, borderRadius: 1 }}>L:{mm.modeDistribution.learn}</span>}
                            {mm.modeDistribution.farm > 0 && <span className="text-[9px] px-1 py-0.5 border" style={{ color: MODE_STYLES.farm.color, borderColor: MODE_STYLES.farm.color, borderRadius: 1 }}>F:{mm.modeDistribution.farm}</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Week-by-Week Mode Distribution */}
          {opRhythm.weekLog && opRhythm.weekLog.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Mode Distribution Over Time</div>
              <div className="space-y-2">
                {Object.entries(
                  opRhythm.weekLog.reduce((acc, wl) => {
                    const mode = wl.mode as "live" | "learn" | "farm";
                    acc[mode] = (acc[mode] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([mode, count]) => {
                  const ms = MODE_STYLES[mode as keyof typeof MODE_STYLES];
                  const pct = (count / opRhythm.weekLog.length) * 100;
                  return (
                    <div key={mode}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2" style={{ backgroundColor: ms?.color || "#8F898B", borderRadius: 1 }} />
                          <span className="text-xs font-semibold uppercase" style={{ color: ms?.color || "#8F898B" }}>{ms?.label || mode}</span>
                        </div>
                        <span className="text-xs text-muted">{count} weeks ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-border overflow-hidden" style={{ borderRadius: 1 }}>
                        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: ms?.color || "#8F898B", borderRadius: 1 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Operational Performance Trends */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-muted mb-4 text-[10px]">Operational Performance Summary</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-[9px] text-muted uppercase mb-1">Total Weeks Operational</div>
                <div className="text-2xl font-semibold text-foreground">{opRhythm.weekLog?.length || 0}</div>
                {launch.operationalAt && (
                  <div className="text-[9px] text-muted mt-1">
                    {Math.floor((new Date().getTime() - new Date(launch.operationalAt).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks since launch
                  </div>
                )}
              </div>
              <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-[9px] text-muted uppercase mb-1">Current Pipeline Health</div>
                <div className="text-2xl font-semibold text-foreground">{metrics.dealsInPipeline?.current || 0}</div>
                <div className="text-[9px] text-muted mt-1">deals in pipeline</div>
              </div>
              <div className="bg-background p-3 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-[9px] text-muted uppercase mb-1">Fellows Embedded</div>
                <div className="text-2xl font-semibold text-foreground">{metrics.fellowsEmbedded?.current || 0}</div>
                <div className="text-[9px] text-muted mt-1">/{metrics.fellowsEmbedded?.target || 0} target</div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
