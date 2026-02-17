type PipelineRole = {
  id: string;
  roleTitle: string;
  department: string | null;
  applicants: number | null;
  leads: number | null;
  review: number | null;
  screening: number | null;
  interview: number | null;
  offer: number | null;
  hired: number | null;
};

const STAGES = [
  { key: "leads", label: "Leads" },
  { key: "review", label: "Review" },
  { key: "screening", label: "Screen" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
] as const;

export default function ReportPipelineSection({
  pipeline,
}: {
  pipeline: PipelineRole[];
}) {
  if (pipeline.length === 0) {
    return (
      <div
        className="bg-surface border border-border p-8 text-center"
        style={{ borderRadius: 2 }}
      >
        <p className="text-muted text-sm">No pipeline data available.</p>
      </div>
    );
  }

  const totalApplicants = pipeline.reduce(
    (s, r) => s + (r.applicants || 0),
    0
  );
  const totalHired = pipeline.reduce((s, r) => s + (r.hired || 0), 0);

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        {totalApplicants} total applicants — {totalHired} hired —{" "}
        {pipeline.length} roles tracked
      </p>

      <div className="space-y-4">
        {pipeline.map((role) => {
          const maxStageValue = Math.max(
            role.leads || 0,
            role.review || 0,
            role.screening || 0,
            role.interview || 0,
            role.offer || 0,
            role.hired || 0,
            1
          );

          return (
            <div
              key={role.id}
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {role.roleTitle}
                  </h3>
                  {role.department && (
                    <div className="text-xs text-muted">{role.department}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">
                    {role.applicants}
                  </div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">
                    Applicants
                  </div>
                </div>
              </div>

              {/* Funnel visualization */}
              <div className="grid grid-cols-6 gap-2">
                {STAGES.map((stage) => {
                  const value =
                    (role[stage.key as keyof PipelineRole] as number) || 0;
                  const height =
                    maxStageValue > 0
                      ? Math.max((value / maxStageValue) * 40, 4)
                      : 4;
                  return (
                    <div key={stage.key} className="text-center">
                      <div
                        className="flex items-end justify-center mb-1"
                        style={{ height: 44 }}
                      >
                        <div
                          className="w-full max-w-[40px]"
                          style={{
                            height,
                            backgroundColor:
                              value > 0 ? "#CC5536" : "#E3E1E2",
                            borderRadius: 1,
                            opacity:
                              value > 0
                                ? 0.7 + (value / maxStageValue) * 0.3
                                : 0.3,
                          }}
                        />
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {value}
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">
                        {stage.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
