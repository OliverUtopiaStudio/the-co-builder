"use server";

import {
  getFellowDetail,
  getMilestones,
  getTodoItems,
  getCategorizedLinks,
} from "@/app/actions/fellows";
import {
  getVentureDiagnosisByVentureId,
  type DiagnosisResult,
  type CriticalAction,
} from "@/app/actions/diagnosis";

export type DashboardData = {
  fellow: NonNullable<Awaited<ReturnType<typeof getFellowDetail>>>["fellow"];
  venture: NonNullable<Awaited<ReturnType<typeof getFellowDetail>>>["venture"];
  milestones: Awaited<ReturnType<typeof getMilestones>>;
  todos: Awaited<ReturnType<typeof getTodoItems>>;
  links: Awaited<ReturnType<typeof getCategorizedLinks>>;
  diagnosis: DiagnosisResult | null;
  nextAction: CriticalAction | null;
};

export async function getDashboardData(fellowId: string): Promise<DashboardData | null> {
  const detail = await getFellowDetail(fellowId);
  if (!detail?.venture) return null;

  const ventureId = detail.venture.id;
  const [milestones, todos, links, diagnosis] = await Promise.all([
    getMilestones(ventureId),
    getTodoItems(ventureId),
    getCategorizedLinks(ventureId),
    getVentureDiagnosisByVentureId(ventureId),
  ]);

  return {
    fellow: detail.fellow,
    venture: detail.venture,
    milestones,
    todos,
    links,
    diagnosis: diagnosis ?? null,
    nextAction: diagnosis?.criticalActions?.[0] ?? null,
  };
}
