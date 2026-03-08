CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp with time zone,
	"status" text DEFAULT 'not_started' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_status_check" CHECK ("milestones"."status" IN ('not_started','in_progress','completed','blocked'))
);
--> statement-breakpoint
CREATE TABLE "todo_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venture_id" uuid NOT NULL,
	"milestone_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text,
	"asset_number" integer,
	"external_url" text,
	"external_provider" text,
	"assigned_to" uuid,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_by" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "todo_status_check" CHECK ("todo_items"."status" IN ('open','in_progress','completed','cancelled')),
	CONSTRAINT "todo_priority_check" CHECK ("todo_items"."priority" IN ('low','medium','high','urgent'))
);
--> statement-breakpoint
ALTER TABLE "ventures" ADD COLUMN "categorized_links" jsonb DEFAULT '{"product":[],"gtm":[],"investment":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_created_by_fellows_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."fellows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "public"."ventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_assigned_to_fellows_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."fellows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_created_by_fellows_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."fellows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_milestones_venture" ON "milestones" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_todo_venture" ON "todo_items" USING btree ("venture_id");--> statement-breakpoint
CREATE INDEX "idx_todo_milestone" ON "todo_items" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "idx_todo_status" ON "todo_items" USING btree ("venture_id","status");