-- Migration 019: Marketing Content Plan (studio)
-- Weekly content items for studio to push, with venture tags and Buffer integration.

BEGIN;

CREATE TABLE IF NOT EXISTS marketing_content_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  platform TEXT,
  venture_ids JSONB NOT NULL DEFAULT '[]',
  position INTEGER NOT NULL DEFAULT 0,
  buffer_post_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_content_week
  ON marketing_content_plan(week_start_date);

COMMIT;
