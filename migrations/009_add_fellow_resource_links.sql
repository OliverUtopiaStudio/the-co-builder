-- Migration 009: Add resource links to fellows table
-- Adds fields for Google Drive, contextual docs, PRDs, websites, notes, etc.

ALTER TABLE fellows
  ADD COLUMN IF NOT EXISTS google_drive_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS resource_links JSONB DEFAULT '{}'::jsonb;

-- resource_links JSONB structure:
-- {
--   "prd": "https://...",
--   "contextualDocs": ["https://...", "https://..."],
--   "notes": "https://...",
--   "other": [{"label": "Custom Link", "url": "https://..."}]
-- }

COMMENT ON COLUMN fellows.google_drive_url IS 'Main Google Drive folder URL for the fellow';
COMMENT ON COLUMN fellows.website_url IS 'Personal or company website URL';
COMMENT ON COLUMN fellows.resource_links IS 'JSONB object containing PRD links, contextual docs, notes, and other custom links';
