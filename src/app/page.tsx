"use client";

import Link from "next/link";
import { stages, keyTakeaways, failureModes } from "@/lib/data";
import { useProgress } from "@/lib/useProgress";

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

export default function Home() {
  const { getStageProgress, getOverallProgress, loaded, resetProgress } =
    useProgress();
  const overall = getOverallProgress();

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-1">
                Utopia Studio
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                The Co-Builder
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-accent">
                {overall.percentage}%
              </p>
              <p className="text-xs text-muted">
                {overall.completed}/{overall.total} tasks
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar percentage={overall.percentage} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Intro */}
        <section className="mb-12">
          <p className="text-lg text-muted max-w-3xl">
            <strong className="text-foreground">
              27 Assets from Invention to Spinout
            </strong>{" "}
            — A structured framework for turning domain expertise into
            venture-scale companies. AI-native by design.
          </p>
          <div className="mt-6 p-5 bg-gold-light border border-gold/20 rounded-lg">
            <p className="text-sm font-semibold text-gold uppercase tracking-wide mb-2">
              Key Insight
            </p>
            <p className="text-foreground">
              Most ventures fail because they skip steps. Co-Build forces rigor:
              you can&apos;t build before you&apos;ve proven the problem, and
              you can&apos;t sell before you&apos;ve proven the AI works.
            </p>
          </div>
        </section>

        {/* Stage Cards */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Your Journey</h2>
          <div className="space-y-4">
            {stages.map((stage) => {
              const progress = getStageProgress(stage.id);
              const isComplete = progress.percentage === 100;

              return (
                <Link
                  key={stage.id}
                  href={`/stage/${stage.id}`}
                  className={`block border rounded-xl p-6 transition-all hover:shadow-md ${
                    isComplete
                      ? "border-accent/30 bg-accent-light"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                          isComplete
                            ? "bg-accent text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        {isComplete ? "✓" : stage.number}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {stage.title}
                        </h3>
                        <p className="text-sm text-muted">{stage.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold">
                        {progress.percentage}%
                      </p>
                      <p className="text-xs text-muted">
                        {progress.completed}/{progress.total}
                      </p>
                    </div>
                  </div>
                  <ProgressBar percentage={progress.percentage} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stage.assets.map((asset) => (
                      <span
                        key={asset.number}
                        className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-muted"
                      >
                        #{asset.number}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Overview Table */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">The 13 Stages at a Glance</h2>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Focus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "0",
                    "Invention Gate",
                    "Risk capital logic + category ambition",
                  ],
                  ["1-2", "Problem", "Deep dive + workflow mapping"],
                  ["3-4", "Customer", "ICP + assumptions + kill switches"],
                  [
                    "5",
                    "Validation",
                    "Design partners + AI feasibility + eval plan",
                  ],
                  [
                    "6",
                    "Data Rights",
                    "Security pack + data advantage contracts",
                  ],
                  [
                    "7",
                    "PRD",
                    "Culmination: what we build + what we don't",
                  ],
                  [
                    "8-9",
                    "Build",
                    "Architecture + LOI + pilot SOW + prototype",
                  ],
                  ["10-11", "Scale", "Sales pack + pricing + roadmap"],
                  ["12-13", "Spinout", "Data room + legal + exit map"],
                ].map(([stage, name, focus], i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-accent font-semibold">
                      {stage}
                    </td>
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 text-muted">{focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Key Takeaways</h2>
          <div className="space-y-3">
            {keyTakeaways.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border"
              >
                <span className="w-7 h-7 shrink-0 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Failure Modes */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Common Failure Modes</h2>
          <div className="space-y-3">
            {failureModes.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gold-light rounded-lg border border-gold/20"
              >
                <span className="text-gold text-lg">⚠</span>
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reset */}
        <section className="text-center pb-16">
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to reset all progress? This cannot be undone."
                )
              ) {
                resetProgress();
              }
            }}
            className="text-sm text-muted hover:text-foreground underline transition-colors"
          >
            Reset all progress
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted">
          The Co-Build Framework — Utopia Studio
        </p>
      </footer>
    </div>
  );
}
