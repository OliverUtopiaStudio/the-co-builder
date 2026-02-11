"use server";

import { db } from "@/db";
import { fellows, ventures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ONBOARDING_STATUS, type OnboardingStatus } from "@/lib/onboarding";

async function getCurrentFellow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow) throw new Error("Fellow not found");
  return fellow;
}

export async function getOnboardingState() {
  const fellow = await getCurrentFellow();
  const status = (fellow.onboardingStatus as OnboardingStatus | null) || DEFAULT_ONBOARDING_STATUS;

  // Check if they have a venture
  const ventureList = await db
    .select({ id: ventures.id })
    .from(ventures)
    .where(eq(ventures.fellowId, fellow.id))
    .limit(1);

  // Auto-update ventureCreated if they have one
  if (ventureList.length > 0 && !status.ventureCreated) {
    status.ventureCreated = true;
    await db
      .update(fellows)
      .set({ onboardingStatus: status, updatedAt: new Date() })
      .where(eq(fellows.id, fellow.id));
  }

  return {
    fellow: {
      id: fellow.id,
      fullName: fellow.fullName,
      email: fellow.email,
      lifecycleStage: fellow.lifecycleStage,
      experienceProfile: fellow.experienceProfile,
    },
    status,
    hasVenture: ventureList.length > 0,
  };
}

export async function updateOnboardingStep(
  step: keyof OnboardingStatus,
  value: boolean
) {
  const fellow = await getCurrentFellow();
  const current = (fellow.onboardingStatus as OnboardingStatus | null) || DEFAULT_ONBOARDING_STATUS;

  const updated: OnboardingStatus = {
    ...current,
    [step]: value,
  };

  await db
    .update(fellows)
    .set({
      onboardingStatus: updated,
      updatedAt: new Date(),
    })
    .where(eq(fellows.id, fellow.id));

  return { success: true, status: updated };
}

export async function completeOnboarding() {
  const fellow = await getCurrentFellow();
  const status = (fellow.onboardingStatus as OnboardingStatus | null) || DEFAULT_ONBOARDING_STATUS;

  // Verify key steps are done (venture must exist)
  const ventureList = await db
    .select({ id: ventures.id })
    .from(ventures)
    .where(eq(ventures.fellowId, fellow.id))
    .limit(1);

  if (ventureList.length === 0) {
    return { error: "Please create a venture before completing onboarding" };
  }

  // Update status and move to building
  const finalStatus: OnboardingStatus = {
    ...status,
    ventureCreated: true,
  };

  await db
    .update(fellows)
    .set({
      lifecycleStage: "building",
      onboardingStatus: finalStatus,
      updatedAt: new Date(),
    })
    .where(eq(fellows.id, fellow.id));

  return { success: true };
}
