"use client";

import Link from "next/link";
import type { PathwayStage } from "@/app/actions/diagnosis";
import type { CriticalAction } from "@/app/actions/diagnosis";
import StageJourneyMap from "./StageJourneyMap";
import MilestonePlan from "@/components/fellows/MilestonePlan";
import { Circle, ListTodo } from "lucide-react";

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date | string | null;
  status: string;
  position: number;
};

type TodoItem = {
  id: string;
  title: string;
  status: string;
  assetNumber: number | null;
};

type Props = {
  pathway: PathwayStage[];
  milestones: Milestone[];
  todos: TodoItem[];
  nextAction: CriticalAction | null;
  ventureId: string;
  isStudio: boolean;
};

export default function TailoredCoBuild({
  pathway,
  milestones,
  todos,
  nextAction,
  ventureId,
  isStudio,
}: Props) {
  const activeTodo = todos.find(
    (t) => t.status === "open" || t.status === "in_progress"
  );
  const hasActiveTodo = !!nextAction || !!activeTodo;

  return (
    <section>
      <h2 className="label-uppercase text-[10px] mb-3 text-muted">
        Tailored co-build
      </h2>
      <div
        className="bg-surface border border-border overflow-hidden"
        style={{ borderRadius: 2 }}
      >
        {/* Active to-do: single prominent item (next action or first open todo) */}
        {hasActiveTodo && (
          <div className="border-b border-border p-4 sm:p-5 bg-accent/5">
            <div className="flex items-center gap-2 mb-3">
              <ListTodo className="h-4 w-4 text-accent" aria-hidden />
              <span className="text-xs font-medium text-accent">
                Active to-do
              </span>
            </div>
            {nextAction ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    Asset #{nextAction.assetNumber}: {nextAction.title}
                  </p>
                  {nextAction.reason && (
                    <p className="text-xs text-muted mt-1">{nextAction.reason}</p>
                  )}
                </div>
                <Link
                  href={`/library/${nextAction.assetNumber}`}
                  className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity min-h-[44px]"
                  style={{ borderRadius: 2 }}
                >
                  Start →
                </Link>
              </div>
            ) : activeTodo ? (
              <div className="flex items-center gap-3">
                <Circle className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-foreground">{activeTodo.title}</span>
                  {activeTodo.assetNumber && (
                    <Link
                      href={`/library/${activeTodo.assetNumber}`}
                      className="ml-2 text-xs text-accent hover:underline"
                    >
                      #{activeTodo.assetNumber}
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="grid gap-0 md:grid-cols-2">
          {/* Journey (pathway stages) */}
          <div className="p-4 sm:p-5 md:border-r border-border">
            <div className="label-uppercase text-[10px] mb-3 text-muted">
              Your journey
            </div>
            <StageJourneyMap pathway={pathway} embedded />
          </div>
          {/* Milestones */}
          <div className="p-4 sm:p-5">
            <MilestonePlan
              milestones={milestones}
              ventureId={ventureId}
              isStudio={isStudio}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
