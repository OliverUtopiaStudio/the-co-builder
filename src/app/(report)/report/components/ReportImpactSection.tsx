type ImpactData = {
  avgQatarImpact: number;
  avgGlobalPotential: number;
  avgAlignmentScore: number;
  qatarRatingCount: number;
  globalRatingCount: number;
  alignmentScoreCount: number;
  totalFellows: number;
  totalVentures: number;
  activeVentures: number;
  assetCompletionRate: number;
  lifecycleDistribution: Record<string, number>;
  ventureDetails?: Array<{
    id: string;
    name: string;
    podAlignmentScore: string | null;
    isActive: boolean;
  }>;
  podBreakdown?: Array<{
    podId: string;
    podName: string;
    podColor: string | null;
    fellowCount: number;
    avgQatarImpact: number | null;
    avgGlobalPotential: number | null;
  }>;
  ratingDistribution?: {
    qatar: number[];
    global: number[];
  };
};

const LIFECYCLE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  building: "Building",
  spin_out: "Spin-Out",
  graduated: "Graduated",
};

const LIFECYCLE_COLORS: Record<string, string> = {
  onboarding: "#CC5536",
  building: "#D97706",
  spin_out: "#2563EB",
  graduated: "#2E7D32",
};

function MetricCard({
  label,
  value,
  max,
  suffix,
  count,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  count?: number;
}) {
  const progress = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      className="bg-surface border border-border p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase text-muted mb-3 text-[10px]">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-3xl font-semibold text-foreground">
          {value}
        </span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      <div
        className="h-1.5 bg-background overflow-hidden mb-3"
        style={{ borderRadius: 1 }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: progress >= 75 ? "#2E7D32" : "#CC5536",
            borderRadius: 1,
          }}
        />
      </div>
      {count !== undefined && (
        <div className="text-xs text-muted">
          Based on {count} rating{count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default function ReportImpactSection({
  impact,
  isInternal = false,
}: {
  impact: ImpactData;
  isInternal?: boolean;
}) {
  const lifecycleEntries = Object.entries(impact.lifecycleDistribution);
  const totalInDist = lifecycleEntries.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Avg Qatar Impact"
          value={impact.avgQatarImpact}
          max={100}
          suffix="/ 100"
          count={impact.qatarRatingCount}
        />
        <MetricCard
          label="Avg Global Potential"
          value={impact.avgGlobalPotential}
          max={100}
          suffix="/ 100"
          count={impact.globalRatingCount}
        />
        <MetricCard
          label="Avg Thesis Alignment"
          value={impact.avgAlignmentScore}
          max={100}
          suffix="/ 100"
          count={impact.alignmentScoreCount}
        />
        <MetricCard
          label="Asset Completion"
          value={impact.assetCompletionRate}
          max={100}
          suffix="%"
        />
      </div>

      {/* Lifecycle distribution */}
      {lifecycleEntries.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase text-muted mb-3 text-[10px]">
            Fellow Lifecycle Distribution
          </div>

          {/* Stacked bar */}
          <div
            className="h-6 flex overflow-hidden mb-3"
            style={{ borderRadius: 2 }}
          >
            {lifecycleEntries.map(([stage, count]) => {
              const pct = totalInDist > 0 ? (count / totalInDist) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage}
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      LIFECYCLE_COLORS[stage] || "#9CA3AF",
                  }}
                  title={`${LIFECYCLE_LABELS[stage] || stage}: ${count}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {lifecycleEntries.map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5"
                  style={{
                    backgroundColor:
                      LIFECYCLE_COLORS[stage] || "#9CA3AF",
                    borderRadius: 1,
                  }}
                />
                <span className="text-xs text-muted">
                  {LIFECYCLE_LABELS[stage] || stage}:{" "}
                  <span className="font-semibold text-foreground">
                    {count}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key numbers */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="bg-surface border border-border p-4 text-center"
          style={{ borderRadius: 2 }}
        >
          <div className="text-2xl font-semibold text-foreground">
            {impact.totalFellows}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Total Fellows
          </div>
        </div>
        <div
          className="bg-surface border border-border p-4 text-center"
          style={{ borderRadius: 2 }}
        >
          <div className="text-2xl font-semibold text-foreground">
            {impact.activeVentures}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Active Ventures
          </div>
        </div>
        <div
          className="bg-surface border border-border p-4 text-center"
          style={{ borderRadius: 2 }}
        >
          <div className="text-2xl font-semibold text-foreground">
            {impact.totalVentures}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Total Ventures
          </div>
        </div>
      </div>

      {/* Per-pod breakdown (internal only) */}
      {isInternal && impact.podBreakdown && impact.podBreakdown.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase text-muted mb-3 text-[10px]">
            Impact by Pod
          </div>
          <div className="space-y-3">
            {impact.podBreakdown.map((pod) => (
              <div key={pod.podId} className="flex items-center gap-4">
                <div
                  className="w-2 h-8 flex-shrink-0"
                  style={{
                    backgroundColor: pod.podColor || "#CC5536",
                    borderRadius: 1,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {pod.podName}
                  </div>
                  <div className="text-xs text-muted">
                    {pod.fellowCount} fellows
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-right">
                  <div>
                    <div className="text-muted">Qatar</div>
                    <div className="font-semibold text-foreground">
                      {pod.avgQatarImpact != null
                        ? pod.avgQatarImpact
                        : "\u2014"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted">Global</div>
                    <div className="font-semibold text-foreground">
                      {pod.avgGlobalPotential != null
                        ? pod.avgGlobalPotential
                        : "\u2014"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating distribution histograms (internal only) */}
      {isInternal && impact.ratingDistribution && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["qatar", "global"] as const).map((type) => {
            const buckets = impact.ratingDistribution![type];
            const maxBucket = Math.max(...buckets, 1);
            const labels = ["0-19", "20-39", "40-59", "60-79", "80-100"];
            return (
              <div
                key={type}
                className="bg-surface border border-border p-5"
                style={{ borderRadius: 2 }}
              >
                <div className="label-uppercase text-muted mb-3 text-[10px]">
                  {type === "qatar" ? "Qatar Impact" : "Global Potential"}{" "}
                  Distribution
                </div>
                <div
                  className="flex items-end gap-2"
                  style={{ height: 80 }}
                >
                  {buckets.map((count, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full"
                        style={{
                          height: Math.max((count / maxBucket) * 60, 2),
                          backgroundColor:
                            count > 0 ? "#CC5536" : "#E3E1E2",
                          borderRadius: 1,
                          opacity:
                            count > 0
                              ? 0.7 + (count / maxBucket) * 0.3
                              : 0.3,
                        }}
                      />
                      <div className="text-[9px] text-muted mt-1">
                        {labels[i]}
                      </div>
                      <div className="text-[10px] font-semibold text-foreground">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Venture alignment table (internal only) */}
      {isInternal &&
        impact.ventureDetails &&
        impact.ventureDetails.length > 0 && (
          <div
            className="bg-surface border border-border p-5"
            style={{ borderRadius: 2 }}
          >
            <div className="label-uppercase text-muted mb-3 text-[10px]">
              Venture Alignment Scores
            </div>
            <div className="space-y-1.5">
              {impact.ventureDetails
                .sort(
                  (a, b) =>
                    Number(b.podAlignmentScore || 0) -
                    Number(a.podAlignmentScore || 0)
                )
                .map((v) => {
                  const score = v.podAlignmentScore
                    ? Number(v.podAlignmentScore)
                    : null;
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 text-xs"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          v.isActive ? "bg-green-500" : "bg-border"
                        }`}
                      />
                      <span className="flex-1 text-foreground truncate">
                        {v.name}
                      </span>
                      {score != null ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-1.5 bg-background overflow-hidden"
                            style={{ borderRadius: 1 }}
                          >
                            <div
                              className="h-full"
                              style={{
                                width: `${Math.min(score, 100)}%`,
                                backgroundColor:
                                  score >= 80
                                    ? "#2E7D32"
                                    : score >= 60
                                      ? "#D97706"
                                      : "#CC5536",
                                borderRadius: 1,
                              }}
                            />
                          </div>
                          <span className="text-muted w-8 text-right">
                            {score.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">{"\u2014"}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
    </div>
  );
}
