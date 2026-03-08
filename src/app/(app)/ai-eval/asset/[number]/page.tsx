"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { allAssets } from "@/lib/data";

export default function AIEvalAssetPage() {
  const params = useParams<{ number: string }>();
  const number = parseInt(params?.number ?? "0", 10);
  const asset = allAssets.find((a) => a.number === number);

  if (!asset || number < 1 || number > 27) {
    return (
      <div className="space-y-4">
        <Link href="/ai-eval" className="text-sm text-muted hover:text-foreground">
          ← AI Eval Tools
        </Link>
        <p className="text-muted">Asset not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-eval" className="text-sm text-muted hover:text-foreground">
          ← AI Eval Tools
        </Link>
      </div>
      <div>
        <span className="text-xs font-medium text-accent">Asset #{asset.number}</span>
        <h1 className="text-2xl font-medium mt-1">{asset.title}</h1>
        <p className="text-muted text-sm mt-1">{asset.purpose}</p>
      </div>
      <div
        className="p-6 bg-surface border border-border border-dashed text-center text-muted"
        style={{ borderRadius: 2 }}
      >
        <p className="text-sm font-medium">Prototype coming soon</p>
        <p className="text-xs mt-1">
          This asset will get an eval tool to generate structured output from your inputs.
        </p>
      </div>
    </div>
  );
}
