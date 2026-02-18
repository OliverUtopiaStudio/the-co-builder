import Link from "next/link";
import type { LifecycleStage } from "@/lib/onboarding";
import { LIFECYCLE_STAGE_LABELS } from "@/lib/onboarding";

type PortfolioFellow = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  domain: string | null;
  lifecycleStage: string | null;
  ventureCount: number;
  podId?: string | null;
  podName?: string | null;
  podColor?: string | null;
  equityPercentage?: string | null;
  globalPotentialRating?: number | null;
  qatarImpactRating?: number | null;
  experienceProfile?: string | null;
  background?: string | null;
  selectionRationale?: string | null;
  ventures?: Array<{
    name: string;
    alignmentScore: string | null;
    isActive: boolean;
  }>;
};

const STAGE_COLORS: Record<string, string> = {
  onboarding: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  spin_out: "bg-accent/15 text-accent",
  graduated: "bg-accent/20 text-accent",
};

export default function ReportFellowsSection({
  fellows,
  isInternal = false,
  highlightedIds,
}: {
  fellows: PortfolioFellow[];
  isInternal?: boolean;
  highlightedIds?: string[];
}) {
  if (fellows.length === 0) {
    return (
      <div
        className="bg-surface border border-border p-12 text-center text-muted"
        style={{ borderRadius: 2 }}
      >
        No fellows in the portfolio yet.
      </div>
    );
  }

  const hlSet = new Set(highlightedIds || []);

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        {fellows.length} fellows in the Co-Build programme
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fellows.map((fellow) => {
          const isHighlighted = hlSet.size > 0 && hlSet.has(fellow.id);

          if (isInternal) {
            return (
              <div
                key={fellow.id}
                className={`bg-surface border p-5 ${
                  isHighlighted ? "border-accent/40" : "border-border"
                }`}
                style={{ borderRadius: 2 }}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {fellow.avatarUrl ? (
                      <img
                        src={fellow.avatarUrl}
                        alt={fellow.fullName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-medium">
                        {fellow.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Name + Pod badge */}
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {fellow.fullName}
                      </h3>
                      {fellow.podName && (
                        <span
                          className="text-[10px] font-semibold tracking-[0.5px] px-1.5 py-0.5 flex-shrink-0"
                          style={{
                            borderRadius: 2,
                            backgroundColor: fellow.podColor
                              ? `${fellow.podColor}15`
                              : undefined,
                            color: fellow.podColor ?? undefined,
                          }}
                        >
                          {fellow.podName}
                        </span>
                      )}
                    </div>

                    {/* Domain */}
                    {fellow.domain && (
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {fellow.domain}
                      </p>
                    )}

                    {/* Ratings row */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {fellow.qatarImpactRating != null && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground"
                          style={{ borderRadius: 2 }}
                        >
                          Qatar: {fellow.qatarImpactRating}/100
                        </span>
                      )}
                      {fellow.globalPotentialRating != null && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground"
                          style={{ borderRadius: 2 }}
                        >
                          Global: {fellow.globalPotentialRating}/100
                        </span>
                      )}
                      {fellow.equityPercentage &&
                        Number(fellow.equityPercentage) > 0 && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground"
                            style={{ borderRadius: 2 }}
                          >
                            Equity: {fellow.equityPercentage}%
                          </span>
                        )}
                      {fellow.lifecycleStage && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-medium ${
                            STAGE_COLORS[fellow.lifecycleStage] ??
                            "bg-border/50 text-muted"
                          }`}
                          style={{ borderRadius: 2 }}
                        >
                          {LIFECYCLE_STAGE_LABELS[
                            fellow.lifecycleStage as LifecycleStage
                          ] ?? fellow.lifecycleStage}
                        </span>
                      )}
                    </div>

                    {/* Bio / Background */}
                    {(fellow.background || fellow.bio) && (
                      <p className="text-xs text-muted mt-2 line-clamp-2">
                        {fellow.background || fellow.bio}
                      </p>
                    )}

                    {/* Ventures list */}
                    {fellow.ventures && fellow.ventures.length > 0 && (
                      <div className="border-t border-border pt-2 mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {fellow.ventures.map((venture) => (
                            <span
                              key={venture.name}
                              className="text-[10px] px-1.5 py-0.5 bg-background border border-border"
                              style={{ borderRadius: 2 }}
                            >
                              {venture.name}
                              {venture.alignmentScore && (
                                <span className="text-muted ml-1">
                                  {venture.alignmentScore}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LinkedIn */}
                    {fellow.linkedinUrl && (
                      <a
                        href={fellow.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline mt-2 inline-block"
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={fellow.id}
              href={`/report/${fellow.id}`}
              className={`block bg-surface border p-5 hover:border-accent/30 transition-all ${
                isHighlighted ? "border-accent/40" : "border-border"
              }`}
              style={{ borderRadius: 2 }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {fellow.avatarUrl ? (
                    <img
                      src={fellow.avatarUrl}
                      alt={fellow.fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-medium">
                      {fellow.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground truncate">
                    {fellow.fullName}
                  </h3>
                  {fellow.domain && (
                    <p className="text-muted text-xs mt-0.5 truncate">
                      {fellow.domain}
                    </p>
                  )}
                  {fellow.bio && (
                    <p className="text-muted text-sm mt-2 line-clamp-2">
                      {fellow.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {fellow.lifecycleStage && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-medium ${
                          STAGE_COLORS[fellow.lifecycleStage] ??
                          "bg-border/50 text-muted"
                        }`}
                        style={{ borderRadius: 2 }}
                      >
                        {LIFECYCLE_STAGE_LABELS[
                          fellow.lifecycleStage as LifecycleStage
                        ] ?? fellow.lifecycleStage}
                      </span>
                    )}
                    {fellow.ventureCount > 0 && (
                      <span className="text-xs text-muted">
                        {fellow.ventureCount} venture
                        {fellow.ventureCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {fellow.linkedinUrl && (
                      <a
                        href={fellow.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
