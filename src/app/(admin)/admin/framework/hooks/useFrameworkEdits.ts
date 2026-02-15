"use client";

import { useState, useCallback, useRef } from "react";
import {
  getFrameworkEditsForAllAssets,
  saveFrameworkEdit,
  deleteFrameworkEditsForAsset,
  exportFrameworkEdits,
  importFrameworkEdits,
  type AllEdits,
  type AssetEdits,
} from "@/app/actions/framework";
import type { Conflict } from "../components/ConflictResolutionDialog";

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Conflict Detection ──────────────────────────────────────────

/**
 * Compare the current local state against newly-fetched server data.
 * A conflict exists when a field has a local value AND the server has
 * a *different* value for that same field (meaning another admin changed it).
 *
 * We track which fields the current admin has actively edited via
 * dirtyFields so we only flag conflicts for fields the user touched.
 */
function detectConflicts(
  localEdits: AllEdits,
  serverEdits: AllEdits,
  dirtyFields: Set<string>
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const key of dirtyFields) {
    const [assetStr, fieldType, fieldId, fieldKey] = key.split("|");
    const assetNumber = Number(assetStr);
    const localAsset = localEdits[assetNumber];
    const serverAsset = serverEdits[assetNumber];

    const localValue = getFieldValue(localAsset, fieldType, fieldId, fieldKey);
    const serverValue = getFieldValue(serverAsset, fieldType, fieldId, fieldKey);

    // Conflict: both exist and differ, OR one was deleted by the other admin
    if (localValue !== serverValue) {
      conflicts.push({
        assetNumber,
        fieldType: fieldType as Conflict["fieldType"],
        fieldId: fieldId || "",
        fieldKey: fieldKey || "",
        localValue: localValue ?? "",
        serverValue: serverValue ?? "",
      });
    }
  }

  return conflicts;
}

function getFieldValue(
  assetEdits: AssetEdits | undefined,
  fieldType: string,
  fieldId: string,
  fieldKey: string
): string | undefined {
  if (!assetEdits) return undefined;

  if (fieldType === "title") return assetEdits.title;
  if (fieldType === "purpose") return assetEdits.purpose;
  if (fieldType === "coreQuestion") return assetEdits.coreQuestion;
  if (fieldType === "checklist") return assetEdits.checklist?.[fieldId];
  if (fieldType === "question") {
    const q = assetEdits.questions?.[fieldId];
    if (!q) return undefined;
    return (q as Record<string, string | undefined>)[fieldKey];
  }
  return undefined;
}

function makeDirtyKey(
  assetNumber: number,
  fieldType: string,
  fieldId: string,
  fieldKey: string
): string {
  return `${assetNumber}|${fieldType}|${fieldId}|${fieldKey}`;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useFrameworkEdits() {
  const [allEdits, setAllEdits] = useState<AllEdits>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Track which fields THIS admin has edited since last load
  const dirtyFieldsRef = useRef<Set<string>>(new Set());
  // Store pending server data while conflicts are being resolved
  const pendingServerDataRef = useRef<AllEdits | null>(null);
  // Track whether this is the initial load (no conflict check needed)
  const hasLoadedRef = useRef(false);

  const loadEdits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const serverData = await getFrameworkEditsForAllAssets();

      // On initial load or when no dirty fields, just accept server data
      if (!hasLoadedRef.current || dirtyFieldsRef.current.size === 0) {
        setAllEdits(serverData);
        hasLoadedRef.current = true;
        return;
      }

      // Check for conflicts with locally-edited fields
      const detected = detectConflicts(
        // Use current state via functional update pattern
        // We need the current allEdits, which we already have in scope via closure
        allEdits,
        serverData,
        dirtyFieldsRef.current
      );

      if (detected.length === 0) {
        // No conflicts — safe to accept all server data
        setAllEdits(serverData);
        dirtyFieldsRef.current.clear();
      } else {
        // Conflicts detected — store server data and show dialog
        pendingServerDataRef.current = serverData;
        setConflicts(detected);
        // Don't update allEdits yet — wait for resolution
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load edits");
    } finally {
      setLoading(false);
    }
  }, [allEdits]);

  // ─── Conflict Resolution ─────────────────────────────────────

  const resolveConflict = useCallback(
    async (conflict: Conflict, choice: "mine" | "theirs") => {
      if (choice === "mine") {
        // Save local value to server (overwrite their change)
        try {
          await saveFrameworkEdit(
            conflict.assetNumber,
            conflict.fieldType,
            conflict.fieldId,
            conflict.fieldKey,
            conflict.localValue
          );
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to save resolution");
        }
      } else {
        // Accept server value — update local state for this field
        const serverData = pendingServerDataRef.current;
        if (serverData) {
          setAllEdits((prev) => {
            const serverAsset = serverData[conflict.assetNumber] ?? {};
            const localAsset = prev[conflict.assetNumber] ?? {};
            const merged = mergeField(localAsset, serverAsset, conflict);
            return { ...prev, [conflict.assetNumber]: merged };
          });
        }
      }

      // Remove the dirty key for this resolved conflict
      const key = makeDirtyKey(
        conflict.assetNumber,
        conflict.fieldType,
        conflict.fieldId,
        conflict.fieldKey
      );
      dirtyFieldsRef.current.delete(key);

      // Remove this conflict from the list
      setConflicts((prev) => {
        const remaining = prev.filter(
          (c) =>
            !(
              c.assetNumber === conflict.assetNumber &&
              c.fieldType === conflict.fieldType &&
              c.fieldId === conflict.fieldId &&
              c.fieldKey === conflict.fieldKey
            )
        );

        // If all conflicts resolved, apply remaining non-conflicting server updates
        if (remaining.length === 0 && pendingServerDataRef.current) {
          applyNonConflictingUpdates();
        }

        return remaining;
      });
    },
    []
  );

  const resolveAllConflicts = useCallback(
    async (choice: "mine" | "theirs") => {
      if (choice === "mine") {
        // Save all local values to server
        for (const conflict of conflicts) {
          try {
            await saveFrameworkEdit(
              conflict.assetNumber,
              conflict.fieldType,
              conflict.fieldId,
              conflict.fieldKey,
              conflict.localValue
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save resolution");
          }
        }
      } else {
        // Accept all server values
        const serverData = pendingServerDataRef.current;
        if (serverData) {
          setAllEdits((prev) => {
            let merged = { ...prev };
            for (const conflict of conflicts) {
              const serverAsset = serverData[conflict.assetNumber] ?? {};
              const localAsset = merged[conflict.assetNumber] ?? {};
              merged = {
                ...merged,
                [conflict.assetNumber]: mergeField(localAsset, serverAsset, conflict),
              };
            }
            return merged;
          });
        }
      }

      // Clear all dirty keys for resolved conflicts
      for (const conflict of conflicts) {
        const key = makeDirtyKey(
          conflict.assetNumber,
          conflict.fieldType,
          conflict.fieldId,
          conflict.fieldKey
        );
        dirtyFieldsRef.current.delete(key);
      }

      setConflicts([]);
      applyNonConflictingUpdates();
    },
    [conflicts]
  );

  /**
   * After all conflicts are resolved, apply the pending server data
   * for non-conflicting fields so we stay in sync.
   */
  function applyNonConflictingUpdates() {
    const serverData = pendingServerDataRef.current;
    if (!serverData) return;

    setAllEdits((prev) => {
      const merged = { ...prev };
      // For each asset in server data that doesn't have dirty fields, take server value
      for (const assetStr of Object.keys(serverData)) {
        const assetNumber = Number(assetStr);
        if (!merged[assetNumber]) {
          // New asset from server — accept it entirely
          merged[assetNumber] = serverData[assetNumber];
        }
        // Fields without dirty keys were already accepted during individual resolution
      }
      return merged;
    });

    pendingServerDataRef.current = null;
  }

  // ─── Save with dirty tracking ────────────────────────────────

  const saveEdit = useCallback(
    async (
      assetNumber: number,
      fieldType: "title" | "purpose" | "coreQuestion" | "checklist" | "question",
      fieldId: string,
      fieldKey: string,
      value: string
    ) => {
      setError(null);
      const prev = allEdits[assetNumber] ?? {};
      const optimistic: AssetEdits = { ...prev };

      if (fieldType === "title") optimistic.title = value;
      else if (fieldType === "purpose") optimistic.purpose = value;
      else if (fieldType === "coreQuestion") optimistic.coreQuestion = value;
      else if (fieldType === "checklist") {
        optimistic.checklist = { ...(prev.checklist ?? {}), [fieldId]: value };
        if (value.trim() === "") {
          delete optimistic.checklist![fieldId];
          if (Object.keys(optimistic.checklist).length === 0)
            delete optimistic.checklist;
        }
      } else if (fieldType === "question") {
        optimistic.questions = { ...(prev.questions ?? {}) };
        const q = optimistic.questions[fieldId] ?? {};
        (q as Record<string, string>)[fieldKey] = value;
        if (value.trim() === "") {
          delete (q as Record<string, string>)[fieldKey];
          if (Object.keys(q).length === 0) delete optimistic.questions[fieldId];
          else optimistic.questions[fieldId] = q;
        } else {
          optimistic.questions[fieldId] = q;
        }
        if (optimistic.questions && Object.keys(optimistic.questions).length === 0)
          delete optimistic.questions;
      }

      // Track this field as dirty (edited by current admin)
      const dirtyKey = makeDirtyKey(assetNumber, fieldType, fieldId, fieldKey);
      dirtyFieldsRef.current.add(dirtyKey);

      setAllEdits((prevAll) => ({ ...prevAll, [assetNumber]: optimistic }));
      setSaving(true);
      try {
        await saveFrameworkEdit(
          assetNumber,
          fieldType,
          fieldId ?? "",
          fieldKey ?? "",
          value
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
        setAllEdits((prevAll) => ({ ...prevAll, [assetNumber]: prev }));
        dirtyFieldsRef.current.delete(dirtyKey);
      } finally {
        setSaving(false);
      }
    },
    [allEdits]
  );

  const clearAssetEdits = useCallback(
    async (assetNumber: number) => {
      setError(null);
      setSaving(true);
      try {
        await deleteFrameworkEditsForAsset(assetNumber);
        setAllEdits((prev) => {
          const next = { ...prev };
          delete next[assetNumber];
          return next;
        });
        // Clear dirty keys for this asset
        for (const key of dirtyFieldsRef.current) {
          if (key.startsWith(`${assetNumber}|`)) {
            dirtyFieldsRef.current.delete(key);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to clear edits");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const exportEdits = useCallback(async () => {
    setError(null);
    try {
      const data = await exportFrameworkEdits();
      if (data.totalModified === 0) {
        setError("No modifications to export.");
        return;
      }
      downloadJson(
        data,
        `framework-edits-${new Date().toISOString().slice(0, 10)}.json`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export");
    }
  }, []);

  const importEdits = useCallback(
    async (jsonData: { assets?: Record<string, { assetNumber: number; modifications: AssetEdits }> }) => {
      setError(null);
      setSaving(true);
      try {
        const { imported, errors } = await importFrameworkEdits(jsonData);
        if (errors.length > 0)
          setError(`Imported ${imported} assets; ${errors.join("; ")}`);
        // After import, clear dirty fields and reload
        dirtyFieldsRef.current.clear();
        hasLoadedRef.current = false; // Treat as fresh load
        await loadEdits();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to import");
      } finally {
        setSaving(false);
      }
    },
    [loadEdits]
  );

  return {
    allEdits,
    loading,
    saving,
    error,
    conflicts,
    loadEdits,
    saveEdit,
    clearAssetEdits,
    exportEdits,
    importEdits,
    resolveConflict,
    resolveAllConflicts,
  };
}

// ─── Merge Helper ────────────────────────────────────────────────

/**
 * Merge a single field from the server asset into the local asset.
 * Used when the admin chooses "Keep theirs" for a specific conflict.
 */
function mergeField(
  localAsset: AssetEdits,
  serverAsset: AssetEdits,
  conflict: Conflict
): AssetEdits {
  const merged = { ...localAsset };
  const { fieldType, fieldId, fieldKey } = conflict;

  if (fieldType === "title") {
    merged.title = serverAsset.title;
  } else if (fieldType === "purpose") {
    merged.purpose = serverAsset.purpose;
  } else if (fieldType === "coreQuestion") {
    merged.coreQuestion = serverAsset.coreQuestion;
  } else if (fieldType === "checklist") {
    merged.checklist = { ...(merged.checklist ?? {}) };
    const serverVal = serverAsset.checklist?.[fieldId];
    if (serverVal !== undefined) {
      merged.checklist[fieldId] = serverVal;
    } else {
      delete merged.checklist[fieldId];
      if (Object.keys(merged.checklist).length === 0) delete merged.checklist;
    }
  } else if (fieldType === "question") {
    merged.questions = { ...(merged.questions ?? {}) };
    const serverQ = serverAsset.questions?.[fieldId];
    const localQ = { ...(merged.questions[fieldId] ?? {}) };
    const serverVal = serverQ
      ? (serverQ as Record<string, string | undefined>)[fieldKey]
      : undefined;
    if (serverVal !== undefined) {
      (localQ as Record<string, string>)[fieldKey] = serverVal;
    } else {
      delete (localQ as Record<string, string | undefined>)[fieldKey];
    }
    if (Object.keys(localQ).length === 0) {
      delete merged.questions[fieldId];
    } else {
      merged.questions[fieldId] = localQ;
    }
    if (merged.questions && Object.keys(merged.questions).length === 0) {
      delete merged.questions;
    }
  }

  return merged;
}
