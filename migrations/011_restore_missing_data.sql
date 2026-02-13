-- Migration 011: Restore Missing Data
-- This migration restores KPI metrics, ensures all required tables exist, and seeds initial data

-- ============================================================================
-- 1. Ensure KPI Metrics Table Exists and Seed Initial Data
-- ============================================================================

-- Create kpi_metrics table if it doesn't exist (should already exist from schema)
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 0,
  current INTEGER NOT NULL DEFAULT 0,
  pipeline_notes TEXT,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed KPI metrics (insert only if they don't exist)
INSERT INTO kpi_metrics (key, label, target, current, pipeline_notes, display_order, updated_at)
VALUES
  ('eir', 'Entrepreneurs in Residence', 12, 0, 'Target: 12 fellows by end of Year 1', 1, now()),
  ('concepts', 'Venture Concepts', 12, 0, 'Target: 12 active ventures', 2, now()),
  ('spinouts', 'Ventures Spun Out', 6, 0, 'Target: 6 ventures spun out by end of Year 1', 3, now()),
  ('ftes', 'Full-Time Equivalents Hired', 8, 0, 'Target: 8 FTE hires across ventures', 4, now()),
  ('equity', 'Equity Acquired', 15, 0, 'Target: 15% average equity per venture', 5, now()),
  ('revenue', 'Cumulative Revenue Generated', 500000, 0, 'Target: $500K cumulative revenue across ventures', 6, now()),
  ('customers', 'Total Customers Served', 50, 0, 'Target: 50 total customers across all ventures', 7, now())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  target = EXCLUDED.target,
  pipeline_notes = EXCLUDED.pipeline_notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ============================================================================
-- 2. Ensure KPI History Table Exists
-- ============================================================================

CREATE TABLE IF NOT EXISTS kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT NOT NULL REFERENCES kpi_metrics(key) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_key, month)
);

CREATE INDEX IF NOT EXISTS idx_kpi_history_key ON kpi_history(metric_key);

-- ============================================================================
-- 3. Ensure All Other Required Tables Exist
-- ============================================================================

-- Pods table (if missing)
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  thesis TEXT,
  market_gap TEXT,
  target_archetype TEXT,
  color TEXT DEFAULT '#CC5536',
  clusters JSONB DEFAULT '[]',
  optimal_fellow_profile TEXT,
  corporate_partners JSONB DEFAULT '[]',
  co_investors JSONB DEFAULT '[]',
  sourcing_strategy TEXT,
  display_order INTEGER DEFAULT 0,
  journey_checkpoints JSONB DEFAULT '[]',
  current_journey_stage TEXT,
  thesis_version INTEGER DEFAULT 1,
  thesis_history JSONB DEFAULT '[]',
  alignment_criteria JSONB DEFAULT '[]',
  evidence_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ashby Pipeline table (if missing)
CREATE TABLE IF NOT EXISTS ashby_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_title TEXT NOT NULL,
  department TEXT,
  applicants INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  review INTEGER DEFAULT 0,
  screening INTEGER DEFAULT 0,
  interview INTEGER DEFAULT 0,
  offer INTEGER DEFAULT 0,
  hired INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  ashby_live BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pod Campaigns table (if missing)
CREATE TABLE IF NOT EXISTS pod_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'mixed',
  status TEXT NOT NULL DEFAULT 'draft',
  sprint_weeks INTEGER NOT NULL DEFAULT 4,
  target_fellows INTEGER NOT NULL DEFAULT 2,
  target_deals INTEGER DEFAULT 0,
  channels JSONB DEFAULT '[]',
  weekly_milestones JSONB DEFAULT '[]',
  actual_progress JSONB DEFAULT '[]',
  current_week INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  fellows_recruited INTEGER DEFAULT 0,
  deals_sourced INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('draft','active','paused','completed','cancelled')),
  CHECK (campaign_type IN ('fellow','deal','mixed'))
);

-- Pod Launches table (if missing)
CREATE TABLE IF NOT EXISTS pod_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  current_phase TEXT NOT NULL DEFAULT 'pre_work',
  phase_started_at TIMESTAMPTZ,
  pre_work JSONB DEFAULT '{}',
  sprint_1 JSONB DEFAULT '{}',
  sprint_2 JSONB DEFAULT '{}',
  pre_launch JSONB DEFAULT '{}',
  sprints JSONB DEFAULT '[]',
  operational_rhythm JSONB DEFAULT '{}',
  role_kpis JSONB DEFAULT '{}',
  deal_timelines JSONB DEFAULT '[]',
  implementation_timeline JSONB DEFAULT '{}',
  schema_version INTEGER NOT NULL DEFAULT 1,
  target_metrics JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  operational_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('planning','pre_launch','pre_work','sprint_1','sprint_2','sprint_3','sprint_4','post_sprint','operational','paused','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_pod_launches_pod ON pod_launches(pod_id);

-- Tasks table (if missing)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  asset_number INTEGER NOT NULL,
  checklist_item_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL,
  slack_channel_id TEXT,
  slack_message_ts TEXT,
  slack_user_id TEXT,
  slack_user_name TEXT,
  ai_confidence INTEGER,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK (asset_number >= 1 AND asset_number <= 27),
  CHECK (priority IN ('low','medium','high','urgent')),
  CHECK (status IN ('open','in_progress','completed','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_venture ON tasks(venture_id);
CREATE INDEX IF NOT EXISTS idx_tasks_venture_asset ON tasks(venture_id, asset_number);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(venture_id, status);

-- Slack Channel Ventures table (if missing)
CREATE TABLE IF NOT EXISTS slack_channel_ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  slack_channel_id TEXT NOT NULL UNIQUE,
  slack_channel_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scv_venture ON slack_channel_ventures(venture_id);

-- ============================================================================
-- 4. Verify Data Integrity
-- ============================================================================

-- Check if KPI metrics were seeded
DO $$
DECLARE
  kpi_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO kpi_count FROM kpi_metrics;
  IF kpi_count = 0 THEN
    RAISE NOTICE 'WARNING: No KPI metrics found after seeding. Check for errors above.';
  ELSE
    RAISE NOTICE 'SUCCESS: % KPI metrics seeded.', kpi_count;
  END IF;
END $$;

-- ============================================================================
-- 5. Summary
-- ============================================================================

SELECT 
  'Data restoration complete. Run refreshKPIsFromData() in Studio UI to update current values from actual data.' AS status,
  (SELECT COUNT(*) FROM kpi_metrics) AS kpi_metrics_count,
  (SELECT COUNT(*) FROM kpi_history) AS kpi_history_count;
