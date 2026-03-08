"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { stages, library, allTags, customModules } from "@/lib/data";
import { limitlessTopics } from "@/lib/limitless";
import { getPersonalisedLibraryData } from "@/app/actions/library";

function AssetCard({
  asset,
  isComplete,
  isRecommended,
}: {
  asset: (typeof library)[0];
  isComplete: boolean;
  isRecommended: boolean;
}) {
  return (
    <Link
      href={`/library/${asset.number}`}
      className={`block bg-surface border p-5 hover:border-accent/40 hover:shadow-sm transition-all relative ${
        isRecommended ? "border-accent/40" : "border-border"
      }`}
      style={{ borderRadius: 2 }}
    >
      {isComplete && (
        <span
          className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-accent text-white text-xs"
          style={{ borderRadius: 2 }}
          title="Completed"
        >
          ✓
        </span>
      )}
      {isRecommended && !isComplete && (
        <span
          className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 bg-accent/20 text-accent"
          style={{ borderRadius: 2 }}
        >
          Recommended
        </span>
      )}
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
            <h3 className="font-medium text-sm leading-tight">{asset.title}</h3>
          </div>
          <p className="text-muted text-xs mt-1 line-clamp-2">{asset.purpose}</p>
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
          <span className="text-xs text-accent font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
}

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [personalised, setPersonalised] = useState<{
    completion: Record<number, boolean>;
    nextActionAssetNumber: number | null;
  }>({ completion: {}, nextActionAssetNumber: null });

  useEffect(() => {
    getPersonalisedLibraryData().then((d) =>
      setPersonalised({
        completion: d.completion,
        nextActionAssetNumber: d.nextActionAssetNumber,
      })
    );
  }, []);

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

  const showStructuredView = !search.trim() && !activeTag;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium">Content Library</h1>
        <p className="text-muted text-sm mt-1">
          Framework stages, Becoming Limitless, and skills lessons — all in one place.
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

      {(search || activeTag) && (
        <p className="text-xs text-muted">
          Showing {filtered.length} of {library.length} items
        </p>
      )}

      {showStructuredView ? (
        <>
          {/* Stages */}
          {stages.map((stage) => (
            <section key={stage.id}>
              <h2 className="text-sm font-medium text-muted label-uppercase mb-3">
                Stage {stage.number} — {stage.title}
              </h2>
              <p className="text-xs text-muted mb-4 max-w-2xl">
                {stage.subtitle}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stage.assets.map((asset) => (
                  <AssetCard
                    key={asset.number}
                    asset={{
                      ...asset,
                      tags: [`stage-${stage.number}`, "core", ...asset.tags],
                      isCustomModule: false,
                    }}
                    isComplete={personalised.completion[asset.number]}
                    isRecommended={
                      personalised.nextActionAssetNumber === asset.number
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Becoming Limitless — customer path after stages */}
          <section>
            <h2 className="text-sm font-medium text-muted label-uppercase mb-3">
              Customer path — Becoming Limitless
            </h2>
            <p className="text-xs text-muted mb-4 max-w-2xl">
              Fellow guide for psyche and abilities: curiosity, invention, bias to action, pitching, systems design, resilience, and organising yourself.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {limitlessTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/library/limitless/${topic.slug}`}
                  className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
                  style={{ borderRadius: 2 }}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="font-medium text-sm leading-tight">
                      {topic.title}
                    </h3>
                    <p className="text-muted text-xs mt-1 line-clamp-2">
                      {topic.shortDescription}
                    </p>
                    <span className="text-xs text-accent font-medium mt-3">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Skills lessons */}
          <section>
            <h2 className="text-sm font-medium text-muted label-uppercase mb-3">
              Skills & execution
            </h2>
            <p className="text-xs text-muted mb-4 max-w-2xl">
              Lessons for website, pitch deck, commercials, sales, and talking to investors.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customModules.map((asset) => (
                <AssetCard
                  key={asset.number}
                  asset={asset}
                  isComplete={personalised.completion[asset.number]}
                  isRecommended={
                    personalised.nextActionAssetNumber === asset.number
                  }
                />
              ))}
            </div>
          </section>
        </>
      ) : filtered.length === 0 ? (
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
            <AssetCard
              key={asset.number}
              asset={asset}
              isComplete={personalised.completion[asset.number]}
              isRecommended={
                personalised.nextActionAssetNumber === asset.number
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
