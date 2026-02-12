-- 004: Pod Launch Playbook v2 — Hyper-Granular Operational Setup
-- Adds new JSONB columns for expanded sprint model with daily task grids,
-- deal timelines, role KPIs, operational rhythm, and implementation timeline.
-- Keeps v1 columns (pre_work, sprint_1, sprint_2) for backward compatibility.

-- New v2 columns
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS pre_launch JSONB DEFAULT '{}';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS sprints JSONB DEFAULT '[]';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS operational_rhythm JSONB DEFAULT '{}';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS role_kpis JSONB DEFAULT '{}';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS deal_timelines JSONB DEFAULT '[]';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS implementation_timeline JSONB DEFAULT '{}';
ALTER TABLE pod_launches ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1;

-- Update status constraint to allow new phases
ALTER TABLE pod_launches DROP CONSTRAINT IF EXISTS pod_launches_status_check;
ALTER TABLE pod_launches ADD CONSTRAINT pod_launches_status_check
  CHECK (status IN (
    'planning','pre_launch','pre_work',
    'sprint_1','sprint_2','sprint_3','sprint_4',
    'post_sprint','operational','paused','cancelled'
  ));
