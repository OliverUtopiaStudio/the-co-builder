-- Migration 015: Framework Notifications
-- Notifications to fellows when framework assets are updated

CREATE TABLE IF NOT EXISTS framework_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fellow_id UUID REFERENCES fellows(id) ON DELETE CASCADE,
  asset_number INTEGER NOT NULL CHECK (asset_number >= 1 AND asset_number <= 27),
  notification_type TEXT NOT NULL DEFAULT 'framework_updated',
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_framework_notifications_fellow ON framework_notifications(fellow_id);
CREATE INDEX IF NOT EXISTS idx_framework_notifications_asset ON framework_notifications(asset_number);
CREATE INDEX IF NOT EXISTS idx_framework_notifications_read ON framework_notifications(read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_framework_notifications_unread ON framework_notifications(fellow_id, read) WHERE read = false;

COMMENT ON TABLE framework_notifications IS 'Notifications to fellows when framework assets are updated. If fellow_id is NULL, notification applies to all fellows.';
