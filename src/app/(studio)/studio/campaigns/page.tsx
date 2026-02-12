"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getCampaigns,
  getPods,
  createCampaign,
  launchCampaign,
  advanceCampaignWeek,
  updateCampaign,
} from "@/app/actions/studio";

type Channel = { channel: string; tactic: string; target: string };

type Campaign = {
  campaign: {
    id: string;
    podId: string;
    name: string;
    campaignType: string;
    status: string;
    sprintWeeks: number;
    targetFellows: number;
    targetDeals: number | null;
    channels: unknown;
    weeklyMilestones: unknown;
    actualProgress: unknown;
    currentWeek: number | null;
    startDate: Date | null;
    endDate: Date | null;
    fellowsRecruited: number | null;
    dealsSourced: number | null;
    notes: string | null;
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

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  active: { bg: "bg-green-50", text: "text-green-700", label: "Active" },
  paused: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Paused" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", label: "Completed" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Cancelled" },
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  fellow: { label: "Fellow Sourcing", color: "#CC5536" },
  deal: { label: "Deal Sourcing", color: "#1976D2" },
  mixed: { label: "Fellows + Deals", color: "#7B1FA2" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pods, setPodsState] = useState<PodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newPodId, setNewPodId] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("mixed");
  const [newTargetFellows, setNewTargetFellows] = useState(2);
  const [newTargetDeals, setNewTargetDeals] = useState(3);
  const [newSprintWeeks, setNewSprintWeeks] = useState(4);
  const [newChannels, setNewChannels] = useState<Channel[]>([
    { channel: "", tactic: "", target: "" },
  ]);
  const [newMilestones, setNewMilestones] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  // Week advance modal
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [weekNote, setWeekNote] = useState("");

  // Expand detail
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCampaigns(), getPods()]).then(([c, p]) => {
      setCampaigns(c as Campaign[]);
      setPodsState(p as PodOption[]);
      setLoading(false);
    });
  }, []);

  function handleCreate() {
    if (!newPodId || !newName) return;
    startTransition(async () => {
      await createCampaign({
        podId: newPodId,
        name: newName,
        campaignType: newType,
        targetFellows:
          newType === "deal" ? 0 : newTargetFellows,
        targetDeals:
          newType === "fellow" ? 0 : newTargetDeals,
        sprintWeeks: newSprintWeeks,
        channels: newChannels.filter((c) => c.channel.trim()),
        weeklyMilestones: newMilestones.filter((m) => m.trim()),
      });
      const updated = await getCampaigns();
      setCampaigns(updated as Campaign[]);
      setShowCreate(false);
      resetForm();
    });
  }

  function resetForm() {
    setNewPodId("");
    setNewName("");
    setNewType("mixed");
    setNewTargetFellows(2);
    setNewTargetDeals(3);
    setNewSprintWeeks(4);
    setNewChannels([{ channel: "", tactic: "", target: "" }]);
    setNewMilestones(["", "", "", ""]);
  }

  function handleLaunch(campaignId: string) {
    startTransition(async () => {
      await launchCampaign(campaignId);
      const updated = await getCampaigns();
      setCampaigns(updated as Campaign[]);
    });
  }

  function handleAdvanceWeek(campaignId: string) {
    if (!weekNote.trim()) return;
    startTransition(async () => {
      await advanceCampaignWeek(campaignId, weekNote.trim());
      const updated = await getCampaigns();
      setCampaigns(updated as Campaign[]);
      setAdvancingId(null);
      setWeekNote("");
    });
  }

  function handleStatusChange(campaignId: string, status: string) {
    startTransition(async () => {
      await updateCampaign(campaignId, { status });
      const updated = await getCampaigns();
      setCampaigns(updated as Campaign[]);
    });
  }

  if (loading) {
    return <div className="text-muted text-sm">Loading campaigns...</div>;
  }

  const activeCampaigns = campaigns.filter(
    (c) => c.campaign.status === "active"
  );
  const draftCampaigns = campaigns.filter(
    (c) => c.campaign.status === "draft"
  );
  const pastCampaigns = campaigns.filter(
    (c) =>
      c.campaign.status === "completed" ||
      c.campaign.status === "cancelled" ||
      c.campaign.status === "paused"
  );

  // Aggregate stats
  const totalFellowTarget = campaigns
    .filter((c) => c.campaign.status !== "cancelled")
    .reduce((s, c) => s + (c.campaign.targetFellows || 0), 0);
  const totalDealTarget = campaigns
    .filter((c) => c.campaign.status !== "cancelled")
    .reduce((s, c) => s + (c.campaign.targetDeals || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label-uppercase text-muted mb-2">Studio OS</div>
            <h1 className="text-2xl font-medium text-foreground">
              Sourcing Campaigns
            </h1>
            <p className="text-sm text-muted mt-1">
              {activeCampaigns.length} active —{" "}
              {totalFellowTarget > 0 && (
                <span>{totalFellowTarget} fellow targets</span>
              )}
              {totalFellowTarget > 0 && totalDealTarget > 0 && " / "}
              {totalDealTarget > 0 && (
                <span>{totalDealTarget} deal targets</span>
              )}
              {totalFellowTarget === 0 && totalDealTarget === 0 && (
                <span>{campaigns.length} total</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
            style={{ borderRadius: 2 }}
          >
            <span>+</span> New Campaign
          </button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreate && (
        <div
          className="bg-surface border border-accent/20 p-6 mb-8"
          style={{ borderRadius: 2 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Launch a Sourcing Campaign
          </h2>

          {/* Campaign Type Selector */}
          <div className="mb-5">
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
              Campaign Type
            </label>
            <div className="flex gap-2">
              {(["mixed", "fellow", "deal"] as const).map((t) => {
                const tl = TYPE_LABELS[t];
                const active = newType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`px-4 py-2 text-xs font-semibold border transition-colors ${
                      active
                        ? "border-accent/50 text-foreground"
                        : "border-border text-muted hover:border-accent/30"
                    }`}
                    style={{
                      borderRadius: 2,
                      backgroundColor: active ? `${tl.color}10` : undefined,
                    }}
                  >
                    {tl.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted mt-1.5">
              {newType === "mixed" &&
                "Source both EIR fellows and pre-seed investment opportunities within the pod thesis."}
              {newType === "fellow" &&
                "Focus on recruiting EIR fellows with domain expertise for this pod."}
              {newType === "deal" &&
                "Focus on sourcing pre-seed ventures and deal flow aligned with the pod thesis."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Pod selector */}
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

            {/* Campaign name */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Q1 2026 Energy Grid Sprint"
                className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>

            {/* Sprint length */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Sprint Length (weeks)
              </label>
              <input
                type="number"
                value={newSprintWeeks}
                onChange={(e) => setNewSprintWeeks(Number(e.target.value))}
                min={1}
                max={12}
                className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>

            {/* Targets — conditional on type */}
            <div className="flex gap-3">
              {newType !== "deal" && (
                <div className="flex-1">
                  <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                    Fellow Target
                  </label>
                  <input
                    type="number"
                    value={newTargetFellows}
                    onChange={(e) =>
                      setNewTargetFellows(Number(e.target.value))
                    }
                    min={0}
                    max={20}
                    className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                </div>
              )}
              {newType !== "fellow" && (
                <div className="flex-1">
                  <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                    Deal Target
                  </label>
                  <input
                    type="number"
                    value={newTargetDeals}
                    onChange={(e) => setNewTargetDeals(Number(e.target.value))}
                    min={0}
                    max={50}
                    className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sourcing Channels */}
          <div className="mb-4">
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
              Sourcing Channels
            </label>
            <div className="space-y-2">
              {newChannels.map((ch, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ch.channel}
                    onChange={(e) => {
                      const updated = [...newChannels];
                      updated[i] = { ...updated[i], channel: e.target.value };
                      setNewChannels(updated);
                    }}
                    placeholder="e.g. LinkedIn Outreach"
                    className="px-2 py-1.5 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                  <input
                    type="text"
                    value={ch.tactic}
                    onChange={(e) => {
                      const updated = [...newChannels];
                      updated[i] = { ...updated[i], tactic: e.target.value };
                      setNewChannels(updated);
                    }}
                    placeholder="Tactic / approach"
                    className="px-2 py-1.5 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={ch.target}
                      onChange={(e) => {
                        const updated = [...newChannels];
                        updated[i] = { ...updated[i], target: e.target.value };
                        setNewChannels(updated);
                      }}
                      placeholder="Target volume"
                      className="flex-1 px-2 py-1.5 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                      style={{ borderRadius: 2 }}
                    />
                    {newChannels.length > 1 && (
                      <button
                        onClick={() =>
                          setNewChannels(
                            newChannels.filter((_, j) => j !== i)
                          )
                        }
                        className="px-2 text-xs text-muted hover:text-red-500"
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  setNewChannels([
                    ...newChannels,
                    { channel: "", tactic: "", target: "" },
                  ])
                }
                className="text-xs text-accent hover:underline"
              >
                + Add channel
              </button>
            </div>
          </div>

          {/* Weekly Milestones */}
          <div className="mb-6">
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
              Weekly Milestones
            </label>
            <div className="space-y-2">
              {newMilestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted font-semibold w-14 shrink-0">
                    Week {i + 1}
                  </span>
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const updated = [...newMilestones];
                      updated[i] = e.target.value;
                      setNewMilestones(updated);
                    }}
                    placeholder={`Week ${i + 1} milestone...`}
                    className="flex-1 px-2 py-1.5 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                </div>
              ))}
              {newMilestones.length < newSprintWeeks && (
                <button
                  onClick={() => setNewMilestones([...newMilestones, ""])}
                  className="text-xs text-accent hover:underline"
                >
                  + Add week
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newPodId || !newName || isPending}
              className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {isPending ? "Creating..." : "Create Campaign"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <section className="mb-8">
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Active Sprints ({activeCampaigns.length})
          </h2>
          <div className="space-y-4">
            {activeCampaigns.map((c) => (
              <CampaignCard
                key={c.campaign.id}
                data={c}
                expanded={expandedId === c.campaign.id}
                onToggleExpand={() =>
                  setExpandedId(
                    expandedId === c.campaign.id ? null : c.campaign.id
                  )
                }
                onAdvanceWeek={() => {
                  setAdvancingId(c.campaign.id);
                  setWeekNote("");
                }}
                onStatusChange={(status) =>
                  handleStatusChange(c.campaign.id, status)
                }
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Draft Campaigns */}
      {draftCampaigns.length > 0 && (
        <section className="mb-8">
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Draft Campaigns ({draftCampaigns.length})
          </h2>
          <div className="space-y-4">
            {draftCampaigns.map((c) => (
              <CampaignCard
                key={c.campaign.id}
                data={c}
                expanded={expandedId === c.campaign.id}
                onToggleExpand={() =>
                  setExpandedId(
                    expandedId === c.campaign.id ? null : c.campaign.id
                  )
                }
                onLaunch={() => handleLaunch(c.campaign.id)}
                onStatusChange={(status) =>
                  handleStatusChange(c.campaign.id, status)
                }
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Campaigns */}
      {pastCampaigns.length > 0 && (
        <section>
          <h2 className="label-uppercase text-muted mb-4 text-[10px]">
            Past Campaigns ({pastCampaigns.length})
          </h2>
          <div className="space-y-4">
            {pastCampaigns.map((c) => (
              <CampaignCard
                key={c.campaign.id}
                data={c}
                expanded={expandedId === c.campaign.id}
                onToggleExpand={() =>
                  setExpandedId(
                    expandedId === c.campaign.id ? null : c.campaign.id
                  )
                }
                onStatusChange={(status) =>
                  handleStatusChange(c.campaign.id, status)
                }
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {campaigns.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-2">No campaigns yet.</p>
          <p className="text-muted text-xs mb-4">
            Create a sourcing campaign to recruit fellows and source pre-seed
            deals within a pod thesis.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            + New Campaign
          </button>
        </div>
      )}

      {/* Week Advance Modal */}
      {advancingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className="bg-surface border border-border p-6 w-full max-w-md"
            style={{ borderRadius: 2 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Complete Week &amp; Advance
            </h3>
            <p className="text-xs text-muted mb-4">
              Record sourcing progress this week — fellow conversations, deals
              reviewed, intros made.
            </p>
            <textarea
              value={weekNote}
              onChange={(e) => setWeekNote(e.target.value)}
              placeholder="E.g. 'Screened 6 fellow candidates, reviewed 4 deal decks, 2 deep-dives scheduled...'"
              className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent resize-none mb-4"
              style={{ borderRadius: 2 }}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAdvanceWeek(advancingId)}
                disabled={!weekNote.trim() || isPending}
                className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                style={{ borderRadius: 2 }}
              >
                {isPending ? "Saving..." : "Complete & Advance"}
              </button>
              <button
                onClick={() => {
                  setAdvancingId(null);
                  setWeekNote("");
                }}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaign Card Component ──────────────────────────────────────

function CampaignCard({
  data,
  expanded,
  onToggleExpand,
  onLaunch,
  onAdvanceWeek,
  onStatusChange,
  isPending,
}: {
  data: Campaign;
  expanded: boolean;
  onToggleExpand: () => void;
  onLaunch?: () => void;
  onAdvanceWeek?: () => void;
  onStatusChange: (status: string) => void;
  isPending: boolean;
}) {
  const { campaign, podName, podColor, podDisplayOrder } = data;
  const status = STATUS_STYLES[campaign.status] || STATUS_STYLES.draft;
  const typeInfo = TYPE_LABELS[campaign.campaignType] || TYPE_LABELS.mixed;
  const channels = Array.isArray(campaign.channels)
    ? (campaign.channels as Channel[])
    : [];
  const milestones = Array.isArray(campaign.weeklyMilestones)
    ? (campaign.weeklyMilestones as string[])
    : [];
  const progress = Array.isArray(campaign.actualProgress)
    ? (campaign.actualProgress as string[])
    : [];
  const currentWeek = campaign.currentWeek || 0;
  const sprintWeeks = campaign.sprintWeeks || 4;
  const targetFellows = campaign.targetFellows || 0;
  const targetDeals = campaign.targetDeals || 0;

  // Build target summary
  const targets: string[] = [];
  if (targetFellows > 0)
    targets.push(`${targetFellows} fellow${targetFellows !== 1 ? "s" : ""}`);
  if (targetDeals > 0)
    targets.push(`${targetDeals} deal${targetDeals !== 1 ? "s" : ""}`);
  const targetSummary = targets.join(" + ") || "no targets set";

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      {/* Color bar */}
      <div
        className="h-1"
        style={{ backgroundColor: podColor || "#CC5536" }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{
                backgroundColor: podColor || "#CC5536",
                borderRadius: 2,
              }}
            >
              {podDisplayOrder}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {campaign.name}
                </h3>
                <span
                  className="text-[8px] font-bold tracking-[0.5px] uppercase px-1.5 py-0.5"
                  style={{
                    borderRadius: 2,
                    backgroundColor: `${typeInfo.color}15`,
                    color: typeInfo.color,
                  }}
                >
                  {typeInfo.label}
                </span>
              </div>
              <div className="text-xs text-muted">
                {podName} — {targetSummary} — {sprintWeeks}-week sprint
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-semibold tracking-[0.5px] uppercase px-1.5 py-0.5 ${status.bg} ${status.text} border`}
              style={{ borderRadius: 2, borderColor: "transparent" }}
            >
              {status.label}
            </span>
            <button
              onClick={onToggleExpand}
              className="text-xs text-muted hover:text-accent"
            >
              {expanded ? "▾" : "▸"} Details
            </button>
          </div>
        </div>

        {/* Progress bar (for active campaigns) */}
        {campaign.status === "active" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted uppercase tracking-wider">
                Week {currentWeek} of {sprintWeeks}
              </span>
              <span className="text-xs text-foreground font-semibold">
                {Math.round((currentWeek / sprintWeeks) * 100)}%
              </span>
            </div>
            <div
              className="h-2 bg-background overflow-hidden"
              style={{ borderRadius: 1 }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (currentWeek / sprintWeeks) * 100,
                    100
                  )}%`,
                  backgroundColor: typeInfo.color,
                  borderRadius: 1,
                }}
              />
            </div>
            {/* Week dots */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: sprintWeeks }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5"
                  style={{
                    backgroundColor:
                      i < currentWeek
                        ? typeInfo.color
                        : i === currentWeek
                        ? `${typeInfo.color}40`
                        : "#E3E1E2",
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed summary */}
        {campaign.status === "completed" && (
          <div
            className="bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 mb-4"
            style={{ borderRadius: 2 }}
          >
            Sprint completed
            {targetFellows > 0 && (
              <span>
                {" "}
                — {campaign.fellowsRecruited || 0}/{targetFellows} fellows
              </span>
            )}
            {targetDeals > 0 && (
              <span>
                {" "}
                — {campaign.dealsSourced || 0}/{targetDeals} deals
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {campaign.status === "draft" && onLaunch && (
            <button
              onClick={onLaunch}
              disabled={isPending}
              className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {isPending ? "..." : "Launch Sprint"}
            </button>
          )}
          {campaign.status === "active" && onAdvanceWeek && (
            <button
              onClick={onAdvanceWeek}
              disabled={isPending}
              className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              Complete Week {currentWeek}
            </button>
          )}
          {campaign.status === "active" && (
            <button
              onClick={() => onStatusChange("paused")}
              disabled={isPending}
              className="px-3 py-1.5 text-xs text-muted hover:text-foreground border border-border hover:border-accent/30 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Pause
            </button>
          )}
          {campaign.status === "paused" && (
            <button
              onClick={() => onStatusChange("active")}
              disabled={isPending}
              className="px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              Resume
            </button>
          )}
          <Link
            href={`/studio/pods/${campaign.podId}`}
            className="px-3 py-1.5 text-xs text-accent hover:underline"
          >
            View Pod
          </Link>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-border space-y-5">
            {/* Sourcing Channels */}
            {channels.length > 0 && (
              <div>
                <div className="label-uppercase text-muted mb-2 text-[9px]">
                  Sourcing Channels
                </div>
                <div className="space-y-2">
                  {channels.map((ch, i) => (
                    <div
                      key={i}
                      className="bg-background border border-border p-3"
                      style={{ borderRadius: 2 }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {ch.channel}
                        </span>
                        <span className="text-[10px] text-accent font-medium">
                          {ch.target}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">
                        {ch.tactic}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scoreboard (for active/completed) */}
            {(campaign.status === "active" ||
              campaign.status === "completed") && (
              <div>
                <div className="label-uppercase text-muted mb-2 text-[9px]">
                  Scoreboard
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {targetFellows > 0 && (
                    <div
                      className="bg-background border border-border p-3 text-center"
                      style={{ borderRadius: 2 }}
                    >
                      <div className="text-lg font-semibold text-foreground">
                        {campaign.fellowsRecruited || 0}
                        <span className="text-sm text-muted font-normal">
                          /{targetFellows}
                        </span>
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider mt-1">
                        Fellows Recruited
                      </div>
                    </div>
                  )}
                  {targetDeals > 0 && (
                    <div
                      className="bg-background border border-border p-3 text-center"
                      style={{ borderRadius: 2 }}
                    >
                      <div className="text-lg font-semibold text-foreground">
                        {campaign.dealsSourced || 0}
                        <span className="text-sm text-muted font-normal">
                          /{targetDeals}
                        </span>
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider mt-1">
                        Deals Sourced
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weekly Plan vs Actual */}
            <div>
              <div className="label-uppercase text-muted mb-2 text-[9px]">
                Weekly Plan{progress.length > 0 ? " vs Actual" : ""}
              </div>
              <div className="space-y-2">
                {milestones.map((milestone, i) => {
                  const isCompleted = i < progress.length;
                  const isCurrent =
                    i === currentWeek - 1 && campaign.status === "active";
                  return (
                    <div
                      key={i}
                      className={`border p-3 ${
                        isCurrent
                          ? "border-accent/30 bg-accent/5"
                          : isCompleted
                          ? "border-green-200 bg-green-50/50"
                          : "border-border bg-background"
                      }`}
                      style={{ borderRadius: 2 }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-[10px] font-bold shrink-0 w-14 ${
                            isCurrent
                              ? "text-accent"
                              : isCompleted
                              ? "text-green-600"
                              : "text-muted"
                          }`}
                        >
                          Week {i + 1}
                          {isCurrent && " ←"}
                        </span>
                        <div className="flex-1">
                          <p
                            className={`text-xs ${
                              isCompleted
                                ? "text-muted line-through"
                                : "text-foreground"
                            }`}
                          >
                            {milestone}
                          </p>
                          {isCompleted && progress[i] && (
                            <p className="text-xs text-green-700 mt-1">
                              ✓ {progress[i]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            {campaign.notes && (
              <div>
                <div className="label-uppercase text-muted mb-2 text-[9px]">
                  Notes
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {campaign.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
