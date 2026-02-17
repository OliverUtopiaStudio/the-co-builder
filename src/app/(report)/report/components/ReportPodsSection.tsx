type Pod = {
  id: string;
  name: string;
  tagline: string | null;
  color: string | null;
  clusters: unknown;
  displayOrder: number | null;
  fellowCount: number;
};

export default function ReportPodsSection({
  pods,
  highlightedIds,
}: {
  pods: Pod[];
  highlightedIds?: string[];
}) {
  if (pods.length === 0) {
    return (
      <div
        className="bg-surface border border-border p-8 text-center"
        style={{ borderRadius: 2 }}
      >
        <p className="text-muted text-sm">No pods available.</p>
      </div>
    );
  }

  const hlSet = new Set(highlightedIds || []);
  const totalFellows = pods.reduce((s, p) => s + p.fellowCount, 0);

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        {pods.length} investment thesis pods — {totalFellows} fellows assigned
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pods.map((pod) => {
          const clusters = Array.isArray(pod.clusters)
            ? (pod.clusters as string[])
            : [];
          const isHighlighted = hlSet.size > 0 && hlSet.has(pod.id);

          return (
            <div
              key={pod.id}
              className={`bg-surface border p-0 ${
                isHighlighted ? "border-accent/40" : "border-border"
              }`}
              style={{ borderRadius: 2 }}
            >
              {/* Color bar */}
              <div
                className="h-1"
                style={{ backgroundColor: pod.color || "#CC5536" }}
              />

              <div className="p-5">
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
                    <h3 className="text-base font-semibold text-foreground">
                      {pod.name}
                    </h3>
                  </div>
                </div>

                {pod.tagline && (
                  <p className="text-xs text-muted mb-3">{pod.tagline}</p>
                )}

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

                <div className="text-xs text-muted border-t border-border pt-3 mt-3">
                  <span className="font-semibold text-foreground">
                    {pod.fellowCount}
                  </span>{" "}
                  {pod.fellowCount === 1 ? "fellow" : "fellows"} assigned
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
