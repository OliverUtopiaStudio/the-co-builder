"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVentures } from "@/lib/hooks/use-fellow-ventures";

export default function DashboardPage() {
  const venturesQuery = useVentures();
  const ventures = venturesQuery.data ?? [];
  const loading = venturesQuery.isLoading && ventures.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading ventures...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="label-uppercase mb-2">Venture Carousel</div>
        <h1 className="text-2xl font-medium">Choose a venture to work on</h1>
        <p className="text-muted text-sm mt-1">
          Each venture has a curated playlist of framework assets and modules.
        </p>
      </div>

      {ventures.length === 0 ? (
        <div className="bg-surface border border-border p-12 text-center" style={{ borderRadius: 2 }}>
          <div className="label-uppercase mb-4">No Ventures Configured</div>
          <h3 className="text-lg font-medium mb-2">Ask your studio team to add ventures</h3>
          <p className="text-muted text-sm mb-4 max-w-md mx-auto">
            Ventures are created by the studio team and assigned a playlist of assets.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ventures.map((venture) => (
            <Link
              key={venture.id}
              href={`/venture/${venture.id}`}
              className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="label-uppercase text-xs mb-1">
                    Venture
                  </div>
                  <h3 className="font-medium text-lg">{venture.name}</h3>
                  {venture.description && (
                    <p className="text-muted text-sm mt-1 line-clamp-3">
                      {venture.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    {venture.industry && (
                      <span
                        className="px-2 py-0.5 bg-accent/10 text-accent font-medium"
                        style={{ borderRadius: 2 }}
                      >
                        {venture.industry}
                      </span>
                    )}
                    <span>Stage {venture.currentStage || "00"}</span>
                  </div>
                  <span className="text-accent font-medium">Open →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
