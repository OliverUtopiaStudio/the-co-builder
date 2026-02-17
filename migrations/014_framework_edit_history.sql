-- Migration 014: Framework Edit History
-- Tracks all changes to framework edits for version history and rollback capability

CREATE TABLE IF NOT EXISTS framework_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_edit_id UUID REFERENCES framework_edits(id) ON DELETE SET NULL,
  asset_number INTEGER NOT NULL CHECK (asset_number >= 1 AND asset_number <= 27),
  admin_id UUID NOT NULL REFERENCES fellows(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('title','purpose','coreQuestion','checklist','question')),
  field_id TEXT NOT NULL DEFAULT '',
  field_key TEXT NOT NULL DEFAULT '',
  old_value TEXT,
  new_value TEXT,
  action TEXT NOT NULL CHECK (action IN ('created','updated','deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_framework_edit_history_asset ON framework_edit_history(asset_number);
CREATE INDEX IF NOT EXISTS idx_framework_edit_history_edit_id ON framework_edit_history(framework_edit_id);
CREATE INDEX IF NOT EXISTS idx_framework_edit_history_admin ON framework_edit_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_framework_edit_history_created ON framework_edit_history(created_at DESC);

COMMENT ON TABLE framework_edit_history IS 'Version history for framework edits. Tracks all changes (created, updated, deleted) for audit trail and rollback capability.';
