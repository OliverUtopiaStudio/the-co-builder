"use server";

import { db } from "@/db";
import { frameworkEdits, fellows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { stages } from "@/lib/data";

// ─── Types (match framework page) ─────────────────────────────────

export interface AssetEdits {
  title?: string;
  purpose?: string;
  coreQuestion?: string;
  checklist?: Record<string, string>;
  questions?: Record<string, { label?: string; description?: string }>;
}

export interface AllEdits {
  [assetNumber: number]: AssetEdits;
}

// ─── Auth ───────────────────────────────────────────────────────

async function requireAdmin() {
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

  if (!fellow || fellow.role !== "admin") throw new Error("Forbidden");
  return fellow;
}

// ─── Convert DB rows → AssetEdits / AllEdits ─────────────────────

function rowsToAssetEdits(
  rows: {
    assetNumber: number;
    fieldType: string;
    fieldId: string;
    fieldKey: string;
    value: string;
  }[]
): AssetEdits {
  const out: AssetEdits = {};
  for (const r of rows) {
    if (r.fieldType === "title") out.title = r.value;
    else if (r.fieldType === "purpose") out.purpose = r.value;
    else if (r.fieldType === "coreQuestion") out.coreQuestion = r.value;
    else if (r.fieldType === "checklist" && r.fieldId) {
      if (!out.checklist) out.checklist = {};
      out.checklist[r.fieldId] = r.value;
    } else if (r.fieldType === "question" && r.fieldId && r.fieldKey) {
      if (!out.questions) out.questions = {};
      if (!out.questions[r.fieldId]) out.questions[r.fieldId] = {};
      (out.questions[r.fieldId] as Record<string, string>)[r.fieldKey] = r.value;
    }
  }
  return out;
}

// ─── Get edits ───────────────────────────────────────────────────

export async function getFrameworkEdits(
  assetNumber: number
): Promise<AssetEdits> {
  await requireAdmin();

  const rows = await db
    .select({
      assetNumber: frameworkEdits.assetNumber,
      fieldType: frameworkEdits.fieldType,
      fieldId: frameworkEdits.fieldId,
      fieldKey: frameworkEdits.fieldKey,
      value: frameworkEdits.value,
    })
    .from(frameworkEdits)
    .where(eq(frameworkEdits.assetNumber, assetNumber));

  return rowsToAssetEdits(rows);
}

export async function getFrameworkEditsForAllAssets(): Promise<AllEdits> {
  await requireAdmin();

  const rows = await db.select().from(frameworkEdits);
  type Row = {
    assetNumber: number;
    fieldType: string;
    fieldId: string;
    fieldKey: string;
    value: string;
  };
  const byAsset: Record<number, Row[]> = {};
  for (const r of rows) {
    const n = r.assetNumber;
    if (!byAsset[n]) byAsset[n] = [];
    byAsset[n].push({
      assetNumber: r.assetNumber,
      fieldType: r.fieldType,
      fieldId: r.fieldId ?? "",
      fieldKey: r.fieldKey ?? "",
      value: r.value,
    });
  }
  const all: AllEdits = {};
  for (const [numStr, arr] of Object.entries(byAsset)) {
    const num = Number(numStr);
    all[num] = rowsToAssetEdits(arr);
  }
  return all;
}

// ─── Save one edit (upsert: insert or update by unique key) ────────

export async function saveFrameworkEdit(
  assetNumber: number,
  fieldType: "title" | "purpose" | "coreQuestion" | "checklist" | "question",
  fieldId: string,
  fieldKey: string,
  value: string
): Promise<{ id: string } | { deleted: true }> {
  const fellow = await requireAdmin();
  const fid = fieldId ?? "";
  const fkey = fieldKey ?? "";

  if (value.trim() === "") {
    await db
      .delete(frameworkEdits)
      .where(
        and(
          eq(frameworkEdits.assetNumber, assetNumber),
          eq(frameworkEdits.fieldType, fieldType),
          eq(frameworkEdits.fieldId, fid),
          eq(frameworkEdits.fieldKey, fkey)
        )
      );
    return { deleted: true };
  }

  const existing = await db
    .select({ id: frameworkEdits.id })
    .from(frameworkEdits)
    .where(
      and(
        eq(frameworkEdits.assetNumber, assetNumber),
        eq(frameworkEdits.fieldType, fieldType),
        eq(frameworkEdits.fieldId, fid),
        eq(frameworkEdits.fieldKey, fkey)
      )
    )
    .limit(1);

  const now = new Date();
  if (existing.length > 0) {
    await db
      .update(frameworkEdits)
      .set({ value, adminId: fellow.id, updatedAt: now })
      .where(eq(frameworkEdits.id, existing[0].id));
    return { id: existing[0].id };
  }

  const [inserted] = await db
    .insert(frameworkEdits)
    .values({
      assetNumber,
      adminId: fellow.id,
      fieldType,
      fieldId: fid,
      fieldKey: fkey,
      value,
      updatedAt: now,
    })
    .returning({ id: frameworkEdits.id });

  return { id: inserted!.id };
}

// ─── Delete single edit by id ─────────────────────────────────────

export async function deleteFrameworkEdit(editId: string): Promise<void> {
  await requireAdmin();
  await db.delete(frameworkEdits).where(eq(frameworkEdits.id, editId));
}

// ─── Delete all edits for an asset ───────────────────────────────

export async function deleteFrameworkEditsForAsset(
  assetNumber: number
): Promise<void> {
  await requireAdmin();
  await db
    .delete(frameworkEdits)
    .where(eq(frameworkEdits.assetNumber, assetNumber));
}

// ─── Export (same shape as current JSON export) ───────────────────

export async function exportFrameworkEdits(): Promise<{
  exportedAt: string;
  totalModified: number;
  assets: Record<string, { assetNumber: number; assetTitle: string; modifications: AssetEdits }>;
}> {
  await requireAdmin();

  const all = await getFrameworkEditsForAllAssets();
  const assets: Record<
    string,
    { assetNumber: number; assetTitle: string; modifications: AssetEdits }
  > = {};
  for (const [assetNumStr, edits] of Object.entries(all)) {
    const assetNumber = Number(assetNumStr);
    const hasAny =
      edits.title ||
      edits.purpose ||
      edits.coreQuestion ||
      (edits.checklist && Object.keys(edits.checklist).length > 0) ||
      (edits.questions && Object.keys(edits.questions).length > 0);
    if (!hasAny) continue;
    const asset = stages
      .flatMap((s) => s.assets)
      .find((a) => a.number === assetNumber);
    assets[assetNumStr] = {
      assetNumber,
      assetTitle: asset?.title ?? `Asset #${assetNumber}`,
      modifications: edits,
    };
  }
  return {
    exportedAt: new Date().toISOString(),
    totalModified: Object.keys(assets).length,
    assets,
  };
}

// ─── Import from JSON (e.g. from migration or backup) ──────────────

export async function importFrameworkEdits(data: {
  assets?: Record<
    string,
    { assetNumber: number; modifications: AssetEdits }
  >;
}): Promise<{ imported: number; errors: string[] }> {
  const fellow = await requireAdmin();
  const errors: string[] = [];
  let imported = 0;

  const assets = data.assets ?? {};
  for (const [assetNumStr, item] of Object.entries(assets)) {
    const assetNumber = item.assetNumber ?? Number(assetNumStr);
    const mod = item.modifications ?? (item as unknown as AssetEdits);
    try {
      if (mod.title != null && mod.title.trim() !== "")
        await saveFrameworkEdit(assetNumber, "title", "", "", mod.title);
      if (mod.purpose != null && mod.purpose.trim() !== "")
        await saveFrameworkEdit(assetNumber, "purpose", "", "", mod.purpose);
      if (mod.coreQuestion != null && mod.coreQuestion.trim() !== "")
        await saveFrameworkEdit(
          assetNumber,
          "coreQuestion",
          "",
          "",
          mod.coreQuestion
        );
      if (mod.checklist) {
        for (const [id, text] of Object.entries(mod.checklist))
          if (text?.trim())
            await saveFrameworkEdit(
              assetNumber,
              "checklist",
              id,
              "",
              text
            );
      }
      if (mod.questions) {
        for (const [qId, q] of Object.entries(mod.questions)) {
          if (q?.label?.trim())
            await saveFrameworkEdit(
              assetNumber,
              "question",
              qId,
              "label",
              q.label
            );
          if (q?.description?.trim())
            await saveFrameworkEdit(
              assetNumber,
              "question",
              qId,
              "description",
              q.description
            );
        }
      }
      imported += 1;
    } catch (e) {
      errors.push(
        `Asset ${assetNumber}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return { imported, errors };
}
