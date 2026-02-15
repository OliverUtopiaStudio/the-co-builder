"use client";

import { useCallback } from "react";
import { stages } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────

export interface Conflict {
  assetNumber: number;
  fieldType: "title" | "purpose" | "coreQuestion" | "checklist" | "question";
  fieldId: string;
  fieldKey: string;
  localValue: string;
  serverValue: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function getAssetTitle(assetNumber: number): string {
  const asset = stages
    .flatMap((s) => s.assets)
    .find((a) => a.number === assetNumber);
  return asset ? asset.title : `Asset #${assetNumber}`;
}

function getFieldLabel(conflict: Conflict): string {
  const { fieldType, fieldId, fieldKey } = conflict;
  if (fieldType === "title") return "Title";
  if (fieldType === "purpose") return "Purpose";
  if (fieldType === "coreQuestion") return "Core Question";
  if (fieldType === "checklist") return `Checklist › ${fieldId}`;
  if (fieldType === "question") {
    const keyLabel = fieldKey === "label" ? "Label" : "Description";
    return `Question ${fieldId} › ${keyLabel}`;
  }
  return fieldType;
}

function truncate(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

// ─── Component ───────────────────────────────────────────────────

export default function ConflictResolutionDialog({
  conflicts,
  onResolve,
  onResolveAll,
}: {
  conflicts: Conflict[];
  onResolve: (conflict: Conflict, choice: "mine" | "theirs") => void;
  onResolveAll: (choice: "mine" | "theirs") => void;
}) {
  const handleResolve = useCallback(
    (conflict: Conflict, choice: "mine" | "theirs") => {
      onResolve(conflict, choice);
    },
    [onResolve]
  );

  if (conflicts.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-labelledby="conflict-title"
    >
      <div
        className="bg-surface border border-border w-full max-w-lg p-6"
        style={{ borderRadius: 2 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold shrink-0"
            style={{ borderRadius: 2 }}
          >
            !
          </span>
          <h2 id="conflict-title" className="text-lg font-semibold">
            Editing conflict detected
          </h2>
        </div>
        <p className="text-muted text-sm mb-4">
          Another admin made changes to{" "}
          {conflicts.length === 1
            ? "a field you've also edited"
            : `${conflicts.length} fields you've also edited`}
          . Choose which version to keep for each.
        </p>

        {/* Conflict list */}
        <div
          className="space-y-3 max-h-[50vh] overflow-y-auto pr-1"
          role="list"
        >
          {conflicts.map((conflict) => (
            <div
              key={`${conflict.assetNumber}-${conflict.fieldType}-${conflict.fieldId}-${conflict.fieldKey}`}
              className="border border-border bg-background/30 p-4"
              style={{ borderRadius: 2 }}
              role="listitem"
            >
              {/* Field identifier */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5"
                  style={{ borderRadius: 2 }}
                >
                  #{conflict.assetNumber}
                </span>
                <span className="text-xs font-medium">
                  {getAssetTitle(conflict.assetNumber)}
                </span>
                <span className="text-[10px] text-muted">›</span>
                <span className="text-xs text-muted">
                  {getFieldLabel(conflict)}
                </span>
              </div>

              {/* Value comparison */}
              <div className="space-y-2 mb-3">
                <div>
                  <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                    Your version
                  </div>
                  <div
                    className="text-xs text-foreground bg-blue-50 border border-blue-200 px-2.5 py-1.5"
                    style={{ borderRadius: 2 }}
                  >
                    {truncate(conflict.localValue) || (
                      <span className="italic text-muted">(empty)</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                    Their version
                  </div>
                  <div
                    className="text-xs text-foreground bg-amber-50 border border-amber-200 px-2.5 py-1.5"
                    style={{ borderRadius: 2 }}
                  >
                    {truncate(conflict.serverValue) || (
                      <span className="italic text-muted">(empty)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Per-conflict actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolve(conflict, "mine")}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  Keep mine
                </button>
                <button
                  onClick={() => handleResolve(conflict, "theirs")}
                  className="flex-1 px-3 py-1.5 text-xs font-medium border border-border hover:bg-background/50 transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  Keep theirs
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk actions (only show if multiple conflicts) */}
        {conflicts.length > 1 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={() => onResolveAll("mine")}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Keep all mine
            </button>
            <button
              onClick={() => onResolveAll("theirs")}
              className="flex-1 px-4 py-2 text-sm font-medium border border-border hover:bg-background/50 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Accept all updates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
