-- Migration 018: Playlist Items
-- Per-venture curated playlists combining framework assets, custom modules, and external links.

BEGIN;

CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'asset' | 'module' | 'link'
  asset_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_venture
  ON playlist_items(venture_id, position);

COMMIT;

