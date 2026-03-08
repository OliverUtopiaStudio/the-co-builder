"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Calendar, ListTodo } from "lucide-react";
import OnboardingChecklist from "@/components/fellows/OnboardingChecklist";
import TodoList from "@/components/fellows/TodoList";
import type { OnboardingStatus } from "@/lib/onboarding";

const BOOK_LINKS = [
  { label: "Book with Ollie & Karan", href: "https://calendly.com/oliver-utopia-studio/fellow-co-build-session-with-ollie-clone" },
  { label: "Book with Ollie (45 min)", href: "https://calendly.com/oliver-utopia-studio/fellow-co-build-session-45-mins-clone" },
];

type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  assetNumber: number | null;
  externalUrl: string | null;
  externalProvider: string | null;
  dueDate: Date | string | null;
  position: number;
};

type Props = {
  onboardingStatus: OnboardingStatus | null;
  fellowName: string;
  fellowId?: string;
  todos?: TodoItem[];
  ventureId: string;
  isStudio: boolean;
};

export default function StudioServicesMenu({
  onboardingStatus,
  fellowName,
  fellowId,
  todos = [],
  ventureId,
  isStudio,
}: Props) {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [todosOpen, setTodosOpen] = useState(false);

  return (
    <section>
      <h2 className="label-uppercase text-[10px] mb-3 text-muted">
        Studio services
      </h2>
      <div
        className="bg-surface border border-border overflow-hidden"
        style={{ borderRadius: 2 }}
      >
        {/* Onboarding dropdown */}
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setOnboardingOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-border/30 transition-colors min-h-[48px]"
          >
            <span>Onboarding</span>
            {onboardingOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            )}
          </button>
          {onboardingOpen && (
            <div className="px-4 pb-4 pt-0 border-t border-border/50">
              <OnboardingChecklist
                status={onboardingStatus}
                fellowName={fellowName}
                readOnly
                fellowId={fellowId}
              />
            </div>
          )}
        </div>

        {/* To-dos dropdown */}
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setTodosOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-border/30 transition-colors min-h-[48px]"
          >
            <span className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted" aria-hidden />
              To-dos
            </span>
            {todosOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            )}
          </button>
          {todosOpen && (
            <div className="border-t border-border/50 p-4">
              <TodoList
                todos={todos}
                ventureId={ventureId}
                isStudio={isStudio}
              />
            </div>
          )}
        </div>

        {/* Book time with Studio */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Calendar className="h-4 w-4 text-muted" aria-hidden />
            Book time with Studio
          </div>
          <div className="flex flex-wrap gap-2">
            {BOOK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity touch-manipulation min-h-[44px]"
                style={{ borderRadius: 2 }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
