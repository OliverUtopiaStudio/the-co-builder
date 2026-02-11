-- 003: Stipend milestones table
-- Global milestone definitions (fellow_id IS NULL) + per-fellow payment tracking

CREATE TABLE IF NOT EXISTS stipend_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fellow_id UUID REFERENCES fellows(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL DEFAULT 2500,
  milestone_met TIMESTAMPTZ,
  payment_released TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stipend_fellow ON stipend_milestones(fellow_id);
CREATE INDEX IF NOT EXISTS idx_stipend_milestone_num ON stipend_milestones(milestone_number);

-- RLS policies
ALTER TABLE stipend_milestones ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access on stipend_milestones"
  ON stipend_milestones
  FOR ALL
  USING (public.is_admin());

-- Fellows can read their own stipend records
CREATE POLICY "Fellows read own stipends"
  ON stipend_milestones
  FOR SELECT
  USING (
    fellow_id IN (
      SELECT id FROM fellows WHERE auth_user_id = auth.uid()::text
    )
  );

-- Fellows can also read global definitions (fellow_id IS NULL)
CREATE POLICY "Anyone reads global milestone definitions"
  ON stipend_milestones
  FOR SELECT
  USING (fellow_id IS NULL);

-- Seed default milestones (global definitions)
INSERT INTO stipend_milestones (fellow_id, milestone_number, title, description, amount)
VALUES
  (NULL, 1, 'Stage 01 Approved', 'First stipend payment triggered when Stage 01 (Invention) is reviewed and approved by the studio team.', 2500),
  (NULL, 2, 'Stage 04 Approved', 'Second stipend payment triggered when Stage 04 (Product-Market Fit) is reviewed and approved by the studio team.', 2500);
