# Data Restoration Guide

**Issue:** Features are being lost, KPI data is missing, co-build lessons have been lost.

## Problem Summary

1. **KPI Data Missing**: The `kpi_metrics` table exists but has no seed data
2. **Co-build Lessons**: The AI learning system exists but doesn't store lessons in a database table (this is a Phase 3+ feature)
3. **Features Lost**: May be due to missing migrations or seed data

## Solution

### Step 1: Run Data Restoration Migration

Execute the migration file in Supabase SQL Editor:

```bash
migrations/011_restore_missing_data.sql
```

This will:
- ✅ Seed KPI metrics with Year 1 targets
- ✅ Ensure all required tables exist
- ✅ Create missing indexes
- ✅ Verify data integrity

### Step 2: Refresh KPI Current Values

After running the migration, go to the Studio Scoreboard (`/studio`) and click **"Refresh from Data"** to update current values from actual database counts.

### Step 3: Verify Features

Check these features are working:

1. **Studio Scoreboard** (`/studio`)
   - Should show 7 KPI metrics with targets
   - Current values should update when you click "Refresh from Data"

2. **Admin Dashboard** (`/admin`)
   - Should show fellow stats
   - Stipend tracking should work

3. **Venture Pages** (`/venture/[ventureId]`)
   - Connection status should display
   - Asset completion tracking should work

## What About "Co-build Lessons"?

The PRD mentions an AI Layer that "Learns from patterns across all ventures to improve over time" and "Surfaces cohort patterns: where fellows get stuck, which assets need better guidance."

**Current Status:**
- ✅ AI classification system exists (`src/lib/ai/classify.ts`)
- ✅ Tasks are created from Slack messages
- ❌ No database table for storing "lessons learned" (Phase 3+ feature)
- ✅ Hardcoded lessons exist in `src/lib/data.ts` (`keyTakeaways`, `failureModes`)

**To Implement Lessons Storage (Future):**
1. Create a `co_build_lessons` table
2. Store patterns identified by AI analysis
3. Display lessons in Studio view
4. Use lessons to improve guidance

## KPI Metrics Seeded

The following KPI metrics are now seeded:

| Key | Label | Target | Description |
|-----|-------|--------|-------------|
| `eir` | Entrepreneurs in Residence | 12 | Target: 12 fellows by end of Year 1 |
| `concepts` | Venture Concepts | 12 | Target: 12 active ventures |
| `spinouts` | Ventures Spun Out | 6 | Target: 6 ventures spun out by end of Year 1 |
| `ftes` | Full-Time Equivalents Hired | 8 | Target: 8 FTE hires across ventures |
| `equity` | Equity Acquired | 15 | Target: 15% average equity per venture |
| `revenue` | Cumulative Revenue Generated | 500000 | Target: $500K cumulative revenue across ventures |
| `customers` | Total Customers Served | 50 | Target: 50 total customers across all ventures |

## Verification Checklist

- [ ] Run `migrations/011_restore_missing_data.sql` in Supabase
- [ ] Verify KPI metrics appear in Studio Scoreboard
- [ ] Click "Refresh from Data" to update current values
- [ ] Check that all tables exist (pods, campaigns, launches, etc.)
- [ ] Verify connection status works on venture pages
- [ ] Check that fellow data is intact

## If Issues Persist

1. **Check Migration Status**: Run `SELECT * FROM schema_migrations;` (if using migration tracking)
2. **Verify Table Structure**: Compare `src/db/schema.ts` with actual database schema
3. **Check RLS Policies**: Ensure Row Level Security policies allow admin access
4. **Review Recent Deployments**: Check if any migrations were rolled back

## Next Steps

1. **Immediate**: Run the restoration migration
2. **Short-term**: Implement lessons storage table (if needed)
3. **Long-term**: Build AI pattern analysis to populate lessons automatically
