import { redirect } from "next/navigation";
import { getCurrentFellowId } from "@/app/actions/fellows";
import { getDashboardData } from "@/app/actions/dashboard";
import ProgressHeader from "@/components/dashboard/ProgressHeader";
import WorkspaceSection from "@/components/dashboard/WorkspaceSection";
import NextActionCard from "@/components/dashboard/NextActionCard";
import TailoredCoBuild from "@/components/dashboard/TailoredCoBuild";
import KeyAssetsRow from "@/components/dashboard/KeyAssetsRow";
import StudioServicesMenu from "@/components/dashboard/StudioServicesMenu";
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

      {/* Workspace: Slack + Drive — recheck: links from DB (slack_channel_ventures) */}
      <WorkspaceSection workspace={workspace} />

      {/* Your next step — first thing a fellow sees daily */}
      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">
          Your next step
        </h2>
        <NextActionCard action={nextAction} />
      </section>

      {/* Tailored co-build: journey + milestones + active to-do */}
      <TailoredCoBuild
        pathway={diagnosis?.pathway ?? []}
        milestones={milestones}
        todos={todos}
        nextAction={nextAction}
        ventureId={ventureId}
        isStudio={isStudio}
      />

      {/* Row of links to key assets */}
      <KeyAssetsRow links={links} />

      {/* Studio services: onboarding (dropdown), to-dos (dropdown), book time */}
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
