"use server";

import { db } from "@/db";
import { reportConfig, fellows, pods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

async function requireStudioOrAdmin() {
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

export async function getReportConfig() {
  await requireStudioOrAdmin();
  return db.select().from(reportConfig).orderBy(reportConfig.displayOrder);
}

export async function updateReportSection(
  sectionKey: string,
  data: {
    visible?: boolean;
    narrativeTitle?: string | null;
    narrativeText?: string | null;
    highlightedIds?: string[];
    highlightMode?: string;
    displayOrder?: number;
  }
) {
  const admin = await requireStudioOrAdmin();
  await db
    .update(reportConfig)
    .set({
      ...data,
      updatedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(reportConfig.sectionKey, sectionKey));
  return { success: true };
}

export async function getReportFellowOptions() {
  await requireStudioOrAdmin();
  return db
    .select({ id: fellows.id, fullName: fellows.fullName })
    .from(fellows)
    .where(eq(fellows.role, "fellow"))
    .orderBy(fellows.fullName);
}

export async function getReportPodOptions() {
  await requireStudioOrAdmin();
  return db
    .select({ id: pods.id, name: pods.name })
    .from(pods)
    .orderBy(pods.displayOrder);
}
