CREATE TABLE "asset_completion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"asset_number" integer NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_number" integer NOT NULL,
	"loom_url" text,
	"drive_template_url" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_media_asset_number_unique" UNIQUE("asset_number")
);
--> statement-breakpoint
CREATE TABLE "asset_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid,
	"asset_number" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'fellow' NOT NULL,
	"avatar_url" text,
	"bio" text,
	"linkedin_url" text,
	"google_drive_url" text,
	"website_url" text,
	"resource_links" jsonb DEFAULT '{}'::jsonb,
	"lifecycle_stage" text DEFAULT 'onboarding' NOT NULL,
	"experience_profile" text,
	"domain" text,
	"background" text,
	"selection_rationale" text,
	"onboarding_status" jsonb,
	"equity_percentage" numeric(5, 2) DEFAULT '0',
	"global_potential_rating" integer,
	"qatar_impact_rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fellows_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "playlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" text NOT NULL,
	"asset_number" integer,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"asset_number" integer NOT NULL,
	"question_id" text NOT NULL,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slack_channel_ventures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"slack_channel_id" text NOT NULL,
	"slack_channel_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slack_channel_ventures_slack_channel_id_unique" UNIQUE("slack_channel_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"asset_number" integer NOT NULL,
	"checklist_item_id" text,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"slack_channel_id" text,
	"slack_message_ts" text,
	"slack_user_id" text,
	"slack_user_name" text,
	"ai_confidence" integer,
	"ai_reasoning" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "tasks_asset_range" CHECK ("tasks"."asset_number" >= 1 AND "tasks"."asset_number" <= 27),
	CONSTRAINT "tasks_priority_check" CHECK ("tasks"."priority" IN ('low','medium','high','urgent')),
	CONSTRAINT "tasks_status_check" CHECK ("tasks"."status" IN ('open','in_progress','completed','cancelled'))
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"asset_number" integer NOT NULL,
	"question_id" text,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ventures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fellow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text,
	"current_stage" text DEFAULT '00',
	"google_drive_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"pod_alignment_score" numeric(5, 2),
	"alignment_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_completion" ADD CONSTRAINT "asset_completion_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_requirements" ADD CONSTRAINT "asset_requirements_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slack_channel_ventures" ADD CONSTRAINT "slack_channel_ventures_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventures" ADD CONSTRAINT "ventures_fellow_id_fellows_id_fk" FOREIGN KEY ("fellow_id") REFERENCES "public"."fellows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_asset_completion_venture_asset" ON "asset_completion" USING btree ("venture_id","asset_number");--> statement-breakpoint
CREATE INDEX "idx_asset_req_venture_id" ON "asset_requirements" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_playlist_items_venture" ON "playlist_items" USING btree ("venture_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_responses_venture_asset_question" ON "responses" USING btree ("venture_id","asset_number","question_id");--> statement-breakpoint
CREATE INDEX "idx_responses_venture" ON "responses" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_scv_venture" ON "slack_channel_ventures" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_venture" ON "tasks" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_venture_asset" ON "tasks" USING btree ("venture_id","asset_number");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("venture_id","status");--> statement-breakpoint
CREATE INDEX "idx_uploads_venture_asset" ON "uploads" USING btree ("venture_id","asset_number");--> statement-breakpoint
CREATE INDEX "idx_ventures_fellow" ON "ventures" USING btree ("fellow_id");