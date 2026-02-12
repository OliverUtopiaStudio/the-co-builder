"use server";

import { db } from "@/db";
import { responses, assetCompletion, ventures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyVentureAccess } from "@/lib/venture-access";

export async function saveResponse(
  ventureId: string,
  assetNumber: number,
  questionId: string,
  value: unknown
) {
  await verifyVentureAccess(ventureId);

  // Check if response exists
  const existing = await db
    .select()
    .from(responses)
    .where(
      and(
        eq(responses.ventureId, ventureId),
        eq(responses.assetNumber, assetNumber),
        eq(responses.questionId, questionId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(responses)
      .set({
        value: JSON.parse(JSON.stringify(value)),
        updatedAt: new Date(),
      })
      .where(eq(responses.id, existing[0].id));
  } else {
    await db.insert(responses).values({
      ventureId,
      assetNumber,
      questionId,
      value: JSON.parse(JSON.stringify(value)),
    });
  }

  return { success: true };
}

export async function getResponses(ventureId: string, assetNumber: number) {
  await verifyVentureAccess(ventureId);

  const result = await db
    .select()
    .from(responses)
    .where(
      and(
        eq(responses.ventureId, ventureId),
        eq(responses.assetNumber, assetNumber)
      )
    );

  // Convert to a map of questionId -> value
  const responseMap: Record<string, unknown> = {};
  for (const row of result) {
    responseMap[row.questionId] = row.value;
  }
  return responseMap;
}

export async function getAllResponses(ventureId: string) {
  await verifyVentureAccess(ventureId);

  const result = await db
    .select()
    .from(responses)
    .where(eq(responses.ventureId, ventureId));

  return result;
}

export async function markAssetComplete(
  ventureId: string,
  assetNumber: number,
  complete: boolean
) {
  await verifyVentureAccess(ventureId);

  const existing = await db
    .select()
    .from(assetCompletion)
    .where(
      and(
        eq(assetCompletion.ventureId, ventureId),
        eq(assetCompletion.assetNumber, assetNumber)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(assetCompletion)
      .set({
        isComplete: complete,
        completedAt: complete ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(assetCompletion.id, existing[0].id));
  } else {
    await db.insert(assetCompletion).values({
      ventureId,
      assetNumber,
      isComplete: complete,
      completedAt: complete ? new Date() : null,
    });
  }

  return { success: true };
}

export async function getAssetCompletions(ventureId: string) {
  await verifyVentureAccess(ventureId);

  const result = await db
    .select()
    .from(assetCompletion)
    .where(eq(assetCompletion.ventureId, ventureId));

  const completionMap: Record<number, boolean> = {};
  for (const row of result) {
    completionMap[row.assetNumber] = row.isComplete;
  }
  return completionMap;
}
