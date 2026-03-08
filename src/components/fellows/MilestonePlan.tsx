"use client";

import { useState } from "react";
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/app/actions/fellows";
import { Plus, Trash2, Check, Circle, AlertCircle, Clock } from "lucide-react";

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date | string | null;
  status: string;
  position: number;
};

const STATUS_CONFIG: Record<
  string,
  { icon: typeof Check; label: string; color: string }
> = {
  not_started: { icon: Circle, label: "Not started", color: "text-muted" },
  in_progress: { icon: Clock, label: "In progress", color: "text-accent" },
  completed: { icon: Check, label: "Completed", color: "text-green-600" },
  blocked: { icon: AlertCircle, label: "Blocked", color: "text-red-500" },
};

export default function MilestonePlan({
  milestones: initialMilestones,
  ventureId,
  isStudio,
}: {
  milestones: Milestone[];
  ventureId: string;
  isStudio: boolean;
}) {
  const [items, setItems] = useState(initialMilestones);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  const completed = items.filter((m) => m.status === "completed").length;
  const total = items.length;

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const milestone = await createMilestone(ventureId, {
        title: newTitle.trim(),
        targetDate: newDate || undefined,
      });
      setItems((prev) => [...prev, milestone as Milestone]);
      setNewTitle("");
      setNewDate("");
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const updated = await updateMilestone(id, { status });
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
  }

  async function handleDelete(id: string) {
    await deleteMilestone(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  function formatDate(d: Date | string | null) {
    if (!d) return null;
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div
      className="bg-surface border border-border p-6"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-sm">Milestone Plan</h3>
          {total > 0 && (
            <p className="text-xs text-muted mt-0.5">
              {completed} of {total} completed
            </p>
          )}
        </div>
        {isStudio && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <Plus size={14} /> Add milestone
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full h-1.5 bg-border/50 mb-4" style={{ borderRadius: 2 }}>
          <div
            className="h-full bg-accent transition-all"
            style={{
              width: `${(completed / total) * 100}%`,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Milestone list */}
      {items.length === 0 && !showAdd ? (
        <p className="text-muted text-xs italic">
          No milestones set yet.
          {isStudio && " Click 'Add milestone' to create the plan."}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((m) => {
            const statusConf = STATUS_CONFIG[m.status] || STATUS_CONFIG.not_started;
            const StatusIcon = statusConf.icon;
            return (
              <div
                key={m.id}
                className="flex items-start gap-3 py-2 group"
              >
                {/* Status toggle */}
                <button
                  onClick={() => {
                    const next =
                      m.status === "completed"
                        ? "not_started"
                        : m.status === "not_started"
                        ? "in_progress"
                        : m.status === "in_progress"
                        ? "completed"
                        : "not_started";
                    handleStatusChange(m.id, next);
                  }}
                  className={`mt-0.5 ${statusConf.color} hover:text-accent transition-colors`}
                  title={`Status: ${statusConf.label}. Click to change.`}
                >
                  <StatusIcon size={16} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        m.status === "completed"
                          ? "line-through text-muted"
                          : "text-foreground"
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>
                  {m.targetDate && (
                    <span className="text-[10px] text-muted">
                      Target: {formatDate(m.targetDate)}
                    </span>
                  )}
                </div>

                {/* Delete (studio only) */}
                {isStudio && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete milestone"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <input
            type="text"
            placeholder="Milestone title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
            style={{ borderRadius: 2 }}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-background border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent/50"
              style={{ borderRadius: 2 }}
            />
            <div className="flex-1" />
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !newTitle.trim()}
              className="px-3 py-1.5 text-xs bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
              style={{ borderRadius: 2 }}
            >
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
