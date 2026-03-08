"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getMarketingContentPlan,
  getActiveVenturesForStudio,
  createMarketingContentItem,
  updateMarketingContentItem,
  deleteMarketingContentItem,
  pushContentPlanToBuffer,
  type MarketingContentItem,
  type VentureOption,
} from "@/app/actions/marketing";

function formatWeekLabel(date: Date): string {
  const d = new Date(date);
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function toMonday(weekStartDate: Date): string {
  const d = new Date(weekStartDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export default function MarketingContentPlan() {
  const [items, setItems] = useState<MarketingContentItem[]>([]);
  const [ventures, setVentures] = useState<VentureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pushStatus, setPushStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    weekStartDate: toMonday(new Date()),
    title: "",
    body: "",
    platform: "",
    ventureIds: [] as string[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [plan, v] = await Promise.all([
        getMarketingContentPlan(),
        getActiveVenturesForStudio(),
      ]);
      setItems(plan);
      setVentures(v);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byWeek = useMemo(() => {
    const map = new Map<string, MarketingContentItem[]>();
    for (const item of items) {
      const key = toMonday(new Date(item.weekStartDate));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.position - b.position);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const ventureNames = useMemo(() => {
    const m = new Map(ventures.map((v) => [v.id, v.name]));
    return m;
  }, [ventures]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setAdding(true);
    setPushStatus(null);
    try {
      const res = await createMarketingContentItem({
        weekStartDate: form.weekStartDate,
        title: form.title.trim(),
        body: form.body.trim(),
        platform: form.platform.trim() || null,
        ventureIds: form.ventureIds,
      });
      if (res.error) {
        setPushStatus({ ok: false, message: res.error });
      } else {
        setForm({ ...form, title: "", body: "", platform: "" });
        await load();
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (
    id: string,
    data: { title?: string; body?: string; platform?: string | null; ventureIds?: string[] }
  ) => {
    const res = await updateMarketingContentItem(id, data);
    if (res.error) setPushStatus({ ok: false, message: res.error });
    else {
      setEditingId(null);
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content item?")) return;
    await deleteMarketingContentItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await load();
  };

  const handlePushToBuffer = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) {
      setPushStatus({ ok: false, message: "Select at least one item to push." });
      return;
    }
    setPushStatus(null);
    setAdding(true);
    try {
      const res = await pushContentPlanToBuffer(ids);
      if (res.error) {
        setPushStatus({ ok: false, message: res.error });
      } else {
        const msg =
          res.results?.length &&
          res.results.some((r) => !r.success)
            ? `Pushed ${res.pushed ?? 0}. Some failed: ${res.results?.filter((r) => !r.success).map((r) => r.error).join("; ")}`
            : `Pushed ${res.pushed ?? 0} item(s) to Buffer.`;
        setPushStatus({ ok: true, message: msg });
        await load();
        setSelectedIds(new Set());
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted text-sm">Loading content plan…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Marketing content plan
        </h1>
        <p className="mt-1 text-sm text-muted">
          Plan content by week, tag ventures, and push to Buffer.
        </p>
      </div>

      {pushStatus && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            pushStatus.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {pushStatus.message}
        </div>
      )}

      {/* Add new item */}
      <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">Add content item</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Week starting</label>
              <input
                type="date"
                value={form.weekStartDate}
                onChange={(e) => setForm((f) => ({ ...f, weekStartDate: e.target.value }))}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Platform (optional)</label>
              <input
                type="text"
                placeholder="e.g. LinkedIn, Twitter"
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Short title for this post"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Copy / body</label>
            <textarea
              required
              rows={3}
              placeholder="Post text to push to Buffer"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm resize-y"
            />
          </div>
          {ventures.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Tag ventures (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {ventures.map((v) => (
                  <label key={v.id} className="inline-flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form.ventureIds.includes(v.id)}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          ventureIds: e.target.checked
                            ? [...f.ventureIds, v.id]
                            : f.ventureIds.filter((id) => id !== v.id),
                        }));
                      }}
                      className="rounded border-border text-accent"
                    />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={adding}
            className="rounded border border-accent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add item"}
          </button>
        </form>
      </section>

      {/* Push to Buffer */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePushToBuffer}
            disabled={selectedIds.size === 0 || adding}
            className="rounded border border-accent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {adding ? "Pushing…" : `Push ${selectedIds.size ? `${selectedIds.size} selected` : "selected"} to Buffer`}
          </button>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-sm text-muted hover:text-foreground"
          >
            {selectedIds.size === items.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      )}

      {/* Content by week */}
      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">Content by week</h2>
        {byWeek.length === 0 ? (
          <p className="text-sm text-muted">No content items yet. Add one above.</p>
        ) : (
          <div className="space-y-6">
            {byWeek.map(([weekKey, weekItems]) => (
              <div key={weekKey} className="rounded-lg border border-border bg-surface overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 text-xs font-medium text-muted uppercase tracking-wider">
                  Week of {formatWeekLabel(new Date(weekKey))}
                </div>
                <ul className="divide-y divide-border">
                  {weekItems.map((item) => (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="mt-1 rounded border-border text-accent"
                          aria-label={`Select ${item.title}`}
                        />
                        <div className="min-w-0 flex-1">
                          {editingId === item.id ? (
                            <EditForm
                              item={item}
                              ventures={ventures}
                              ventureIds={item.ventureIds}
                              onSave={(data) => handleUpdate(item.id, data)}
                              onCancel={() => setEditingId(null)}
                            />
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{item.title}</span>
                                {item.platform && (
                                  <span className="text-xs text-muted">({item.platform})</span>
                                )}
                                {item.bufferPostId && (
                                  <span className="text-xs text-green-600">In Buffer</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted whitespace-pre-wrap">{item.body}</p>
                              {item.ventureIds.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.ventureIds.map((vid) => (
                                    <span
                                      key={vid}
                                      className="inline rounded bg-accent/10 px-2 py-0.5 text-xs text-accent"
                                    >
                                      {ventureNames.get(vid) ?? vid}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(item.id)}
                                  className="text-xs text-accent hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EditForm({
  item,
  ventures,
  ventureIds,
  onSave,
  onCancel,
}: {
  item: MarketingContentItem;
  ventures: VentureOption[];
  ventureIds: string[];
  onSave: (data: {
    title?: string;
    body?: string;
    platform?: string | null;
    ventureIds?: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [platform, setPlatform] = useState(item.platform ?? "");
  const [vIds, setVIds] = useState<string[]>(ventureIds);

  return (
    <div className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
        placeholder="Title"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="w-full rounded border border-border bg-background px-2 py-1 text-sm resize-y"
        placeholder="Body"
      />
      <input
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
        placeholder="Platform"
      />
      {ventures.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ventures.map((v) => (
            <label key={v.id} className="inline-flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={vIds.includes(v.id)}
                onChange={(e) => {
                  setVIds((prev) =>
                    e.target.checked ? [...prev, v.id] : prev.filter((id) => id !== v.id)
                  );
                }}
                className="rounded border-border text-accent"
              />
              {v.name}
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ title, body, platform: platform || null, ventureIds: vIds })}
          className="text-xs rounded bg-accent text-white px-2 py-1"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
