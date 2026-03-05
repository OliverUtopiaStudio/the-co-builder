"use client";

import { useState, FormEvent } from "react";

export function AssetMediaEditor({
  assetNumber,
  initialLoomUrl,
  initialDriveUrl,
  onSaved,
}: {
  assetNumber: number;
  initialLoomUrl: string | null;
  initialDriveUrl: string | null;
  onSaved: (loomUrl: string | null, driveUrl: string | null) => void;
}) {
  const [loomUrl, setLoomUrl] = useState(initialLoomUrl ?? "");
  const [driveUrl, setDriveUrl] = useState(initialDriveUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/asset-media/${assetNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loomUrl: loomUrl.trim() || null,
          driveTemplateUrl: driveUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error ?? "Save failed.");
        return;
      }

      setMessage("Saved");
      onSaved(loomUrl.trim() || null, driveUrl.trim() || null);
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="label-uppercase text-[10px] mb-1 block">
          Loom Video URL
        </label>
        <input
          type="url"
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          placeholder="https://www.loom.com/share/..."
          className={inputClass}
          style={{ borderRadius: 2 }}
        />
      </div>
      <div>
        <label className="label-uppercase text-[10px] mb-1 block">
          Google Drive Template URL
        </label>
        <input
          type="url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          placeholder="https://docs.google.com/..."
          className={inputClass}
          style={{ borderRadius: 2 }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          style={{ borderRadius: 2 }}
        >
          {saving ? "Saving..." : "Save Media"}
        </button>
        {message && (
          <span
            className={`text-xs ${message === "Saved" ? "text-green-600" : "text-accent"}`}
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
