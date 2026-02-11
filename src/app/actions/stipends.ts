"use server";

import { db } from "@/db";
import { fellows, stipendMilestones } from "@/db/schema";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// ─── Auth helpers ────────────────────────────────────────────────

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

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow) throw new Error("No fellow record");
  return fellow;
}

// ─── Global milestone definitions (admin) ────────────────────────

export async function getGlobalMilestones() {
  await requireAdmin();
  return db
    .select()
    .from(stipendMilestones)
    .where(isNull(stipendMilestones.fellowId))
    .orderBy(stipendMilestones.milestoneNumber);
}

export async function updateGlobalMilestone(
  milestoneId: string,
  data: { title?: string; description?: string; amount?: number }
) {
  await requireAdmin();
  await db
    .update(stipendMilestones)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amount !== undefined && { amount: data.amount }),
      updatedAt: new Date(),
    })
    .where(eq(stipendMilestones.id, milestoneId));
  return { success: true };
}

// ─── Per-fellow stipend records (admin) ──────────────────────────

export async function getFellowStipends(fellowId: string) {
  await requireAdmin();
  return db
    .select()
    .from(stipendMilestones)
    .where(eq(stipendMilestones.fellowId, fellowId))
    .orderBy(stipendMilestones.milestoneNumber);
}

export async function getAllFellowStipends() {
  await requireAdmin();
  // Get all per-fellow stipend records (not global definitions)
  return db
    .select({
      stipend: stipendMilestones,
      fellow: {
        id: fellows.id,
        fullName: fellows.fullName,
        email: fellows.email,
      },
    })
    .from(stipendMilestones)
    .innerJoin(fellows, eq(stipendMilestones.fellowId, fellows.id))
    .where(isNotNull(stipendMilestones.fellowId))
    .orderBy(fellows.fullName, stipendMilestones.milestoneNumber);
}

/**
 * Create stipend records for a fellow based on global milestone definitions.
 * Called when admin wants to set up a fellow's stipend tracking.
 */
export async function initFellowStipends(fellowId: string) {
  await requireAdmin();

  // Check if fellow already has stipend records
  const existing = await db
    .select()
    .from(stipendMilestones)
    .where(eq(stipendMilestones.fellowId, fellowId));

  if (existing.length > 0) {
    return { success: false, error: "Fellow already has stipend records" };
  }

  // Get global definitions
  const globals = await db
    .select()
    .from(stipendMilestones)
    .where(isNull(stipendMilestones.fellowId))
    .orderBy(stipendMilestones.milestoneNumber);

  // Create per-fellow records based on global definitions
  for (const g of globals) {
    await db.insert(stipendMilestones).values({
      fellowId,
      milestoneNumber: g.milestoneNumber,
      title: g.title,
      description: g.description,
      amount: g.amount,
    });
  }

  return { success: true };
}

/**
 * Mark a fellow's milestone as met (date recorded).
 */
export async function markMilestoneMet(stipendId: string) {
  await requireAdmin();
  await db
    .update(stipendMilestones)
    .set({ milestoneMet: new Date(), updatedAt: new Date() })
    .where(eq(stipendMilestones.id, stipendId));
  return { success: true };
}

/**
 * Clear a fellow's milestone-met date.
 */
export async function clearMilestoneMet(stipendId: string) {
  await requireAdmin();
  await db
    .update(stipendMilestones)
    .set({ milestoneMet: null, updatedAt: new Date() })
    .where(eq(stipendMilestones.id, stipendId));
  return { success: true };
}

/**
 * Mark a fellow's payment as released (date recorded).
 */
export async function markPaymentReleased(stipendId: string) {
  await requireAdmin();
  await db
    .update(stipendMilestones)
    .set({ paymentReleased: new Date(), updatedAt: new Date() })
    .where(eq(stipendMilestones.id, stipendId));
  return { success: true };
}

/**
 * Clear a fellow's payment-released date.
 */
export async function clearPaymentReleased(stipendId: string) {
  await requireAdmin();
  await db
    .update(stipendMilestones)
    .set({ paymentReleased: null, updatedAt: new Date() })
    .where(eq(stipendMilestones.id, stipendId));
  return { success: true };
}

// ─── Fellow-facing reads ─────────────────────────────────────────

export async function getMyStipendStatus() {
  const fellow = await requireAuth();

  // Get global definitions for context
  const globals = await db
    .select()
    .from(stipendMilestones)
    .where(isNull(stipendMilestones.fellowId))
    .orderBy(stipendMilestones.milestoneNumber);

  // Get this fellow's stipend records
  const myStipends = await db
    .select()
    .from(stipendMilestones)
    .where(eq(stipendMilestones.fellowId, fellow.id))
    .orderBy(stipendMilestones.milestoneNumber);

  return {
    milestoneDefinitions: globals,
    myMilestones: myStipends,
    totalBudget: 5000,
    computeBudget: 4000,
  };
}
