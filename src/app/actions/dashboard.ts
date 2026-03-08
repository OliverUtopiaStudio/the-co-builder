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
import { db } from "@/db";
import { slackChannelVentures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSlackChannelUrl } from "@/lib/slack/utils";

type FellowDetail = NonNullable<Awaited<ReturnType<typeof getFellowDetail>>>;

export type DashboardData = {
  fellow: FellowDetail["fellow"];
  venture: FellowDetail["venture"] | null;
  milestones: Awaited<ReturnType<typeof getMilestones>>;
  todos: Awaited<ReturnType<typeof getTodoItems>>;
  links: Awaited<ReturnType<typeof getCategorizedLinks>>;
  diagnosis: DiagnosisResult | null;
  nextAction: CriticalAction | null;
  /** Workspace links for Slack + Drive (no auth required, from DB) */
  workspace: {
    slackChannelUrl: string | null;
    slackChannelName: string | null;
    googleDriveUrl: string | null;
  };
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
      workspace: {
        slackChannelUrl: null,
        slackChannelName: null,
        googleDriveUrl: null,
      },
    };
  }

  const ventureId = venture.id;
  const [milestones, todos, links, diagnosis, slackRows] = await Promise.all([
    getMilestones(ventureId),
    getTodoItems(ventureId),
    getCategorizedLinks(ventureId),
    getVentureDiagnosisByVentureId(ventureId),
    db
      .select({
        slackChannelId: slackChannelVentures.slackChannelId,
        slackChannelName: slackChannelVentures.slackChannelName,
      })
      .from(slackChannelVentures)
      .where(eq(slackChannelVentures.ventureId, ventureId))
      .limit(1),
  ]);

  const slack =
    slackRows.length > 0
      ? {
          slackChannelUrl: buildSlackChannelUrl(slackRows[0].slackChannelId),
          slackChannelName: slackRows[0].slackChannelName ?? null,
        }
      : { slackChannelUrl: null as string | null, slackChannelName: null as string | null };

  return {
    fellow: detail.fellow,
    venture,
    milestones,
    todos,
    links,
    diagnosis: diagnosis ?? null,
    nextAction: diagnosis?.criticalActions?.[0] ?? null,
    workspace: {
      ...slack,
      googleDriveUrl: venture.googleDriveUrl ?? null,
    },
  };
}
