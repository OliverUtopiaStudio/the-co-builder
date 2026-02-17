type KPIMetric = {
  key: string;
  label: string;
  target: number;
  current: number;
  pipelineNotes: string | null;
};

export default function ReportKPIsSection({ kpis }: { kpis: KPIMetric[] }) {
  if (kpis.length === 0) {
    return (
      <div
        className="bg-surface border border-border p-8 text-center"
        style={{ borderRadius: 2 }}
      >
        <p className="text-muted text-sm">No KPIs available.</p>
      </div>
    );
  }

  const totalCurrent = kpis.reduce((s, k) => s + k.current, 0);
  const totalTarget = kpis.reduce((s, k) => s + k.target, 0);

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        Year 1 targets — {totalCurrent}/{totalTarget} metrics achieved across{" "}
        {kpis.length} KPIs
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const progress =
            kpi.target > 0
              ? Math.round((kpi.current / kpi.target) * 100)
              : 0;

          return (
            <div
              key={kpi.key}
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="label-uppercase text-muted mb-3 text-[10px]">
                {kpi.label}
              </div>

              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-semibold text-foreground">
                  {kpi.key === "equity"
                    ? kpi.current.toFixed(1)
                    : kpi.current}
                </span>
                <span className="text-sm text-muted">
                  / {kpi.target}
                  {kpi.key === "equity" ? "M" : ""}
                </span>
              </div>

              <div
                className="h-1.5 bg-background overflow-hidden mb-3"
                style={{ borderRadius: 1 }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor:
                      progress >= 100 ? "#2E7D32" : "#CC5536",
                    borderRadius: 1,
                  }}
                />
              </div>

              <div className="text-xs text-muted mb-2">
                {progress}% of target
              </div>

              {kpi.pipelineNotes && (
                <div className="text-[11px] text-muted leading-relaxed border-t border-border pt-2 mt-2">
                  {kpi.pipelineNotes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
