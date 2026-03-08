import { notFound } from "next/navigation";
import {
  getFellowDetail,
  getMilestones,
  getTodoItems,
  getCategorizedLinks,
} from "@/app/actions/fellows";
import VentureOverview from "@/components/fellows/VentureOverview";
import MilestonePlan from "@/components/fellows/MilestonePlan";
import TodoList from "@/components/fellows/TodoList";
import CategorizedLinks from "@/components/fellows/CategorizedLinks";

export default async function FellowDetailPage({
  params,
}: {
  params: Promise<{ fellowId: string }>;
}) {
  const { fellowId } = await params;
  const detail = await getFellowDetail(fellowId);
  if (!detail) notFound();

  const { fellow, venture, isStudio } = detail;

  // Fetch venture-specific data in parallel (only if venture exists)
  const [milestoneList, todoList, links] = venture
    ? await Promise.all([
        getMilestones(venture.id),
        getTodoItems(venture.id),
        getCategorizedLinks(venture.id),
      ])
    : [[], [], { product: [], gtm: [], investment: [] }];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-medium">{fellow.fullName}</h2>
        {fellow.domain && (
          <p className="text-sm text-muted mt-0.5">{fellow.domain}</p>
        )}
      </div>

      {/* Section 1: Venture Overview */}
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

      {/* Sections 2-4 only render if venture exists */}
      {venture && (
        <>
          {/* Section 2: Milestone Plan */}
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

          {/* Section 3: Active To-Do List */}
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

          {/* Section 4: Key Assets (Categorized Links) */}
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
