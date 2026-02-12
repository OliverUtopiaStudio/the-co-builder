"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ui";
import type { TestProjectData } from "@/types/tools";

/**
 * Collapsible test project checklist — renders inside a ToolCard.
 * Steps can be clicked to toggle completion, with an animated progress bar.
 */
export default function TestProject({
  project,
  color,
}: {
  project: TestProjectData;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  function toggleStep(index: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  /** Resolve color for light-background tool (Git #F0F0F0) */
  const fgColor = color === "#F0F0F0" ? "#1F1E1D" : color;
  const fgOnColor = color === "#F0F0F0" ? "#F0F0F0" : "#fff";

  const progress = completedSteps.size;
  const total = project.steps.length;

  return (
    <div className="border-t border-border">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-3.5 text-left hover:bg-background/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5"
            style={{
              borderRadius: 2,
              background: `${color}15`,
              color: fgColor,
            }}
          >
            Test Project
          </span>
          <span className="text-sm font-medium text-foreground/80">
            {project.title}
          </span>
          {progress > 0 && (
            <span className="text-[10px] text-muted">
              {progress}/{total}
            </span>
          )}
        </div>
        <span
          className="text-muted group-hover:text-foreground transition-all text-sm"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s ease",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {/* Expandable steps */}
      <div
        style={{
          maxHeight: open ? `${total * 120 + 60}px` : "0",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <div className="px-6 pb-5 space-y-1">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <ProgressBar
              progress={progress / total}
              color={fgColor}
              className="flex-1"
            />
            <span className="text-[11px] text-muted shrink-0">
              {progress === total
                ? "Complete"
                : `${progress} of ${total} steps`}
            </span>
          </div>

          {/* Steps */}
          {project.steps.map((step, i) => {
            const done = completedSteps.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleStep(i)}
                className={`w-full flex items-start gap-3 text-left p-3 transition-all ${
                  done ? "bg-background/30" : "hover:bg-background/50"
                }`}
                style={{ borderRadius: 2 }}
              >
                {/* Step number / checkmark */}
                <div
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-[11px] font-bold mt-0.5 transition-all"
                  style={{
                    borderRadius: 2,
                    background: done ? fgColor : `${color}15`,
                    color: done ? fgOnColor : fgColor,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium transition-colors ${
                      done ? "line-through text-muted" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </div>
                  <p
                    className={`text-sm leading-relaxed mt-0.5 transition-colors ${
                      done ? "text-muted-light" : "text-muted"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {step.instruction}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
