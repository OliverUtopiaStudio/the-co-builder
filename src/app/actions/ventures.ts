"use server";

import { db } from "@/db";
import { ventures, fellows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { OnboardingStatus } from "@/lib/onboarding";

async function getFellow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow) {
    // Auto-create fellow profile
    const [newFellow] = await db
      .insert(fellows)
      .values({
        authUserId: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "Fellow",
      })
      .returning();
    return newFellow;
  }

  return fellow;
}

export async function createVenture(formData: FormData) {
  const fellow = await getFellow();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const industry = formData.get("industry") as string;

  if (!name || name.length < 2) {
    return { error: "Venture name must be at least 2 characters" };
  }

  const [venture] = await db
    .insert(ventures)
    .values({
      fellowId: fellow.id,
      name,
      description: description || null,
      industry: industry || null,
    })
    .returning();

  // Auto-update onboarding status
  const currentStatus = (fellow.onboardingStatus as OnboardingStatus | null);
  if (currentStatus && !currentStatus.ventureCreated) {
    await db
      .update(fellows)
      .set({
        onboardingStatus: { ...currentStatus, ventureCreated: true },
        updatedAt: new Date(),
      })
      .where(eq(fellows.id, fellow.id));
  }

  redirect(`/venture/${venture.id}`);
}

export async function getVentures() {
  const fellow = await getFellow();
  return db
    .select()
    .from(ventures)
    .where(eq(ventures.fellowId, fellow.id))
    .orderBy(ventures.createdAt);
}

export async function getVenture(ventureId: string) {
  const fellow = await getFellow();
  const [venture] = await db
    .select()
    .from(ventures)
    .where(
      and(eq(ventures.id, ventureId), eq(ventures.fellowId, fellow.id))
    )
    .limit(1);
  return venture || null;
}
