import { redirect } from "next/navigation";
import { getCurrentFellowId } from "@/app/actions/fellows";
import { getDashboardData } from "@/app/actions/dashboard";
import ProgressHeader from "@/components/dashboard/ProgressHeader";
import WorkspaceSection from "@/components/dashboard/WorkspaceSection";
import VentureOverview from "@/components/fellows/VentureOverview";
import NextActionCard from "@/components/dashboard/NextActionCard";
import StageJourneyMap from "@/components/dashboard/StageJourneyMap";
import MilestonePlan from "@/components/fellows/MilestonePlan";
import TodoList from "@/components/fellows/TodoList";
import CategorizedLinks from "@/components/fellows/CategorizedLinks";
import OnboardingChecklist from "@/components/fellows/OnboardingChecklist";
import type { OnboardingStatus } from "@/lib/onboarding";

export default async function DashboardPage() {
  const { id: fellowId, isStudio } = await getCurrentFellowId();

  if (!fellowId && !isStudio) {
    redirect("/login");
  }

  if (!fellowId) {
    redirect("/fellows");
  }

  const data = await getDashboardData(fellowId);
  if (!data) {
    redirect("/fellows");
  }

  const { fellow, venture, milestones, todos, links, diagnosis, nextAction, workspace } =
    data;
  const ventureId = venture?.id ?? "";

  return (
    <div className="space-y-6 sm:space-y-8">
      <ProgressHeader
        fellowName={fellow.fullName}
        ventureName={venture?.name ?? ""}
        diagnosis={diagnosis}
      />

      {/* Workspace: Slack + Drive as the hub around the channel */}
      <WorkspaceSection workspace={workspace} />

      {/* Two-column layout on desktop: left = progress + venture, right = next step + journey */}
      <div className="grid gap-6 lg:grid-cols-[1fr,minmax(280px,340px)]">
        <div className="space-y-6">
          <section>
            <h2 className="label-uppercase text-[10px] mb-3 text-muted">
              Venture & links
            </h2>
            <VentureOverview
              venture={
                venture
                  ? {
                      id: venture.id,
                      name: venture.name,
                      description: venture.description,
                      industry: venture.industry,
                      currentStage: venture.currentStage,
                      googleDriveUrl: venture.googleDriveUrl,
                    }
                  : null
              }
              fellow={{
                fullName: fellow.fullName,
                websiteUrl: fellow.websiteUrl,
                linkedinUrl: fellow.linkedinUrl,
              }}
            />
          </section>

          <section>
            <StageJourneyMap pathway={diagnosis?.pathway ?? []} />
          </section>
        </div>
        <div className="space-y-6">
          <section>
            <h2 className="label-uppercase text-[10px] mb-3 text-muted">
              Your next step
            </h2>
            <NextActionCard action={nextAction} />
          </section>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <div>
          <h3 className="label-uppercase text-[10px] mb-3 text-muted">
            Onboarding checklist
          </h3>
          <OnboardingChecklist
            status={(fellow.onboardingStatus as OnboardingStatus | null) ?? null}
            fellowName={fellow.fullName}
            readOnly
          />
        </div>
        <div>
          <h3 className="label-uppercase text-[10px] mb-3 text-muted">
            Milestones
          </h3>
          <MilestonePlan
            milestones={milestones}
            ventureId={ventureId}
            isStudio={isStudio}
          />
        </div>
        <div>
          <h3 className="label-uppercase text-[10px] mb-3 text-muted">
            To-dos
          </h3>
          <TodoList
            todos={todos}
            ventureId={ventureId}
            isStudio={isStudio}
          />
        </div>
        <div>
          <h3 className="label-uppercase text-[10px] mb-3 text-muted">
            Key links
          </h3>
          <CategorizedLinks
            links={links}
            ventureId={ventureId}
            isStudio={isStudio}
          />
        </div>
      </div>

      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">
          Book time with Studio team
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://calendly.com/oliver-utopia-studio/fellow-co-build-session-with-ollie-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity touch-manipulation min-h-[44px]"
            style={{ borderRadius: 2 }}
          >
            Book with Ollie & Karan
          </a>
          <a
            href="https://calendly.com/oliver-utopia-studio/fellow-co-build-session-45-mins-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-surface border border-border text-foreground hover:bg-border/50 transition-colors touch-manipulation min-h-[44px]"
            style={{ borderRadius: 2 }}
          >
            Book with Ollie (45 min)
          </a>
        </div>
      </section>
    </div>
  );
}
