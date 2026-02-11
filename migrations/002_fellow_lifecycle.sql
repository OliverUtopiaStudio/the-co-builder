-- Migration 002: Fellow Lifecycle (MVP)
-- Adds lifecycle tracking columns to fellows table
-- Run in Supabase SQL Editor

-- Add lifecycle columns to fellows
ALTER TABLE fellows
  ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT NOT NULL DEFAULT 'onboarding',
  ADD COLUMN IF NOT EXISTS experience_profile TEXT,
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS background TEXT,
  ADD COLUMN IF NOT EXISTS selection_rationale TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_status JSONB;

-- Set existing fellows (who already have ventures) to 'building' stage
UPDATE fellows
SET lifecycle_stage = 'building',
    onboarding_status = '{"agreementSigned": null, "kycVerified": null, "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb
WHERE id IN (SELECT DISTINCT fellow_id FROM ventures);

-- Set admin to 'building' (skip onboarding)
UPDATE fellows
SET lifecycle_stage = 'building'
WHERE role = 'admin';
