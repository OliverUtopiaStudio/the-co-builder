-- Migration 007: Living Thesis System
-- Adds thesis versioning, evidence tracking, and alignment scoring
-- Run in Supabase SQL Editor

-- Add living thesis columns to pods
ALTER TABLE pods
  ADD COLUMN IF NOT EXISTS thesis_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS thesis_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS alignment_criteria JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_log JSONB DEFAULT '[]'::jsonb;

-- Add alignment tracking to ventures
ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS pod_alignment_score NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS alignment_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN pods.thesis_version IS 'Current version number of the thesis';
COMMENT ON COLUMN pods.thesis_history IS 'Array of thesis version objects tracking evolution over time';
COMMENT ON COLUMN pods.alignment_criteria IS 'Array of alignment criteria with weights for scoring';
COMMENT ON COLUMN pods.evidence_log IS 'Array of evidence entries (validates/challenges thesis)';
COMMENT ON COLUMN ventures.pod_alignment_score IS '0-100 score indicating how well venture aligns with pod thesis';
COMMENT ON COLUMN ventures.alignment_notes IS 'Notes explaining alignment score and fit';
