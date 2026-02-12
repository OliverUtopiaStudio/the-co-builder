"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPod, getCampaignsForPod, getPodLaunchForPod } from "@/app/actions/studio";

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

export default function PodDetailPage() {
  const { podId } = useParams<{ podId: string }>();
  const [data, setData] = useState<PodData | null>(null);
  const [campaigns, setCampaigns] = useState<PodCampaign[]>([]);
  const [podLaunch, setPodLaunch] = useState<PodLaunchStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (podId) {
      Promise.all([getPod(podId), getCampaignsForPod(podId), getPodLaunchForPod(podId)]).then(
        ([result, campData, launchData]) => {
          setData(result as PodData | null);
          setCampaigns(campData as PodCampaign[]);
          setPodLaunch(launchData as PodLaunchStatus | null);
          setLoading(false);
        }
      );
    }
  }, [podId]);

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
      <div className="flex items-start gap-4 mb-8">
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
    </div>
  );
}
