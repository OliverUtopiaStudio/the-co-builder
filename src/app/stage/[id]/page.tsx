"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { stages } from "@/lib/data";
import { useProgress } from "@/lib/useProgress";
import type { Asset } from "@/lib/data";

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function AssetCard({
  asset,
  checked,
  toggle,
}: {
  asset: Asset;
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const completed = asset.checklist.filter((item) => checked[item.id]).length;
  const total = asset.checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Asset Header */}
      <div className="p-6 border-b border-border bg-surface">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-sm font-bold text-accent font-mono bg-accent-light px-2.5 py-1 rounded">
              #{asset.number}
            </span>
            <div>
              <h3 className="text-lg font-bold">{asset.title}</h3>
              <p className="text-sm text-muted mt-1">{asset.purpose}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-sm font-semibold">{pct}%</p>
            <p className="text-xs text-muted">
              {completed}/{total}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar percentage={pct} />
        </div>
      </div>

      {/* Asset Content */}
      <div className="p-6 space-y-5">
        {/* Core Question */}
        {asset.coreQuestion && (
          <div className="p-4 bg-accent-light border border-accent/20 rounded-lg">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
              The Core Question
            </p>
            <p className="font-medium italic">
              &ldquo;{asset.coreQuestion}&rdquo;
            </p>
          </div>
        )}

        {/* Key Inputs & Outputs */}
        {(asset.keyInputs || asset.outputs) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {asset.keyInputs && (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                  Key Inputs
                </p>
                <ul className="space-y-1">
                  {asset.keyInputs.map((input, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      {input}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {asset.outputs && (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                  Outputs
                </p>
                <ul className="space-y-1">
                  {asset.outputs.map((output, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-accent mt-0.5">→</span>
                      {output}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {asset.table && (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {asset.table.header.map((h, i) => (
                    <th key={i} className="text-left px-4 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asset.table.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-2.5 ${
                          j === 0 ? "font-medium" : "text-muted"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bullets */}
        {asset.bullets && (
          <div className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              Must Cover
            </p>
            <ul className="space-y-1">
              {asset.bullets.map((b, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details */}
        {asset.details && (
          <p className="text-sm text-muted italic">{asset.details}</p>
        )}

        {/* Feeds Into */}
        {asset.feedsInto && (
          <div className="p-3 bg-gold-light border border-gold/20 rounded-lg">
            <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">
              Feeds Into
            </p>
            <p className="text-sm">{asset.feedsInto}</p>
          </div>
        )}

        {/* Checklist */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
            Checklist
          </p>
          <div className="space-y-2">
            {asset.checklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  checked[item.id]
                    ? "bg-accent-light border-accent/30"
                    : "border-border hover:border-accent/20 hover:bg-surface"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-accent"
                />
                <span
                  className={`text-sm ${
                    checked[item.id] ? "line-through text-muted" : ""
                  }`}
                >
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StagePage() {
  const params = useParams();
  const stageId = params.id as string;
  const { checked, loaded, toggle, getStageProgress } = useProgress();

  const stage = stages.find((s) => s.id === stageId);
  const stageIndex = stages.findIndex((s) => s.id === stageId);
  const prevStage = stageIndex > 0 ? stages[stageIndex - 1] : null;
  const nextStage =
    stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <p className="text-muted mb-4">Stage not found</p>
          <Link href="/" className="text-accent underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const progress = getStageProgress(stage.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← Back to overview
            </Link>
            <div className="text-right">
              <p className="text-sm font-semibold">{progress.percentage}%</p>
              <p className="text-xs text-muted">
                {progress.completed}/{progress.total} tasks
              </p>
            </div>
          </div>
          <div className="mt-2">
            <ProgressBar percentage={progress.percentage} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Stage Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-2xl">
              {stage.number}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{stage.title}</h1>
              <p className="text-muted text-lg">{stage.subtitle}</p>
            </div>
          </div>
          <p className="text-muted max-w-3xl">{stage.description}</p>
        </div>

        {/* Assets */}
        <div className="space-y-8 mb-12">
          {stage.assets.map((asset) => (
            <AssetCard
              key={asset.number}
              asset={asset}
              checked={checked}
              toggle={toggle}
            />
          ))}
        </div>

        {/* Gate Decision */}
        <div className="p-6 bg-gold-light border border-gold/30 rounded-xl mb-12">
          <p className="text-sm font-semibold text-gold uppercase tracking-wide mb-2">
            Gate Decision
          </p>
          <p className="font-medium">{stage.gateDecision}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevStage ? (
            <Link
              href={`/stage/${prevStage.id}`}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              ← {prevStage.title}
            </Link>
          ) : (
            <div />
          )}
          {nextStage ? (
            <Link
              href={`/stage/${nextStage.id}`}
              className="text-sm font-semibold text-accent hover:underline transition-colors"
            >
              {nextStage.title} →
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Back to Overview →
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center mt-16">
        <p className="text-xs text-muted">
          The Co-Build Framework — Utopia Studio
        </p>
      </footer>
    </div>
  );
}
