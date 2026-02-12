import { db } from "@/db";
import { fellows, ventures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function verifyVentureAccess(ventureId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .select({ ventureId: ventures.id })
    .from(ventures)
    .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
    .where(
      and(eq(ventures.id, ventureId), eq(fellows.authUserId, user.id))
    )
    .limit(1);

  if (result.length === 0) throw new Error("Venture not found");
  return true;
}

/** Sanitize filename to prevent path traversal. Returns basename with safe chars only. */
export function sanitizeFileName(fileName: string): string {
  const basename = fileName.replace(/^.*[\\/]/, "");
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200) || "file";
}
