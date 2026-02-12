-- Migration 006: Pod Journey Tracking
-- Adds journey checkpoint tracking and current stage to pods table
-- Run in Supabase SQL Editor

-- Add journey tracking columns to pods
ALTER TABLE pods
  ADD COLUMN IF NOT EXISTS journey_checkpoints JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_journey_stage TEXT;

-- Add comment for documentation
COMMENT ON COLUMN pods.journey_checkpoints IS 'Array of journey checkpoint objects tracking progress from thesis formation to network effects POD';
COMMENT ON COLUMN pods.current_journey_stage IS 'Current stage in the journey: thesis_formation, pod_definition, network_design, infrastructure_setup, network_activation, network_effects_operational';
