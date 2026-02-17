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
  ventureName?: string;
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
export async function getActivityFeed(
  options: {
    limit?: number;
    offset?: number;
    type?: "review" | "approval" | "comment" | "stipend" | "all";
  } = {}
): Promise<{ activities: ActivityItem[]; total: number; hasMore: boolean }> {
  const fellow = await requireAuth();
  const limit = options.limit ?? 15;
  const offset = options.offset ?? 0;
  const filterType = options.type ?? "all";

  // Get fellow's ventures
  const fellowVentures = await db
    .select({ id: ventures.id, name: ventures.name })
    .from(ventures)
    .where(eq(ventures.fellowId, fellow.id));

  if (fellowVentures.length === 0) {
    return { activities: [], total: 0, hasMore: false };
  }

  const ventureIds = fellowVentures.map((v) => v.id);
  const ventureMap = new Map(fellowVentures.map((v) => [v.id, v.name]));
  const activities: ActivityItem[] = [];

  // 1. Asset completions (approval type)
  if (filterType === "all" || filterType === "approval") {
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
        .limit(limit * 2); // Get more to account for filtering

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
          ventureName: ventureMap.get(ventureId),
        });
      }
    }
  }

  // 2. Stipend milestones (stipend and approval types)
  if (filterType === "all" || filterType === "stipend" || filterType === "approval") {
    const milestones = await db
      .select()
      .from(stipendMilestones)
      .where(eq(stipendMilestones.fellowId, fellow.id))
      .orderBy(desc(stipendMilestones.updatedAt))
      .limit(limit * 2);

    for (const m of milestones) {
      if (m.paymentReleased && (filterType === "all" || filterType === "stipend")) {
        activities.push({
          id: `stipend-payment-${m.id}`,
          type: "stipend",
          title: `Payment released: ${m.title}`,
          message: `$${m.amount.toLocaleString()} stipend payment has been released`,
          timestamp: m.paymentReleased.toISOString(),
        });
      }
      if (m.milestoneMet && (filterType === "all" || filterType === "approval")) {
        activities.push({
          id: `stipend-met-${m.id}`,
          type: "approval",
          title: `Milestone met: ${m.title}`,
          message: m.description || `${m.title} has been verified by the studio team`,
          timestamp: m.milestoneMet.toISOString(),
        });
      }
    }
  }

  // 3. Recent file uploads (review type)
  if (filterType === "all" || filterType === "review") {
    for (const ventureId of ventureIds) {
      const recentUploads = await db
        .select()
        .from(uploads)
        .where(eq(uploads.ventureId, ventureId))
        .orderBy(desc(uploads.createdAt))
        .limit(limit * 2);

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
          ventureName: ventureMap.get(ventureId),
        });
      }
    }
  }

  // Sort all activities by timestamp (newest first)
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const total = activities.length;
  const paginatedActivities = activities.slice(offset, offset + limit);
  const hasMore = activities.length > offset + limit;

  return {
    activities: paginatedActivities,
    total,
    hasMore,
  };
}
