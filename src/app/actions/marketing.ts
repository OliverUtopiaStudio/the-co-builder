"use server";

import { db } from "@/db";
import { marketingContentPlan, ventures } from "@/db/schema";
import { eq, asc, desc, inArray } from "drizzle-orm";
import { cookies } from "next/headers";

async function requireStudio() {
  const cookieStore = await cookies();
  if (cookieStore.get("co_build_admin_auth")?.value !== "1") {
    throw new Error("Studio access required");
  }
}

export type MarketingContentItem = {
  id: string;
  weekStartDate: Date;
  title: string;
  body: string;
  platform: string | null;
  ventureIds: string[];
  position: number;
  bufferPostId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type VentureOption = { id: string; name: string };

/** Get all active ventures for tagging (studio only). */
export async function getActiveVenturesForStudio(): Promise<VentureOption[]> {
  await requireStudio();
  const rows = await db
    .select({ id: ventures.id, name: ventures.name })
    .from(ventures)
    .where(eq(ventures.isActive, true))
    .orderBy(asc(ventures.name));
  return rows;
}

/** Get full content plan grouped by week (studio only). */
export async function getMarketingContentPlan(): Promise<MarketingContentItem[]> {
  await requireStudio();
  const rows = await db
    .select()
    .from(marketingContentPlan)
    .orderBy(asc(marketingContentPlan.weekStartDate), asc(marketingContentPlan.position));
  return rows.map((r) => ({
    ...r,
    ventureIds: (r.ventureIds as string[]) ?? [],
  }));
}

export type CreateMarketingItemInput = {
  weekStartDate: string; // ISO date
  title: string;
  body: string;
  platform?: string | null;
  ventureIds?: string[];
};

export async function createMarketingContentItem(
  input: CreateMarketingItemInput
): Promise<{ error?: string; id?: string }> {
  await requireStudio();
  if (!input.title?.trim()) return { error: "Title is required" };
  if (!input.body?.trim()) return { error: "Body is required" };
  const weekDate = new Date(input.weekStartDate);
  if (Number.isNaN(weekDate.getTime())) return { error: "Invalid week date" };

  const [maxPos] = await db
    .select({ position: marketingContentPlan.position })
    .from(marketingContentPlan)
    .orderBy(desc(marketingContentPlan.position))
    .limit(1);

  const [row] = await db
    .insert(marketingContentPlan)
    .values({
      weekStartDate: weekDate,
      title: input.title.trim(),
      body: input.body.trim(),
      platform: input.platform?.trim() || null,
      ventureIds: input.ventureIds ?? [],
      position: (maxPos?.position ?? 0) + 1,
    })
    .returning({ id: marketingContentPlan.id });
  return { id: row.id };
}

export type UpdateMarketingItemInput = Partial<{
  weekStartDate: string;
  title: string;
  body: string;
  platform: string | null;
  ventureIds: string[];
  position: number;
}>;

export async function updateMarketingContentItem(
  id: string,
  input: UpdateMarketingItemInput
): Promise<{ error?: string }> {
  await requireStudio();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.body !== undefined) updates.body = input.body.trim();
  if (input.platform !== undefined) updates.platform = input.platform?.trim() || null;
  if (input.ventureIds !== undefined) updates.ventureIds = input.ventureIds;
  if (input.position !== undefined) updates.position = input.position;
  if (input.weekStartDate !== undefined) {
    const d = new Date(input.weekStartDate);
    if (!Number.isNaN(d.getTime())) updates.weekStartDate = d;
  }
  await db.update(marketingContentPlan).set(updates).where(eq(marketingContentPlan.id, id));
  return {};
}

export async function deleteMarketingContentItem(id: string): Promise<{ error?: string }> {
  await requireStudio();
  await db.delete(marketingContentPlan).where(eq(marketingContentPlan.id, id));
  return {};
}

/** Push selected content items to Buffer (studio only). Uses Buffer GraphQL API. */
export async function pushContentPlanToBuffer(itemIds: string[]): Promise<{
  error?: string;
  pushed?: number;
  results?: { id: string; success: boolean; bufferPostId?: string; error?: string }[];
}> {
  await requireStudio();
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const channelId = process.env.BUFFER_CHANNEL_ID;
  if (!token || !channelId) {
    return {
      error:
        "Buffer is not configured. Set BUFFER_ACCESS_TOKEN and BUFFER_CHANNEL_ID in environment.",
    };
  }

  if (!itemIds.length) {
    return { error: "Select at least one item to push." };
  }

  const items = await db
    .select()
    .from(marketingContentPlan)
    .where(inArray(marketingContentPlan.id, itemIds));
  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered = itemIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  if (ordered.length === 0) {
    return { error: "No valid items found." };
  }

  const results: { id: string; success: boolean; bufferPostId?: string; error?: string }[] = [];
  let pushed = 0;

  for (const item of ordered) {
    const text = item.body.trim();
    if (!text) {
      results.push({ id: item.id, success: false, error: "Empty body" });
      continue;
    }
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 1);
    dueAt.setHours(10, 0, 0, 0);

    const mutation = `
      mutation CreatePost {
        createPost(input: {
          text: ${JSON.stringify(text)},
          channelId: ${JSON.stringify(channelId)},
          schedulingType: automatic,
          mode: customSchedule,
          dueAt: "${dueAt.toISOString()}"
        }) {
          ... on PostActionSuccess {
            post { id }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    try {
      const res = await fetch("https://api.buffer.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: mutation }),
      });
      const data = (await res.json()) as {
        data?: { createPost?: { post?: { id: string }; message?: string } };
        errors?: Array<{ message: string }>;
      };
      const errMsg =
        data.errors?.[0]?.message ??
        (data.data?.createPost && "message" in data.data.createPost
          ? (data.data.createPost as { message?: string }).message
          : null);
      if (errMsg) {
        results.push({ id: item.id, success: false, error: errMsg });
        continue;
      }
      const postId = data.data?.createPost && "post" in data.data.createPost
        ? (data.data.createPost as { post: { id: string } }).post?.id
        : null;
      if (postId) {
        await db
          .update(marketingContentPlan)
          .set({ bufferPostId: postId, updatedAt: new Date() })
          .where(eq(marketingContentPlan.id, item.id));
        results.push({ id: item.id, success: true, bufferPostId: postId });
        pushed++;
      } else {
        results.push({ id: item.id, success: false, error: "No post ID returned" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      results.push({ id: item.id, success: false, error: msg });
    }
  }

  return { pushed, results };
}
