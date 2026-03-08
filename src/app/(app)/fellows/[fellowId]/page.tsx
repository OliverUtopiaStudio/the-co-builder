import { notFound, redirect } from "next/navigation";
import {
  getFellowDetail,
  getMilestones,
  getTodoItems,
  getCategorizedLinks,
} from "@/app/actions/fellows";
import { getDashboardData } from "@/app/actions/dashboard";
import VentureOverview from "@/components/fellows/VentureOverview";
import MilestonePlan from "@/components/fellows/MilestonePlan";
import TodoList from "@/components/fellows/TodoList";
import CategorizedLinks from "@/components/fellows/CategorizedLinks";
import OnboardingChecklist from "@/components/fellows/OnboardingChecklist";
import ProgressHeader from "@/components/dashboard/ProgressHeader";
import WorkspaceSection from "@/components/dashboard/WorkspaceSection";
import NextActionCard from "@/components/dashboard/NextActionCard";
import TailoredCoBuild from "@/components/dashboard/TailoredCoBuild";
import KeyAssetsRow from "@/components/dashboard/KeyAssetsRow";
import StudioServicesMenu from "@/components/dashboard/StudioServicesMenu";
import type { OnboardingStatus } from "@/lib/onboarding";

export default async function FellowDetailPage({
  params,
}: {
  params: Promise<{ fellowId: string }>;
}) {
  const { fellowId } = await params;
  const detail = await getFellowDetail(fellowId);
  if (!detail) notFound();

  // Fellows viewing their own profile go to Dashboard (single merged view)
  if (detail.isOwnPage) redirect("/dashboard");

  const { fellow, venture, isStudio } = detail;

  // Studio: show the same dashboard view the fellow sees (merged Dashboard into Fellows)
  if (isStudio) {
    const data = await getDashboardData(fellowId);
    if (!data) notFound();
    const { venture: dataVenture, milestones, todos, links, diagnosis, nextAction, workspace } = data;
    const ventureId = dataVenture?.id ?? "";

    return (
      <div className="space-y-6 sm:space-y-8">
        <ProgressHeader
          fellowName={fellow.fullName}
          ventureName={dataVenture?.name ?? ""}
          diagnosis={diagnosis}
        />
        <WorkspaceSection workspace={workspace} />
        <section>
          <h2 className="label-uppercase text-[10px] mb-3 text-muted">
            Your next step
          </h2>
          <NextActionCard action={nextAction} />
        </section>
        <TailoredCoBuild
          pathway={diagnosis?.pathway ?? []}
          milestones={milestones}
          todos={todos}
          nextAction={nextAction}
          ventureId={ventureId}
          isStudio={isStudio}
        />
        <KeyAssetsRow links={links} />
        <StudioServicesMenu
          onboardingStatus={(fellow.onboardingStatus as OnboardingStatus | null) ?? null}
          fellowName={fellow.fullName}
          fellowId={fellow.id}
          todos={todos}
          ventureId={ventureId}
          isStudio={isStudio}
        />
      </div>
    );
  }

  // Non-studio viewing another fellow (e.g. shared link): show venture profile
  const [milestoneList, todoList, links] = venture
    ? await Promise.all([
        getMilestones(venture.id),
        getTodoItems(venture.id),
        getCategorizedLinks(venture.id),
      ])
    : [[], [], { product: [], gtm: [], investment: [] }];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">{fellow.fullName}</h2>
        {fellow.domain && (
          <p className="text-sm text-muted mt-0.5">{fellow.domain}</p>
        )}
      </div>

      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">
          Onboarding checklist
        </h2>
        <OnboardingChecklist
          status={(fellow.onboardingStatus as OnboardingStatus | null) ?? null}
          fellowName={fellow.fullName}
          readOnly={!isStudio}
          fellowId={isStudio ? fellow.id : undefined}
        />
      </section>

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

      {venture && (
        <>
          <MilestonePlan
            milestones={milestoneList.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              targetDate: m.targetDate,
              status: m.status,
              position: m.position,
            }))}
            ventureId={venture.id}
            isStudio={isStudio}
          />

          <TodoList
            todos={todoList.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              category: t.category,
              assetNumber: t.assetNumber,
              externalUrl: t.externalUrl,
              externalProvider: t.externalProvider,
              dueDate: t.dueDate,
              position: t.position,
            }))}
            ventureId={venture.id}
            isStudio={isStudio}
          />

          <CategorizedLinks
            links={links}
            ventureId={venture.id}
            isStudio={isStudio}
          />
        </>
      )}
    </div>
  );
}
