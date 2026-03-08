"use client";

import { useState } from "react";
import {
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
} from "@/app/actions/fellows";
import AssetPicker from "./AssetPicker";
import {
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Circle,
  Link as LinkIcon,
} from "lucide-react";

type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  assetNumber: number | null;
  externalUrl: string | null;
  externalProvider: string | null;
  dueDate: Date | string | null;
  position: number;
};

const CATEGORIES = [
  { value: "product", label: "Product" },
  { value: "gtm", label: "GTM" },
  { value: "investment", label: "Investment" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-600",
  high: "bg-orange-500/10 text-orange-600",
  medium: "bg-accent/10 text-accent",
  low: "bg-border/50 text-muted",
};

export default function TodoList({
  todos: initialTodos,
  ventureId,
  isStudio,
}: {
  todos: TodoItem[];
  ventureId: string;
  isStudio: boolean;
}) {
  const [items, setItems] = useState(initialTodos);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newExternalUrl, setNewExternalUrl] = useState("");
  const [newExternalProvider, setNewExternalProvider] = useState("");

  // Group by category
  const grouped = items.reduce<Record<string, TodoItem[]>>(
    (acc, item) => {
      if (
        filter === "open" &&
        (item.status === "completed" || item.status === "cancelled")
      )
        return acc;
      if (filter === "completed" && item.status !== "completed") return acc;

      const cat = item.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const categoryOrder = ["product", "gtm", "investment", "general"];
  const sortedGroups = categoryOrder.filter((c) => grouped[c]?.length);

  const categoryLabels: Record<string, string> = {
    product: "Product",
    gtm: "GTM",
    investment: "Investment",
    general: "General",
  };

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const item = await createTodoItem(ventureId, {
        title: newTitle.trim(),
        category: newCategory || undefined,
        priority: newPriority,
        externalUrl: newExternalUrl || undefined,
        externalProvider: newExternalProvider || undefined,
      });
      setItems((prev) => [...prev, item as TodoItem]);
      setNewTitle("");
      setNewCategory("");
      setNewPriority("medium");
      setNewExternalUrl("");
      setNewExternalProvider("");
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus =
      currentStatus === "completed" ? "open" : "completed";
    const updated = await updateTodoItem(id, { status: newStatus });
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  }

  async function handleDelete(id: string) {
    await deleteTodoItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleAssetSelect(
    todoId: string,
    assetNumber: number
  ) {
    const updated = await updateTodoItem(todoId, {
      assetNumber: assetNumber || null,
    });
    setItems((prev) =>
      prev.map((item) => (item.id === todoId ? { ...item, ...updated } : item))
    );
    setShowAssetPicker(null);
  }

  const openCount = items.filter(
    (i) => i.status === "open" || i.status === "in_progress"
  ).length;
  const completedCount = items.filter(
    (i) => i.status === "completed"
  ).length;

  return (
    <div
      className="bg-surface border border-border p-6"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-sm">Active To-Do List</h3>
          <p className="text-xs text-muted mt-0.5">
            {openCount} open, {completedCount} completed
          </p>
        </div>
        {isStudio && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <Plus size={14} /> Add to-do
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {(["all", "open", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "bg-border/30 text-muted hover:text-foreground"
            }`}
            style={{ borderRadius: 2 }}
          >
            {f === "all"
              ? `All (${items.length})`
              : f === "open"
              ? `Open (${openCount})`
              : `Done (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Grouped items */}
      {sortedGroups.length === 0 ? (
        <p className="text-muted text-xs italic">
          {items.length === 0
            ? `No to-do items yet.${isStudio ? " Click 'Add to-do' to create one." : ""}`
            : "No items match this filter."}
        </p>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map((cat) => (
            <div key={cat}>
              <div className="label-uppercase text-muted mb-2" style={{ fontSize: 10 }}>
                {categoryLabels[cat]}
              </div>
              <div className="space-y-1">
                {grouped[cat].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 py-1.5 group"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        handleToggleStatus(item.id, item.status)
                      }
                      className={`mt-0.5 ${
                        item.status === "completed"
                          ? "text-green-600"
                          : "text-muted hover:text-accent"
                      } transition-colors`}
                    >
                      {item.status === "completed" ? (
                        <Check size={15} />
                      ) : (
                        <Circle size={15} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-sm ${
                            item.status === "completed"
                              ? "line-through text-muted"
                              : ""
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Priority badge */}
                        {item.priority !== "medium" && (
                          <span
                            className={`text-[9px] px-1 py-0.5 font-medium uppercase ${
                              PRIORITY_COLORS[item.priority] || ""
                            }`}
                            style={{ borderRadius: 2 }}
                          >
                            {item.priority}
                          </span>
                        )}

                        {/* Asset link badge */}
                        {item.assetNumber && (
                          <a
                            href={`/library/${item.assetNumber}`}
                            className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent hover:bg-accent/20 transition-colors inline-flex items-center gap-0.5"
                            style={{ borderRadius: 2 }}
                          >
                            #{item.assetNumber}
                          </a>
                        )}

                        {/* External link */}
                        {item.externalUrl && (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-accent transition-colors"
                            title={`Open in ${item.externalProvider || "external tool"}`}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Studio actions */}
                    {isStudio && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setShowAssetPicker(item.id)}
                          className="text-muted hover:text-accent transition-colors"
                          title="Link asset"
                        >
                          <LinkIcon size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-muted hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <input
            type="text"
            placeholder="To-do title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
            style={{ borderRadius: 2 }}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-background border border-border px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent/50"
              style={{ borderRadius: 2 }}
            >
              <option value="">General</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="bg-background border border-border px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent/50"
              style={{ borderRadius: 2 }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* External URL */}
            <input
              type="url"
              placeholder="Notion/Linear URL (optional)"
              value={newExternalUrl}
              onChange={(e) => {
                setNewExternalUrl(e.target.value);
                // Auto-detect provider
                const url = e.target.value.toLowerCase();
                if (url.includes("notion")) setNewExternalProvider("notion");
                else if (url.includes("linear")) setNewExternalProvider("linear");
                else setNewExternalProvider("");
              }}
              className="flex-1 min-w-[160px] bg-background border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
              style={{ borderRadius: 2 }}
            />

            <div className="flex-1" />

            <button
              onClick={() => {
                setShowAdd(false);
                setNewTitle("");
              }}
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

      {/* Asset picker modal */}
      {showAssetPicker && (
        <AssetPicker
          onSelect={(num, _title) =>
            handleAssetSelect(showAssetPicker, num)
          }
          onClose={() => setShowAssetPicker(null)}
          currentAssetNumber={
            items.find((i) => i.id === showAssetPicker)?.assetNumber
          }
        />
      )}
    </div>
  );
}
