"use client";

import Link from "next/link";
import type { CriticalAction } from "@/app/actions/diagnosis";

export default function NextActionCard({
  action,
}: {
  action: CriticalAction | null;
}) {
  if (!action) {
    return (
      <div
        className="bg-surface border border-border p-5 text-muted text-sm"
        style={{ borderRadius: 2 }}
      >
        Complete assets in the library to see your next recommended step.
      </div>
    );
  }

  return (
    <div
      className="bg-accent/5 border border-accent/20 p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="label-uppercase text-[10px] mb-1 text-accent">
            Your next step
          </div>
          <h3 className="font-medium text-foreground">
            Asset #{action.assetNumber}: {action.title}
          </h3>
          {action.reason && (
            <p className="text-sm text-muted mt-2">{action.reason}</p>
          )}
        </div>
        <Link
          href={`/library/${action.assetNumber}`}
          className="shrink-0 px-4 py-2 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
          style={{ borderRadius: 2 }}
        >
          Start →
        </Link>
      </div>
    </div>
  );
}
