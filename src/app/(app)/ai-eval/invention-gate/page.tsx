"use client";

import { useState } from "react";
import Link from "next/link";

type Dimension = "uniqueness" | "defensiveness" | "novelty" | "hidden_problem_potential";

interface CheckResult {
  dimension: Dimension;
  label: string;
  score: number;
  summary: string;
  detail: string;
}

const DIMENSION_LABELS: Record<Dimension, string> = {
  uniqueness: "Uniqueness",
  defensiveness: "Defensibility",
  novelty: "Novelty",
  hidden_problem_potential: "Hidden problem potential",
};

/** Demo/think version: no real AI; simulates a global check for testing the flow. */
function runInventionGateCheck(thesis: string): CheckResult[] {
  const len = thesis.trim().length;
  const hasStructure = thesis.includes("market") || thesis.includes("problem") || thesis.includes("why");
  // Simulate scores and copy based on length and keywords (demo only)
  return [
    {
      dimension: "uniqueness",
      label: DIMENSION_LABELS.uniqueness,
      score: len > 80 ? (hasStructure ? 7 : 5) : 4,
      summary: hasStructure
        ? "Concept distinguishes a specific market or mechanism."
        : "Add clarity on what makes this opportunity distinct.",
      detail:
        "Uniqueness measures whether the thesis describes a specific, non-generic opportunity. In the demo this is inferred from length and use of terms like 'market' or 'problem'.",
    },
    {
      dimension: "defensiveness",
      label: DIMENSION_LABELS.defensiveness,
      score: len > 120 ? 6 : 5,
      summary:
        len > 120
          ? "Some structural or insider advantage implied."
          : "Expand on why this is hard to replicate (data, access, regulation).",
      detail:
        "Defensibility asks why a well-funded team could not easily copy this. The real eval would check for moat language, insider advantage, or structural barriers.",
    },
    {
      dimension: "novelty",
      label: DIMENSION_LABELS.novelty,
      score: 5,
      summary: "Novelty is placeholder in the think demo.",
      detail:
        "Novelty would assess timing, technology shift, or regulatory change that makes now the right moment. Not computed in this demo.",
    },
    {
      dimension: "hidden_problem_potential",
      label: DIMENSION_LABELS.hidden_problem_potential,
      score: thesis.toLowerCase().includes("risk") || thesis.toLowerCase().includes("assumption") ? 6 : 5,
      summary:
        "Hidden problem potential is approximated from whether risks or assumptions are mentioned.",
      detail:
        "This dimension flags upside or downside that is not obvious—e.g. unstated assumptions, regulatory or adoption risks, or latent demand. Demo uses keyword hints only.",
    },
  ];
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(10, Math.max(0, score)) * 10;
  return (
    <div className="h-2 w-full bg-border overflow-hidden" style={{ borderRadius: 2 }}>
      <div
        className="h-full bg-accent transition-all duration-500"
        style={{ width: `${pct}%`, borderRadius: 2 }}
      />
    </div>
  );
}

export default function InventionGatePage() {
  const [thesis, setThesis] = useState("");
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [running, setRunning] = useState(false);

  function handleRun() {
    setRunning(true);
    setResults(null);
    // Simulate a short delay (think demo)
    setTimeout(() => {
      setResults(runInventionGateCheck(thesis));
      setRunning(false);
    }, 800);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/ai-eval"
          className="text-sm text-muted hover:text-foreground"
        >
          ← AI Eval Tools
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-medium">Invention Gate</h1>
        <p className="text-muted text-sm mt-1">
          Global check on a pasted concept thesis: uniqueness, defensibility,
          novelty, and hidden problem potential. Think demo — no AI backend yet.
        </p>
      </div>

      <section className="space-y-3">
        <label htmlFor="thesis" className="block text-sm font-medium">
          Concept thesis
        </label>
        <textarea
          id="thesis"
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Paste your one-pager or concept thesis here. E.g. why the market won't solve this, what must be invented, why insiders can win."
          rows={6}
          className="w-full bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-y"
          style={{ borderRadius: 2 }}
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={running || !thesis.trim()}
          className="px-4 py-2.5 text-sm font-medium bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          style={{ borderRadius: 2 }}
        >
          {running ? "Checking…" : "Run global check"}
        </button>
      </section>

      {results && (
        <section className="space-y-4 pt-2 border-t border-border">
          <h2 className="text-lg font-medium">Results</h2>
          <p className="text-xs text-muted">
            Scores 1–10. This is a think demo: logic is simulated, not from an AI
            model.
          </p>
          <ul className="space-y-4">
            {results.map((r) => (
              <li
                key={r.dimension}
                className="p-4 bg-surface border border-border"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{r.label}</span>
                  <span className="text-sm text-muted">{r.score}/10</span>
                </div>
                <div className="mb-2">
                  <ScoreBar score={r.score} />
                </div>
                <p className="text-sm text-foreground">{r.summary}</p>
                <p className="text-xs text-muted mt-2">{r.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
