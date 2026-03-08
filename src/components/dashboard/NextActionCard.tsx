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
      className="bg-accent/5 border border-accent/20 p-4 sm:p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="label-uppercase text-[10px] mb-1 text-accent">
            Your next step
          </div>
          <h3 className="font-medium text-foreground text-sm sm:text-base break-words">
            Asset #{action.assetNumber}: {action.title}
          </h3>
          {action.reason && (
            <p className="text-sm text-muted mt-2 break-words">{action.reason}</p>
          )}
        </div>
        <Link
          href={`/library/${action.assetNumber}`}
          className="shrink-0 px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity text-center touch-manipulation min-h-[44px] flex items-center justify-center sm:py-2"
          style={{ borderRadius: 2 }}
        >
          Start →
        </Link>
      </div>
    </div>
  );
}
