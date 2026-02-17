"use server";

import { db } from "@/db";
import {
  fellows,
  ventures,
  assetCompletion,
  stipendMilestones,
  uploads,
} from "@/db/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { stages } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: "review" | "approval" | "comment" | "stipend";
  title: string;
  message: string;
  timestamp: string;
  assetNumber?: number;
  ventureId?: string;
}

// ─── Auth ────────────────────────────────────────────────────────

async function requireAuth() {
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

  if (!fellow) throw new Error("No fellow record");
  return fellow;
}

// ─── Helpers ─────────────────────────────────────────────────────

function getAssetTitle(assetNumber: number): string {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) return asset.title;
    }
  }
  return `Asset #${assetNumber}`;
}

// ─── Activity Feed ───────────────────────────────────────────────

/**
 * Aggregates recent activity for a fellow from multiple sources:
 * - Asset completions
 * - Stipend milestone updates
 * - File uploads
 *
 * Returns a unified, chronologically sorted feed.
 */
export async function getActivityFeed(limit: number = 15): Promise<ActivityItem[]> {
  const fellow = await requireAuth();

  // Get fellow's ventures
  const fellowVentures = await db
    .select({ id: ventures.id, name: ventures.name })
    .from(ventures)
    .where(eq(ventures.fellowId, fellow.id));

  if (fellowVentures.length === 0) return [];

  const ventureIds = fellowVentures.map((v) => v.id);
  const activities: ActivityItem[] = [];

  // 1. Asset completions
  for (const ventureId of ventureIds) {
    const completions = await db
      .select()
      .from(assetCompletion)
      .where(
        and(
          eq(assetCompletion.ventureId, ventureId),
          eq(assetCompletion.isComplete, true),
          isNotNull(assetCompletion.completedAt)
        )
      )
      .orderBy(desc(assetCompletion.completedAt))
      .limit(limit);

    for (const c of completions) {
      const assetTitle = getAssetTitle(c.assetNumber);
      activities.push({
        id: `completion-${c.id}`,
        type: "approval",
        title: `Asset ${c.assetNumber} completed`,
        message: `${assetTitle} has been marked as complete${c.notes ? ` — ${c.notes}` : ""}`,
        timestamp: (c.completedAt ?? c.updatedAt).toISOString(),
        assetNumber: c.assetNumber,
        ventureId,
      });
    }
  }

  // 2. Stipend milestones
  const milestones = await db
    .select()
    .from(stipendMilestones)
    .where(eq(stipendMilestones.fellowId, fellow.id))
    .orderBy(desc(stipendMilestones.updatedAt))
    .limit(limit);

  for (const m of milestones) {
    if (m.paymentReleased) {
      activities.push({
        id: `stipend-payment-${m.id}`,
        type: "stipend",
        title: `Payment released: ${m.title}`,
        message: `$${m.amount.toLocaleString()} stipend payment has been released`,
        timestamp: m.paymentReleased.toISOString(),
      });
    }
    if (m.milestoneMet) {
      activities.push({
        id: `stipend-met-${m.id}`,
        type: "approval",
        title: `Milestone met: ${m.title}`,
        message: m.description || `${m.title} has been verified by the studio team`,
        timestamp: m.milestoneMet.toISOString(),
      });
    }
  }

  // 3. Recent file uploads
  for (const ventureId of ventureIds) {
    const recentUploads = await db
      .select()
      .from(uploads)
      .where(eq(uploads.ventureId, ventureId))
      .orderBy(desc(uploads.createdAt))
      .limit(5);

    for (const u of recentUploads) {
      const assetTitle = getAssetTitle(u.assetNumber);
      activities.push({
        id: `upload-${u.id}`,
        type: "review",
        title: `File uploaded for Asset ${u.assetNumber}`,
        message: `${u.fileName} uploaded to ${assetTitle}`,
        timestamp: u.createdAt.toISOString(),
        assetNumber: u.assetNumber,
        ventureId,
      });
    }
  }

  // Sort all activities by timestamp (newest first) and limit
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return activities.slice(0, limit);
}
