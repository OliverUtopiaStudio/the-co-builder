"use client";

import { useEffect, useState } from "react";
import NarrativeBlock from "./components/NarrativeBlock";
import ReportKPIsSection from "./components/ReportKPIsSection";
import ReportPodsSection from "./components/ReportPodsSection";
import ReportFellowsSection from "./components/ReportFellowsSection";
import ReportPipelineSection from "./components/ReportPipelineSection";
import ReportImpactSection from "./components/ReportImpactSection";

type SectionConfig = {
  sectionKey: string;
  visible: boolean;
  displayOrder: number | null;
  narrativeTitle: string | null;
  narrativeText: string | null;
  highlightedIds: unknown;
  highlightMode: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type ReportData = {
  config: Record<string, SectionConfig>;
  kpis?: any[];
  pods?: any[];
  fellows?: any[];
  pipeline?: any[];
  impact?: any;
};

const DEFAULT_TITLES: Record<string, string> = {
  kpis: "Key Performance Indicators",
  pods: "Investment Thesis Pods",
  fellows: "Fellow Portfolio",
  pipeline: "Recruitment Pipeline",
  impact: "Impact Metrics",
};

// Section rendering map
const SECTION_COMPONENTS: Record<
  string,
  (data: ReportData, config: SectionConfig) => React.ReactNode
> = {
  kpis: (data) =>
    data.kpis ? <ReportKPIsSection kpis={data.kpis} /> : null,
  pods: (data, config) =>
    data.pods ? (
      <ReportPodsSection
        pods={data.pods}
        highlightedIds={
          Array.isArray(config.highlightedIds)
            ? (config.highlightedIds as string[])
            : undefined
        }
      />
    ) : null,
  fellows: (data, config) =>
    data.fellows ? (
      <ReportFellowsSection
        fellows={data.fellows}
        highlightedIds={
          Array.isArray(config.highlightedIds)
            ? (config.highlightedIds as string[])
            : undefined
        }
      />
    ) : null,
  pipeline: (data) =>
    data.pipeline ? (
      <ReportPipelineSection pipeline={data.pipeline} />
    ) : null,
  impact: (data) =>
    data.impact ? <ReportImpactSection impact={data.impact} /> : null,
};

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/report/data")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-medium mb-2">Stakeholder Report</h1>
          <p className="text-muted text-sm">Loading report data...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div
              className="h-6 w-48 bg-surface border border-border animate-pulse"
              style={{ borderRadius: 2 }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-32 bg-surface border border-border animate-pulse"
                  style={{ borderRadius: 2 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium mb-2">Stakeholder Report</h1>
          <p className="text-muted text-sm">
            The Utopia Studio programme overview
          </p>
        </div>
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-300"
          style={{ borderRadius: 2 }}
        >
          {error || "Failed to load report data"}
        </div>
      </div>
    );
  }

  // Sort visible sections by displayOrder
  const visibleSections = Object.values(data.config)
    .filter((c) => c.visible)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium mb-2">Stakeholder Report</h1>
        <p className="text-muted text-sm">
          The Utopia Studio programme overview
        </p>
      </div>

      {visibleSections.length === 0 && (
        <div
          className="bg-surface border border-border p-12 text-center text-muted"
          style={{ borderRadius: 2 }}
        >
          No report sections are currently configured.
        </div>
      )}

      {visibleSections.map((section) => {
        const renderer = SECTION_COMPONENTS[section.sectionKey];
        if (!renderer) return null;
        const content = renderer(data, section);
        if (!content) return null;

        return (
          <section key={section.sectionKey}>
            <NarrativeBlock
              title={section.narrativeTitle}
              text={section.narrativeText}
            />
            {!section.narrativeTitle && !section.narrativeText && (
              <h2 className="text-xl font-medium mb-4 text-foreground">
                {DEFAULT_TITLES[section.sectionKey] || section.sectionKey}
              </h2>
            )}
            {content}
          </section>
        );
      })}
    </div>
  );
}
