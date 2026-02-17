import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  fellows,
  ventures,
  assetCompletion,
  stipendMilestones,
  uploads,
} from "@/db/schema";
import { eq, and, desc, isNotNull, gte, lte, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { stages } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────

export interface StudioActivityItem {
  id: string;
  type: "review" | "approval" | "comment" | "stipend";
  title: string;
  message: string;
  timestamp: string;
  assetNumber?: number;
  ventureId?: string;
  ventureName?: string;
  fellowId?: string;
  fellowName?: string;
}

// ─── Auth ────────────────────────────────────────────────────────

async function requireStudio() {
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

// ─── Helpers ─────────────────────────────────────────────────────

function getAssetTitle(assetNumber: number): string {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) return asset.title;
    }
  }
  return `Asset #${assetNumber}`;
}

// ─── Activity Feed API ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    await requireStudio();

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const activityType = searchParams.get("type") as
      | "review"
      | "approval"
      | "comment"
      | "stipend"
      | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const activities: StudioActivityItem[] = [];

    // Get all ventures with fellow info
    const allVentures = await db
      .select({
        venture: ventures,
        fellow: {
          id: fellows.id,
          fullName: fellows.fullName,
        },
      })
      .from(ventures)
      .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
      .where(eq(ventures.isActive, true));

    const ventureMap = new Map(
      allVentures.map((v) => [v.venture.id, v])
    );

    // 1. Asset completions (approval type)
    if (!activityType || activityType === "approval") {
      const completions = await db
        .select({
          completion: assetCompletion,
          venture: ventures,
          fellow: {
            id: fellows.id,
            fullName: fellows.fullName,
          },
        })
        .from(assetCompletion)
        .innerJoin(ventures, eq(assetCompletion.ventureId, ventures.id))
        .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
        .where(
          and(
            eq(assetCompletion.isComplete, true),
            isNotNull(assetCompletion.completedAt),
            ...(startDate ? [gte(assetCompletion.completedAt, new Date(startDate))] : []),
            ...(endDate ? [lte(assetCompletion.completedAt, new Date(endDate))] : [])
          )
        )
        .orderBy(desc(assetCompletion.completedAt))
        .limit(limit * 2); // Get more to account for filtering

      for (const { completion, venture, fellow } of completions) {
        const assetTitle = getAssetTitle(completion.assetNumber);
        activities.push({
          id: `completion-${completion.id}`,
          type: "approval",
          title: `Asset ${completion.assetNumber} completed`,
          message: `${fellow.fullName} completed ${assetTitle}${completion.notes ? ` — ${completion.notes}` : ""}`,
          timestamp: (completion.completedAt ?? completion.updatedAt).toISOString(),
          assetNumber: completion.assetNumber,
          ventureId: venture.id,
          ventureName: venture.name,
          fellowId: fellow.id,
          fellowName: fellow.fullName,
        });
      }
    }

    // 2. Stipend milestones (stipend and approval types)
    if (!activityType || activityType === "stipend" || activityType === "approval") {
      const milestones = await db
        .select({
          milestone: stipendMilestones,
          fellow: {
            id: fellows.id,
            fullName: fellows.fullName,
          },
        })
        .from(stipendMilestones)
        .innerJoin(fellows, eq(stipendMilestones.fellowId, fellows.id))
        .where(
          and(
            isNotNull(stipendMilestones.fellowId),
            ...(startDate
              ? [
                  gte(
                    sql`COALESCE(${stipendMilestones.paymentReleased}, ${stipendMilestones.milestoneMet}, ${stipendMilestones.updatedAt})`,
                    new Date(startDate)
                  ),
                ]
              : []),
            ...(endDate
              ? [
                  lte(
                    sql`COALESCE(${stipendMilestones.paymentReleased}, ${stipendMilestones.milestoneMet}, ${stipendMilestones.updatedAt})`,
                    new Date(endDate)
                  ),
                ]
              : [])
          )
        )
        .orderBy(desc(stipendMilestones.updatedAt))
        .limit(limit * 2);

      for (const { milestone, fellow } of milestones) {
        if (milestone.paymentReleased && (!activityType || activityType === "stipend")) {
          activities.push({
            id: `stipend-payment-${milestone.id}`,
            type: "stipend",
            title: `Payment released: ${milestone.title}`,
            message: `${fellow.fullName} — $${milestone.amount.toLocaleString()} stipend payment has been released`,
            timestamp: milestone.paymentReleased.toISOString(),
            fellowId: fellow.id,
            fellowName: fellow.fullName,
          });
        }
        if (
          milestone.milestoneMet &&
          (!activityType || activityType === "approval")
        ) {
          activities.push({
            id: `stipend-met-${milestone.id}`,
            type: "approval",
            title: `Milestone met: ${milestone.title}`,
            message: `${fellow.fullName} — ${milestone.description || `${milestone.title} has been verified by the studio team`}`,
            timestamp: milestone.milestoneMet.toISOString(),
            fellowId: fellow.id,
            fellowName: fellow.fullName,
          });
        }
      }
    }

    // 3. File uploads (review type)
    if (!activityType || activityType === "review") {
      const recentUploads = await db
        .select({
          upload: uploads,
          venture: ventures,
          fellow: {
            id: fellows.id,
            fullName: fellows.fullName,
          },
        })
        .from(uploads)
        .innerJoin(ventures, eq(uploads.ventureId, ventures.id))
        .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
        .where(
          and(
            ...(startDate ? [gte(uploads.createdAt, new Date(startDate))] : []),
            ...(endDate ? [lte(uploads.createdAt, new Date(endDate))] : [])
          )
        )
        .orderBy(desc(uploads.createdAt))
        .limit(limit * 2);

      for (const { upload, venture, fellow } of recentUploads) {
        const assetTitle = getAssetTitle(upload.assetNumber);
        activities.push({
          id: `upload-${upload.id}`,
          type: "review",
          title: `File uploaded for Asset ${upload.assetNumber}`,
          message: `${fellow.fullName} uploaded ${upload.fileName} to ${assetTitle}`,
          timestamp: upload.createdAt.toISOString(),
          assetNumber: upload.assetNumber,
          ventureId: venture.id,
          ventureName: venture.name,
          fellowId: fellow.id,
          fellowName: fellow.fullName,
        });
      }
    }

    // Sort all activities by timestamp (newest first)
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);
    const hasMore = activities.length > offset + limit;

    return NextResponse.json({
      activities: paginatedActivities,
      pagination: {
        total: activities.length,
        limit,
        offset,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch activity feed",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : error instanceof Error && error.message === "Forbidden" ? 403 : 500 }
    );
  }
}
