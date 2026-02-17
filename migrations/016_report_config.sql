-- Migration 016: Report Configuration
-- Stores per-section visibility, narrative text, and highlighted items for the stakeholder report.

CREATE TABLE IF NOT EXISTS report_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  narrative_title TEXT,
  narrative_text TEXT,
  highlighted_ids JSONB DEFAULT '[]'::jsonb,
  highlight_mode TEXT DEFAULT 'all',
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES fellows(id) ON DELETE SET NULL
);

-- Seed default config for all 5 sections
INSERT INTO report_config (section_key, visible, display_order, narrative_title)
VALUES
  ('kpis', true, 1, 'Key Performance Indicators'),
  ('pods', true, 2, 'Investment Thesis Pods'),
  ('fellows', true, 3, 'Fellow Portfolio'),
  ('pipeline', true, 4, 'Recruitment Pipeline'),
  ('impact', true, 5, 'Impact Metrics')
ON CONFLICT (section_key) DO NOTHING;
