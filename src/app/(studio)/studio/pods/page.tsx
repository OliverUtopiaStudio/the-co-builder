"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPods } from "@/app/actions/studio";

type Pod = {
  id: string;
  name: string;
  tagline: string | null;
  color: string | null;
  clusters: unknown;
  displayOrder: number | null;
  fellowCount: number;
};

export default function PodsPage() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPods().then((data) => {
      setPods(data as Pod[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-muted text-sm">Loading pods...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="label-uppercase text-muted mb-2">Studio OS</div>
        <h1 className="text-2xl font-medium text-foreground">Pod Directory</h1>
        <p className="text-sm text-muted mt-1">
          {pods.length} investment thesis pods — {pods.reduce((s, p) => s + p.fellowCount, 0)} fellows assigned
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pods.map((pod) => {
          const clusters = Array.isArray(pod.clusters) ? (pod.clusters as string[]) : [];
          return (
            <Link
              key={pod.id}
              href={`/studio/pods/${pod.id}`}
              className="block bg-surface border border-border hover:border-accent/30 transition-colors group"
              style={{ borderRadius: 2 }}
            >
              {/* Color bar */}
              <div className="h-1" style={{ backgroundColor: pod.color || "#CC5536" }} />

              <div className="p-5">
                {/* Pod number + name */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div
                      className="inline-block text-[10px] font-semibold tracking-[1px] px-1.5 py-0.5 mb-2"
                      style={{
                        backgroundColor: `${pod.color || "#CC5536"}15`,
                        color: pod.color || "#CC5536",
                        borderRadius: 2,
                      }}
                    >
                      POD {pod.displayOrder}
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                      {pod.name}
                    </h3>
                  </div>
                  <span className="text-muted group-hover:text-accent transition-colors">→</span>
                </div>

                {/* Tagline */}
                {pod.tagline && (
                  <p className="text-xs text-muted mb-3">{pod.tagline}</p>
                )}

                {/* Clusters */}
                {clusters.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {clusters.map((cluster, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-muted bg-background px-2 py-0.5 border border-border"
                        style={{ borderRadius: 2 }}
                      >
                        {cluster.split("(")[0].trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Fellow count */}
                <div className="text-xs text-muted border-t border-border pt-3 mt-3">
                  <span className="font-semibold text-foreground">{pod.fellowCount}</span>{" "}
                  {pod.fellowCount === 1 ? "fellow" : "fellows"} assigned
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
