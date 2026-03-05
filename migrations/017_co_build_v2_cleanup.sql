-- Migration 017: Co-Build OS v2 cleanup
-- Drops legacy tables that powered removed admin/studio/report functionality.
-- Safe to run multiple times; uses IF EXISTS.

BEGIN;

-- Stakeholder report configuration
DROP TABLE IF EXISTS report_config CASCADE;

-- Framework admin/editor tables
DROP TABLE IF EXISTS framework_notifications CASCADE;
DROP TABLE IF EXISTS framework_edit_history CASCADE;
DROP TABLE IF EXISTS framework_edits CASCADE;

-- Stipend tracking
DROP TABLE IF EXISTS stipend_milestones CASCADE;

-- Studio pods / campaigns / launches / KPIs / recruiting
DROP TABLE IF EXISTS pod_launches CASCADE;
DROP TABLE IF EXISTS pod_campaigns CASCADE;
DROP TABLE IF EXISTS ashby_pipeline CASCADE;
DROP TABLE IF EXISTS kpi_history CASCADE;
DROP TABLE IF EXISTS kpi_metrics CASCADE;
DROP TABLE IF EXISTS pods CASCADE;

COMMIT;

