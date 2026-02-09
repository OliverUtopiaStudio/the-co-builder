"use server";

import { db } from "@/db";
import { fellows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getFellow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [fellow] = await db
    .select()
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow) {
    // Auto-create
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

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const fullName = formData.get("fullName") as string;
  const bio = formData.get("bio") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;

  if (!fullName || fullName.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  await db
    .update(fellows)
    .set({
      fullName,
      bio: bio || null,
      linkedinUrl: linkedinUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(fellows.authUserId, user.id));

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
