-- ═══════════════════════════════════════════════════════════════
-- The Co-Builder — Supabase Database Setup
-- Run this in the Supabase SQL Editor: Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Fellows (user profiles)
CREATE TABLE IF NOT EXISTS fellows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Ventures
CREATE TABLE IF NOT EXISTS ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fellow_id UUID NOT NULL REFERENCES fellows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  current_stage TEXT DEFAULT '00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ventures_fellow ON ventures(fellow_id);

-- 3. Responses (answers to action-based questions)
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  asset_number INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_venture_asset_question
  ON responses(venture_id, asset_number, question_id);
CREATE INDEX IF NOT EXISTS idx_responses_venture ON responses(venture_id);

-- 4. Asset Completion
CREATE TABLE IF NOT EXISTS asset_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  asset_number INTEGER NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_completion_venture_asset
  ON asset_completion(venture_id, asset_number);

-- 5. Uploads (file references)
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  asset_number INTEGER NOT NULL,
  question_id TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uploads_venture_asset ON uploads(venture_id, asset_number);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ═══════════════════════════════════════════════════════════════

-- Fellows: users can only see/edit their own profile
ALTER TABLE fellows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fellows own their profile" ON fellows
  FOR ALL USING (auth_user_id = auth.uid()::text);

-- Ventures: users can only access their own ventures
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fellows own their ventures" ON ventures
  FOR ALL USING (
    fellow_id IN (SELECT id FROM fellows WHERE auth_user_id = auth.uid()::text)
  );

-- Responses: users can only access responses for their own ventures
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fellows own their responses" ON responses
  FOR ALL USING (
    venture_id IN (
      SELECT v.id FROM ventures v
      JOIN fellows f ON v.fellow_id = f.id
      WHERE f.auth_user_id = auth.uid()::text
    )
  );

-- Asset Completion: same pattern
ALTER TABLE asset_completion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fellows own their completions" ON asset_completion
  FOR ALL USING (
    venture_id IN (
      SELECT v.id FROM ventures v
      JOIN fellows f ON v.fellow_id = f.id
      WHERE f.auth_user_id = auth.uid()::text
    )
  );

-- Uploads: same pattern
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fellows own their uploads" ON uploads
  FOR ALL USING (
    venture_id IN (
      SELECT v.id FROM ventures v
      JOIN fellows f ON v.fellow_id = f.id
      WHERE f.auth_user_id = auth.uid()::text
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Storage Bucket for file uploads
-- ═══════════════════════════════════════════════════════════════
-- Note: Create a bucket called "venture-assets" in Supabase Dashboard > Storage
-- Set it to Private (not public)
-- Add policy: Authenticated users can upload/read their own files

SELECT 'Database setup complete! Now create a "venture-assets" storage bucket in the Dashboard.' AS status;
