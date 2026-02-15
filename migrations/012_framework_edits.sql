-- Migration 012: Framework Edits (admin overlay for 27-asset framework)
-- Enables database-backed persistence and real-time collaboration in the framework editor.

CREATE TABLE IF NOT EXISTS framework_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_number INTEGER NOT NULL CHECK (asset_number >= 1 AND asset_number <= 27),
  admin_id UUID NOT NULL REFERENCES fellows(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('title','purpose','coreQuestion','checklist','question')),
  field_id TEXT NOT NULL DEFAULT '',
  field_key TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asset_number, field_type, field_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_framework_edits_asset ON framework_edits(asset_number);
CREATE INDEX IF NOT EXISTS idx_framework_edits_admin ON framework_edits(admin_id);

-- Enable Supabase Realtime for this table (run in Supabase Dashboard if using Realtime)
-- ALTER PUBLICATION supabase_realtime ADD TABLE framework_edits;

COMMENT ON TABLE framework_edits IS 'Admin overlay edits for the Co-Build framework (asset titles, purpose, core question, checklist items, question labels/descriptions). Replaces localStorage in the framework editor.';
