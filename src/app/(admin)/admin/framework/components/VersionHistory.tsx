"use client";

import { useState, useEffect } from "react";
import { getFrameworkEditHistory, rollbackFrameworkEdit, type FrameworkEditHistoryRecord } from "@/app/actions/framework";
import RollbackDialog from "./RollbackDialog";

interface VersionHistoryProps {
  assetNumber: number;
  onRollback?: () => void;
}

export default function VersionHistory({ assetNumber, onRollback }: VersionHistoryProps) {
  const [history, setHistory] = useState<FrameworkEditHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<FrameworkEditHistoryRecord | null>(null);

  useEffect(() => {
    loadHistory();
  }, [assetNumber]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await getFrameworkEditHistory(assetNumber);
      setHistory(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  function getFieldLabel(fieldType: string, fieldId: string, fieldKey: string): string {
    if (fieldType === "title") return "Title";
    if (fieldType === "purpose") return "Purpose";
    if (fieldType === "coreQuestion") return "Core Question";
    if (fieldType === "checklist") return `Checklist: ${fieldId}`;
    if (fieldType === "question") {
      const keyLabel = fieldKey === "label" ? "Label" : "Description";
      return `Question ${fieldId}: ${keyLabel}`;
    }
    return `${fieldType}${fieldId ? `: ${fieldId}` : ""}${fieldKey ? ` (${fieldKey})` : ""}`;
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  function handleRollback(record: FrameworkEditHistoryRecord) {
    setRollbackTarget(record);
  }

  async function confirmRollback() {
    if (!rollbackTarget) return;

    try {
      const result = await rollbackFrameworkEdit(rollbackTarget.id);
      if (result.success) {
        setRollbackTarget(null);
        await loadHistory();
        onRollback?.();
      } else {
        alert(result.error || "Failed to rollback");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to rollback");
    }
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <p className="text-sm text-muted">Loading history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadHistory}
          className="mt-2 text-sm text-accent hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <p className="text-sm text-muted">No history available for this asset.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface border border-border" style={{ borderRadius: 2 }}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">Version History</h3>
          <p className="text-xs text-muted mt-1">
            {history.length} change{history.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {history.map((record) => (
            <div key={record.id} className="px-4 py-3 hover:bg-background/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-accent">
                      {getFieldLabel(record.fieldType, record.fieldId, record.fieldKey)}
                    </span>
                    <span className="text-xs text-muted">
                      {record.action === "created" && "Created"}
                      {record.action === "updated" && "Updated"}
                      {record.action === "deleted" && "Deleted"}
                    </span>
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <div>
                      <span className="font-medium">By:</span> {record.adminName}
                    </div>
                    <div>
                      <span className="font-medium">When:</span> {formatDate(record.createdAt)}
                    </div>
                    {record.action === "updated" && (
                      <>
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-red-600 line-through">
                            <span className="font-medium">Old:</span> {record.oldValue || "(empty)"}
                          </div>
                          <div className="text-green-600">
                            <span className="font-medium">New:</span> {record.newValue || "(empty)"}
                          </div>
                        </div>
                      </>
                    )}
                    {record.action === "created" && record.newValue && (
                      <div className="mt-2 pt-2 border-t border-border text-green-600">
                        <span className="font-medium">Value:</span> {record.newValue}
                      </div>
                    )}
                    {record.action === "deleted" && record.oldValue && (
                      <div className="mt-2 pt-2 border-t border-border text-red-600">
                        <span className="font-medium">Deleted:</span> {record.oldValue}
                      </div>
                    )}
                  </div>
                </div>
                {record.action !== "created" && record.oldValue && (
                  <button
                    onClick={() => handleRollback(record)}
                    className="px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors shrink-0"
                    style={{ borderRadius: 2 }}
                  >
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {rollbackTarget && (
        <RollbackDialog
          record={rollbackTarget}
          onConfirm={confirmRollback}
          onCancel={() => setRollbackTarget(null)}
        />
      )}
    </>
  );
}
