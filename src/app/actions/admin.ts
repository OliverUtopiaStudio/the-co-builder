"use server";

import { db } from "@/db";
import { fellows, ventures, responses, assetCompletion, assetRequirements } from "@/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

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

  // Upsert global requirement
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
