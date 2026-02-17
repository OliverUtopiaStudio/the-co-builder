"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LIFECYCLE_STAGE_LABELS } from "@/lib/onboarding";
import type { LifecycleStage } from "@/lib/onboarding";

interface FellowProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  domain: string | null;
  background: string | null;
  lifecycleStage: LifecycleStage | null;
  googleDriveUrl: string | null;
  websiteUrl: string | null;
  resourceLinks: ResourceLinks | null;
  ventures: Venture[];
}

interface ResourceLinks {
  prd?: string;
  contextualDocs?: string[];
  notes?: string;
  other?: Array<{ label: string; url: string }>;
}

interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  alignmentNotes: string | null;
  googleDriveUrl: string | null;
  createdAt: Date;
}

const STAGE_COLORS: Record<string, string> = {
  onboarding: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  spin_out: "bg-accent/15 text-accent",
  graduated: "bg-accent/20 text-accent",
};

export default function ReportFellowDetailPage() {
  const params = useParams();
  const fellowId = params.fellowId as string;

  const [fellow, setFellow] = useState<FellowProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFellow() {
      try {
        const res = await fetch(`/api/fellows/${fellowId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Fellow not found");
          } else {
            throw new Error("Failed to load fellow");
          }
          return;
        }
        const data = await res.json();
        setFellow(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fellow");
      } finally {
        setLoading(false);
      }
    }
    loadFellow();
  }, [fellowId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface border border-border mb-4" style={{ borderRadius: 2 }} />
          <div className="h-64 bg-surface border border-border" style={{ borderRadius: 2 }} />
        </div>
      </div>
    );
  }

  if (error || !fellow) {
    return (
      <div className="space-y-6">
        <Link
          href="/report"
          className="text-sm text-muted hover:text-foreground inline-block"
        >
          &larr; Back to Portfolio
        </Link>
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-300"
          style={{ borderRadius: 2 }}
        >
          {error || "Fellow not found"}
        </div>
      </div>
    );
  }

  const stageLabel = fellow.lifecycleStage
    ? LIFECYCLE_STAGE_LABELS[fellow.lifecycleStage]
    : null;
  const stageColor = fellow.lifecycleStage
    ? STAGE_COLORS[fellow.lifecycleStage] ?? "bg-border/50 text-muted"
    : "bg-border/50 text-muted";

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/report"
        className="text-sm text-muted hover:text-foreground inline-block"
      >
        &larr; Back to Portfolio
      </Link>

      {/* Header */}
      <div
        className="bg-surface border border-border p-8"
        style={{ borderRadius: 2 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {fellow.avatarUrl ? (
              <img
                src={fellow.avatarUrl}
                alt={fellow.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-accent text-3xl font-medium"
                style={{ borderRadius: 2 }}
              >
                {fellow.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-medium mb-2">{fellow.fullName}</h1>
                {fellow.domain && (
                  <p className="text-muted text-lg mb-3">{fellow.domain}</p>
                )}
                {fellow.background && (
                  <p className="text-muted text-sm mb-4">{fellow.background}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {stageLabel && (
                  <span
                    className={`text-xs px-2 py-1 uppercase tracking-wide font-medium ${stageColor}`}
                    style={{ borderRadius: 2 }}
                  >
                    {stageLabel}
                  </span>
                )}
                {fellow.linkedinUrl && (
                  <a
                    href={fellow.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    LinkedIn →
                  </a>
                )}
              </div>
            </div>

            {fellow.bio && (
              <p className="text-foreground mt-4 leading-relaxed">{fellow.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Resource Links */}
      {(fellow.googleDriveUrl || fellow.websiteUrl || fellow.resourceLinks) && (
        <div
          className="bg-surface border border-border p-6"
          style={{ borderRadius: 2 }}
        >
          <h2 className="text-lg font-medium mb-4">Resources & Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fellow.googleDriveUrl && (
              <a
                href={fellow.googleDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <svg
                  className="w-5 h-5 text-muted group-hover:text-accent"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.71 2.5L2.5 7.71l5.21 5.21L13.13 7.7 7.71 2.5zm8.79 0L8.29 7.71l5.21 5.21 5.21-5.21L16.5 2.5zM2.5 16.29l5.21 5.21L13.13 16.3 7.92 11.09 2.5 16.29zm18.21 0l-5.21-5.21-5.21 5.21 5.21 5.21 5.21-5.21z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-accent">
                    Google Drive
                  </div>
                  <div className="text-xs text-muted truncate">
                    {fellow.googleDriveUrl.replace(/^https?:\/\//, "").substring(0, 40)}...
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {fellow.websiteUrl && (
              <a
                href={fellow.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <svg
                  className="w-5 h-5 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-accent">
                    Website
                  </div>
                  <div className="text-xs text-muted truncate">
                    {fellow.websiteUrl.replace(/^https?:\/\//, "").substring(0, 40)}...
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {fellow.resourceLinks?.prd && (
              <a
                href={fellow.resourceLinks.prd}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <svg
                  className="w-5 h-5 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-accent">
                    PRD
                  </div>
                  <div className="text-xs text-muted truncate">
                    Product Requirements Document
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {fellow.resourceLinks?.notes && (
              <a
                href={fellow.resourceLinks.notes}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                style={{ borderRadius: 2 }}
              >
                <svg
                  className="w-5 h-5 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-accent">
                    Notes
                  </div>
                  <div className="text-xs text-muted truncate">
                    Additional notes and documentation
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-muted group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {fellow.resourceLinks?.contextualDocs &&
              fellow.resourceLinks.contextualDocs.length > 0 &&
              fellow.resourceLinks.contextualDocs.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                  style={{ borderRadius: 2 }}
                >
                  <svg
                    className="w-5 h-5 text-muted group-hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-accent">
                      Contextual Doc {idx + 1}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {doc.replace(/^https?:\/\//, "").substring(0, 40)}...
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted group-hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}

            {fellow.resourceLinks?.other &&
              fellow.resourceLinks.other.length > 0 &&
              fellow.resourceLinks.other.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-border hover:border-accent/30 transition-colors group"
                  style={{ borderRadius: 2 }}
                >
                  <svg
                    className="w-5 h-5 text-muted group-hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-accent">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {link.url.replace(/^https?:\/\//, "").substring(0, 40)}...
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted group-hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Ventures */}
      <div>
        <h2 className="text-xl font-medium mb-4">
          Ventures ({fellow.ventures.length})
        </h2>

        {fellow.ventures.length === 0 ? (
          <div
            className="bg-surface border border-border p-12 text-center text-muted"
            style={{ borderRadius: 2 }}
          >
            No ventures yet.
          </div>
        ) : (
          <div className="space-y-4">
            {fellow.ventures.map((venture) => (
              <div
                key={venture.id}
                className="bg-surface border border-border p-6 hover:border-accent/30 transition-colors"
                style={{ borderRadius: 2 }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{venture.name}</h3>
                    {venture.description && (
                      <p className="text-muted mb-4 leading-relaxed">
                        {venture.description}
                      </p>
                    )}
                    {venture.alignmentNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-medium text-muted mb-1">
                          Qatar Ecosystem Impact
                        </p>
                        <p className="text-sm text-foreground">
                          {venture.alignmentNotes}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {venture.industry && (
                        <span
                          className="text-xs px-2 py-1 bg-accent/10 text-accent font-medium"
                          style={{ borderRadius: 2 }}
                        >
                          {venture.industry}
                        </span>
                      )}
                      {venture.currentStage && (
                        <span className="text-xs px-2 py-1 bg-border/50 text-muted">
                          Stage {venture.currentStage}
                        </span>
                      )}
                    </div>
                    {venture.googleDriveUrl && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <a
                          href={venture.googleDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7.71 2.5L2.5 7.71l5.21 5.21L13.13 7.7 7.71 2.5zm8.79 0L8.29 7.71l5.21 5.21 5.21-5.21L16.5 2.5zM2.5 16.29l5.21 5.21L13.13 16.3 7.92 11.09 2.5 16.29zm18.21 0l-5.21-5.21-5.21 5.21 5.21 5.21 5.21-5.21z"/>
                          </svg>
                          Venture Google Drive Folder
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
