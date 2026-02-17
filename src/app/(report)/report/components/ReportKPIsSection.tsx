import { FIVE_YEAR_TARGETS, formatKPIValue } from "@/data/five-year-kpis";

type KPIMetric = {
  key: string;
  label: string;
  target: number;
  current: number;
  pipelineNotes: string | null;
};

const YEARS = [1, 2, 3, 4, 5] as const;
type YearKey = "year1" | "year2" | "year3" | "year4" | "year5";

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

  return (
    <div className="space-y-8">
      {/* Year 1 Progress Cards */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          Year 1 — Current Progress
        </h3>
        <p className="text-xs text-muted mb-4">
          Live tracking against Year 1 targets
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
                      : kpi.key === "revenue"
                        ? formatKPIValue("revenue", kpi.current)
                        : kpi.current}
                  </span>
                  <span className="text-sm text-muted">
                    / {formatKPIValue(kpi.key, kpi.target)}
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

      {/* 5-Year Roadmap Table */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          5-Year KPI Roadmap
        </h3>
        <p className="text-xs text-muted mb-4">
          Cumulative targets across the full programme horizon
        </p>

        <div
          className="bg-surface border border-border overflow-x-auto"
          style={{ borderRadius: 2 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-[10px] label-uppercase text-muted font-medium w-[200px]">
                  KPI
                </th>
                {YEARS.map((year) => (
                  <th
                    key={year}
                    className={`text-right py-3 px-4 text-[10px] label-uppercase font-medium ${
                      year === 1 ? "text-foreground" : "text-muted"
                    }`}
                  >
                    Year {year}
                    {year === 1 && (
                      <span className="ml-1 text-[9px] text-muted font-normal">
                        (active)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi, idx) => {
                const targets = FIVE_YEAR_TARGETS[kpi.key];
                const progress =
                  kpi.target > 0
                    ? Math.round((kpi.current / kpi.target) * 100)
                    : 0;

                return (
                  <tr
                    key={kpi.key}
                    className={
                      idx < kpis.length - 1 ? "border-b border-border" : ""
                    }
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground text-xs">
                        {kpi.label}
                      </div>
                    </td>
                    {YEARS.map((year) => {
                      const yearKey = `year${year}` as YearKey;
                      const target = targets
                        ? targets[yearKey]
                        : year === 1
                          ? kpi.target
                          : null;

                      if (year === 1) {
                        return (
                          <td key={year} className="py-3 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-baseline gap-1">
                                <span className="font-semibold text-foreground">
                                  {kpi.key === "equity"
                                    ? kpi.current.toFixed(1)
                                    : kpi.key === "revenue"
                                      ? formatKPIValue("revenue", kpi.current)
                                      : kpi.current}
                                </span>
                                <span className="text-muted text-[11px]">
                                  / {formatKPIValue(kpi.key, kpi.target)}
                                </span>
                              </div>
                              <div
                                className="w-16 h-1 bg-background overflow-hidden"
                                style={{ borderRadius: 1 }}
                              >
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${Math.min(progress, 100)}%`,
                                    backgroundColor:
                                      progress >= 100 ? "#2E7D32" : "#CC5536",
                                    borderRadius: 1,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={year}
                          className="py-3 px-4 text-right text-muted"
                        >
                          {target !== null
                            ? formatKPIValue(kpi.key, target)
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
