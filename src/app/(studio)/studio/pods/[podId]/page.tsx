"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPod, getCampaignsForPod, getPodLaunchForPod, getPodJourney, updateJourneyCheckpoint, deletePod, getPodThesis, updateThesisVersion, addEvidence, updateVentureAlignment } from "@/app/actions/studio";
import { type ThesisVersion, type EvidenceEntry, type AlignmentCriterion, getEvidenceImpactColor, getAlignmentColor } from "@/data/thesis-alignment";
import { POD_JOURNEY_STAGES, getJourneyProgress, getNextCheckpoint, type JourneyCheckpoint, type JourneyStage } from "@/data/pod-journey";

type PodData = {
  pod: {
    id: string;
    name: string;
    tagline: string | null;
    thesis: string | null;
    marketGap: string | null;
    targetArchetype: string | null;
    color: string | null;
    clusters: unknown;
    corporatePartners: unknown;
    coInvestors: unknown;
    sourcingStrategy: string | null;
    displayOrder: number | null;
  };
  fellows: {
    id: string;
    fullName: string;
    email: string;
    lifecycleStage: string;
    equityPercentage: string | null;
    globalPotentialRating: number | null;
    qatarImpactRating: number | null;
    linkedinUrl: string | null;
  }[];
};

type PodCampaign = {
  id: string;
  name: string;
  campaignType: string;
  status: string;
  sprintWeeks: number;
  targetFellows: number;
  targetDeals: number | null;
  currentWeek: number | null;
  fellowsRecruited: number | null;
  dealsSourced: number | null;
  startDate: Date | null;
  createdAt: Date;
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  fellow: { label: "Fellow Sourcing", color: "#CC5536" },
  deal: { label: "Deal Sourcing", color: "#1976D2" },
  mixed: { label: "Fellows + Deals", color: "#7B1FA2" },
};

type PodLaunchStatus = {
  id: string;
  name: string;
  status: string;
  currentPhase: string;
  createdAt: Date;
};

const CAMPAIGN_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  active: { bg: "bg-green-50", text: "text-green-700", label: "Active" },
  paused: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Paused" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", label: "Completed" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Cancelled" },
};

const LAUNCH_PHASE_LABELS: Record<string, string> = {
  planning: "Planning",
  pre_work: "Pre-Work",
  sprint_1: "Sprint 1",
  sprint_2: "Sprint 2",
  post_sprint: "Post-Sprint",
  operational: "Operational",
  paused: "Paused",
  cancelled: "Cancelled",
};

function ratingLabel(rating: number | null): string {
  if (!rating) return "—";
  if (rating >= 8) return "A";
  if (rating >= 5) return "B";
  return "C";
}

const TABS = ["Overview", "Thesis", "Journey", "Campaigns", "Launch"] as const;
type TabKey = typeof TABS[number];

export default function PodDetailPage() {
  const { podId } = useParams<{ podId: string }>();
  const [data, setData] = useState<PodData | null>(null);
  const [campaigns, setCampaigns] = useState<PodCampaign[]>([]);
  const [podLaunch, setPodLaunch] = useState<PodLaunchStatus | null>(null);
  const [journey, setJourney] = useState<{ checkpoints: JourneyCheckpoint[]; progress: ReturnType<typeof getJourneyProgress>; nextCheckpoint: JourneyCheckpoint | null; currentStage: JourneyStage | null } | null>(null);
  const [thesis, setThesis] = useState<Awaited<ReturnType<typeof getPodThesis>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [updatingCheckpoint, setUpdatingCheckpoint] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showThesisEditor, setShowThesisEditor] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  function reload() {
    if (!podId) return;
    Promise.all([
      getPod(podId),
      getCampaignsForPod(podId),
      getPodLaunchForPod(podId),
      getPodJourney(podId),
      getPodThesis(podId),
    ]).then(([result, campData, launchData, journeyData, thesisData]) => {
      setData(result as PodData | null);
      setCampaigns(campData as PodCampaign[]);
      setPodLaunch(launchData as PodLaunchStatus | null);
      setJourney(journeyData as typeof journey);
      setThesis(thesisData);
      setLoading(false);
    });
  }

  useEffect(() => {
    reload();
  }, [podId]);

  async function handleCheckpointToggle(checkpointId: string, completed: boolean) {
    if (!podId) return;
    setUpdatingCheckpoint(checkpointId);
    try {
      await updateJourneyCheckpoint(podId, checkpointId, completed);
      reload();
    } catch (err) {
      console.error("Failed to update checkpoint:", err);
    } finally {
      setUpdatingCheckpoint(null);
    }
  }

  async function handleDeletePod() {
    if (!podId) return;
    try {
      await deletePod(podId);
      window.location.href = "/studio/pods";
    } catch (err: unknown) {
      const error = err as { error?: string };
      alert(error?.error || "Failed to delete pod");
    }
  }

  if (loading) {
    return <div className="text-muted text-sm">Loading pod...</div>;
  }

  if (!data) {
    return <div className="text-muted text-sm">Pod not found.</div>;
  }

  const { pod, fellows } = data;
  const clusters = Array.isArray(pod.clusters) ? (pod.clusters as string[]) : [];
  const partners = Array.isArray(pod.corporatePartners) ? (pod.corporatePartners as Array<{ name: string; type: string; relevance: string; tier: string }>) : [];
  const investors = Array.isArray(pod.coInvestors) ? (pod.coInvestors as Array<{ name: string; type: string; thesis: string; stage: string }>) : [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/studio/pods" className="text-xs text-accent hover:underline">
          ← Back to Pods
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: pod.color || "#CC5536", borderRadius: 2 }}
          >
            {pod.displayOrder}
          </div>
          <div>
            <h1 className="text-2xl font-medium text-foreground">{pod.name}</h1>
            {pod.tagline && <p className="text-sm text-muted mt-0.5">{pod.tagline}</p>}
          </div>
        </div>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Delete pod?</span>
            <button
              onClick={handleDeletePod}
              className="px-3 py-1.5 text-xs text-red-600 border border-red-300 hover:bg-red-50 font-semibold transition-colors"
              style={{ borderRadius: 2 }}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1.5 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700"
          >
            Delete Pod
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ TAB: Overview ═══ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thesis */}
          {pod.thesis && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Investment Thesis</div>
              <p className="text-sm text-foreground leading-relaxed">{pod.thesis}</p>
            </section>
          )}

          {/* Market Gap */}
          {pod.marketGap && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Market Gap</div>
              <p className="text-sm text-foreground leading-relaxed">{pod.marketGap}</p>
            </section>
          )}

          {/* Fellows */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-muted mb-3 text-[10px]">
              Assigned Fellows ({fellows.length})
            </div>
            {fellows.length === 0 ? (
              <p className="text-sm text-muted">No fellows assigned to this pod yet.</p>
            ) : (
              <div className="space-y-3">
                {fellows.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{f.fullName}</div>
                      <div className="text-xs text-muted">{f.email}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-[9px] text-muted uppercase tracking-wider">Global</div>
                        <div className="font-semibold text-foreground">{ratingLabel(f.globalPotentialRating)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-muted uppercase tracking-wider">Qatar</div>
                        <div className="font-semibold text-foreground">{ratingLabel(f.qatarImpactRating)}</div>
                      </div>
                      {f.equityPercentage && Number(f.equityPercentage) > 0 && (
                        <div className="text-center">
                          <div className="text-[9px] text-muted uppercase tracking-wider">Equity</div>
                          <div className="font-semibold text-foreground">{f.equityPercentage}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pod Launch */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="label-uppercase text-muted text-[10px]">
                Pod Launch
              </div>
              <Link
                href="/studio/pod-launch"
                className="text-xs text-accent hover:underline"
              >
                All Launches →
              </Link>
            </div>
            {podLaunch ? (
              <Link
                href={`/studio/pod-launch/${podLaunch.id}`}
                className="block border border-border p-3 hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {podLaunch.name}
                  </span>
                  <span
                    className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${
                      podLaunch.status === "operational"
                        ? "bg-emerald-50 text-emerald-700"
                        : ["sprint_1", "sprint_2"].includes(podLaunch.status)
                        ? "bg-green-50 text-green-700"
                        : podLaunch.status === "pre_work"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {LAUNCH_PHASE_LABELS[podLaunch.status] || podLaunch.status}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  Phase: {LAUNCH_PHASE_LABELS[podLaunch.currentPhase] || podLaunch.currentPhase}
                  {" · "}View playbook →
                </div>
              </Link>
            ) : (
              <div>
                <p className="text-sm text-muted mb-3">
                  No launch playbook for this pod yet.
                </p>
                <Link
                  href="/studio/pod-launch"
                  className="inline-block px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  + Launch Pod
                </Link>
              </div>
            )}
          </section>

          {/* Campaigns */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="label-uppercase text-muted text-[10px]">
                Sourcing Campaigns ({campaigns.length})
              </div>
              <Link
                href="/studio/campaigns"
                className="text-xs text-accent hover:underline"
              >
                Manage Campaigns →
              </Link>
            </div>
            {campaigns.length === 0 ? (
              <div>
                <p className="text-sm text-muted mb-3">
                  No campaigns launched for this pod yet.
                </p>
                <Link
                  href="/studio/campaigns"
                  className="inline-block px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  + Launch Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const st = CAMPAIGN_STATUS[c.status] || CAMPAIGN_STATUS.draft;
                  const typeInfo = TYPE_LABELS[c.campaignType] || TYPE_LABELS.mixed;
                  const currentWeek = c.currentWeek || 0;
                  const showFellows = c.campaignType !== "deal";
                  const showDeals = c.campaignType !== "fellow";
                  return (
                    <div
                      key={c.id}
                      className="border border-border p-3"
                      style={{ borderRadius: 2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {c.name}
                          </span>
                          <span
                            className="text-[8px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 text-white"
                            style={{ backgroundColor: typeInfo.color, borderRadius: 2 }}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${st.bg} ${st.text}`}
                          style={{ borderRadius: 2 }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {showFellows && (
                          <span>{c.targetFellows} fellow target</span>
                        )}
                        {showDeals && (c.targetDeals || 0) > 0 && (
                          <span>{c.targetDeals} deal target</span>
                        )}
                        <span>
                          {c.sprintWeeks}-week sprint
                        </span>
                        {c.status === "active" && (
                          <span className="font-medium text-foreground">
                            Week {currentWeek}/{c.sprintWeeks}
                          </span>
                        )}
                        {c.status === "completed" && (
                          <span className="font-medium">
                            {showFellows && (
                              <span style={{ color: "#CC5536" }}>
                                {c.fellowsRecruited || 0} recruited
                              </span>
                            )}
                            {showFellows && showDeals && " · "}
                            {showDeals && (
                              <span style={{ color: "#1976D2" }}>
                                {c.dealsSourced || 0} deals
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {c.status === "active" && (
                        <div
                          className="h-1.5 bg-background overflow-hidden mt-2"
                          style={{ borderRadius: 1 }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${Math.min(
                                (currentWeek / c.sprintWeeks) * 100,
                                100
                              )}%`,
                              backgroundColor: typeInfo.color,
                              borderRadius: 1,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-6">
          {/* Clusters */}
          {clusters.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Clusters</div>
              <ul className="space-y-2">
                {clusters.map((c, i) => (
                  <li key={i} className="text-sm text-foreground">{c}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Target Archetype */}
          {pod.targetArchetype && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Target Archetype</div>
              <p className="text-sm text-foreground leading-relaxed">{pod.targetArchetype}</p>
            </section>
          )}

          {/* Corporate Partners */}
          {partners.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Corporate Partners</div>
              <div className="space-y-2">
                {partners.map((p, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted">{p.type} — {p.tier}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Co-Investors */}
          {investors.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-3 text-[10px]">Co-Investors</div>
              <div className="space-y-2">
                {investors.map((inv, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium text-foreground">{inv.name}</div>
                    <div className="text-xs text-muted">{inv.type} — {inv.stage}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      )}

      {/* ═══ TAB: Thesis ═══ */}
      {activeTab === "Thesis" && thesis && (
        <div className="space-y-6">
          {/* Current Thesis */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label-uppercase text-muted text-[10px] mb-1">
                  Current Thesis (v{thesis.thesisVersion})
                </div>
                <div className="text-xs text-muted">
                  Last updated {thesis.thesisHistory.length > 0 
                    ? new Date(thesis.thesisHistory[thesis.thesisHistory.length - 1].updatedAt).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
              <button
                onClick={() => setShowThesisEditor(true)}
                className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                style={{ borderRadius: 2 }}
              >
                Update Thesis
              </button>
            </div>
            {thesis.currentThesis && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted mb-1">Investment Thesis</div>
                <p className="text-sm text-foreground leading-relaxed">{thesis.currentThesis}</p>
              </div>
            )}
            {thesis.currentMarketGap && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted mb-1">Market Gap</div>
                <p className="text-sm text-foreground leading-relaxed">{thesis.currentMarketGap}</p>
              </div>
            )}
            {thesis.currentTargetArchetype && (
              <div>
                <div className="text-xs font-semibold text-muted mb-1">Target Archetype</div>
                <p className="text-sm text-foreground leading-relaxed">{thesis.currentTargetArchetype}</p>
              </div>
            )}
          </section>

          {/* Alignment Dashboard */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-muted mb-4 text-[10px]">Alignment Dashboard</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-xs text-muted mb-1">Average Alignment</div>
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: thesis.avgAlignment ? getAlignmentColor(thesis.avgAlignment) : "#8F898B" }}
                >
                  {thesis.avgAlignment ? `${Math.round(thesis.avgAlignment)}%` : "—"}
                </div>
                <div className="text-xs text-muted">{thesis.ventures.length} ventures</div>
              </div>
              <div className="text-center p-4 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-xs text-muted mb-1">Evidence Points</div>
                <div className="text-3xl font-bold text-foreground mb-1">{thesis.evidenceLog.length}</div>
                <div className="text-xs text-muted">
                  {thesis.evidenceLog.filter((e) => e.type === "validates").length} validates,{" "}
                  {thesis.evidenceLog.filter((e) => e.type === "challenges").length} challenges
                </div>
              </div>
              <div className="text-center p-4 border border-border" style={{ borderRadius: 2 }}>
                <div className="text-xs text-muted mb-1">Thesis Versions</div>
                <div className="text-3xl font-bold text-foreground mb-1">{thesis.thesisVersion}</div>
                <div className="text-xs text-muted">{thesis.thesisHistory.length} historical versions</div>
              </div>
            </div>
          </section>

          {/* Venture Alignment */}
          {thesis.ventures.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Venture Alignment</div>
              <div className="space-y-3">
                {thesis.ventures.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border border-border"
                    style={{ borderRadius: 2 }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{v.name}</div>
                      {v.alignmentNotes && (
                        <div className="text-xs text-muted mt-1">{v.alignmentNotes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {v.podAlignmentScore && (
                        <div className="text-right">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: getAlignmentColor(Number(v.podAlignmentScore)) }}
                          >
                            {Math.round(Number(v.podAlignmentScore))}%
                          </div>
                          <div className="text-[10px] text-muted">Alignment</div>
                        </div>
                      )}
                      <Link
                        href={`/admin/ventures/${v.id}`}
                        className="text-xs text-accent hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Evidence Log */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="label-uppercase text-muted text-[10px]">Evidence Log</div>
              <button
                onClick={() => setShowEvidenceForm(true)}
                className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                style={{ borderRadius: 2 }}
              >
                + Add Evidence
              </button>
            </div>
            {thesis.evidenceLog.length === 0 ? (
              <p className="text-sm text-muted">No evidence logged yet.</p>
            ) : (
              <div className="space-y-3">
                {[...thesis.evidenceLog].reverse().map((evidence) => (
                  <div
                    key={evidence.id}
                    className="p-3 border-l-3"
                    style={{
                      borderLeftColor: getEvidenceImpactColor(evidence.type),
                      backgroundColor: `${getEvidenceImpactColor(evidence.type)}10`,
                      borderRadius: 2,
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-semibold uppercase px-1.5 py-0.5 text-white"
                          style={{
                            backgroundColor: getEvidenceImpactColor(evidence.type),
                            borderRadius: 2,
                          }}
                        >
                          {evidence.type}
                        </span>
                        <span className="text-xs text-muted">{evidence.source}</span>
                        {evidence.sourceName && (
                          <span className="text-xs font-medium text-foreground">{evidence.sourceName}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(evidence.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{evidence.description}</p>
                    {evidence.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {evidence.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-muted bg-background px-2 py-0.5 border border-border"
                            style={{ borderRadius: 2 }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Thesis History */}
          {thesis.thesisHistory.length > 0 && (
            <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
              <div className="label-uppercase text-muted mb-4 text-[10px]">Version History</div>
              <div className="space-y-4">
                {[...thesis.thesisHistory].reverse().map((version) => (
                  <div
                    key={version.version}
                    className="p-4 border border-border"
                    style={{ borderRadius: 2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-foreground">
                        Version {version.version}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(version.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {version.rationale && (
                      <div className="text-xs text-muted mb-2">
                        <strong>Rationale:</strong> {version.rationale}
                      </div>
                    )}
                    {version.changes.length > 0 && (
                      <div className="text-xs text-muted mb-2">
                        <strong>Changes:</strong> {version.changes.join(", ")}
                      </div>
                    )}
                    <div className="text-xs text-foreground mt-2">{version.thesis}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══ TAB: Journey ═══ */}
      {activeTab === "Journey" && journey && (
        <div className="space-y-6">
          {/* Journey Progress Overview */}
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-muted mb-4 text-[10px]">Journey Progress</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              {POD_JOURNEY_STAGES.map((stage) => {
                const stageProgress = journey.progress.byStage[stage.key];
                const pct = stageProgress.total > 0 ? (stageProgress.completed / stageProgress.total) * 100 : 0;
                const isCurrent = journey.currentStage === stage.key;
                return (
                  <div key={stage.key} className="text-center">
                    <div className="text-[9px] font-bold uppercase mb-1" style={{ color: isCurrent ? pod.color || "#CC5536" : "#8F898B" }}>
                      {stage.label}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {stageProgress.completed}/{stageProgress.total}
                    </div>
                    <div className="h-1.5 bg-border overflow-hidden mt-1" style={{ borderRadius: 1 }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isCurrent ? pod.color || "#CC5536" : pct === 100 ? "#16a34a" : "#8F898B",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground">
                {journey.progress.completed}/{journey.progress.total} checkpoints complete
              </div>
              <div className="text-xs text-muted mt-1">
                {journey.nextCheckpoint
                  ? `Next: ${journey.nextCheckpoint.label}`
                  : "Journey complete — Network Effects POD operational"}
              </div>
            </div>
          </section>

          {/* Journey Stages */}
          {POD_JOURNEY_STAGES.map((stage, stageIdx) => {
            const stageCheckpoints = journey.checkpoints.filter((cp) => cp.stage === stage.key);
            const stageProgress = journey.progress.byStage[stage.key];
            const isCurrent = journey.currentStage === stage.key;
            const isComplete = stageProgress.completed === stageProgress.total && stageProgress.total > 0;
            const isUpcoming = POD_JOURNEY_STAGES.findIndex((s) => s.key === journey.currentStage) < stageIdx;

            return (
              <section
                key={stage.key}
                className="bg-surface border border-border p-5"
                style={{
                  borderRadius: 2,
                  borderColor: isCurrent ? pod.color || "#CC5536" : isComplete ? "#16a34a" : "#E3E1E2",
                  borderLeftWidth: isCurrent ? 3 : 1,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-foreground">{stage.order}. {stage.label}</div>
                      {isComplete && <span className="text-xs text-green-600">✓ Complete</span>}
                      {isCurrent && <span className="text-xs font-semibold" style={{ color: pod.color || "#CC5536" }}>Current</span>}
                    </div>
                    <p className="text-xs text-muted">{stage.description}</p>
                  </div>
                  <div className="text-xs text-muted">
                    {stageProgress.completed}/{stageProgress.total}
                  </div>
                </div>

                <div className="space-y-2">
                  {stageCheckpoints.map((checkpoint) => {
                    const canToggle = !checkpoint.dependencies || checkpoint.dependencies.every((depId) => {
                      const dep = journey.checkpoints.find((c) => c.id === depId);
                      return dep?.completed;
                    });
                    const isUpdating = updatingCheckpoint === checkpoint.id;

                    return (
                      <div
                        key={checkpoint.id}
                        className={`flex items-start gap-3 p-3 border transition-colors ${
                          checkpoint.completed
                            ? "bg-green-50/50 border-green-200"
                            : canToggle
                            ? "bg-background border-border cursor-pointer hover:border-accent/30"
                            : "bg-background/50 border-border/50 opacity-60"
                        }`}
                        style={{ borderRadius: 2 }}
                        onClick={() => {
                          if (canToggle && !isUpdating) {
                            handleCheckpointToggle(checkpoint.id, !checkpoint.completed);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checkpoint.completed}
                          disabled={!canToggle || isUpdating}
                          readOnly
                          className="mt-0.5 accent-[#16a34a]"
                        />
                        <div className="flex-1">
                          <div className={`text-sm ${checkpoint.completed ? "text-muted line-through" : "text-foreground"}`}>
                            {checkpoint.label}
                            {checkpoint.required && (
                              <span className="text-[10px] text-muted ml-1">(required)</span>
                            )}
                          </div>
                          <div className="text-xs text-muted mt-0.5">{checkpoint.description}</div>
                          {checkpoint.completed && checkpoint.completedAt && (
                            <div className="text-[10px] text-muted mt-1">
                              Completed {new Date(checkpoint.completedAt).toLocaleDateString()}
                            </div>
                          )}
                          {!canToggle && checkpoint.dependencies && checkpoint.dependencies.length > 0 && (
                            <div className="text-[10px] text-muted mt-1">
                              Requires: {checkpoint.dependencies.map((depId) => {
                                const dep = journey.checkpoints.find((c) => c.id === depId);
                                return dep?.label;
                              }).filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ═══ TAB: Campaigns ═══ */}
      {activeTab === "Campaigns" && (
        <div className="space-y-6">
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="label-uppercase text-muted text-[10px]">
                Sourcing Campaigns ({campaigns.length})
              </div>
              <Link
                href="/studio/campaigns"
                className="text-xs text-accent hover:underline"
              >
                Manage Campaigns →
              </Link>
            </div>
            {campaigns.length === 0 ? (
              <div>
                <p className="text-sm text-muted mb-3">
                  No campaigns launched for this pod yet.
                </p>
                <Link
                  href="/studio/campaigns"
                  className="inline-block px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  + Launch Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const st = CAMPAIGN_STATUS[c.status] || CAMPAIGN_STATUS.draft;
                  const typeInfo = TYPE_LABELS[c.campaignType] || TYPE_LABELS.mixed;
                  const currentWeek = c.currentWeek || 0;
                  const showFellows = c.campaignType !== "deal";
                  const showDeals = c.campaignType !== "fellow";
                  return (
                    <div
                      key={c.id}
                      className="border border-border p-3"
                      style={{ borderRadius: 2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {c.name}
                          </span>
                          <span
                            className="text-[8px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 text-white"
                            style={{ backgroundColor: typeInfo.color, borderRadius: 2 }}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${st.bg} ${st.text}`}
                          style={{ borderRadius: 2 }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {showFellows && (
                          <span>{c.targetFellows} fellow target</span>
                        )}
                        {showDeals && (c.targetDeals || 0) > 0 && (
                          <span>{c.targetDeals} deal target</span>
                        )}
                        <span>
                          {c.sprintWeeks}-week sprint
                        </span>
                        {c.status === "active" && (
                          <span className="font-medium text-foreground">
                            Week {currentWeek}/{c.sprintWeeks}
                          </span>
                        )}
                        {c.status === "completed" && (
                          <span className="font-medium">
                            {showFellows && (
                              <span style={{ color: "#CC5536" }}>
                                {c.fellowsRecruited || 0} recruited
                              </span>
                            )}
                            {showFellows && showDeals && " · "}
                            {showDeals && (
                              <span style={{ color: "#1976D2" }}>
                                {c.dealsSourced || 0} deals
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {c.status === "active" && (
                        <div
                          className="h-1.5 bg-background overflow-hidden mt-2"
                          style={{ borderRadius: 1 }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${Math.min(
                                (currentWeek / c.sprintWeeks) * 100,
                                100
                              )}%`,
                              backgroundColor: typeInfo.color,
                              borderRadius: 1,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══ TAB: Launch ═══ */}
      {activeTab === "Launch" && (
        <div className="space-y-6">
          <section className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="label-uppercase text-muted text-[10px]">
                Pod Launch
              </div>
              <Link
                href="/studio/pod-launch"
                className="text-xs text-accent hover:underline"
              >
                All Launches →
              </Link>
            </div>
            {podLaunch ? (
              <Link
                href={`/studio/pod-launch/${podLaunch.id}`}
                className="block border border-border p-3 hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {podLaunch.name}
                  </span>
                  <span
                    className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${
                      podLaunch.status === "operational"
                        ? "bg-emerald-50 text-emerald-700"
                        : ["sprint_1", "sprint_2"].includes(podLaunch.status)
                        ? "bg-green-50 text-green-700"
                        : podLaunch.status === "pre_work"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {LAUNCH_PHASE_LABELS[podLaunch.status] || podLaunch.status}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  Phase: {LAUNCH_PHASE_LABELS[podLaunch.currentPhase] || podLaunch.currentPhase}
                  {" · "}View playbook →
                </div>
              </Link>
            ) : (
              <div>
                <p className="text-sm text-muted mb-3">
                  No launch playbook for this pod yet.
                </p>
                <Link
                  href="/studio/pod-launch"
                  className="inline-block px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  + Launch Pod
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
