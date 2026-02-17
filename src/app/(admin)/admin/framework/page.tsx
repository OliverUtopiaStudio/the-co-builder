"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { stages } from "@/lib/data";
import { getWorkflowForAsset } from "@/lib/questions";
import type { Asset, Stage } from "@/lib/data";
import type { AssetWorkflow, Question, WorkflowStep } from "@/lib/questions";
import { useFrameworkEdits } from "./hooks/useFrameworkEdits";
import { useRealTimeFramework } from "./hooks/useRealTimeFramework";
import MigrationDialog, { useMigrationDialog } from "./components/MigrationDialog";
import ConflictResolutionDialog from "./components/ConflictResolutionDialog";
import VersionHistory from "./components/VersionHistory";
import { notifyFellowsOfFrameworkUpdate } from "@/app/actions/framework";

// ─── Types ───────────────────────────────────────────────────────

interface AssetEdits {
  title?: string;
  purpose?: string;
  coreQuestion?: string;
  checklist?: Record<string, string>;
  questions?: Record<
    string,
    { label?: string; description?: string }
  >;
}

interface AllEdits {
  [assetNumber: number]: AssetEdits;
}

// ─── Helpers ─────────────────────────────────────────────────────

function hasEdits(edits: AssetEdits | undefined): boolean {
  if (!edits) return false;
  if (edits.title || edits.purpose || edits.coreQuestion) return true;
  if (edits.checklist && Object.keys(edits.checklist).length > 0) return true;
  if (edits.questions && Object.keys(edits.questions).length > 0) return true;
  return false;
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Auto-grow Textarea Component ────────────────────────────────

function AutoTextarea({
  value,
  onChange,
  placeholder,
  readOnly,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed ${
        readOnly
          ? "cursor-default text-muted"
          : "border border-border px-3 py-2 focus:outline-none focus:border-accent/50"
      } ${className || ""}`}
      style={{ borderRadius: readOnly ? 0 : 2 }}
    />
  );
}

// ─── Chevron Icon ────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`transition-transform duration-150 ${
        open ? "rotate-90" : ""
      }`}
    >
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Edit Icon ───────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-muted"
    >
      <path
        d="M8.5 1.5l2 2M1 11l.5-2L9 1.5l2 2L3.5 11 1 11z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Modified Badge ──────────────────────────────────────────────

function ModifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700"
      style={{ borderRadius: 2 }}
    >
      Modified
    </span>
  );
}

// ─── Question Type Badge ─────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    text: "bg-blue-50 text-blue-600",
    textarea: "bg-indigo-50 text-indigo-600",
    select: "bg-purple-50 text-purple-600",
    multiselect: "bg-violet-50 text-violet-600",
    number: "bg-emerald-50 text-emerald-600",
    url: "bg-sky-50 text-sky-600",
    file: "bg-orange-50 text-orange-600",
    table: "bg-pink-50 text-pink-600",
    checklist: "bg-teal-50 text-teal-600",
    rating: "bg-yellow-50 text-yellow-600",
    date: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[10px] font-medium ${
        colors[type] || "bg-gray-50 text-gray-600"
      }`}
      style={{ borderRadius: 2 }}
    >
      {type}
    </span>
  );
}

// ─── Main Page Component ─────────────────────────────────────────

export default function AdminFrameworkPage() {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set()
  );
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const {
    allEdits,
    loading,
    saving,
    error,
    conflicts,
    loadEdits,
    saveEdit,
    clearAssetEdits: clearAssetEditsFromHook,
    exportEdits,
    importEdits,
    resolveConflict,
    resolveAllConflicts,
  } = useFrameworkEdits();

  const { show: showMigrationFromStorage, assetCount: migrationAssetCount } = useMigrationDialog();
  const [migrationDialogDismissed, setMigrationDialogDismissed] = useState(false);
  const showMigration = showMigrationFromStorage && !migrationDialogDismissed;

  // Load all edits from database on mount
  useEffect(() => {
    loadEdits();
    if (stages.length > 0) {
      setExpandedStages(new Set([stages[0].id]));
      if (stages[0].assets.length > 0) {
        setSelectedAsset(stages[0].assets[0].number);
      }
    }
  }, [loadEdits]);

  // Real-time: refetch when another admin edits
  useRealTimeFramework(loadEdits);

  // Find current asset data
  const currentAsset: Asset | undefined = selectedAsset
    ? stages.flatMap((s) => s.assets).find((a) => a.number === selectedAsset)
    : undefined;

  const currentStage: Stage | undefined = selectedAsset
    ? stages.find((s) => s.assets.some((a) => a.number === selectedAsset))
    : undefined;

  const currentWorkflow: AssetWorkflow | undefined = selectedAsset
    ? getWorkflowForAsset(selectedAsset)
    : undefined;

  const currentEdits: AssetEdits = selectedAsset
    ? allEdits[selectedAsset] || {}
    : {};

  // Count total modified assets
  const modifiedCount = Object.values(allEdits).filter(hasEdits).length;

  // ─── Edit handlers (delegate to hook) ───────────────────────────

  const setFieldEdit = useCallback(
    (
      assetNumber: number,
      field: "title" | "purpose" | "coreQuestion",
      value: string,
      _original: string
    ) => {
      saveEdit(assetNumber, field, "", "", value);
    },
    [saveEdit]
  );

  const setChecklistEdit = useCallback(
    (
      assetNumber: number,
      itemId: string,
      value: string,
      _original: string
    ) => {
      saveEdit(assetNumber, "checklist", itemId, "", value);
    },
    [saveEdit]
  );

  const setQuestionEdit = useCallback(
    (
      assetNumber: number,
      questionId: string,
      field: "label" | "description",
      value: string,
      _original: string
    ) => {
      saveEdit(assetNumber, "question", questionId, field, value);
    },
    [saveEdit]
  );

  // ─── Export & clear ────────────────────────────────────────────

  function exportAllChanges() {
    exportEdits();
  }

  async function notifyFellows(assetNumber: number) {
    if (!confirm("Send notifications to all fellows about this framework update?")) {
      return;
    }
    setNotifying(true);
    try {
      const result = await notifyFellowsOfFrameworkUpdate(assetNumber);
      if (result.success) {
        alert(`Notifications sent to ${result.notified} fellow${result.notified !== 1 ? "s" : ""}.`);
      } else {
        alert(result.error || "Failed to send notifications");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  }

  function exportAssetChanges(assetNumber: number) {
    const edits = allEdits[assetNumber];
    if (!hasEdits(edits)) {
      alert("No modifications for this asset.");
      return;
    }
    const asset = stages
      .flatMap((s) => s.assets)
      .find((a) => a.number === assetNumber);
    downloadJson(
      {
        exportedAt: new Date().toISOString(),
        assetNumber,
        assetTitle: asset?.title || `Asset #${assetNumber}`,
        modifications: edits,
      },
      `framework-edits-asset-${assetNumber}.json`
    );
  }

  function clearAssetEdits(assetNumber: number) {
    clearAssetEditsFromHook(assetNumber);
  }

  // ─── Sidebar Toggle ──────────────────────────────────────────

  function toggleStage(stageId: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }

  function selectAsset(assetNumber: number) {
    setSelectedAsset(assetNumber);
    setMobileNavOpen(false);
    // Auto-expand the stage containing this asset
    const stage = stages.find((s) =>
      s.assets.some((a) => a.number === assetNumber)
    );
    if (stage) {
      setExpandedStages((prev) => new Set(prev).add(stage.id));
    }
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {showMigration && (
        <MigrationDialog
          assetCount={migrationAssetCount}
          onImport={importEdits}
          onDismiss={() => setMigrationDialogDismissed(true)}
        />
      )}
      {conflicts.length > 0 && (
        <ConflictResolutionDialog
          conflicts={conflicts}
          onResolve={resolveConflict}
          onResolveAll={resolveAllConflicts}
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label-uppercase mb-2">Admin</div>
          <h1 className="text-2xl font-medium">Framework Editor</h1>
          <p className="text-muted text-sm mt-1">
            View and edit the 27-asset Co-Build framework. Changes are saved to
            the database and visible to other admins.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
          {(loading || saving) && (
            <span className="text-xs text-muted">
              {loading ? "Loading…" : "Saving…"}
            </span>
          )}
          {modifiedCount > 0 && !loading && (
            <span className="text-xs text-muted">
              {modifiedCount} asset{modifiedCount !== 1 ? "s" : ""} modified
            </span>
          )}
          <button
            onClick={exportAllChanges}
            disabled={loading || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors disabled:opacity-50"
            style={{ borderRadius: 2 }}
          >
            Export All Changes
          </button>
        </div>
      </div>

      {/* Mobile nav toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-border text-sm font-medium"
          style={{ borderRadius: 2 }}
        >
          <span>
            {currentAsset
              ? `#${currentAsset.number} ${currentAsset.title}`
              : "Select an asset"}
          </span>
          <ChevronIcon open={mobileNavOpen} />
        </button>
      </div>

      {/* Two-column layout */}
      {loading ? (
        <div className="bg-surface border border-border p-8 text-center" style={{ borderRadius: 2 }}>
          <p className="text-muted text-sm">Loading framework edits…</p>
        </div>
      ) : (
      <div className="flex gap-6 items-start">
        {/* Left sidebar: Stage / Asset nav */}
        <aside
          className={`shrink-0 w-full lg:w-[260px] ${
            mobileNavOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="space-y-2">
            {stages.map((stage) => {
              const isExpanded = expandedStages.has(stage.id);
              const stageModifiedCount = stage.assets.filter((a) =>
                hasEdits(allEdits[a.number])
              ).length;

              return (
                <div
                  key={stage.id}
                  className="bg-surface border border-border"
                  style={{ borderRadius: 2 }}
                >
                  {/* Stage header */}
                  <button
                    onClick={() => toggleStage(stage.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-background/50 transition-colors text-left"
                  >
                    <div className="text-muted">
                      <ChevronIcon open={isExpanded} />
                    </div>
                    <div
                      className="w-7 h-7 bg-accent/10 flex items-center justify-center font-semibold text-accent text-xs shrink-0"
                      style={{ borderRadius: 2 }}
                    >
                      {stage.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {stage.title}
                      </div>
                      <div className="text-[11px] text-muted truncate">
                        {stage.subtitle}
                      </div>
                    </div>
                    {stageModifiedCount > 0 && (
                      <span
                        className="w-2 h-2 bg-amber-400 shrink-0"
                        style={{ borderRadius: 1 }}
                      />
                    )}
                  </button>

                  {/* Asset list */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {stage.assets.map((asset) => {
                        const isSelected = selectedAsset === asset.number;
                        const isModified = hasEdits(allEdits[asset.number]);

                        return (
                          <button
                            key={asset.number}
                            onClick={() => selectAsset(asset.number)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-accent/5 border-l-2 border-l-accent"
                                : "hover:bg-background/50 border-l-2 border-l-transparent"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                isSelected
                                  ? "bg-accent text-white"
                                  : "bg-accent/10 text-accent"
                              }`}
                              style={{ borderRadius: 2 }}
                            >
                              {asset.number}
                            </div>
                            <span
                              className={`text-xs truncate flex-1 ${
                                isSelected ? "font-medium" : "text-muted"
                              }`}
                            >
                              {asset.title}
                            </span>
                            {isModified && (
                              <span
                                className="w-1.5 h-1.5 bg-amber-400 shrink-0"
                                style={{ borderRadius: 1 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main editor area */}
        <div className="flex-1 min-w-0">
          {!currentAsset ? (
            <div
              className="bg-surface border border-border p-12 text-center"
              style={{ borderRadius: 2 }}
            >
              <p className="text-muted text-sm">
                Select an asset from the sidebar to view and edit its content.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Asset header */}
              <div
                className="bg-surface border border-border p-6"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 bg-accent/10 flex items-center justify-center font-bold text-accent text-sm shrink-0 mt-0.5"
                      style={{ borderRadius: 2 }}
                    >
                      {currentAsset.number}
                    </div>
                    <div className="min-w-0">
                      {currentStage && (
                        <div className="text-[10px] text-muted tracking-wider uppercase font-medium mb-1">
                          Stage {currentStage.number} &middot;{" "}
                          {currentStage.title}
                        </div>
                      )}
                      <h2 className="text-xl font-medium">
                        {currentEdits.title || currentAsset.title}
                      </h2>
                      {hasEdits(currentEdits) && (
                        <div className="mt-2">
                          <ModifiedBadge />
                        </div>
                      )}
                    </div>
                  </div>

                  {hasEdits(currentEdits) && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => clearAssetEdits(currentAsset.number)}
                        className="px-3 py-1.5 text-xs text-muted border border-border hover:bg-background/50 transition-colors"
                        style={{ borderRadius: 2 }}
                      >
                        Discard
                      </button>
                      <button
                        onClick={() =>
                          exportAssetChanges(currentAsset.number)
                        }
                        className="px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
                        style={{ borderRadius: 2 }}
                      >
                        Export
                      </button>
                      <button
                        onClick={() => notifyFellows(currentAsset.number)}
                        disabled={notifying}
                        className="px-3 py-1.5 text-xs font-medium text-accent border border-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
                        style={{ borderRadius: 2 }}
                      >
                        {notifying ? "Notifying..." : "Notify Fellows"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editable fields: Title, Purpose, Core Question */}
              <div
                className="bg-surface border border-border"
                style={{ borderRadius: 2 }}
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="label-uppercase" style={{ fontSize: 10 }}>
                    Asset Details
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {/* Title */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted uppercase tracking-wider">
                        Title
                      </span>
                      <EditIcon />
                      {currentEdits.title && <ModifiedBadge />}
                    </div>
                    <AutoTextarea
                      value={
                        currentEdits.title ?? currentAsset.title
                      }
                      onChange={(v) =>
                        setFieldEdit(
                          currentAsset.number,
                          "title",
                          v,
                          currentAsset.title
                        )
                      }
                    />
                  </div>

                  {/* Purpose */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted uppercase tracking-wider">
                        Purpose
                      </span>
                      <EditIcon />
                      {currentEdits.purpose && <ModifiedBadge />}
                    </div>
                    <AutoTextarea
                      value={
                        currentEdits.purpose ?? currentAsset.purpose
                      }
                      onChange={(v) =>
                        setFieldEdit(
                          currentAsset.number,
                          "purpose",
                          v,
                          currentAsset.purpose
                        )
                      }
                    />
                  </div>

                  {/* Core Question */}
                  {currentAsset.coreQuestion && (
                    <div className="px-4 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted uppercase tracking-wider">
                          Core Question
                        </span>
                        <EditIcon />
                        {currentEdits.coreQuestion && <ModifiedBadge />}
                      </div>
                      <AutoTextarea
                        value={
                          currentEdits.coreQuestion ??
                          currentAsset.coreQuestion
                        }
                        onChange={(v) =>
                          setFieldEdit(
                            currentAsset.number,
                            "coreQuestion",
                            v,
                            currentAsset.coreQuestion!
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Items */}
              {currentAsset.checklist.length > 0 && (
                <div
                  className="bg-surface border border-border"
                  style={{ borderRadius: 2 }}
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="label-uppercase" style={{ fontSize: 10 }}>
                      Checklist ({currentAsset.checklist.length} items)
                    </div>
                    {currentEdits.checklist &&
                      Object.keys(currentEdits.checklist).length > 0 && (
                        <ModifiedBadge />
                      )}
                  </div>
                  <div className="divide-y divide-border">
                    {currentAsset.checklist.map((item) => {
                      const edited =
                        currentEdits.checklist?.[item.id];

                      return (
                        <div key={item.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <span
                              className="text-[10px] text-muted font-mono bg-background px-1.5 py-0.5 shrink-0 mt-1"
                              style={{ borderRadius: 2 }}
                            >
                              {item.id}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <EditIcon />
                                {edited !== undefined && <ModifiedBadge />}
                              </div>
                              <AutoTextarea
                                value={edited ?? item.text}
                                onChange={(v) =>
                                  setChecklistEdit(
                                    currentAsset.number,
                                    item.id,
                                    v,
                                    item.text
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guided Questions (Workflow Steps) */}
              {currentWorkflow && currentWorkflow.steps.length > 0 && (
                <div
                  className="bg-surface border border-border"
                  style={{ borderRadius: 2 }}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="label-uppercase" style={{ fontSize: 10 }}>
                      Guided Questions ({currentWorkflow.steps.length} steps,{" "}
                      {currentWorkflow.steps.reduce(
                        (sum, s) => sum + s.questions.length,
                        0
                      )}{" "}
                      questions)
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {currentWorkflow.steps.map(
                      (step: WorkflowStep, stepIndex: number) => (
                        <div key={step.id} className="px-4 py-5">
                          {/* Step header */}
                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className="text-[10px] text-white bg-accent/80 font-semibold px-2 py-0.5 shrink-0"
                              style={{ borderRadius: 2 }}
                            >
                              Step {stepIndex + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {step.title}
                            </span>
                            <span
                              className="text-[10px] text-muted font-mono bg-background px-1.5 py-0.5"
                              style={{ borderRadius: 2 }}
                            >
                              {step.id}
                            </span>
                          </div>
                          {step.description && (
                            <p className="text-xs text-muted mb-4 pl-0.5">
                              {step.description}
                            </p>
                          )}

                          {/* Questions in step */}
                          <div className="space-y-4">
                            {step.questions.map((question: Question) => {
                              const qEdits =
                                currentEdits.questions?.[question.id];
                              const labelEdited =
                                qEdits?.label !== undefined;
                              const descEdited =
                                qEdits?.description !== undefined;

                              return (
                                <div
                                  key={question.id}
                                  className="border border-border/60 bg-background/30"
                                  style={{ borderRadius: 2 }}
                                >
                                  {/* Question meta */}
                                  <div className="px-3 py-2 flex items-center gap-2 border-b border-border/40 flex-wrap">
                                    <span
                                      className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5"
                                      style={{ borderRadius: 2 }}
                                    >
                                      {question.id}
                                    </span>
                                    <TypeBadge type={question.type} />
                                    {question.required && (
                                      <span
                                        className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5"
                                        style={{ borderRadius: 2 }}
                                      >
                                        Required
                                      </span>
                                    )}
                                    {!question.required && (
                                      <span
                                        className="text-[10px] text-muted bg-surface px-1.5 py-0.5"
                                        style={{ borderRadius: 2 }}
                                      >
                                        Optional
                                      </span>
                                    )}
                                    {(labelEdited || descEdited) && (
                                      <ModifiedBadge />
                                    )}
                                  </div>

                                  {/* Editable label */}
                                  <div className="px-3 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
                                        Label
                                      </span>
                                      <EditIcon />
                                    </div>
                                    <AutoTextarea
                                      value={
                                        qEdits?.label ?? question.label
                                      }
                                      onChange={(v) =>
                                        setQuestionEdit(
                                          currentAsset.number,
                                          question.id,
                                          "label",
                                          v,
                                          question.label
                                        )
                                      }
                                    />
                                  </div>

                                  {/* Editable description */}
                                  {(question.description ||
                                    qEdits?.description) && (
                                    <div className="px-3 pb-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
                                          Description
                                        </span>
                                        <EditIcon />
                                      </div>
                                      <AutoTextarea
                                        value={
                                          qEdits?.description ??
                                          question.description ??
                                          ""
                                        }
                                        onChange={(v) =>
                                          setQuestionEdit(
                                            currentAsset.number,
                                            question.id,
                                            "description",
                                            v,
                                            question.description ?? ""
                                          )
                                        }
                                      />
                                    </div>
                                  )}

                                  {/* Read-only info: options, placeholder, etc */}
                                  {question.options &&
                                    question.options.length > 0 && (
                                      <div className="px-3 pb-3">
                                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                                          Options (read-only)
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {question.options.map((opt) => (
                                            <span
                                              key={opt.value}
                                              className="text-[11px] text-muted bg-surface border border-border px-2 py-0.5"
                                              style={{ borderRadius: 2 }}
                                            >
                                              {opt.label}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* No workflow notice */}
              {!currentWorkflow && (
                <div
                  className="bg-surface border border-border p-6 text-center"
                  style={{ borderRadius: 2 }}
                >
                  <p className="text-muted text-sm">
                    No guided workflow questions defined for this asset yet.
                  </p>
                </div>
              )}

              {/* Additional asset info (read-only) */}
              {(currentAsset.keyInputs ||
                currentAsset.outputs ||
                currentAsset.bullets ||
                currentAsset.details ||
                currentAsset.feedsInto ||
                currentAsset.table) && (
                <div
                  className="bg-surface border border-border"
                  style={{ borderRadius: 2 }}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="label-uppercase" style={{ fontSize: 10 }}>
                      Additional Info (Read-Only)
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {currentAsset.details && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                          Details
                        </div>
                        <p className="text-sm text-muted">
                          {currentAsset.details}
                        </p>
                      </div>
                    )}
                    {currentAsset.keyInputs && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                          Key Inputs
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentAsset.keyInputs.map((input) => (
                            <span
                              key={input}
                              className="text-[11px] text-muted bg-background border border-border px-2 py-0.5"
                              style={{ borderRadius: 2 }}
                            >
                              {input}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentAsset.outputs && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                          Outputs
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentAsset.outputs.map((output) => (
                            <span
                              key={output}
                              className="text-[11px] text-muted bg-background border border-border px-2 py-0.5"
                              style={{ borderRadius: 2 }}
                            >
                              {output}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentAsset.bullets && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                          Key Points
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentAsset.bullets.map((bullet) => (
                            <span
                              key={bullet}
                              className="text-[11px] text-muted bg-background border border-border px-2 py-0.5"
                              style={{ borderRadius: 2 }}
                            >
                              {bullet}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentAsset.feedsInto && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                          Feeds Into
                        </div>
                        <p className="text-sm text-muted">
                          {currentAsset.feedsInto}
                        </p>
                      </div>
                    )}
                    {currentAsset.table && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">
                          Reference Table
                        </div>
                        <div
                          className="border border-border overflow-x-auto"
                          style={{ borderRadius: 2 }}
                        >
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-background">
                                {currentAsset.table.header.map((h) => (
                                  <th
                                    key={h}
                                    className="text-left px-3 py-2 text-[10px] font-semibold text-muted uppercase tracking-wider border-b border-border"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentAsset.table.rows.map(
                                (row, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-border last:border-0"
                                  >
                                    {row.map((cell, j) => (
                                      <td
                                        key={j}
                                        className="px-3 py-2 text-xs text-muted"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Version History */}
              <VersionHistory
                assetNumber={currentAsset.number}
                onRollback={() => {
                  // Reload edits after rollback
                  loadEdits();
                }}
              />
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
