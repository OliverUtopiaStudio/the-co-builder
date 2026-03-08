"use client";

import Link from "next/link";
import { allAssets } from "@/lib/data";

export default function AIEvalToolsPage() {
  const core27 = allAssets.filter((a) => a.number >= 1 && a.number <= 27);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">AI Eval Tools</h1>
        <p className="text-muted text-sm mt-1">
          Prototype evaluators for each of the 27 Co-Build assets. Paste inputs
          and generate structured outputs to test and refine your venture
          materials.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {core27.map((asset) => {
          const isInventionGate = asset.number === 1;
          const href = isInventionGate
            ? "/ai-eval/invention-gate"
            : `/ai-eval/asset/${asset.number}`;
          const label = isInventionGate ? "Invention Gate (think demo)" : "Prototype";

          return (
            <Link
              key={asset.number}
              href={href}
              className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-xs font-medium bg-accent/10 text-accent"
                  style={{ borderRadius: 2 }}
                >
                  #{asset.number}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm leading-tight">
                    {asset.title}
                  </h3>
                  <p className="text-muted text-xs mt-1 line-clamp-2">
                    {asset.purpose}
                  </p>
                  <span className="inline-block mt-2 text-xs font-medium text-accent">
                    {label} →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
