"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getReportConfig,
  updateReportSection,
  getReportFellowOptions,
  getReportPodOptions,
} from "@/app/actions/report-config";

type SectionConfig = {
  id: string;
  sectionKey: string;
  visible: boolean;
  displayOrder: number | null;
  narrativeTitle: string | null;
  narrativeText: string | null;
  highlightedIds: unknown;
  highlightMode: string | null;
  updatedAt: Date;
  updatedBy: string | null;
};

type FellowOption = { id: string; fullName: string | null };
type PodOption = { id: string; name: string };

const SECTION_LABELS: Record<string, string> = {
  kpis: "KPI Scoreboard",
  pods: "Investment Pods",
  fellows: "Fellow Portfolio",
  pipeline: "Recruitment Pipeline",
  impact: "Impact Metrics",
};

const SECTIONS_WITH_HIGHLIGHTS = new Set(["pods", "fellows"]);

export default function ReportConfigPage() {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [fellowOptions, setFellowOptions] = useState<FellowOption[]>([]);
  const [podOptions, setPodOptions] = useState<PodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Local draft state per section
  const [drafts, setDrafts] = useState<Record<string, Partial<SectionConfig>>>(
    {}
  );

  useEffect(() => {
    Promise.all([getReportConfig(), getReportFellowOptions(), getReportPodOptions()])
      .then(([config, fellows, pods]) => {
        setSections(config as SectionConfig[]);
        setFellowOptions(fellows as FellowOption[]);
        setPodOptions(pods as PodOption[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getDraft(key: string, section: SectionConfig) {
    return { ...section, ...drafts[key] };
  }

  function patchDraft(key: string, patch: Partial<SectionConfig>) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function handleSave(sectionKey: string) {
    const section = sections.find((s) => s.sectionKey === sectionKey);
    if (!section) return;
    const draft = getDraft(sectionKey, section);

    startTransition(async () => {
      await updateReportSection(sectionKey, {
        visible: draft.visible,
        narrativeTitle: draft.narrativeTitle || null,
        narrativeText: draft.narrativeText || null,
        highlightedIds: Array.isArray(draft.highlightedIds)
          ? (draft.highlightedIds as string[])
          : [],
        highlightMode: draft.highlightMode || "all",
      });
      // Refresh
      const updated = await getReportConfig();
      setSections(updated as SectionConfig[]);
      // Clear draft for this section
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
      setSavedKey(sectionKey);
      setTimeout(() => setSavedKey(null), 2000);
    });
  }

  function toggleHighlight(sectionKey: string, itemId: string, current: unknown) {
    const arr = Array.isArray(current) ? (current as string[]) : [];
    const next = arr.includes(itemId)
      ? arr.filter((id) => id !== itemId)
      : [...arr, itemId];
    patchDraft(sectionKey, { highlightedIds: next } as Partial<SectionConfig>);
  }

  if (loading) {
    return <div className="text-muted text-sm">Loading report config...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label-uppercase text-muted mb-2">Studio OS</div>
            <h1 className="text-2xl font-medium text-foreground">
              Stakeholder Report
            </h1>
            <p className="text-sm text-muted mt-1">
              Curate what stakeholders see on the report page
            </p>
          </div>
          <a
            href="/report"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent border border-accent/30 hover:bg-accent/5 transition-colors shrink-0"
            style={{ borderRadius: 2 }}
          >
            Preview Report &rarr;
          </a>
        </div>
      </div>

      {/* Section cards */}
      <div className="space-y-6">
        {sections.map((section) => {
          const draft = getDraft(section.sectionKey, section);
          const hasDraft = !!drafts[section.sectionKey];
          const justSaved = savedKey === section.sectionKey;
          const hasHighlights = SECTIONS_WITH_HIGHLIGHTS.has(
            section.sectionKey
          );
          const options =
            section.sectionKey === "fellows" ? fellowOptions : podOptions;
          const highlightedArr = Array.isArray(draft.highlightedIds)
            ? (draft.highlightedIds as string[])
            : [];

          return (
            <div
              key={section.sectionKey}
              className="bg-surface border border-border overflow-hidden"
              style={{ borderRadius: 2 }}
            >
              {/* Section header bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.visible}
                      onChange={(e) =>
                        patchDraft(section.sectionKey, {
                          visible: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-checked:bg-accent rounded-full peer-focus:ring-2 peer-focus:ring-accent/20 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <span className="text-sm font-semibold text-foreground">
                    {SECTION_LABELS[section.sectionKey] || section.sectionKey}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {justSaved && (
                    <span className="text-xs text-green-600 font-medium">
                      Saved
                    </span>
                  )}
                  <button
                    onClick={() => handleSave(section.sectionKey)}
                    disabled={!hasDraft || isPending}
                    className="px-3 py-1.5 text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-30"
                    style={{ borderRadius: 2 }}
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Section body */}
              <div className="p-5 space-y-4">
                {/* Narrative Title */}
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                    Narrative Title
                  </label>
                  <input
                    type="text"
                    value={draft.narrativeTitle || ""}
                    onChange={(e) =>
                      patchDraft(section.sectionKey, {
                        narrativeTitle: e.target.value,
                      })
                    }
                    placeholder={
                      SECTION_LABELS[section.sectionKey] || "Section title"
                    }
                    className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                    style={{ borderRadius: 2 }}
                  />
                </div>

                {/* Narrative Text */}
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                    Narrative Text
                  </label>
                  <textarea
                    value={draft.narrativeText || ""}
                    onChange={(e) =>
                      patchDraft(section.sectionKey, {
                        narrativeText: e.target.value,
                      })
                    }
                    placeholder="Add context for stakeholders about this section..."
                    className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                    style={{ borderRadius: 2 }}
                    rows={3}
                  />
                </div>

                {/* Highlight picker (fellows + pods only) */}
                {hasHighlights && (
                  <>
                    {/* Highlight mode */}
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
                        Display Mode
                      </label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode-${section.sectionKey}`}
                            checked={draft.highlightMode !== "highlighted_only"}
                            onChange={() =>
                              patchDraft(section.sectionKey, {
                                highlightMode: "all",
                              })
                            }
                            className="accent-accent"
                          />
                          <span className="text-xs text-foreground">
                            Show all (highlight selected)
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode-${section.sectionKey}`}
                            checked={draft.highlightMode === "highlighted_only"}
                            onChange={() =>
                              patchDraft(section.sectionKey, {
                                highlightMode: "highlighted_only",
                              })
                            }
                            className="accent-accent"
                          />
                          <span className="text-xs text-foreground">
                            Show only selected
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Item checkboxes */}
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">
                        Highlighted{" "}
                        {section.sectionKey === "fellows" ? "Fellows" : "Pods"}
                        {highlightedArr.length > 0 && (
                          <span className="text-accent ml-1">
                            ({highlightedArr.length} selected)
                          </span>
                        )}
                      </label>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border bg-background p-3" style={{ borderRadius: 2 }}>
                        {options.map((opt) => {
                          const label =
                            "fullName" in opt
                              ? (opt as FellowOption).fullName || "Unknown"
                              : (opt as PodOption).name;
                          return (
                            <label
                              key={opt.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={highlightedArr.includes(opt.id)}
                                onChange={() =>
                                  toggleHighlight(
                                    section.sectionKey,
                                    opt.id,
                                    draft.highlightedIds
                                  )
                                }
                                className="accent-accent"
                              />
                              <span className="text-xs text-foreground">
                                {label}
                              </span>
                            </label>
                          );
                        })}
                        {options.length === 0 && (
                          <p className="text-xs text-muted">
                            No{" "}
                            {section.sectionKey === "fellows"
                              ? "fellows"
                              : "pods"}{" "}
                            found
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
