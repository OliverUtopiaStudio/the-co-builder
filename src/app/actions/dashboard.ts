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

type FellowDetail = NonNullable<Awaited<ReturnType<typeof getFellowDetail>>>;

export type DashboardData = {
  fellow: FellowDetail["fellow"];
  venture: FellowDetail["venture"] | null;
  milestones: Awaited<ReturnType<typeof getMilestones>>;
  todos: Awaited<ReturnType<typeof getTodoItems>>;
  links: Awaited<ReturnType<typeof getCategorizedLinks>>;
  diagnosis: DiagnosisResult | null;
  nextAction: CriticalAction | null;
};

const EMPTY_LINKS: Awaited<ReturnType<typeof getCategorizedLinks>> = {
  product: [],
  gtm: [],
  investment: [],
};

export async function getDashboardData(fellowId: string): Promise<DashboardData | null> {
  const detail = await getFellowDetail(fellowId);
  if (!detail) return null;

  const venture = detail.venture ?? null;

  if (!venture) {
    return {
      fellow: detail.fellow,
      venture: null,
      milestones: [],
      todos: [],
      links: EMPTY_LINKS,
      diagnosis: null,
      nextAction: null,
    };
  }

  const ventureId = venture.id;
  const [milestones, todos, links, diagnosis] = await Promise.all([
    getMilestones(ventureId),
    getTodoItems(ventureId),
    getCategorizedLinks(ventureId),
    getVentureDiagnosisByVentureId(ventureId),
  ]);

  return {
    fellow: detail.fellow,
    venture,
    milestones,
    todos,
    links,
    diagnosis: diagnosis ?? null,
    nextAction: diagnosis?.criticalActions?.[0] ?? null,
  };
}
