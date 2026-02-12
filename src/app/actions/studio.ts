"use server";

import { db } from "@/db";
import {
  pods,
  fellows,
  kpiMetrics,
  ashbyPipeline,
  ventures,
  assetCompletion,
  podCampaigns,
  podLaunches,
} from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow || (fellow.role !== "admin" && fellow.role !== "studio"))
    throw new Error("Forbidden");
  return fellow;
}

// ─── KPIs ─────────────────────────────────────────────────────────

export async function getKPIs() {
  await requireAdmin();
  return db.select().from(kpiMetrics).orderBy(kpiMetrics.displayOrder);
}

export async function updateKPI(
  key: string,
  data: { current?: number; pipelineNotes?: string }
) {
  await requireAdmin();
  await db
    .update(kpiMetrics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(kpiMetrics.key, key));
  return { success: true };
}

// ─── Pods ─────────────────────────────────────────────────────────

export async function getPods() {
  await requireAdmin();
  const allPods = await db.select().from(pods).orderBy(pods.displayOrder);

  // Get fellow counts per pod
  const fellowCounts = await db
    .select({
      podId: fellows.podId,
      count: sql<number>`count(*)`,
    })
    .from(fellows)
    .where(sql`${fellows.podId} IS NOT NULL`)
    .groupBy(fellows.podId);

  const countMap = new Map(
    fellowCounts.map((fc) => [fc.podId, Number(fc.count)])
  );

  return allPods.map((pod) => ({
    ...pod,
    fellowCount: countMap.get(pod.id) || 0,
  }));
}

export async function getPod(podId: string) {
  await requireAdmin();
  const [pod] = await db.select().from(pods).where(eq(pods.id, podId)).limit(1);
  if (!pod) return null;

  const podFellows = await db
    .select({
      id: fellows.id,
      fullName: fellows.fullName,
      email: fellows.email,
      lifecycleStage: fellows.lifecycleStage,
      equityPercentage: fellows.equityPercentage,
      globalPotentialRating: fellows.globalPotentialRating,
      qatarImpactRating: fellows.qatarImpactRating,
      linkedinUrl: fellows.linkedinUrl,
    })
    .from(fellows)
    .where(eq(fellows.podId, podId));

  return { pod, fellows: podFellows };
}

export async function updatePod(
  podId: string,
  data: {
    name?: string;
    tagline?: string;
    thesis?: string;
    marketGap?: string;
    targetArchetype?: string;
    color?: string;
  }
) {
  await requireAdmin();
  await db
    .update(pods)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pods.id, podId));
  return { success: true };
}

// ─── Pipeline ─────────────────────────────────────────────────────

export async function getPipeline() {
  await requireAdmin();
  return db.select().from(ashbyPipeline).orderBy(ashbyPipeline.displayOrder);
}

export async function updatePipelineRole(
  roleId: string,
  data: {
    applicants?: number;
    leads?: number;
    review?: number;
    screening?: number;
    interview?: number;
    offer?: number;
    hired?: number;
    archived?: number;
    status?: string;
  }
) {
  await requireAdmin();
  await db
    .update(ashbyPipeline)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ashbyPipeline.id, roleId));
  return { success: true };
}

// ─── Studio Fellows ───────────────────────────────────────────────

export async function getStudioFellows() {
  await requireAdmin();
  return db
    .select({
      id: fellows.id,
      fullName: fellows.fullName,
      email: fellows.email,
      role: fellows.role,
      lifecycleStage: fellows.lifecycleStage,
      podId: fellows.podId,
      equityPercentage: fellows.equityPercentage,
      globalPotentialRating: fellows.globalPotentialRating,
      qatarImpactRating: fellows.qatarImpactRating,
      linkedinUrl: fellows.linkedinUrl,
    })
    .from(fellows)
    .where(eq(fellows.role, "fellow"))
    .orderBy(fellows.createdAt);
}

export async function getStudioStats() {
  await requireAdmin();

  const kpis = await db.select().from(kpiMetrics).orderBy(kpiMetrics.displayOrder);
  const pipelineRoles = await db.select().from(ashbyPipeline).orderBy(ashbyPipeline.displayOrder);
  const podList = await db.select().from(pods).orderBy(pods.displayOrder);

  const totalApplicants = pipelineRoles.reduce((sum, r) => sum + (r.applicants || 0), 0);

  return {
    kpis,
    pipeline: pipelineRoles,
    pods: podList,
    totalApplicants,
  };
}

// ─── KPI ↔ Data Refresh ──────────────────────────────────────────
// Computes live values for KPIs that can be derived from actual DB data.
// Returns the refreshed counts so the UI can show what changed.

export async function refreshKPIsFromData() {
  await requireAdmin();

  // Count fellows (role = 'fellow')
  const [fellowCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fellows)
    .where(eq(fellows.role, "fellow"));

  // Count active ventures
  const [ventureCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ventures)
    .where(eq(ventures.isActive, true));

  // Count completed assets
  const [completedAssets] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assetCompletion)
    .where(eq(assetCompletion.isComplete, true));

  // Count spinouts (lifecycle_stage = 'spin_out' or 'graduated')
  const [spinoutCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fellows)
    .where(sql`${fellows.lifecycleStage} IN ('spin_out', 'graduated')`);

  // Count hired from pipeline
  const [hiredCount] = await db
    .select({ total: sql<number>`COALESCE(SUM(${ashbyPipeline.hired}), 0)` })
    .from(ashbyPipeline);

  const liveValues: Record<string, number> = {
    eir: Number(fellowCount?.count || 0),
    concepts: Number(ventureCount?.count || 0),
    spinouts: Number(spinoutCount?.count || 0),
    ftes: Number(hiredCount?.total || 0),
  };

  // Update KPIs that have live data mappings
  const updated: string[] = [];
  for (const [key, value] of Object.entries(liveValues)) {
    await db
      .update(kpiMetrics)
      .set({ current: value, updatedAt: new Date() })
      .where(eq(kpiMetrics.key, key));
    updated.push(key);
  }

  return {
    success: true,
    updated,
    values: liveValues,
    completedAssets: Number(completedAssets?.count || 0),
  };
}

// ─── Pod Campaigns (Sourcing Sprints) ────────────────────────────

export async function getCampaigns() {
  await requireAdmin();
  const campaigns = await db
    .select({
      campaign: podCampaigns,
      podName: pods.name,
      podColor: pods.color,
      podDisplayOrder: pods.displayOrder,
    })
    .from(podCampaigns)
    .innerJoin(pods, eq(podCampaigns.podId, pods.id))
    .orderBy(desc(podCampaigns.createdAt));
  return campaigns;
}

export async function getCampaignsForPod(podId: string) {
  await requireAdmin();
  return db
    .select()
    .from(podCampaigns)
    .where(eq(podCampaigns.podId, podId))
    .orderBy(desc(podCampaigns.createdAt));
}

export async function createCampaign(data: {
  podId: string;
  name: string;
  campaignType?: string;
  sprintWeeks?: number;
  targetFellows?: number;
  targetDeals?: number;
  channels?: Array<{ channel: string; tactic: string; target: string }>;
  weeklyMilestones?: string[];
  notes?: string;
}) {
  await requireAdmin();
  const [campaign] = await db
    .insert(podCampaigns)
    .values({
      podId: data.podId,
      name: data.name,
      campaignType: data.campaignType || "mixed",
      sprintWeeks: data.sprintWeeks || 4,
      targetFellows: data.targetFellows || 2,
      targetDeals: data.targetDeals || 0,
      channels: data.channels || [],
      weeklyMilestones: data.weeklyMilestones || [],
      actualProgress: [],
      notes: data.notes || null,
    })
    .returning();
  return campaign;
}

export async function updateCampaign(
  campaignId: string,
  data: {
    name?: string;
    campaignType?: string;
    status?: string;
    sprintWeeks?: number;
    targetFellows?: number;
    targetDeals?: number;
    channels?: Array<{ channel: string; tactic: string; target: string }>;
    weeklyMilestones?: string[];
    actualProgress?: string[];
    currentWeek?: number;
    startDate?: string | null;
    endDate?: string | null;
    fellowsRecruited?: number;
    dealsSourced?: number;
    notes?: string;
  }
) {
  await requireAdmin();

  const setData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) setData.name = data.name;
  if (data.campaignType !== undefined) setData.campaignType = data.campaignType;
  if (data.status !== undefined) setData.status = data.status;
  if (data.sprintWeeks !== undefined) setData.sprintWeeks = data.sprintWeeks;
  if (data.targetFellows !== undefined) setData.targetFellows = data.targetFellows;
  if (data.targetDeals !== undefined) setData.targetDeals = data.targetDeals;
  if (data.channels !== undefined) setData.channels = data.channels;
  if (data.weeklyMilestones !== undefined) setData.weeklyMilestones = data.weeklyMilestones;
  if (data.actualProgress !== undefined) setData.actualProgress = data.actualProgress;
  if (data.currentWeek !== undefined) setData.currentWeek = data.currentWeek;
  if (data.startDate !== undefined) setData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) setData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.fellowsRecruited !== undefined) setData.fellowsRecruited = data.fellowsRecruited;
  if (data.dealsSourced !== undefined) setData.dealsSourced = data.dealsSourced;
  if (data.notes !== undefined) setData.notes = data.notes;

  await db
    .update(podCampaigns)
    .set(setData)
    .where(eq(podCampaigns.id, campaignId));

  return { success: true };
}

export async function launchCampaign(campaignId: string) {
  await requireAdmin();
  await db
    .update(podCampaigns)
    .set({
      status: "active",
      currentWeek: 1,
      startDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(podCampaigns.id, campaignId));
  return { success: true };
}

export async function advanceCampaignWeek(campaignId: string, weekNote: string) {
  await requireAdmin();
  const [campaign] = await db
    .select()
    .from(podCampaigns)
    .where(eq(podCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) throw new Error("Campaign not found");

  const currentProgress = Array.isArray(campaign.actualProgress)
    ? (campaign.actualProgress as string[])
    : [];
  const newWeek = (campaign.currentWeek || 0) + 1;
  const isComplete = newWeek > (campaign.sprintWeeks || 4);

  await db
    .update(podCampaigns)
    .set({
      currentWeek: isComplete ? campaign.sprintWeeks : newWeek,
      actualProgress: [...currentProgress, weekNote],
      status: isComplete ? "completed" : "active",
      endDate: isComplete ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(podCampaigns.id, campaignId));

  return { success: true, isComplete };
}

// ─── Pod Launches (Thesis Pod Setup Playbook) ────────────────────

import {
  DEFAULT_PRE_LAUNCH,
  DEFAULT_SPRINTS,
  DEFAULT_ROLE_KPIS,
  DEFAULT_OPERATIONAL_RHYTHM,
  DEFAULT_IMPLEMENTATION_TIMELINE,
  DEAL_STAGE_TEMPLATES,
} from "@/data/pod-launch-templates";

const DEFAULT_TARGET_METRICS = {
  fellowsEmbedded: { target: 2, current: 0 },
  corporatePartnersEngaged: { target: 3, current: 0, tier1Count: 0 },
  coInvestorsMapped: { target: 5, current: 0 },
  dealsInPipeline: { target: 3, current: 0 },
  podLeadActive: false,
};

export async function getPodLaunches() {
  await requireAdmin();
  const launches = await db
    .select({
      launch: podLaunches,
      podName: pods.name,
      podColor: pods.color,
      podDisplayOrder: pods.displayOrder,
    })
    .from(podLaunches)
    .innerJoin(pods, eq(podLaunches.podId, pods.id))
    .orderBy(desc(podLaunches.createdAt));
  return launches;
}

export async function getPodLaunch(launchId: string) {
  await requireAdmin();
  const [result] = await db
    .select({
      launch: podLaunches,
      podName: pods.name,
      podColor: pods.color,
      podDisplayOrder: pods.displayOrder,
      podThesis: pods.thesis,
      podClusters: pods.clusters,
      podTargetArchetype: pods.targetArchetype,
    })
    .from(podLaunches)
    .innerJoin(pods, eq(podLaunches.podId, pods.id))
    .where(eq(podLaunches.id, launchId))
    .limit(1);
  return result || null;
}

export async function getPodLaunchForPod(podId: string) {
  await requireAdmin();
  const [result] = await db
    .select()
    .from(podLaunches)
    .where(eq(podLaunches.podId, podId))
    .orderBy(desc(podLaunches.createdAt))
    .limit(1);
  return result || null;
}

// ─── Create (v2 — hyper-granular) ────────────────────────────────

export async function createPodLaunch(data: {
  podId: string;
  name: string;
  podLeadName?: string;
  targetMetrics?: Record<string, unknown>;
}) {
  await requireAdmin();

  // Build pre-launch with pod lead name
  const preLaunch = JSON.parse(JSON.stringify(DEFAULT_PRE_LAUNCH));
  if (data.podLeadName) {
    preLaunch.checks.podLeadName = data.podLeadName;
    preLaunch.checks.podLeadIdentified = true;
  }

  // Build sprints from templates
  const sprints = JSON.parse(JSON.stringify(DEFAULT_SPRINTS));

  const [launch] = await db
    .insert(podLaunches)
    .values({
      podId: data.podId,
      name: data.name,
      currentPhase: "pre_launch",
      // v2 fields
      preLaunch,
      sprints,
      roleKpis: JSON.parse(JSON.stringify(DEFAULT_ROLE_KPIS)),
      operationalRhythm: JSON.parse(JSON.stringify(DEFAULT_OPERATIONAL_RHYTHM)),
      implementationTimeline: JSON.parse(JSON.stringify(DEFAULT_IMPLEMENTATION_TIMELINE)),
      dealTimelines: [],
      schemaVersion: 2,
      // shared
      targetMetrics: data.targetMetrics || DEFAULT_TARGET_METRICS,
    })
    .returning();
  return launch;
}

// ─── Pre-Launch Actions ──────────────────────────────────────────

export async function updatePreLaunchChecks(
  launchId: string,
  checks: Record<string, unknown>
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pl = (launch.preLaunch || {}) as any;
  pl.checks = { ...(pl.checks || {}), ...checks };
  await db.update(podLaunches).set({ preLaunch: pl, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function togglePreLaunchTask(
  launchId: string,
  weekKey: "weekMinus1" | "week0",
  taskId: string,
  completed: boolean,
  notes?: string
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pl = (launch.preLaunch || {}) as any;
  if (!pl[weekKey]?.tasks) throw new Error("Invalid pre-launch data");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks = pl[weekKey].tasks as any[];
  const idx = tasks.findIndex((t: { id: string }) => t.id === taskId);
  if (idx === -1) throw new Error("Task not found");
  tasks[idx] = {
    ...tasks[idx],
    completed,
    notes: notes !== undefined ? notes : tasks[idx].notes,
    completedAt: completed ? new Date().toISOString() : null,
  };
  await db.update(podLaunches).set({ preLaunch: pl, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// Keep v1 compat wrapper
export async function updatePodLaunchPreWork(
  launchId: string,
  preWork: Record<string, unknown>
) {
  await requireAdmin();
  await db
    .update(podLaunches)
    .set({ preWork, updatedAt: new Date() })
    .where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Sprint Task Actions (v2 — daily grid) ───────────────────────

export async function toggleLaunchTask(
  launchId: string,
  sprintIndex: number,
  weekKey: "week1" | "week2",
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
  workstream: "pod_lead" | "fund" | "studio",
  completed: boolean,
  notes?: string
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sprintsArr = (launch.sprints || []) as any[];
  if (!sprintsArr[sprintIndex]) throw new Error("Sprint not found");
  const sprint = sprintsArr[sprintIndex];
  const daySlot = sprint[weekKey]?.days?.[day];
  if (!daySlot?.tasks?.[workstream]) throw new Error("Task slot not found");

  daySlot.tasks[workstream] = {
    ...daySlot.tasks[workstream],
    completed,
    notes: notes !== undefined ? notes : daySlot.tasks[workstream].notes,
    completedAt: completed ? new Date().toISOString() : null,
  };

  await db.update(podLaunches).set({ sprints: sprintsArr, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function updateSprintKPIs(
  launchId: string,
  sprintIndex: number,
  kpis: Record<string, { target?: number; current?: number }>
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sprintsArr = (launch.sprints || []) as any[];
  if (!sprintsArr[sprintIndex]) throw new Error("Sprint not found");
  const currentKpis = sprintsArr[sprintIndex].kpis || {};
  for (const [key, val] of Object.entries(kpis)) {
    if (!currentKpis[key]) currentKpis[key] = { target: 0, current: 0 };
    if (val.target !== undefined) currentKpis[key].target = val.target;
    if (val.current !== undefined) currentKpis[key].current = val.current;
  }
  sprintsArr[sprintIndex].kpis = currentKpis;
  await db.update(podLaunches).set({ sprints: sprintsArr, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Phase Advancement ───────────────────────────────────────────

export async function advancePodLaunchPhase(launchId: string) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");

  const isV2 = launch.schemaVersion === 2;
  const phaseOrder = isV2
    ? ["pre_launch", "sprint_1", "sprint_2", "post_sprint", "operational"]
    : ["pre_work", "sprint_1", "sprint_2", "post_sprint", "operational"];

  const currentIdx = phaseOrder.indexOf(launch.currentPhase);
  if (currentIdx === -1 || currentIdx >= phaseOrder.length - 1) {
    throw new Error("Cannot advance from current phase");
  }

  const nextPhase = phaseOrder[currentIdx + 1];
  const now = new Date();

  const setData: Record<string, unknown> = {
    currentPhase: nextPhase,
    status: nextPhase,
    phaseStartedAt: now,
    updatedAt: now,
  };

  if (isV2) {
    // v2 phase transitions
    if (launch.currentPhase === "pre_launch") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pl = (launch.preLaunch || {}) as any;
      pl.completedAt = now.toISOString();
      setData.preLaunch = pl;
      setData.startedAt = now;
      // Start sprint 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sprintsArr = (launch.sprints || []) as any[];
      if (sprintsArr[0]) {
        sprintsArr[0].status = "active";
        sprintsArr[0].startDate = now.toISOString();
        setData.sprints = sprintsArr;
      }
    }
    if (launch.currentPhase === "sprint_1") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sprintsArr = (launch.sprints || []) as any[];
      if (sprintsArr[0]) {
        sprintsArr[0].status = "completed";
        sprintsArr[0].endDate = now.toISOString();
      }
      if (sprintsArr[1]) {
        sprintsArr[1].status = "active";
        sprintsArr[1].startDate = now.toISOString();
      }
      setData.sprints = sprintsArr;
    }
    if (launch.currentPhase === "sprint_2") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sprintsArr = (launch.sprints || []) as any[];
      if (sprintsArr[1]) {
        sprintsArr[1].status = "completed";
        sprintsArr[1].endDate = now.toISOString();
      }
      setData.sprints = sprintsArr;
    }
  } else {
    // v1 phase transitions (backward compat)
    if (launch.currentPhase === "pre_work") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pw = (launch.preWork || {}) as any;
      pw.completedAt = now.toISOString();
      setData.preWork = pw;
      setData.startedAt = now;
    }
    if (launch.currentPhase === "sprint_1") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s1 = (launch.sprint1 || {}) as any;
      s1.status = "completed"; s1.endDate = now.toISOString();
      setData.sprint1 = s1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s2 = (launch.sprint2 || {}) as any;
      s2.status = "active"; s2.startDate = now.toISOString();
      setData.sprint2 = s2;
    }
    if (launch.currentPhase === "sprint_2") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s2 = (launch.sprint2 || {}) as any;
      s2.status = "completed"; s2.endDate = now.toISOString();
      setData.sprint2 = s2;
    }
    if (nextPhase === "sprint_1") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s1 = (launch.sprint1 || {}) as any;
      s1.status = "active"; s1.startDate = now.toISOString();
      setData.sprint1 = s1;
    }
  }

  if (nextPhase === "operational") {
    setData.operationalAt = now;
  }

  await db.update(podLaunches).set(setData).where(eq(podLaunches.id, launchId));
  return { success: true, nextPhase };
}

// ─── Metrics ─────────────────────────────────────────────────────

export async function updatePodLaunchMetrics(
  launchId: string,
  metrics: Record<string, unknown>
) {
  await requireAdmin();
  await db
    .update(podLaunches)
    .set({ targetMetrics: metrics, updatedAt: new Date() })
    .where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function updateRoleKPIs(
  launchId: string,
  roleKpis: Record<string, unknown>
) {
  await requireAdmin();
  await db
    .update(podLaunches)
    .set({ roleKpis, updatedAt: new Date() })
    .where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Deal Timelines ──────────────────────────────────────────────

export async function upsertDealTimeline(
  launchId: string,
  deal: {
    id?: string;
    dealType: "co_build_fellow" | "pre_seed_vc" | "seed_vc";
    dealName: string;
  }
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deals = (launch.dealTimelines || []) as any[];

  const template = DEAL_STAGE_TEMPLATES[deal.dealType];
  const stages = template.stages.map((s) => ({
    name: s.name,
    durationLabel: s.durationLabel,
    status: "pending",
    startedAt: null,
    completedAt: null,
    notes: null,
  }));
  // Set first stage to active
  if (stages.length > 0) stages[0].status = "active";

  if (deal.id) {
    const idx = deals.findIndex((d: { id: string }) => d.id === deal.id);
    if (idx !== -1) {
      deals[idx].dealName = deal.dealName;
    }
  } else {
    deals.push({
      id: crypto.randomUUID(),
      dealType: deal.dealType,
      dealName: deal.dealName,
      currentStageIndex: 0,
      stages,
      createdAt: new Date().toISOString(),
    });
  }
  await db.update(podLaunches).set({ dealTimelines: deals, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function advanceDealStage(
  launchId: string,
  dealId: string,
  stageIndex: number,
  status: "active" | "completed" | "skipped",
  notes?: string
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deals = (launch.dealTimelines || []) as any[];
  const dealIdx = deals.findIndex((d: { id: string }) => d.id === dealId);
  if (dealIdx === -1) throw new Error("Deal not found");
  const deal = deals[dealIdx];
  if (!deal.stages[stageIndex]) throw new Error("Stage not found");

  const now = new Date().toISOString();
  deal.stages[stageIndex].status = status;
  if (notes) deal.stages[stageIndex].notes = notes;

  if (status === "completed" || status === "skipped") {
    deal.stages[stageIndex].completedAt = now;
    // Advance to next pending stage
    const nextIdx = deal.stages.findIndex(
      (s: { status: string }, i: number) => i > stageIndex && s.status === "pending"
    );
    if (nextIdx !== -1) {
      deal.stages[nextIdx].status = "active";
      deal.stages[nextIdx].startedAt = now;
      deal.currentStageIndex = nextIdx;
    }
  } else if (status === "active") {
    deal.stages[stageIndex].startedAt = now;
    deal.currentStageIndex = stageIndex;
  }

  await db.update(podLaunches).set({ dealTimelines: deals, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Operational Rhythm ──────────────────────────────────────────

export async function updateOperationalRhythm(
  launchId: string,
  rhythm: Record<string, unknown>
) {
  await requireAdmin();
  await db
    .update(podLaunches)
    .set({ operationalRhythm: rhythm, updatedAt: new Date() })
    .where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function logOperationalWeek(
  launchId: string,
  weekNote: string,
  mode: "live" | "learn" | "farm"
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rhythm = (launch.operationalRhythm || {}) as any;
  if (!rhythm.weekLog) rhythm.weekLog = [];
  const weekNumber = rhythm.weekLog.length + 1;
  rhythm.weekLog.push({
    weekNumber,
    startDate: new Date().toISOString(),
    notes: weekNote,
    mode,
  });
  await db.update(podLaunches).set({ operationalRhythm: rhythm, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Implementation Timeline ─────────────────────────────────────

export async function updateMilestone(
  launchId: string,
  milestoneId: string,
  status: "pending" | "active" | "completed"
) {
  await requireAdmin();
  const [launch] = await db.select().from(podLaunches).where(eq(podLaunches.id, launchId)).limit(1);
  if (!launch) throw new Error("Launch not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeline = (launch.implementationTimeline || {}) as any;
  if (!timeline.milestones) return { success: false };
  const ms = timeline.milestones.find((m: { id: string }) => m.id === milestoneId);
  if (!ms) throw new Error("Milestone not found");
  ms.status = status;
  if (status === "completed") ms.completedAt = new Date().toISOString();
  await db.update(podLaunches).set({ implementationTimeline: timeline, updatedAt: new Date() }).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// v1 compat — kept for existing sprint update calls
export async function updatePodLaunchSprint(
  launchId: string,
  sprintKey: "sprint1" | "sprint2",
  sprintData: Record<string, unknown>
) {
  await requireAdmin();
  const setData: Record<string, unknown> = { updatedAt: new Date() };
  setData[sprintKey] = sprintData;
  await db.update(podLaunches).set(setData).where(eq(podLaunches.id, launchId));
  return { success: true };
}

// ─── Delete Actions ────────────────────────────────────────────────────

export async function deletePodLaunch(launchId: string) {
  await requireAdmin();
  await db.delete(podLaunches).where(eq(podLaunches.id, launchId));
  return { success: true };
}

export async function deletePod(podId: string) {
  await requireAdmin();
  // Check if pod has fellows assigned
  const podFellows = await db
    .select({ id: fellows.id })
    .from(fellows)
    .where(eq(fellows.podId, podId))
    .limit(1);
  
  if (podFellows.length > 0) {
    return { error: "Cannot delete pod with assigned fellows. Reassign fellows first." };
  }
  
  await db.delete(pods).where(eq(pods.id, podId));
  return { success: true };
}

// ─── POD Journey ──────────────────────────────────────────────────────

import {
  POD_JOURNEY_STAGES,
  type JourneyCheckpoint,
  type JourneyStage,
  getJourneyProgress,
  getNextCheckpoint,
  getCurrentStage,
} from "@/data/pod-journey";

export async function getPodJourney(podId: string) {
  await requireAdmin();
  const [pod] = await db.select().from(pods).where(eq(pods.id, podId)).limit(1);
  if (!pod) return null;

  // Initialize journey checkpoints if not exists
  let checkpoints = (pod.journeyCheckpoints as JourneyCheckpoint[] | null) || [];
  
  // If empty, initialize from template
  if (checkpoints.length === 0) {
    checkpoints = POD_JOURNEY_STAGES.flatMap((stage) => stage.checkpoints.map((cp) => ({ ...cp })));
  }

  const progress = getJourneyProgress(checkpoints);
  const nextCheckpoint = getNextCheckpoint(checkpoints);
  const currentStage = getCurrentStage(checkpoints) || pod.currentJourneyStage as JourneyStage | null;

  return {
    podId: pod.id,
    checkpoints,
    progress,
    nextCheckpoint,
    currentStage,
  };
}

export async function updateJourneyCheckpoint(
  podId: string,
  checkpointId: string,
  completed: boolean
) {
  await requireAdmin();
  const [pod] = await db.select().from(pods).where(eq(pods.id, podId)).limit(1);
  if (!pod) throw new Error("Pod not found");

  let checkpoints = (pod.journeyCheckpoints as JourneyCheckpoint[] | null) || [];
  
  // Initialize if empty
  if (checkpoints.length === 0) {
    checkpoints = POD_JOURNEY_STAGES.flatMap((stage) => stage.checkpoints.map((cp) => ({ ...cp })));
  }

  // Update checkpoint
  const checkpoint = checkpoints.find((cp) => cp.id === checkpointId);
  if (!checkpoint) throw new Error("Checkpoint not found");

  checkpoint.completed = completed;
  checkpoint.completedAt = completed ? new Date().toISOString() : null;

  // Update current stage
  const currentStage = getCurrentStage(checkpoints);

  await db
    .update(pods)
    .set({
      journeyCheckpoints: checkpoints,
      currentJourneyStage: currentStage,
      updatedAt: new Date(),
    })
    .where(eq(pods.id, podId));

  return { success: true };
}
