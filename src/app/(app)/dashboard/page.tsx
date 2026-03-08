import { redirect } from "next/navigation";
import { getCurrentFellowId } from "@/app/actions/fellows";
import { getDashboardData } from "@/app/actions/dashboard";
import ProgressHeader from "@/components/dashboard/ProgressHeader";
import NextActionCard from "@/components/dashboard/NextActionCard";
import StageJourneyMap from "@/components/dashboard/StageJourneyMap";
import MilestonePlan from "@/components/fellows/MilestonePlan";
import TodoList from "@/components/fellows/TodoList";
import CategorizedLinks from "@/components/fellows/CategorizedLinks";

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

  const { fellow, venture, milestones, todos, links, diagnosis, nextAction } =
    data;
  const ventureId = venture?.id ?? "";

  return (
    <div className="space-y-8">
      <ProgressHeader
        fellowName={fellow.fullName}
        ventureName={venture?.name ?? ""}
        diagnosis={diagnosis}
      />

      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">
          Your next step
        </h2>
        <NextActionCard action={nextAction} />
      </section>

      <section>
        <StageJourneyMap pathway={diagnosis?.pathway ?? []} />
      </section>

      <div className="grid gap-6 md:grid-cols-3">
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
    </div>
  );
}
