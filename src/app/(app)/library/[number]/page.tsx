"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { library, stages } from "@/lib/data";
import { getGuidanceTip, getAssetResources } from "@/lib/guidance";
import type { ExperienceProfileKey } from "@/lib/guidance";
import {
  getWorkflowForAsset,
  type WorkflowStep,
} from "@/lib/questions";
import { LoomEmbed } from "@/components/LoomEmbed";
import { AnimatedLesson } from "@/components/AnimatedLesson";
import { getLessonForAsset, BOOK_REVIEW_CALENDLY_URL } from "@/lib/lessons";
import { DriveTemplateLink } from "@/components/DriveTemplateLink";
import { AssetMediaEditor } from "@/components/AssetMediaEditor";
import { getCurrentFellow } from "@/app/actions/fellows";
import { getAssetCompletions, markAssetComplete } from "@/app/actions/responses";

function findAssetContext(assetNumber: number) {
  for (const stage of stages) {
    const asset = stage.assets.find((a) => a.number === assetNumber);
    if (asset) return { asset, stage };
  }
  // Check custom modules (not in stages)
  const custom = library.find(
    (a) => a.number === assetNumber && a.isCustomModule
  );
  if (custom) return { asset: custom, stage: null };
  return null;
}

export default function AssetDetailPage() {
  const { number } = useParams<{ number: string }>();
  const assetNumber = parseInt(number, 10);

  // Admin mode + media state
  const [isAdmin, setIsAdmin] = useState(false);
  const [loomUrl, setLoomUrl] = useState<string | null>(null);
  const [driveTemplateUrl, setDriveTemplateUrl] = useState<string | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Fellow context (for Mark Complete + personalised guidance)
  const [ventureId, setVentureId] = useState<string | null>(null);
  const [experienceProfile, setExperienceProfile] =
    useState<ExperienceProfileKey>("first_time_builder");
  const [isComplete, setIsComplete] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    getCurrentFellow().then((data) => {
      if (data?.venture) {
        setVentureId(data.venture.id);
        const profile = (data.fellow.experienceProfile as ExperienceProfileKey) || "first_time_builder";
        setExperienceProfile(
          ["first_time_builder", "experienced_founder", "corporate_innovator"].includes(profile)
            ? profile
            : "first_time_builder"
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!ventureId || isNaN(assetNumber)) return;
    getAssetCompletions(ventureId).then((map) =>
      setIsComplete(map[assetNumber] === true)
    );
  }, [ventureId, assetNumber]);

  async function handleMarkComplete(complete: boolean) {
    if (!ventureId) return;
    setMarkingComplete(true);
    try {
      await markAssetComplete(ventureId, assetNumber, complete);
      setIsComplete(complete);
    } finally {
      setMarkingComplete(false);
    }
  }

  // Fetch media for this asset
  useEffect(() => {
    if (isNaN(assetNumber)) return;
    let cancelled = false;
    fetch(`/api/asset-media/${assetNumber}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setLoomUrl(data.loomUrl ?? null);
        setDriveTemplateUrl(data.driveTemplateUrl ?? null);
        setMediaLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setMediaLoaded(true);
      });
    return () => { cancelled = true; };
  }, [assetNumber]);

  // Check admin status
  useEffect(() => {
    fetch("/api/auth/admin-check")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, []);

  if (isNaN(assetNumber)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Invalid asset number</h2>
        <Link
          href="/library"
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const ctx = findAssetContext(assetNumber);
  if (!ctx) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Asset not found</h2>
        <Link
          href="/library"
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const { asset, stage } = ctx;

  // Get workflow questions for reference display
  const workflow = getWorkflowForAsset(assetNumber);

  // Get guidance tips (personalised by fellow experience when logged in)
  const guidanceTip = stage
    ? getGuidanceTip(experienceProfile, stage.number)
    : null;

  // Get resources if available
  const resources = stage
    ? getAssetResources(experienceProfile, assetNumber)
    : [];

  // Find prev/next in the library array
  const libraryIndex = library.findIndex((a) => a.number === assetNumber);
  const prevAsset = libraryIndex > 0 ? library[libraryIndex - 1] : null;
  const nextAsset =
    libraryIndex < library.length - 1 && libraryIndex >= 0
      ? library[libraryIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/library" className="hover:text-accent transition-colors">
          Library
        </Link>
        <span>/</span>
        {stage && (
          <>
            <span>{stage.title}</span>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">
          {asset.isCustomModule ? "Module" : `Asset #${asset.number}`}:{" "}
          {asset.title}
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-12 h-12 flex items-center justify-center text-sm font-medium ${
              asset.isCustomModule
                ? "bg-gold/10 text-gold"
                : "bg-accent/10 text-accent"
            }`}
            style={{ borderRadius: 2 }}
          >
            {asset.isCustomModule ? "M" : `#${asset.number}`}
          </div>
          <div>
            <h1 className="text-2xl font-medium">{asset.title}</h1>
            {stage && (
              <p className="text-xs text-muted mt-0.5">
                Stage {stage.number}: {stage.title}
              </p>
            )}
          </div>
        </div>
        {asset.coreQuestion && (
          <div
            className="bg-accent/5 border border-accent/20 px-4 py-3 mt-4"
            style={{ borderRadius: 2 }}
          >
            <div className="label-uppercase text-[10px] mb-1 text-accent">
              Core Question
            </div>
            <p className="text-sm font-medium">{asset.coreQuestion}</p>
          </div>
        )}
      </div>

      {/* Lesson Video — Loom if available, animated fallback otherwise */}
      {mediaLoaded && loomUrl && <LoomEmbed url={loomUrl} />}
      {mediaLoaded && !loomUrl && (() => {
        const lesson = getLessonForAsset(assetNumber);
        return lesson ? <AnimatedLesson lesson={lesson} /> : null;
      })()}

      {/* Book output review with Ollie — shown for every asset */}
      {mediaLoaded && (
        <div
          className="flex flex-wrap items-center justify-center gap-2 py-3 px-4 bg-surface border border-border"
          style={{ borderRadius: 2 }}
        >
          <span className="text-xs text-muted">Done with this lesson?</span>
          <a
            href={BOOK_REVIEW_CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:underline"
          >
            Book output review with Ollie →
          </a>
        </div>
      )}

      {/* Drive Template */}
      {mediaLoaded && driveTemplateUrl && (
        <DriveTemplateLink url={driveTemplateUrl} />
      )}

      {/* Admin: Media Editor */}
      {isAdmin && mediaLoaded && (
        <div
          className="bg-accent/5 border border-accent/20 p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase text-[10px] mb-3 text-accent">
            Admin — Edit Media
          </div>
          <AssetMediaEditor
            assetNumber={assetNumber}
            initialLoomUrl={loomUrl}
            initialDriveUrl={driveTemplateUrl}
            onSaved={(newLoom, newDrive) => {
              setLoomUrl(newLoom);
              setDriveTemplateUrl(newDrive);
            }}
          />
        </div>
      )}

      {/* Purpose */}
      <div
        className="bg-surface border border-border p-5"
        style={{ borderRadius: 2 }}
      >
        <div className="label-uppercase mb-2">Purpose</div>
        <p className="text-sm leading-relaxed">{asset.purpose}</p>
        {asset.details && (
          <p className="text-sm text-muted mt-3 leading-relaxed">
            {asset.details}
          </p>
        )}
      </div>

      {/* Key Inputs / Outputs */}
      {(asset.keyInputs?.length || asset.outputs?.length) && (
        <div className="grid gap-4 md:grid-cols-2">
          {asset.keyInputs && asset.keyInputs.length > 0 && (
            <div
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="label-uppercase mb-3">Key Inputs</div>
              <ul className="space-y-1.5">
                {asset.keyInputs.map((input, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    {input}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {asset.outputs && asset.outputs.length > 0 && (
            <div
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="label-uppercase mb-3">Outputs</div>
              <ul className="space-y-1.5">
                {asset.outputs.map((output, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mark Complete (fellow only) */}
      {ventureId && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-2 text-muted">Progress</div>
          <button
            type="button"
            onClick={() => handleMarkComplete(!isComplete)}
            disabled={markingComplete}
            className={`px-4 py-2 text-sm font-medium border transition-colors ${
              isComplete
                ? "bg-accent/10 border-accent/30 text-accent"
                : "border-border hover:border-accent/50 text-foreground"
            }`}
            style={{ borderRadius: 2 }}
          >
            {markingComplete
              ? "Updating..."
              : isComplete
                ? "✓ Marked complete — click to undo"
                : "Mark complete"}
          </button>
        </div>
      )}

      {/* Checklist (read-only or with completion state) */}
      {asset.checklist.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Completion Checklist</div>
          <ul className="space-y-2">
            {asset.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <div
                  className={`w-5 h-5 border flex-shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                    isComplete
                      ? "border-accent bg-accent text-white"
                      : "border-border"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  {isComplete ? "✓" : ""}
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workflow Questions (reference) */}
      {workflow && workflow.steps.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Framework Questions</div>
          <p className="text-xs text-muted mb-4">
            These questions guide fellows through this asset.
          </p>
          <div className="space-y-4">
            {workflow.steps.map((step: WorkflowStep) => (
              <div key={step.id}>
                <h4 className="text-sm font-medium mb-2">{step.title}</h4>
                {step.description && (
                  <p className="text-xs text-muted mb-2">{step.description}</p>
                )}
                <ul className="space-y-1.5 pl-4">
                  {step.questions.map((q) => (
                    <li key={q.id} className="text-sm text-muted">
                      <span className="text-foreground">{q.label}</span>
                      {q.required && (
                        <span className="text-accent ml-1 text-xs">*</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidance */}
      {guidanceTip && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-2">Guidance</div>
          <p className="text-sm text-muted leading-relaxed">{guidanceTip}</p>
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Resources</div>
          <ul className="space-y-2">
            {resources.map((r, i) => (
              <li key={i} className="text-sm">
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium"
                >
                  {r.label}
                </a>
                {r.description && (
                  <p className="text-xs text-muted mt-0.5">{r.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((tag) => (
            <Link
              key={tag}
              href={`/library?tag=${tag}`}
              className="text-xs px-2 py-1 bg-surface border border-border text-muted hover:text-foreground transition-colors"
              style={{ borderRadius: 2 }}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex-1">
          {prevAsset ? (
            <Link
              href={`/library/${prevAsset.number}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Previous</div>
              <div className="text-sm font-medium">
                {prevAsset.isCustomModule ? "Module" : `#${prevAsset.number}`}:{" "}
                {prevAsset.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="flex-1">
          {nextAsset ? (
            <Link
              href={`/library/${nextAsset.number}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all text-right"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Next</div>
              <div className="text-sm font-medium">
                {nextAsset.isCustomModule ? "Module" : `#${nextAsset.number}`}:{" "}
                {nextAsset.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

    </div>
  );
}
