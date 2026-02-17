"use server";

import { db } from "@/db";
import { fellows, ventures, responses, assetCompletion, assetRequirements, pods, slackChannelVentures } from "@/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import type { ExperienceProfile, LifecycleStage, OnboardingStatus } from "@/lib/onboarding";
import { validateOnboardingUpdate } from "@/lib/onboarding";
import { extractSlackChannelId, buildSlackChannelUrl } from "@/lib/slack/utils";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow || fellow.role !== "admin") throw new Error("Forbidden");
  return fellow;
}

export async function getAllFellows() {
  await requireAdmin();
  return db
    .select()
    .from(fellows)
    .where(eq(fellows.role, "fellow"))
    .orderBy(fellows.createdAt);
}

export async function getFellowById(fellowId: string) {
  await requireAdmin();
  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.id, fellowId))
    .limit(1);
  return fellow || null;
}

export async function getAllVentures() {
  await requireAdmin();
  return db
    .select({
      venture: ventures,
      fellow: {
        id: fellows.id,
        fullName: fellows.fullName,
        email: fellows.email,
      },
    })
    .from(ventures)
    .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
    .orderBy(ventures.createdAt);
}

export async function getVenturesForFellow(fellowId: string) {
  await requireAdmin();
  return db
    .select()
    .from(ventures)
    .where(eq(ventures.fellowId, fellowId))
    .orderBy(ventures.createdAt);
}

export async function getVentureWithResponses(ventureId: string) {
  await requireAdmin();
  const [venture] = await db.select().from(ventures).where(eq(ventures.id, ventureId)).limit(1);
  if (!venture) return null;

  const ventureResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.ventureId, ventureId));

  const completions = await db
    .select()
    .from(assetCompletion)
    .where(eq(assetCompletion.ventureId, ventureId));

  const [fellow] = await db
    .select({ fullName: fellows.fullName, email: fellows.email })
    .from(fellows)
    .where(eq(fellows.id, venture.fellowId))
    .limit(1);

  return { venture, responses: ventureResponses, completions, fellow };
}

export async function getAdminStats() {
  await requireAdmin();

  const fellowCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(fellows)
    .where(eq(fellows.role, "fellow"));

  const ventureCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(ventures);

  const completedAssets = await db
    .select({ count: sql<number>`count(*)` })
    .from(assetCompletion)
    .where(eq(assetCompletion.isComplete, true));

  return {
    fellows: Number(fellowCount[0]?.count || 0),
    ventures: Number(ventureCount[0]?.count || 0),
    completedAssets: Number(completedAssets[0]?.count || 0),
  };
}

export async function getGlobalRequirements() {
  await requireAdmin();
  return db
    .select()
    .from(assetRequirements)
    .where(isNull(assetRequirements.ventureId));
}

export async function toggleAssetRequirement(assetNumber: number, isRequired: boolean) {
  await requireAdmin();

  const existing = await db
    .select()
    .from(assetRequirements)
    .where(
      and(
        isNull(assetRequirements.ventureId),
        eq(assetRequirements.assetNumber, assetNumber)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(assetRequirements)
      .set({ isRequired, updatedAt: new Date() })
      .where(eq(assetRequirements.id, existing[0].id));
  } else {
    await db.insert(assetRequirements).values({
      assetNumber,
      isRequired,
    });
  }

  return { success: true };
}

export async function getCompletionCountsForFellow(fellowId: string) {
  await requireAdmin();

  const ventureList = await db
    .select({ id: ventures.id })
    .from(ventures)
    .where(eq(ventures.fellowId, fellowId));

  if (ventureList.length === 0) return { total: 0, completed: 0 };

  const ventureIds = ventureList.map((v) => v.id);

  const completions = await db
    .select()
    .from(assetCompletion)
    .where(eq(assetCompletion.isComplete, true));

  const completed = completions.filter((c) => ventureIds.includes(c.ventureId)).length;

  return { total: ventureList.length * 27, completed };
}

// ─── Lifecycle Management (MVP) ─────────────────────────────────

export async function updateFellowExperienceProfile(
  fellowId: string,
  experienceProfile: ExperienceProfile
) {
  await requireAdmin();
  await db
    .update(fellows)
    .set({ experienceProfile, updatedAt: new Date() })
    .where(eq(fellows.id, fellowId));
  return { success: true };
}

export async function updateFellowLifecycleStage(
  fellowId: string,
  lifecycleStage: LifecycleStage
) {
  await requireAdmin();
  await db
    .update(fellows)
    .set({ lifecycleStage, updatedAt: new Date() })
    .where(eq(fellows.id, fellowId));
  return { success: true };
}

export async function updateFellowOnboardingAdmin(
  fellowId: string,
  step: "agreementSigned" | "kycVerified",
  value: string | null
) {
  const adminFellow = await requireAdmin();

  const normalized = value === "" ? null : (value?.trim() || null);
  const validation = validateOnboardingUpdate(step, normalized);
  if (!validation.valid) throw new Error(validation.error);

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.id, fellowId))
    .limit(1);

  if (!fellow) throw new Error("Fellow not found");

  const current = (fellow.onboardingStatus as OnboardingStatus | null) || {
    agreementSigned: null,
    kycVerified: null,
    toolstackComplete: false,
    computeBudgetAcknowledged: false,
    frameworkIntroComplete: false,
    browserSetupComplete: false,
    ventureCreated: false,
  };

  const markedAt = new Date().toISOString();
  const updated: OnboardingStatus & Record<string, unknown> = { ...current, [step]: normalized };

  if (step === "agreementSigned") {
    updated.agreementSignedBy = normalized ? adminFellow.id : null;
    updated.agreementSignedByName = normalized ? adminFellow.fullName : null;
    updated.agreementSignedMarkedAt = normalized ? markedAt : null;
  } else {
    updated.kycVerifiedBy = normalized ? adminFellow.id : null;
    updated.kycVerifiedByName = normalized ? adminFellow.fullName : null;
    updated.kycVerifiedMarkedAt = normalized ? markedAt : null;
  }

  await db
    .update(fellows)
    .set({ onboardingStatus: updated, updatedAt: new Date() })
    .where(eq(fellows.id, fellowId));

  return { success: true };
}

export async function updateFellowDetails(
  fellowId: string,
  data: { 
    domain?: string; 
    background?: string; 
    selectionRationale?: string; 
    role?: string;
    googleDriveUrl?: string | null;
    websiteUrl?: string | null;
    resourceLinks?: Record<string, unknown> | null;
  }
) {
  await requireAdmin();
  const validRoles = ["fellow", "admin", "studio", "stakeholder"];
  const updates: Record<string, unknown> = {
    ...(data.domain !== undefined && { domain: data.domain }),
    ...(data.background !== undefined && { background: data.background }),
    ...(data.selectionRationale !== undefined && { selectionRationale: data.selectionRationale }),
    ...(data.googleDriveUrl !== undefined && { googleDriveUrl: data.googleDriveUrl }),
    ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
    ...(data.resourceLinks !== undefined && { resourceLinks: data.resourceLinks }),
    updatedAt: new Date(),
  };
  if (data.role !== undefined && validRoles.includes(data.role)) {
    updates.role = data.role;
  }
  await db
    .update(fellows)
    .set(updates as Record<string, unknown>)
    .where(eq(fellows.id, fellowId));
  return { success: true };
}

// ─── Pod Assignment ──────────────────────────────────────────────

export async function getAllPods() {
  await requireAdmin();
  return db.select().from(pods).orderBy(pods.displayOrder);
}

export async function updateFellowPod(
  fellowId: string,
  podId: string | null
) {
  await requireAdmin();
  await db
    .update(fellows)
    .set({ podId, updatedAt: new Date() })
    .where(eq(fellows.id, fellowId));
  return { success: true };
}

// ─── Slack Channel Management ────────────────────────────────────────

export async function linkSlackChannelToVenture(
  ventureId: string,
  slackChannelUrl: string
) {
  await requireAdmin();

  const channelId = extractSlackChannelId(slackChannelUrl);
  if (!channelId) {
    throw new Error("Invalid Slack channel URL format");
  }

  // Check if channel is already linked to another venture
  const [existing] = await db
    .select()
    .from(slackChannelVentures)
    .where(eq(slackChannelVentures.slackChannelId, channelId))
    .limit(1);

  if (existing && existing.ventureId !== ventureId) {
    throw new Error("This Slack channel is already linked to another venture");
  }

  // Update or create mapping
  if (existing) {
    await db
      .update(slackChannelVentures)
      .set({
        ventureId,
        updatedAt: new Date(),
      })
      .where(eq(slackChannelVentures.id, existing.id));
  } else {
    await db.insert(slackChannelVentures).values({
      ventureId,
      slackChannelId: channelId,
      slackChannelName: null, // Will be fetched on verification
    });
  }

  return { success: true, channelId };
}

export async function unlinkSlackChannelFromVenture(ventureId: string) {
  await requireAdmin();

  await db
    .delete(slackChannelVentures)
    .where(eq(slackChannelVentures.ventureId, ventureId));

  return { success: true };
}

export async function getSlackChannelForVenture(ventureId: string) {
  await requireAdmin();

  const [mapping] = await db
    .select()
    .from(slackChannelVentures)
    .where(eq(slackChannelVentures.ventureId, ventureId))
    .limit(1);

  if (!mapping) {
    return null;
  }

  return {
    id: mapping.id,
    channelId: mapping.slackChannelId,
    channelName: mapping.slackChannelName,
    url: buildSlackChannelUrl(mapping.slackChannelId),
  };
}
