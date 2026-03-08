"use server";

import { db } from "@/db";
import {
  fellows,
  ventures,
  milestones,
  todoItems,
} from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// ─── Types ──────────────────────────────────────────────────────

export type CategorizedLink = { title: string; url: string };
export type CategorizedLinks = {
  product: CategorizedLink[];
  gtm: CategorizedLink[];
  investment: CategorizedLink[];
};

// ─── Auth helpers ───────────────────────────────────────────────

/** Check if the current user has the admin cookie (studio/admin access). */
async function checkIsAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("co_build_admin_auth")?.value === "1";
}

/** Require admin access — throws if not admin. */
async function requireAdmin() {
  if (!(await checkIsAdmin())) {
    throw new Error("Admin access required");
  }
}

// ─── Fellow CRUD ─────────────────────────────────────────────────

export type CreateFellowInput = {
  fullName: string;
  email?: string;
  bio?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  domain?: string;
  experienceProfile?: string;
};

export async function createFellow(data: CreateFellowInput) {
  await requireAdmin();

  const id = randomUUID();
  const [fellow] = await db
    .insert(fellows)
    .values({
      id,
      authUserId: id, // cookie-based identity: use fellow id as auth ref
      fullName: data.fullName,
      email: data.email ?? "",
      bio: data.bio ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      websiteUrl: data.websiteUrl ?? null,
      domain: data.domain ?? null,
      experienceProfile: data.experienceProfile ?? null,
    })
    .returning();

  return fellow;
}

export type UpdateFellowInput = Partial<{
  fullName: string;
  email: string;
  bio: string;
  linkedinUrl: string;
  websiteUrl: string;
  domain: string;
  experienceProfile: string;
}>;

export async function updateFellow(fellowId: string, data: UpdateFellowInput) {
  await requireAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
  if (data.domain !== undefined) updateData.domain = data.domain;
  if (data.experienceProfile !== undefined)
    updateData.experienceProfile = data.experienceProfile;

  const [updated] = await db
    .update(fellows)
    .set(updateData)
    .where(eq(fellows.id, fellowId))
    .returning();

  return updated;
}

export async function deleteFellow(fellowId: string) {
  await requireAdmin();
  await db.delete(fellows).where(eq(fellows.id, fellowId));
}

// ─── Venture CRUD ─────────────────────────────────────────────────

export type CreateVentureInput = {
  name: string;
  description?: string;
  industry?: string;
  currentStage?: string;
};

export async function createVenture(fellowId: string, data: CreateVentureInput) {
  await requireAdmin();

  const [venture] = await db
    .insert(ventures)
    .values({
      fellowId,
      name: data.name,
      description: data.description ?? null,
      industry: data.industry ?? null,
      currentStage: data.currentStage ?? "00",
      isActive: true,
    })
    .returning();

  return venture;
}

export type UpdateVentureInput = Partial<{
  name: string;
  description: string;
  industry: string;
  currentStage: string;
  isActive: boolean;
}>;

export async function updateVenture(ventureId: string, data: UpdateVentureInput) {
  await requireAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.currentStage !== undefined) updateData.currentStage = data.currentStage;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const [updated] = await db
    .update(ventures)
    .set(updateData)
    .where(eq(ventures.id, ventureId))
    .returning();

  return updated;
}

// ─── Fellows List ───────────────────────────────────────────────

export async function getFellowsList() {
  const isAdmin = await checkIsAdmin();

  // Return all fellows with their active venture
  const allFellows = await db
    .select()
    .from(fellows)
    .orderBy(asc(fellows.fullName));

  const allVentures = await db
    .select()
    .from(ventures)
    .where(eq(ventures.isActive, true));

  const ventureByFellow = new Map(
    allVentures.map((v) => [v.fellowId, v])
  );

  const { id: currentFellowId } = await getCurrentFellowId();

  return {
    fellows: allFellows.map((f) => ({
      ...f,
      venture: ventureByFellow.get(f.id) || null,
    })),
    currentFellowId,
    isStudio: isAdmin,
  };
}

// ─── Fellow Detail ──────────────────────────────────────────────

export async function getFellowDetail(fellowId: string) {
  const isAdmin = await checkIsAdmin();
  const cookieStore = await cookies();
  const currentFellowId = cookieStore.get("co_build_fellow_id")?.value ?? null;

  // Fellows may only view their own detail page; studio may view any
  if (!isAdmin && currentFellowId !== fellowId) {
    return null;
  }

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.id, fellowId))
    .limit(1);

  if (!fellow) return null;

  const ventureList = await db
    .select()
    .from(ventures)
    .where(
      and(eq(ventures.fellowId, fellowId), eq(ventures.isActive, true))
    )
    .limit(1);

  const venture = ventureList[0] || null;

  return {
    fellow,
    venture,
    isStudio: isAdmin,
    isOwnPage: currentFellowId === fellowId,
  };
}

// ─── Current fellow ID (for redirect) ───────────────────────────

export async function getCurrentFellowId(): Promise<{
  id: string | null;
  isStudio: boolean;
}> {
  const cookieStore = await cookies();
  const fellowId = cookieStore.get("co_build_fellow_id")?.value ?? null;
  const isAdmin = await checkIsAdmin();
  return {
    id: fellowId && /^[0-9a-f-]{36}$/i.test(fellowId) ? fellowId : null,
    isStudio: isAdmin,
  };
}

/** Returns full fellow record + active venture for the logged-in fellow (from cookie). */
export async function getCurrentFellow() {
  const { id: fellowId } = await getCurrentFellowId();
  if (!fellowId) return null;
  return getFellowDetail(fellowId);
}

// ─── Milestones ─────────────────────────────────────────────────

export async function getMilestones(ventureId: string) {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.ventureId, ventureId))
    .orderBy(asc(milestones.position));
}

export async function createMilestone(
  ventureId: string,
  data: {
    title: string;
    description?: string;
    targetDate?: string;
  }
) {
  await requireAdmin();

  // Get next position
  const existing = await db
    .select({ position: milestones.position })
    .from(milestones)
    .where(eq(milestones.ventureId, ventureId))
    .orderBy(desc(milestones.position))
    .limit(1);

  const nextPosition = existing.length > 0 ? existing[0].position + 1 : 0;

  const [milestone] = await db
    .insert(milestones)
    .values({
      ventureId,
      title: data.title,
      description: data.description || null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      position: nextPosition,
      createdBy: null,
    })
    .returning();

  return milestone;
}

export async function updateMilestone(
  milestoneId: string,
  data: {
    title?: string;
    description?: string;
    targetDate?: string | null;
    status?: string;
  }
) {
  const isAdmin = await checkIsAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (isAdmin) {
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.targetDate !== undefined)
      updateData.targetDate = data.targetDate
        ? new Date(data.targetDate)
        : null;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "completed") {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
  }

  const [updated] = await db
    .update(milestones)
    .set(updateData)
    .where(eq(milestones.id, milestoneId))
    .returning();

  return updated;
}

export async function deleteMilestone(milestoneId: string) {
  await requireAdmin();
  await db.delete(milestones).where(eq(milestones.id, milestoneId));
}

// ─── To-Do Items ────────────────────────────────────────────────

export async function getTodoItems(ventureId: string) {
  return db
    .select()
    .from(todoItems)
    .where(eq(todoItems.ventureId, ventureId))
    .orderBy(asc(todoItems.position));
}

export async function createTodoItem(
  ventureId: string,
  data: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    assetNumber?: number;
    externalUrl?: string;
    externalProvider?: string;
    milestoneId?: string;
    dueDate?: string;
  }
) {
  await requireAdmin();

  const existing = await db
    .select({ position: todoItems.position })
    .from(todoItems)
    .where(eq(todoItems.ventureId, ventureId))
    .orderBy(desc(todoItems.position))
    .limit(1);

  const nextPosition = existing.length > 0 ? existing[0].position + 1 : 0;

  const [item] = await db
    .insert(todoItems)
    .values({
      ventureId,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || "medium",
      assetNumber: data.assetNumber || null,
      externalUrl: data.externalUrl || null,
      externalProvider: data.externalProvider || null,
      milestoneId: data.milestoneId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdBy: null,
      position: nextPosition,
    })
    .returning();

  return item;
}

export async function updateTodoItem(
  todoItemId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    assetNumber?: number | null;
    externalUrl?: string | null;
    externalProvider?: string | null;
    milestoneId?: string | null;
    dueDate?: string | null;
  }
) {
  const isAdmin = await checkIsAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  // Anyone can toggle status
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "completed") {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
  }

  // Admin can update all fields
  if (isAdmin) {
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.assetNumber !== undefined) updateData.assetNumber = data.assetNumber;
    if (data.externalUrl !== undefined) updateData.externalUrl = data.externalUrl;
    if (data.externalProvider !== undefined) updateData.externalProvider = data.externalProvider;
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId;
    if (data.dueDate !== undefined)
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  const [updated] = await db
    .update(todoItems)
    .set(updateData)
    .where(eq(todoItems.id, todoItemId))
    .returning();

  return updated;
}

export async function deleteTodoItem(todoItemId: string) {
  await requireAdmin();
  await db.delete(todoItems).where(eq(todoItems.id, todoItemId));
}

// ─── Categorized Links ──────────────────────────────────────────

export async function getCategorizedLinks(ventureId: string) {
  const [venture] = await db
    .select({ categorizedLinks: ventures.categorizedLinks })
    .from(ventures)
    .where(eq(ventures.id, ventureId))
    .limit(1);

  return (venture?.categorizedLinks as CategorizedLinks) || {
    product: [],
    gtm: [],
    investment: [],
  };
}

export async function updateCategorizedLinks(
  ventureId: string,
  links: CategorizedLinks
) {
  await requireAdmin();

  const [updated] = await db
    .update(ventures)
    .set({ categorizedLinks: links, updatedAt: new Date() })
    .where(eq(ventures.id, ventureId))
    .returning();

  return updated;
}
