"use client";

import { ExternalLink } from "lucide-react";

type Venture = {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  googleDriveUrl: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  "00": "The Invention Gate",
  "01": "Problem Deep Dive",
  "02": "Customer & Validation",
  "03": "Solution Design",
  "04": "Build & Test",
  "05": "Launch",
};

export default function VentureOverview({
  venture,
  fellow,
}: {
  venture: Venture | null;
  fellow: { fullName: string; websiteUrl: string | null; linkedinUrl: string | null };
}) {
  if (!venture) {
    return (
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <p className="text-muted text-sm italic">
          No active venture. Create one to get started.
        </p>
      </div>
    );
  }

  const stageLabel = venture.currentStage
    ? STAGE_LABELS[venture.currentStage] || `Stage ${venture.currentStage}`
    : null;

  return (
    <div
      className="bg-surface border border-border p-6"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-medium">{venture.name}</h2>
          {venture.description && (
            <p className="text-muted text-sm mt-1">{venture.description}</p>
          )}
        </div>
        {stageLabel && (
          <span
            className="text-[10px] px-2 py-1 bg-accent/10 text-accent font-medium shrink-0"
            style={{ borderRadius: 2 }}
          >
            {stageLabel}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
        {venture.industry && (
          <span>
            <span className="text-foreground/50">Industry:</span>{" "}
            {venture.industry}
          </span>
        )}
        {venture.googleDriveUrl && (
          <a
            href={venture.googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Google Drive <ExternalLink size={10} />
          </a>
        )}
        {fellow.websiteUrl && (
          <a
            href={fellow.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Website <ExternalLink size={10} />
          </a>
        )}
        {fellow.linkedinUrl && (
          <a
            href={fellow.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            LinkedIn <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
