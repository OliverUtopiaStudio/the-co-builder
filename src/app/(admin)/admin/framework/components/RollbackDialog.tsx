"use client";

import { type FrameworkEditHistoryRecord } from "@/app/actions/framework";

interface RollbackDialogProps {
  record: FrameworkEditHistoryRecord;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RollbackDialog({
  record,
  onConfirm,
  onCancel,
}: RollbackDialogProps) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-surface border border-border max-w-md w-full"
        style={{ borderRadius: 2 }}
      >
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium">Confirm Rollback</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to rollback this change?
          </p>
          <div className="bg-background/50 p-3 space-y-2" style={{ borderRadius: 2 }}>
            <div className="text-xs">
              <span className="font-medium">Field:</span> {getFieldLabel(record.fieldType, record.fieldId, record.fieldKey)}
            </div>
            <div className="text-xs">
              <span className="font-medium">Changed by:</span> {record.adminName}
            </div>
            <div className="text-xs">
              <span className="font-medium">When:</span> {new Date(record.createdAt).toLocaleString()}
            </div>
            <div className="pt-2 mt-2 border-t border-border space-y-1">
              <div className="text-xs text-red-600">
                <span className="font-medium">Current value:</span> {record.newValue || "(empty)"}
              </div>
              <div className="text-xs text-green-600">
                <span className="font-medium">Will restore to:</span> {record.oldValue || "(empty)"}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Rollback
          </button>
        </div>
      </div>
    </div>
  );
}
