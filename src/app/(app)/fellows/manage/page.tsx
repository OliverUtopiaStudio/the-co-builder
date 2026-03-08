"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getFellowsList,
  createFellow,
  createVenture,
  updateFellow,
  updateVenture,
} from "@/app/actions/fellows";

type FellowRow = {
  id: string;
  fullName: string;
  email: string;
  venture: {
    id: string;
    name: string;
    currentStage: string | null;
    industry: string | null;
  } | null;
};

export default function FellowsManagePage() {
  const router = useRouter();
  const [data, setData] = useState<{
    fellows: FellowRow[];
    isStudio: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    ventureName: "",
    industry: "",
    domain: "",
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    ventureName: "",
    currentStage: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getFellowsList()
      .then((res) => {
        setData({
          fellows: res.fellows as FellowRow[],
          isStudio: res.isStudio,
        });
        if (!res.isStudio) router.replace("/fellows");
      })
      .catch(() => setError("Failed to load fellows"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [router]);

  async function handleAdd() {
    if (!addForm.fullName.trim() || !addForm.ventureName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const fellow = await createFellow({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim() || undefined,
        domain: addForm.domain.trim() || undefined,
      });
      await createVenture(fellow.id, {
        name: addForm.ventureName.trim(),
        industry: addForm.industry.trim() || undefined,
      });
      setAddForm({
        fullName: "",
        email: "",
        ventureName: "",
        industry: "",
        domain: "",
      });
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add fellow");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(fellowId: string, ventureId: string) {
    if (!editForm.fullName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateFellow(fellowId, { fullName: editForm.fullName.trim() });
      await updateVenture(ventureId, {
        name: editForm.ventureName.trim(),
        currentStage: editForm.currentStage || "00",
      });
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Manage Fellows</h1>
          <p className="text-muted text-sm mt-1">
            Add and edit fellows and their ventures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/fellows"
            className="px-4 py-2 text-sm border border-border hover:bg-surface transition-colors"
            style={{ borderRadius: 2 }}
          >
            Back to Fellows
          </Link>
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 text-sm bg-accent text-white hover:opacity-90 transition-opacity"
              style={{ borderRadius: 2 }}
            >
              Add Fellow
            </button>
          ) : null}
        </div>
      </div>

      {error && (
        <div
          className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm"
          style={{ borderRadius: 2 }}
        >
          {error}
        </div>
      )}

      {showAdd && (
        <div
          className="bg-surface border border-border p-5 space-y-4"
          style={{ borderRadius: 2 }}
        >
          <h2 className="text-sm font-medium">New Fellow</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-muted mb-1">Full name *</label>
              <input
                value={addForm.fullName}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="w-full bg-background border border-border px-3 py-2 text-sm"
                style={{ borderRadius: 2 }}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full bg-background border border-border px-3 py-2 text-sm"
                style={{ borderRadius: 2 }}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Venture name *
              </label>
              <input
                value={addForm.ventureName}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, ventureName: e.target.value }))
                }
                className="w-full bg-background border border-border px-3 py-2 text-sm"
                style={{ borderRadius: 2 }}
                placeholder="e.g. Acme Inc"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Industry</label>
              <input
                value={addForm.industry}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, industry: e.target.value }))
                }
                className="w-full bg-background border border-border px-3 py-2 text-sm"
                style={{ borderRadius: 2 }}
                placeholder="e.g. Health"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Domain</label>
              <input
                value={addForm.domain}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, domain: e.target.value }))
                }
                className="w-full bg-background border border-border px-3 py-2 text-sm"
                style={{ borderRadius: 2 }}
                placeholder="e.g. AI"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !addForm.fullName.trim() || !addForm.ventureName.trim()}
              className="px-4 py-2 text-sm bg-accent text-white disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {saving ? "Adding..." : "Add Fellow"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setError(null);
              }}
              className="px-4 py-2 text-sm border border-border hover:bg-surface"
              style={{ borderRadius: 2 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        className="bg-surface border border-border overflow-x-auto"
        style={{ borderRadius: 2 }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Fellow</th>
              <th className="text-left py-3 px-4 font-medium">Venture</th>
              <th className="text-left py-3 px-4 font-medium">Stage</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.fellows.map((f) => {
              const venture = f.venture;
              const isEditing = editingId === f.id;
              return (
                <tr key={f.id} className="border-b border-border/50">
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={editForm.fullName}
                        onChange={(e) =>
                          setEditForm((x) => ({ ...x, fullName: e.target.value }))
                        }
                        className="w-full max-w-[200px] bg-background border border-border px-2 py-1.5 text-sm"
                        style={{ borderRadius: 2 }}
                      />
                    ) : (
                      f.fullName
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing && venture ? (
                      <input
                        value={editForm.ventureName}
                        onChange={(e) =>
                          setEditForm((x) => ({
                            ...x,
                            ventureName: e.target.value,
                          }))
                        }
                        className="w-full max-w-[180px] bg-background border border-border px-2 py-1.5 text-sm"
                        style={{ borderRadius: 2 }}
                      />
                    ) : venture ? (
                      venture.name
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={editForm.currentStage}
                        onChange={(e) =>
                          setEditForm((x) => ({
                            ...x,
                            currentStage: e.target.value,
                          }))
                        }
                        placeholder="00"
                        className="w-16 bg-background border border-border px-2 py-1.5 text-sm"
                        style={{ borderRadius: 2 }}
                      />
                    ) : venture?.currentStage ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing && venture ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(f.id, venture.id)
                          }
                          disabled={saving}
                          className="text-accent font-medium mr-2"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setError(null);
                          }}
                          className="text-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(f.id);
                          setEditForm({
                            fullName: f.fullName,
                            ventureName: venture?.name ?? "",
                            currentStage: venture?.currentStage ?? "00",
                          });
                          setError(null);
                        }}
                        className="text-accent hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
