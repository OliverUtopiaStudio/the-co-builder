"use server";

import { db } from "@/db";
import { frameworkEdits, frameworkEditHistory, frameworkNotifications, fellows } from "@/db/schema";
import { eq, and, desc, isNull, sql, ne, or } from "drizzle-orm";
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
    // Get existing value before deletion for history
    const existing = await db
      .select({ id: frameworkEdits.id, value: frameworkEdits.value })
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

    if (existing.length > 0) {
      // Create history record for deletion
      await db.insert(frameworkEditHistory).values({
        frameworkEditId: existing[0].id,
        assetNumber,
        adminId: fellow.id,
        fieldType,
        fieldId: fid,
        fieldKey: fkey,
        oldValue: existing[0].value,
        newValue: null,
        action: "deleted",
      });

      await db
        .delete(frameworkEdits)
        .where(eq(frameworkEdits.id, existing[0].id));
    }
    return { deleted: true };
  }

  const existing = await db
    .select({ id: frameworkEdits.id, value: frameworkEdits.value })
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
    const oldValue = existing[0].value;
    // Create history record for update
    await db.insert(frameworkEditHistory).values({
      frameworkEditId: existing[0].id,
      assetNumber,
      adminId: fellow.id,
      fieldType,
      fieldId: fid,
      fieldKey: fkey,
      oldValue: oldValue,
      newValue: value,
      action: "updated",
    });

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

  // Create history record for creation
  await db.insert(frameworkEditHistory).values({
    frameworkEditId: inserted.id,
    assetNumber,
    adminId: fellow.id,
    fieldType,
    fieldId: fid,
    fieldKey: fkey,
    oldValue: null,
    newValue: value,
    action: "created",
  });

  return { id: inserted.id };
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

// ─── Version History ────────────────────────────────────────────────

export interface FrameworkEditHistoryRecord {
  id: string;
  frameworkEditId: string | null;
  assetNumber: number;
  adminId: string;
  adminName: string;
  fieldType: string;
  fieldId: string;
  fieldKey: string;
  oldValue: string | null;
  newValue: string | null;
  action: "created" | "updated" | "deleted";
  createdAt: Date;
}

export async function getFrameworkEditHistory(
  assetNumber: number
): Promise<FrameworkEditHistoryRecord[]> {
  await requireAdmin();

  const history = await db
    .select({
      id: frameworkEditHistory.id,
      frameworkEditId: frameworkEditHistory.frameworkEditId,
      assetNumber: frameworkEditHistory.assetNumber,
      adminId: frameworkEditHistory.adminId,
      fieldType: frameworkEditHistory.fieldType,
      fieldId: frameworkEditHistory.fieldId,
      fieldKey: frameworkEditHistory.fieldKey,
      oldValue: frameworkEditHistory.oldValue,
      newValue: frameworkEditHistory.newValue,
      action: frameworkEditHistory.action,
      createdAt: frameworkEditHistory.createdAt,
    })
    .from(frameworkEditHistory)
    .where(eq(frameworkEditHistory.assetNumber, assetNumber))
    .orderBy(desc(frameworkEditHistory.createdAt));

  // Get admin names
  const adminIds = [...new Set(history.map((h) => h.adminId))];
  const allFellows = await db
    .select({ id: fellows.id, fullName: fellows.fullName })
    .from(fellows);
  
  const adminMap = new Map(
    allFellows
      .filter((f) => adminIds.includes(f.id))
      .map((a) => [a.id, a.fullName])
  );

  return history.map((h) => ({
    ...h,
    adminName: adminMap.get(h.adminId) || "Unknown",
    action: h.action as "created" | "updated" | "deleted",
  }));
}

export async function getFrameworkEditHistoryForField(
  assetNumber: number,
  fieldType: string,
  fieldId: string,
  fieldKey: string
): Promise<FrameworkEditHistoryRecord[]> {
  await requireAdmin();

  const history = await db
    .select({
      id: frameworkEditHistory.id,
      frameworkEditId: frameworkEditHistory.frameworkEditId,
      assetNumber: frameworkEditHistory.assetNumber,
      adminId: frameworkEditHistory.adminId,
      fieldType: frameworkEditHistory.fieldType,
      fieldId: frameworkEditHistory.fieldId,
      fieldKey: frameworkEditHistory.fieldKey,
      oldValue: frameworkEditHistory.oldValue,
      newValue: frameworkEditHistory.newValue,
      action: frameworkEditHistory.action,
      createdAt: frameworkEditHistory.createdAt,
    })
    .from(frameworkEditHistory)
    .where(
      and(
        eq(frameworkEditHistory.assetNumber, assetNumber),
        eq(frameworkEditHistory.fieldType, fieldType),
        eq(frameworkEditHistory.fieldId, fieldId ?? ""),
        eq(frameworkEditHistory.fieldKey, fieldKey ?? "")
      )
    )
    .orderBy(desc(frameworkEditHistory.createdAt));

  const adminIds = [...new Set(history.map((h) => h.adminId))];
  const allFellows = await db
    .select({ id: fellows.id, fullName: fellows.fullName })
    .from(fellows);
  
  const adminMap = new Map(
    allFellows
      .filter((f) => adminIds.includes(f.id))
      .map((a) => [a.id, a.fullName])
  );

  return history.map((h) => ({
    ...h,
    adminName: adminMap.get(h.adminId) || "Unknown",
    action: h.action as "created" | "updated" | "deleted",
  }));
}

export async function rollbackFrameworkEdit(
  historyId: string
): Promise<{ success: boolean; error?: string }> {
  const fellow = await requireAdmin();

  // Get the history record
  const [historyRecord] = await db
    .select()
    .from(frameworkEditHistory)
    .where(eq(frameworkEditHistory.id, historyId))
    .limit(1);

  if (!historyRecord) {
    return { success: false, error: "History record not found" };
  }

  // Restore the old value (or delete if it was a creation)
  if (historyRecord.action === "created") {
    // If it was created, delete the current edit
    if (historyRecord.frameworkEditId) {
      await db
        .delete(frameworkEdits)
        .where(eq(frameworkEdits.id, historyRecord.frameworkEditId));
    }
  } else {
    // Restore the old value
    const valueToRestore = historyRecord.oldValue;
    if (valueToRestore === null) {
      // Delete if old value was null
      if (historyRecord.frameworkEditId) {
        await db
          .delete(frameworkEdits)
          .where(eq(frameworkEdits.id, historyRecord.frameworkEditId));
      }
    } else {
      // Update or create the edit with the old value
      const existing = await db
        .select({ id: frameworkEdits.id })
        .from(frameworkEdits)
        .where(
          and(
            eq(frameworkEdits.assetNumber, historyRecord.assetNumber),
            eq(frameworkEdits.fieldType, historyRecord.fieldType),
            eq(frameworkEdits.fieldId, historyRecord.fieldId),
            eq(frameworkEdits.fieldKey, historyRecord.fieldKey)
          )
        )
        .limit(1);

      const now = new Date();
      if (existing.length > 0) {
        await db
          .update(frameworkEdits)
          .set({ value: valueToRestore, adminId: fellow.id, updatedAt: now })
          .where(eq(frameworkEdits.id, existing[0].id));
      } else {
        await db.insert(frameworkEdits).values({
          assetNumber: historyRecord.assetNumber,
          adminId: fellow.id,
          fieldType: historyRecord.fieldType,
          fieldId: historyRecord.fieldId,
          fieldKey: historyRecord.fieldKey,
          value: valueToRestore,
          updatedAt: now,
        });
      }
    }
  }

  // Create a new history record for the rollback
  await db.insert(frameworkEditHistory).values({
    frameworkEditId: historyRecord.frameworkEditId,
    assetNumber: historyRecord.assetNumber,
    adminId: fellow.id,
    fieldType: historyRecord.fieldType,
    fieldId: historyRecord.fieldId,
    fieldKey: historyRecord.fieldKey,
    oldValue: historyRecord.newValue,
    newValue: historyRecord.oldValue,
    action: "updated",
  });

  return { success: true };
}

// ─── Notifications ──────────────────────────────────────────────────

export async function notifyFellowsOfFrameworkUpdate(
  assetNumber: number,
  message?: string
): Promise<{ success: boolean; notified: number; error?: string }> {
  await requireAdmin();

  const asset = stages
    .flatMap((s) => s.assets)
    .find((a) => a.number === assetNumber);

  const defaultMessage = `Framework asset "${asset?.title || `Asset #${assetNumber}`}" has been updated.`;
  const notificationMessage = message || defaultMessage;

  // Get all fellows (role is 'fellow' by default)
  // We want to notify all users who are not admins
  const allFellows = await db
    .select({ id: fellows.id })
    .from(fellows)
    .where(or(eq(fellows.role, "fellow"), isNull(fellows.role)));

  // Create notifications for all fellows
  if (allFellows.length > 0) {
    await db.insert(frameworkNotifications).values(
      allFellows.map((fellow) => ({
        fellowId: fellow.id,
        assetNumber,
        notificationType: "framework_updated",
        message: notificationMessage,
        read: false,
      }))
    );
  }

  return { success: true, notified: allFellows.length };
}

export interface FrameworkNotification {
  id: string;
  fellowId: string | null;
  assetNumber: number;
  notificationType: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt: Date | null;
}

export async function getFrameworkNotifications(
  fellowId?: string
): Promise<FrameworkNotification[]> {
  if (fellowId) {
    // Get notifications for a specific fellow
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

    if (!fellow || fellow.id !== fellowId) {
      throw new Error("Forbidden");
    }

    const notifications = await db
      .select()
      .from(frameworkNotifications)
      .where(eq(frameworkNotifications.fellowId, fellowId))
      .orderBy(desc(frameworkNotifications.createdAt));

    return notifications.map((n) => ({
      id: n.id,
      fellowId: n.fellowId ?? null,
      assetNumber: n.assetNumber,
      notificationType: n.notificationType,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      readAt: n.readAt ?? null,
    }));
  } else {
    // Admin can get all notifications
    await requireAdmin();
    const notifications = await db
      .select()
      .from(frameworkNotifications)
      .orderBy(desc(frameworkNotifications.createdAt));

    return notifications.map((n) => ({
      id: n.id,
      fellowId: n.fellowId ?? null,
      assetNumber: n.assetNumber,
      notificationType: n.notificationType,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      readAt: n.readAt ?? null,
    }));
  }
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
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

  if (!fellow) throw new Error("Forbidden");

  // Verify the notification belongs to this fellow
  const [notification] = await db
    .select()
    .from(frameworkNotifications)
    .where(eq(frameworkNotifications.id, notificationId))
    .limit(1);

  if (!notification) {
    return { success: false, error: "Notification not found" };
  }

  if (notification.fellowId !== fellow.id) {
    return { success: false, error: "Forbidden" };
  }

  await db
    .update(frameworkNotifications)
    .set({ read: true, readAt: new Date() })
    .where(eq(frameworkNotifications.id, notificationId));

  return { success: true };
}
