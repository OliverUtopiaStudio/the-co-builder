"use client";

import { useState } from "react";
import { updateCategorizedLinks, type CategorizedLinks as CategorizedLinksType } from "@/app/actions/fellows";
import { Plus, Trash2, ExternalLink, X } from "lucide-react";

const CATEGORIES = [
  { key: "product" as const, label: "Product" },
  { key: "gtm" as const, label: "GTM" },
  { key: "investment" as const, label: "Investment" },
];

export default function CategorizedLinks({
  links: initialLinks,
  ventureId,
  isStudio,
}: {
  links: CategorizedLinksType;
  ventureId: string;
  isStudio: boolean;
}) {
  const [links, setLinks] = useState<CategorizedLinksType>(initialLinks);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(category: keyof CategorizedLinksType) {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    try {
      const updated = {
        ...links,
        [category]: [
          ...links[category],
          { title: newTitle.trim(), url: newUrl.trim() },
        ],
      };
      await updateCategorizedLinks(ventureId, updated);
      setLinks(updated);
      setNewTitle("");
      setNewUrl("");
      setAddingTo(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(
    category: keyof CategorizedLinksType,
    index: number
  ) {
    const updated = {
      ...links,
      [category]: links[category].filter((_, i) => i !== index),
    };
    await updateCategorizedLinks(ventureId, updated);
    setLinks(updated);
  }

  const hasAnyLinks = CATEGORIES.some((c) => links[c.key].length > 0);

  return (
    <div
      className="bg-surface border border-border p-6"
      style={{ borderRadius: 2 }}
    >
      <h3 className="font-medium text-sm mb-4">Key Assets</h3>

      {!hasAnyLinks && !addingTo ? (
        <p className="text-muted text-xs italic">
          No resource links yet.
          {isStudio && " Add links to key documents and tools below."}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span
                className="label-uppercase text-muted"
                style={{ fontSize: 10 }}
              >
                {label}
              </span>
              {isStudio && addingTo !== key && (
                <button
                  onClick={() => {
                    setAddingTo(key);
                    setNewTitle("");
                    setNewUrl("");
                  }}
                  className="text-muted hover:text-accent transition-colors"
                  title={`Add ${label} link`}
                >
                  <Plus size={12} />
                </button>
              )}
            </div>

            {links[key].length === 0 && addingTo !== key ? (
              <p className="text-muted text-[10px] italic">No links</p>
            ) : (
              <div className="space-y-1">
                {links[key].map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 group"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1 min-w-0 truncate"
                    >
                      {link.title}
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                    {isStudio && (
                      <button
                        onClick={() => handleRemove(key, i)}
                        className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Remove link"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Inline add form */}
            {addingTo === key && (
              <div className="mt-2 space-y-1.5">
                <input
                  type="text"
                  placeholder="Title (e.g. PRD)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
                  style={{ borderRadius: 2 }}
                  autoFocus
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
                  style={{ borderRadius: 2 }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAdd(key)
                  }
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAddingTo(null)}
                    className="p-1 text-muted hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                  <button
                    onClick={() => handleAdd(key)}
                    disabled={saving || !newTitle.trim() || !newUrl.trim()}
                    className="px-2 py-1 text-[10px] bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
                    style={{ borderRadius: 2 }}
                  >
                    {saving ? "..." : "Add"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
