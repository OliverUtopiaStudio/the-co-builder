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
  // Resource links
  googleDriveUrl: text("google_drive_url"),
  websiteUrl: text("website_url"),
  resourceLinks: jsonb("resource_links").default({}),
  // Lifecycle fields (MVP)
  lifecycleStage: text("lifecycle_stage").notNull().default("onboarding"),
  experienceProfile: text("experience_profile"),
  domain: text("domain"),
  background: text("background"),
  selectionRationale: text("selection_rationale"),
  onboardingStatus: jsonb("onboarding_status"),
  // Legacy studio fields (kept in DB but unused in v2)
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
    // Categorized resource links: { product: [{title,url}], gtm: [{title,url}], investment: [{title,url}] }
    categorizedLinks: jsonb("categorized_links").default({ product: [], gtm: [], investment: [] }),
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

// ─── Playlist Items (per-venture curated playlist) ────────────────
export const playlistItems = pgTable(
  "playlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    type: text("type").notNull(), // 'asset' | 'module' | 'link'
    assetNumber: integer("asset_number"),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_playlist_items_venture").on(table.ventureId),
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

// ─── Asset Media (Loom videos + Drive templates per lesson) ─────
export const assetMedia = pgTable(
  "asset_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetNumber: integer("asset_number").notNull().unique(),
    loomUrl: text("loom_url"),
    driveTemplateUrl: text("drive_template_url"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
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

// ─── Milestones (studio-fellow agreed plan) ─────────────────────
export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetDate: timestamp("target_date", { withTimezone: true }),
    status: text("status").default("not_started").notNull(),
    position: integer("position").notNull().default(0),
    createdBy: uuid("created_by").references(() => fellows.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_milestones_venture").on(table.ventureId),
    check(
      "milestones_status_check",
      sql`${table.status} IN ('not_started','in_progress','completed','blocked')`
    ),
  ]
);

// ─── To-Do Items (shared studio-fellow to-dos) ──────────────────
export const todoItems = pgTable(
  "todo_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ventureId: uuid("venture_id")
      .notNull()
      .references(() => ventures.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").default("open").notNull(),
    priority: text("priority").default("medium").notNull(),
    category: text("category"), // 'product' | 'gtm' | 'investment' | null
    assetNumber: integer("asset_number"), // links to content library asset 1-27
    externalUrl: text("external_url"), // Notion/Linear URL
    externalProvider: text("external_provider"), // 'notion' | 'linear' | null
    assignedTo: uuid("assigned_to").references(() => fellows.id),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => fellows.id),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_todo_venture").on(table.ventureId),
    index("idx_todo_milestone").on(table.milestoneId),
    index("idx_todo_status").on(table.ventureId, table.status),
    check(
      "todo_status_check",
      sql`${table.status} IN ('open','in_progress','completed','cancelled')`
    ),
    check(
      "todo_priority_check",
      sql`${table.priority} IN ('low','medium','high','urgent')`
    ),
  ]
);

// ─── Marketing Content Plan (studio) ─────────────────────────────
export const marketingContentPlan = pgTable(
  "marketing_content_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStartDate: timestamp("week_start_date", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    platform: text("platform"), // e.g. 'linkedin' | 'twitter' | null = any
    ventureIds: jsonb("venture_ids").$type<string[]>().default([]),
    position: integer("position").notNull().default(0),
    bufferPostId: text("buffer_post_id"), // set after pushing to Buffer
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_marketing_content_week").on(table.weekStartDate)]
);

// Legacy studio/report tables have been physically dropped in migration 017
// and are intentionally omitted from the v2 schema.
