"use client";

import { useState } from "react";
import type { TrainingVideo } from "@/types/tools";

/**
 * Form for embedding a new Loom training video.
 * Extracts the Loom ID from share/embed URLs.
 */
export default function AddVideoForm({
  onAdd,
  onCancel,
}: {
  onAdd: (video: TrainingVideo) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loomUrl, setLoomUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [duration, setDuration] = useState("");

  const inputClass =
    "w-full px-3 py-2.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-sm";

  function extractLoomId(url: string): string | null {
    const match = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const loomId = extractLoomId(loomUrl);
    if (!loomId) return;

    onAdd({
      id: Date.now().toString(),
      title,
      description,
      loomId,
      duration: duration || undefined,
      category,
    });

    setTitle("");
    setDescription("");
    setLoomUrl("");
    setCategory("General");
    setDuration("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-uppercase block mb-1.5">Video Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
          style={{ borderRadius: 2 }}
          placeholder="e.g. Getting Started with Cursor"
        />
      </div>
      <div>
        <label className="label-uppercase block mb-1.5">Loom URL</label>
        <input
          type="url"
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          required
          className={inputClass}
          style={{ borderRadius: 2 }}
          placeholder="https://www.loom.com/share/..."
        />
        <p className="text-muted text-xs mt-1">
          Paste a Loom share or embed link
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-uppercase block mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
            style={{ borderRadius: 2 }}
          >
            <option>General</option>
            <option>Claude</option>
            <option>Cursor</option>
            <option>Git & GitHub</option>
          </select>
        </div>
        <div>
          <label className="label-uppercase block mb-1.5">
            Duration (optional)
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputClass}
            style={{ borderRadius: 2 }}
            placeholder="e.g. 12 min"
          />
        </div>
      </div>
      <div>
        <label className="label-uppercase block mb-1.5">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          style={{ borderRadius: 2 }}
          placeholder="Brief description of what this video covers"
        />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="px-5 py-2.5 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
          style={{ borderRadius: 2 }}
        >
          Embed Video
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
