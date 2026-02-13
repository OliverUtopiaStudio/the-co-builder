-- Migration 010: Seed KPI Metrics
-- Initializes Year 1 KPI targets for the Studio Scoreboard

INSERT INTO kpi_metrics (key, label, target, current, pipeline_notes, display_order, updated_at)
VALUES
  ('eir', 'Entrepreneurs in Residence', 12, 0, 'Target: 12 fellows by end of Year 1', 1, now()),
  ('concepts', 'Venture Concepts', 12, 0, 'Target: 12 active ventures', 2, now()),
  ('spinouts', 'Ventures Spun Out', 6, 0, 'Target: 6 ventures spun out by end of Year 1', 3, now()),
  ('ftes', 'Full-Time Equivalents Hired', 8, 0, 'Target: 8 FTE hires across ventures', 4, now()),
  ('equity', 'Equity Acquired', 15, 0, 'Target: 15% average equity per venture', 5, now()),
  ('revenue', 'Cumulative Revenue Generated', 500000, 0, 'Target: $500K cumulative revenue across ventures', 6, now()),
  ('customers', 'Total Customers Served', 50, 0, 'Target: 50 total customers across all ventures', 7, now())
ON CONFLICT (key) DO NOTHING;

-- Note: These are initial targets. Update current values via the Studio Scoreboard UI
-- or use the refreshKPIsFromData() function to auto-calculate from actual data
