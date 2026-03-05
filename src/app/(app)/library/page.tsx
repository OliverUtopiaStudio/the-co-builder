"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { library, allTags } from "@/lib/data";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag && allTags.includes(tag)) setActiveTag(tag);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let items = library;
    if (activeTag) {
      items = items.filter((a) => a.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.purpose.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeTag]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Content Library</div>
        <h1 className="text-2xl font-medium">Co-Build Assets & Modules</h1>
        <p className="text-muted text-sm mt-1">
          Browse the full framework — 27 core assets and custom modules.
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by title or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
          style={{ borderRadius: 2 }}
        />
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTag === null
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          }`}
          style={{ borderRadius: 2 }}
        >
          All ({library.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTag === tag
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
            style={{ borderRadius: 2 }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search || activeTag) && (
        <p className="text-xs text-muted">
          Showing {filtered.length} of {library.length} items
        </p>
      )}

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-surface border border-border p-12 text-center"
          style={{ borderRadius: 2 }}
        >
          <p className="text-muted text-sm">
            No assets match your search. Try broadening your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <Link
              key={asset.number}
              href={`/library/${asset.number}`}
              className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${
                        asset.isCustomModule
                          ? "bg-gold/10 text-gold"
                          : "bg-accent/10 text-accent"
                      }`}
                      style={{ borderRadius: 2 }}
                    >
                      {asset.isCustomModule ? "M" : `#${asset.number}`}
                    </div>
                    <h3 className="font-medium text-sm leading-tight">
                      {asset.title}
                    </h3>
                  </div>
                  <p className="text-muted text-xs mt-1 line-clamp-2">
                    {asset.purpose}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 bg-border/50 text-muted"
                        style={{ borderRadius: 2 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-accent font-medium">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
