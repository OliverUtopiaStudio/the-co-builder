import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Pods (investment thesis pods) ──────────────────────────────
export const pods = pgTable("pods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  thesis: text("thesis"),
  marketGap: text("market_gap"),
  targetArchetype: text("target_archetype"),
  color: text("color").default("#CC5536"),
  clusters: jsonb("clusters").default([]),
  optimalFellowProfile: text("optimal_fellow_profile"),
  corporatePartners: jsonb("corporate_partners").default([]),
  coInvestors: jsonb("co_investors").default([]),
  sourcingStrategy: text("sourcing_strategy"),
  displayOrder: integer("display_order").default(0),
  journeyCheckpoints: jsonb("journey_checkpoints").default([]),
  currentJourneyStage: text("current_journey_stage"),
  // Living thesis fields
  thesisVersion: integer("thesis_version").default(1),
  thesisHistory: jsonb("thesis_history").default([]), // Array of {version, thesis, marketGap, updatedAt, updatedBy, rationale}
  alignmentCriteria: jsonb("alignment_criteria").default([]), // Array of {id, criterion, weight, description}
  evidenceLog: jsonb("evidence_log").default([]), // Array of {id, type: 'validates'|'challenges', source, description, date, impact}
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Fellows (user profiles + lifecycle) ──────────────────────────
export const fellows = pgTable("fellows", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("fellow"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
  // Lifecycle fields (MVP)
  lifecycleStage: text("lifecycle_stage").notNull().default("onboarding"),
  experienceProfile: text("experience_profile"),
  domain: text("domain"),
  background: text("background"),
  selectionRationale: text("selection_rationale"),
  onboardingStatus: jsonb("onboarding_status"),
  // Studio fields
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "set null" }),
  equityPercentage: numeric("equity_percentage", { precision: 5, scale: 2 }).default("0"),
  globalPotentialRating: integer("global_potential_rating"),
  qatarImpactRating: integer("qatar_impact_rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Ventures ──────────────────────────────────────────────────
export const ventures = pgTable(
  "ventures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fellowId: uuid("fellow_id")
      .notNull()
      .references(() => fellows.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    industry: text("industry"),
    currentStage: text("current_stage").default("00"),
    googleDriveUrl: text("google_drive_url"),
    isActive: boolean("is_active").default(true).notNull(),
    // Alignment tracking
    podAlignmentScore: numeric("pod_alignment_score", { precision: 5, scale: 2 }), // 0-100 score
    alignmentNotes: text("alignment_notes"), // Notes on how venture aligns with pod thesis
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_ventures_fellow").on(table.fellowId)]
);

// ─── Responses (answers to action-based questions) ─────────────
export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    assetNumber: integer("asset_number").notNull(),
    questionId: text("question_id").notNull(),
    value: jsonb("value"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_responses_venture_asset_question").on(
      table.ventureId,
      table.assetNumber,
      table.questionId
    ),
    index("idx_responses_venture").on(table.ventureId),
  ]
);

// ─── Asset Completion ──────────────────────────────────────────
export const assetCompletion = pgTable(
  "asset_completion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    assetNumber: integer("asset_number").notNull(),
    isComplete: boolean("is_complete").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_asset_completion_venture_asset").on(
      table.ventureId,
      table.assetNumber
    ),
  ]
);

// ─── Uploads ───────────────────────────────────────────────────
export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    assetNumber: integer("asset_number").notNull(),
    questionId: text("question_id"),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_uploads_venture_asset").on(table.ventureId, table.assetNumber),
  ]
);

// ─── Asset Requirements (global + per-venture) ──────────────────
export const assetRequirements = pgTable(
  "asset_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id").references(() => ventures.id, { onDelete: "cascade" }),
    assetNumber: integer("asset_number").notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_asset_req_venture_id").on(table.ventureId),
  ]
);

// ─── Stipend Milestones ──────────────────────────────────────────
// Global milestone definitions (fellow_id IS NULL) + per-fellow payment tracking.
// The studio team defines 2 milestones globally, then marks each fellow's payment released.
export const stipendMilestones = pgTable(
  "stipend_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fellowId: uuid("fellow_id").references(() => fellows.id, { onDelete: "cascade" }),
    milestoneNumber: integer("milestone_number").notNull(), // 1 or 2
    title: text("title").notNull(), // e.g. "Stage 01 approved"
    description: text("description"),
    amount: integer("amount").notNull().default(2500), // cents or whole dollars
    // For global definitions (fellow_id IS NULL):
    // title + description define what triggers payment
    // For per-fellow records:
    // milestoneMet + paymentReleased track actual status
    milestoneMet: timestamp("milestone_met", { withTimezone: true }),
    paymentReleased: timestamp("payment_released", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_stipend_fellow").on(table.fellowId),
    index("idx_stipend_milestone_num").on(table.milestoneNumber),
  ]
);

// ─── Slack Channel → Venture Mapping ─────────────────────────────
export const slackChannelVentures = pgTable(
  "slack_channel_ventures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    slackChannelId: text("slack_channel_id").notNull().unique(),
    slackChannelName: text("slack_channel_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_scv_venture").on(table.ventureId),
  ]
);

// ─── Tasks (from Slack) ──────────────────────────────────────────
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    assetNumber: integer("asset_number").notNull(),
    checklistItemId: text("checklist_item_id"),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").default("medium").notNull(),
    status: text("status").default("open").notNull(),
    slackChannelId: text("slack_channel_id"),
    slackMessageTs: text("slack_message_ts"),
    slackUserId: text("slack_user_id"),
    slackUserName: text("slack_user_name"),
    aiConfidence: integer("ai_confidence"),
    aiReasoning: text("ai_reasoning"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_tasks_venture").on(table.ventureId),
    index("idx_tasks_venture_asset").on(table.ventureId, table.assetNumber),
    index("idx_tasks_status").on(table.ventureId, table.status),
    check("tasks_asset_range", sql`${table.assetNumber} >= 1 AND ${table.assetNumber} <= 27`),
    check("tasks_priority_check", sql`${table.priority} IN ('low','medium','high','urgent')`),
    check("tasks_status_check", sql`${table.status} IN ('open','in_progress','completed','cancelled')`),
  ]
);

// ─── KPI Metrics ─────────────────────────────────────────────────
export const kpiMetrics = pgTable("kpi_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  target: integer("target").notNull().default(0),
  current: integer("current").notNull().default(0),
  pipelineNotes: text("pipeline_notes"),
  displayOrder: integer("display_order").default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── KPI History (monthly snapshots) ─────────────────────────────
export const kpiHistory = pgTable(
  "kpi_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metricKey: text("metric_key")
      .notNull()
      .references(() => kpiMetrics.key, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    month: timestamp("month", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_kpi_history_key").on(table.metricKey),
    uniqueIndex("idx_kpi_history_unique").on(table.metricKey, table.month),
  ]
);

// ─── Pod Campaigns (sourcing sprints — fellows + pre-seed deals) ─
export const podCampaigns = pgTable(
  "pod_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    podId: uuid("pod_id")
      .notNull()
      .references(() => pods.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    campaignType: text("campaign_type").notNull().default("mixed"), // fellow | deal | mixed
    status: text("status").notNull().default("draft"),
    sprintWeeks: integer("sprint_weeks").notNull().default(4),
    targetFellows: integer("target_fellows").notNull().default(2),
    targetDeals: integer("target_deals").default(0),
    channels: jsonb("channels").default([]),
    weeklyMilestones: jsonb("weekly_milestones").default([]),
    actualProgress: jsonb("actual_progress").default([]),
    currentWeek: integer("current_week").default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    fellowsRecruited: integer("fellows_recruited").default(0),
    dealsSourced: integer("deals_sourced").default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_pod_campaigns_pod").on(table.podId),
    check("pod_campaigns_status_check", sql`${table.status} IN ('draft','active','paused','completed','cancelled')`),
    check("pod_campaigns_type_check", sql`${table.campaignType} IN ('fellow','deal','mixed')`),
  ]
);

// ─── Pod Launches (thesis pod setup playbook) ───────────────────
export const podLaunches = pgTable(
  "pod_launches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    podId: uuid("pod_id")
      .notNull()
      .references(() => pods.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("planning"),
    currentPhase: text("current_phase").notNull().default("pre_work"),
    phaseStartedAt: timestamp("phase_started_at", { withTimezone: true }),
    // v1 columns (kept for backward compat)
    preWork: jsonb("pre_work").default({}),
    sprint1: jsonb("sprint_1").default({}),
    sprint2: jsonb("sprint_2").default({}),
    // v2 columns — hyper-granular operational setup
    preLaunch: jsonb("pre_launch").default({}),
    sprints: jsonb("sprints").default([]),
    operationalRhythm: jsonb("operational_rhythm").default({}),
    roleKpis: jsonb("role_kpis").default({}),
    dealTimelines: jsonb("deal_timelines").default([]),
    implementationTimeline: jsonb("implementation_timeline").default({}),
    schemaVersion: integer("schema_version").notNull().default(1),
    // shared columns
    targetMetrics: jsonb("target_metrics").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }),
    operationalAt: timestamp("operational_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_pod_launches_pod").on(table.podId),
    check(
      "pod_launches_status_check",
      sql`${table.status} IN ('planning','pre_launch','pre_work','sprint_1','sprint_2','sprint_3','sprint_4','post_sprint','operational','paused','cancelled')`
    ),
  ]
);

// ─── Ashby Pipeline (recruitment tracking) ───────────────────────
export const ashbyPipeline = pgTable("ashby_pipeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleTitle: text("role_title").notNull(),
  department: text("department"),
  applicants: integer("applicants").default(0),
  leads: integer("leads").default(0),
  review: integer("review").default(0),
  screening: integer("screening").default(0),
  interview: integer("interview").default(0),
  offer: integer("offer").default(0),
  hired: integer("hired").default(0),
  archived: integer("archived").default(0),
  status: text("status").default("active"),
  priority: text("priority").default("medium"),
  ashbyLive: boolean("ashby_live").default(false),
  displayOrder: integer("display_order").default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
