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
};

const STAGE_COLORS: Record<string, string> = {
  onboarding: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  spin_out: "bg-accent/15 text-accent",
  graduated: "bg-accent/20 text-accent",
};

export default function ReportFellowsSection({
  fellows,
  highlightedIds,
}: {
  fellows: PortfolioFellow[];
  highlightedIds?: string[];
  isInternal?: boolean;
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
