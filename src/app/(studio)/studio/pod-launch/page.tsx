"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getPodLaunches,
  getPods,
  createPodLaunch,
  advancePodLaunchPhase,
} from "@/app/actions/studio";

// ─── Types ─────────────────────────────────────────────────────────

type SprintTask = {
  id: string;
  title: string;
  completed: boolean;
  notes: string | null;
  completedAt: string | null;
};

type SprintWorkstream = {
  owner: string;
  tasks: SprintTask[];
};

type SprintData = {
  weekLabel: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  workstreams: {
    pod_lead: SprintWorkstream;
    fund: SprintWorkstream;
    studio: SprintWorkstream;
  };
  summary: string | null;
};

type PreWork = {
  thesisValidated: boolean;
  archetypeDefined: boolean;
  podLeadIdentified: boolean;
  podLeadName: string | null;
  corporatePartnersMapped: boolean;
  coInvestorsMapped: boolean;
  clustersDefined: boolean;
  notes: string | null;
  completedAt: string | null;
};

type MetricVal = { target: number; current: number; tier1Count?: number };

type TargetMetrics = {
  fellowsEmbedded: MetricVal;
  corporatePartnersEngaged: MetricVal;
  coInvestorsMapped: MetricVal;
  dealsInPipeline: MetricVal;
  podLeadActive: boolean;
};

type Launch = {
  launch: {
    id: string;
    podId: string;
    name: string;
    status: string;
    currentPhase: string;
    phaseStartedAt: Date | null;
    preWork: unknown;
    sprint1: unknown;
    sprint2: unknown;
    targetMetrics: unknown;
    startedAt: Date | null;
    operationalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  podName: string;
  podColor: string | null;
  podDisplayOrder: number | null;
};

type PodOption = {
  id: string;
  name: string;
  color: string | null;
  displayOrder: number | null;
  fellowCount: number;
};

// ─── Constants ─────────────────────────────────────────────────────

const PHASES = [
  { key: "pre_work", label: "Pre-Work" },
  { key: "sprint_1", label: "Sprint 1" },
  { key: "sprint_2", label: "Sprint 2" },
  { key: "operational", label: "Operational" },
] as const;

const PHASE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: "bg-gray-100", text: "text-gray-600", label: "Planning" },
  pre_work: { bg: "bg-purple-50", text: "text-purple-700", label: "Pre-Work" },
  sprint_1: { bg: "bg-green-50", text: "text-green-700", label: "Sprint 1" },
  sprint_2: { bg: "bg-green-50", text: "text-green-700", label: "Sprint 2" },
  post_sprint: { bg: "bg-blue-50", text: "text-blue-700", label: "Post-Sprint" },
  operational: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Operational" },
  paused: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Paused" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Cancelled" },
};

const OWNER_STYLES = {
  pod_lead: { color: "#CC5536", label: "Pod Lead" },
  fund: { color: "#1976D2", label: "Fund" },
  studio: { color: "#7B1FA2", label: "Studio" },
};

// ─── Helpers ───────────────────────────────────────────────────────

function getPreWork(launch: Launch["launch"]): PreWork {
  const pw = launch.preWork as PreWork | null;
  return pw || {
    thesisValidated: false,
    archetypeDefined: false,
    podLeadIdentified: false,
    podLeadName: null,
    corporatePartnersMapped: false,
    coInvestorsMapped: false,
    clustersDefined: false,
    notes: null,
    completedAt: null,
  };
}

function getSprint(data: unknown): SprintData | null {
  const s = data as SprintData | null;
  if (!s?.workstreams) return null;
  return s;
}

function countSprintTasks(sprint: SprintData | null) {
  if (!sprint?.workstreams) return { total: 0, completed: 0 };
  let total = 0;
  let completed = 0;
  for (const ws of Object.values(sprint.workstreams)) {
    for (const t of ws.tasks) {
      total++;
      if (t.completed) completed++;
    }
  }
  return { total, completed };
}

function countWorkstreamTasks(sprint: SprintData | null, key: keyof SprintData["workstreams"]) {
  if (!sprint?.workstreams?.[key]) return { total: 0, completed: 0 };
  const tasks = sprint.workstreams[key].tasks;
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };
}

function preWorkProgress(pw: PreWork) {
  const checks = [
    pw.thesisValidated,
    pw.archetypeDefined,
    pw.podLeadIdentified,
    pw.corporatePartnersMapped,
    pw.coInvestorsMapped,
    pw.clustersDefined,
  ];
  return { total: checks.length, completed: checks.filter(Boolean).length };
}

function phaseIndex(phase: string): number {
  const map: Record<string, number> = { pre_work: 0, sprint_1: 1, sprint_2: 2, post_sprint: 3, operational: 3 };
  return map[phase] ?? -1;
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function PodLaunchPage() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [pods, setPodsState] = useState<PodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newPodId, setNewPodId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPodLead, setNewPodLead] = useState("");
  const [targetFellows, setTargetFellows] = useState(2);
  const [targetCorporates, setTargetCorporates] = useState(3);
  const [targetCoInvestors, setTargetCoInvestors] = useState(5);
  const [targetDeals, setTargetDeals] = useState(3);

  useEffect(() => {
    Promise.all([getPodLaunches(), getPods()]).then(([l, p]) => {
      setLaunches(l as Launch[]);
      setPodsState(p as PodOption[]);
      setLoading(false);
    });
  }, []);

  // Auto-suggest name when pod changes
  useEffect(() => {
    if (newPodId) {
      const pod = pods.find((p) => p.id === newPodId);
      if (pod) {
        const q = new Date().getMonth() < 3 ? "Q1" : new Date().getMonth() < 6 ? "Q2" : new Date().getMonth() < 9 ? "Q3" : "Q4";
        setNewName(`${pod.name} Launch ${q} ${new Date().getFullYear()}`);
      }
    }
  }, [newPodId, pods]);

  function handleCreate() {
    if (!newPodId || !newName) return;
    startTransition(async () => {
      await createPodLaunch({
        podId: newPodId,
        name: newName,
        podLeadName: newPodLead || undefined,
        targetMetrics: {
          fellowsEmbedded: { target: targetFellows, current: 0 },
          corporatePartnersEngaged: { target: targetCorporates, current: 0, tier1Count: 0 },
          coInvestorsMapped: { target: targetCoInvestors, current: 0 },
          dealsInPipeline: { target: targetDeals, current: 0 },
          podLeadActive: !!newPodLead,
        },
      });
      const updated = await getPodLaunches();
      setLaunches(updated as Launch[]);
      setShowCreate(false);
      resetForm();
    });
  }

  function resetForm() {
    setNewPodId("");
    setNewName("");
    setNewPodLead("");
    setTargetFellows(2);
    setTargetCorporates(3);
    setTargetCoInvestors(5);
    setTargetDeals(3);
  }

  function handleAdvance(launchId: string) {
    startTransition(async () => {
      await advancePodLaunchPhase(launchId);
      const updated = await getPodLaunches();
      setLaunches(updated as Launch[]);
    });
  }

  if (loading) {
    return <div className="text-muted text-sm">Loading pod launches...</div>;
  }

  // Group launches
  const activeLaunches = launches.filter((l) =>
    ["pre_work", "sprint_1", "sprint_2", "post_sprint"].includes(l.launch.status)
  );
  const planningLaunches = launches.filter((l) => l.launch.status === "planning");
  const completedLaunches = launches.filter((l) =>
    ["operational", "cancelled", "paused"].includes(l.launch.status)
  );

  const operationalCount = launches.filter((l) => l.launch.status === "operational").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label-uppercase text-muted mb-2">Studio OS</div>
            <h1 className="text-2xl font-medium text-foreground">
              Pod Launch Playbook
            </h1>
            <p className="text-sm text-muted mt-1">
              {launches.length} launch{launches.length !== 1 ? "es" : ""} — {operationalCount} operational
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
            style={{ borderRadius: 2 }}
          >
            <span>+</span> New Launch
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div
          className="bg-surface border border-accent/20 p-6 mb-8"
          style={{ borderRadius: 2 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Launch a Pod
          </h2>
          <p className="text-xs text-muted mb-5">
            Set up the systematic infrastructure to bring a thesis pod from definition to operational state. Tasks will be pre-populated across Pod Lead, Fund, and Studio workstreams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Pod
              </label>
              <select
                value={newPodId}
                onChange={(e) => setNewPodId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              >
                <option value="">Select a pod...</option>
                {pods.map((p) => (
                  <option key={p.id} value={p.id}>
                    POD {p.displayOrder} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Launch Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Infra Intelligence Launch Q1 2026"
                className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Pod Lead (optional)
              </label>
              <input
                type="text"
                value={newPodLead}
                onChange={(e) => setNewPodLead(e.target.value)}
                placeholder="Name of the pod lead"
                className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div className="space-y-0" />
          </div>

          {/* Target Metrics */}
          <div className="mb-6">
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
              Target Operational State
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[9px] text-muted block mb-1">Fellows to Embed</label>
                <input
                  type="number"
                  value={targetFellows}
                  onChange={(e) => setTargetFellows(Number(e.target.value))}
                  min={0}
                  max={10}
                  className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="text-[9px] text-muted block mb-1">Corporate Partners</label>
                <input
                  type="number"
                  value={targetCorporates}
                  onChange={(e) => setTargetCorporates(Number(e.target.value))}
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="text-[9px] text-muted block mb-1">Co-Investors</label>
                <input
                  type="number"
                  value={targetCoInvestors}
                  onChange={(e) => setTargetCoInvestors(Number(e.target.value))}
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="text-[9px] text-muted block mb-1">Deals in Pipeline</label>
                <input
                  type="number"
                  value={targetDeals}
                  onChange={(e) => setTargetDeals(Number(e.target.value))}
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                  style={{ borderRadius: 2 }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newPodId || !newName || isPending}
              className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {isPending ? "Creating..." : "Create Launch"}
            </button>
            <button
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Launches */}
      {activeLaunches.length > 0 && (
        <section className="mb-8">
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Active Launches ({activeLaunches.length})
          </h2>
          <div className="space-y-4">
            {activeLaunches.map((l) => (
              <LaunchCard
                key={l.launch.id}
                data={l}
                onAdvance={() => handleAdvance(l.launch.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Planning */}
      {planningLaunches.length > 0 && (
        <section className="mb-8">
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Planning ({planningLaunches.length})
          </h2>
          <div className="space-y-4">
            {planningLaunches.map((l) => (
              <LaunchCard
                key={l.launch.id}
                data={l}
                onAdvance={() => handleAdvance(l.launch.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed / Operational */}
      {completedLaunches.length > 0 && (
        <section>
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Completed ({completedLaunches.length})
          </h2>
          <div className="space-y-4">
            {completedLaunches.map((l) => (
              <LaunchCard
                key={l.launch.id}
                data={l}
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {launches.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-2">No pod launches yet.</p>
          <p className="text-muted text-xs mb-4">
            Launch a pod to systematically set up thesis-driven investment infrastructure with parallel workstreams for Pod Lead, Fund, and Studio.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            + New Launch
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Launch Card Component ─────────────────────────────────────────

function LaunchCard({
  data,
  onAdvance,
  isPending,
}: {
  data: Launch;
  onAdvance?: () => void;
  isPending: boolean;
}) {
  const { launch, podName, podColor, podDisplayOrder } = data;
  const phase = PHASE_STYLES[launch.status] || PHASE_STYLES.planning;
  const pw = getPreWork(launch);
  const s1 = getSprint(launch.sprint1);
  const s2 = getSprint(launch.sprint2);
  const metrics = (launch.targetMetrics || {}) as TargetMetrics;

  const currentPhaseIdx = phaseIndex(launch.currentPhase);
  const pwProgress = preWorkProgress(pw);
  const s1Progress = countSprintTasks(s1);
  const s2Progress = countSprintTasks(s2);

  // Workstream summaries for current sprint
  const activeSprint = launch.currentPhase === "sprint_1" ? s1 : launch.currentPhase === "sprint_2" ? s2 : null;

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: podColor || "#CC5536" }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: podColor || "#CC5536", borderRadius: 2 }}
            >
              {podDisplayOrder}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{launch.name}</h3>
              <div className="text-xs text-muted">{podName}</div>
            </div>
          </div>
          <span
            className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${phase.bg} ${phase.text}`}
            style={{ borderRadius: 2 }}
          >
            {phase.label}
          </span>
        </div>

        {/* Phase Stepper */}
        <div className="flex items-center gap-1 mb-4">
          {PHASES.map((p, i) => {
            const isComplete = i < currentPhaseIdx;
            const isCurrent = i === currentPhaseIdx;
            const isPast = launch.status === "operational" && i <= 3;
            return (
              <div key={p.key} className="flex items-center flex-1">
                <div className="flex-1">
                  <div
                    className="text-[8px] font-semibold tracking-[0.5px] uppercase text-center mb-1"
                    style={{
                      color: isComplete || isPast
                        ? "#16a34a"
                        : isCurrent
                        ? podColor || "#CC5536"
                        : "#8F898B",
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    className="h-2 w-full"
                    style={{
                      borderRadius: 1,
                      backgroundColor: isComplete || isPast
                        ? "#16a34a"
                        : isCurrent
                        ? podColor || "#CC5536"
                        : "#E3E1E2",
                    }}
                  />
                </div>
                {i < PHASES.length - 1 && (
                  <div className="w-2 flex items-end pb-0.5">
                    <span
                      className="text-[8px]"
                      style={{ color: isComplete ? "#16a34a" : "#E3E1E2" }}
                    >
                      →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Phase-specific progress */}
        {launch.currentPhase === "pre_work" && (
          <div className="text-xs text-muted mb-3">
            Pre-work: {pwProgress.completed}/{pwProgress.total} checks complete
          </div>
        )}

        {activeSprint && (
          <div className="flex items-center gap-4 text-xs text-muted mb-3">
            {(["pod_lead", "fund", "studio"] as const).map((ws) => {
              const wsCount = countWorkstreamTasks(activeSprint, ws);
              const style = OWNER_STYLES[ws];
              return (
                <div key={ws} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2"
                    style={{ backgroundColor: style.color, borderRadius: 1 }}
                  />
                  <span>
                    {style.label}: <span className="font-semibold text-foreground">{wsCount.completed}/{wsCount.total}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Target metrics summary */}
        {metrics.fellowsEmbedded && (
          <div className="flex items-center gap-4 text-[10px] text-muted mb-4">
            <span>Fellows: {metrics.fellowsEmbedded.current}/{metrics.fellowsEmbedded.target}</span>
            <span>Corporates: {metrics.corporatePartnersEngaged?.current || 0}/{metrics.corporatePartnersEngaged?.target || 0}</span>
            <span>Deals: {metrics.dealsInPipeline?.current || 0}/{metrics.dealsInPipeline?.target || 0}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/studio/pod-launch/${launch.id}`}
            className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            View Playbook
          </Link>
          {onAdvance && !["operational", "cancelled", "paused"].includes(launch.status) && (
            <button
              onClick={onAdvance}
              disabled={isPending}
              className="px-3 py-1.5 text-xs text-accent border border-accent/30 hover:bg-accent/5 font-semibold transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {isPending ? "..." : "Advance Phase →"}
            </button>
          )}
          <Link
            href={`/studio/pods/${launch.podId}`}
            className="px-3 py-1.5 text-xs text-muted hover:text-accent"
          >
            View Pod
          </Link>
        </div>
      </div>
    </div>
  );
}
