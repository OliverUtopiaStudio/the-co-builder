import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Fellows (user profiles) ───────────────────────────────────
export const fellows = pgTable("fellows", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
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
    isActive: boolean("is_active").default(true).notNull(),
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
