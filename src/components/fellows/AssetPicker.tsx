"use client";

import { useState, useMemo } from "react";
import { library } from "@/lib/data";
import { X, Search } from "lucide-react";

export default function AssetPicker({
  onSelect,
  onClose,
  currentAssetNumber,
}: {
  onSelect: (assetNumber: number, title: string) => void;
  onClose: () => void;
  currentAssetNumber?: number | null;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return library;
    const q = search.toLowerCase();
    return library.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q) ||
        String(a.number).includes(q)
    );
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-surface border border-border w-full max-w-md max-h-[70vh] flex flex-col shadow-xl"
        style={{ borderRadius: 2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">Link Content Library Asset</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
              style={{ borderRadius: 2 }}
              autoFocus
            />
          </div>
        </div>

        {/* Asset list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-muted text-xs text-center py-4">
              No matching assets.
            </p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((asset) => (
                <button
                  key={asset.number}
                  onClick={() => onSelect(asset.number, asset.title)}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-accent/5 transition-colors flex items-start gap-2 ${
                    currentAssetNumber === asset.number
                      ? "bg-accent/10 border border-accent/20"
                      : ""
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5 ${
                      asset.isCustomModule
                        ? "bg-gold/10 text-gold"
                        : "bg-accent/10 text-accent"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {asset.isCustomModule ? "M" : `#${asset.number}`}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-xs">{asset.title}</div>
                    <div className="text-muted text-[10px] mt-0.5 line-clamp-1">
                      {asset.purpose}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove link option */}
        {currentAssetNumber && (
          <div className="px-4 py-2 border-t border-border">
            <button
              onClick={() => onSelect(0, "")}
              className="text-xs text-muted hover:text-red-500 transition-colors"
            >
              Remove asset link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
