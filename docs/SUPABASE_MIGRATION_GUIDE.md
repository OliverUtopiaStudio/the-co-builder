# Supabase Migration Guide

How to apply the pending database migrations and configuration for WO-1 and WO-2.

---

## Prerequisites

- Access to your Supabase project dashboard
- You'll need: **SQL Editor** access (Project Settings > SQL Editor)
- Estimated time: ~5 minutes

---

## Step 1: Run Migration 012 — Framework Edits Table

This creates the `framework_edits` table that the Framework Editor uses for database persistence.

1. Go to **Supabase Dashboard > SQL Editor**
2. Click **New query**
3. Paste the following SQL:

```sql
-- Migration 012: Framework Edits (admin overlay for 27-asset framework)

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

COMMENT ON TABLE framework_edits IS 'Admin overlay edits for the Co-Build framework. Replaces localStorage in the framework editor.';
```

4. Click **Run**
5. You should see: `Success. No rows returned`

### Verify

Run this query to confirm the table exists:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'framework_edits' ORDER BY ordinal_position;
```

You should see 9 columns: `id`, `asset_number`, `admin_id`, `field_type`, `field_id`, `field_key`, `value`, `created_at`, `updated_at`.

---

## Step 2: Add RLS Policy for Framework Edits

The framework editor is admin-only. Add a Row Level Security policy so only admins can read/write.

1. In **SQL Editor**, run a new query:

```sql
-- Enable RLS
ALTER TABLE framework_edits ENABLE ROW LEVEL SECURITY;

-- Admin full access (matches the pattern used by stipend_milestones)
CREATE POLICY "Admin full access on framework_edits"
  ON framework_edits
  FOR ALL
  USING (public.is_admin());
```

> **Note:** This uses the `public.is_admin()` function that should already exist in your database (it's used by `stipend_milestones`). If you get an error about `is_admin()` not existing, use this alternative policy instead:

```sql
-- Alternative: If is_admin() doesn't exist
ALTER TABLE framework_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on framework_edits"
  ON framework_edits
  FOR ALL
  USING (
    admin_id IN (
      SELECT id FROM fellows
      WHERE auth_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );
```

---

## Step 3: Enable Realtime for Framework Edits

This is required for the ConflictResolutionDialog — it allows the app to detect when another admin edits the framework in real time.

**Option A: Via SQL Editor (recommended)**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE framework_edits;
```

**Option B: Via Dashboard UI**

1. Go to **Database > Replication** (in the left sidebar)
2. Find the `supabase_realtime` publication
3. Click on it to see the list of tables
4. Toggle **framework_edits** to ON
5. Save

### Verify

Run this query to confirm:

```sql
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

You should see `framework_edits` in the list.

---

## Step 4: Run Migration 013 — Agreement/KYC Timestamp Conversion

This converts existing boolean values for `agreementSigned` and `kycVerified` in the `onboarding_status` JSONB field to proper ISO timestamps.

**Important:** This migration modifies existing data. Fellows who had `agreementSigned: true` will get their `created_at` date as the signing timestamp. Fellows with `false` will get `null`.

1. In **SQL Editor**, run a new query:

```sql
-- Migration 013: Normalize agreement/KYC to timestamp in onboarding_status

-- agreementSigned: boolean true -> fellow's created_at date
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{agreementSigned}',
  to_jsonb(created_at::text)
)
WHERE (onboarding_status->>'agreementSigned') = 'true';

-- agreementSigned: boolean false -> null
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{agreementSigned}',
  'null'::jsonb
)
WHERE (onboarding_status->>'agreementSigned') = 'false';

-- kycVerified: boolean true -> fellow's created_at date
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{kycVerified}',
  to_jsonb(created_at::text)
)
WHERE (onboarding_status->>'kycVerified') = 'true';

-- kycVerified: boolean false -> null
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{kycVerified}',
  'null'::jsonb
)
WHERE (onboarding_status->>'kycVerified') = 'false';
```

2. Click **Run**
3. You should see a message like `Success. 3 rows affected` (the number depends on how many fellows have onboarding data)

### Verify

Run this query to check the converted data:

```sql
SELECT full_name,
  onboarding_status->>'agreementSigned' AS agreement_signed,
  onboarding_status->>'kycVerified' AS kyc_verified
FROM fellows
WHERE onboarding_status IS NOT NULL
LIMIT 10;
```

You should see ISO date strings (like `2025-06-15T12:00:00+00:00`) instead of `true`/`false`.

---

## Execution Order

Run the steps in this exact order:

| Step | Migration | What it does | Reversible? |
|------|-----------|-------------|-------------|
| 1 | `012_framework_edits.sql` | Creates new table | Yes (`DROP TABLE framework_edits`) |
| 2 | RLS policy | Adds security | Yes (`DROP POLICY ... ON framework_edits`) |
| 3 | Realtime publication | Enables live sync | Yes (remove from publication) |
| 4 | `013_fix_onboarding_status_types.sql` | Converts boolean data to timestamps | Partially (would need manual revert) |

---

## Troubleshooting

### "relation framework_edits already exists"
The table was already created. This is safe to ignore — `CREATE TABLE IF NOT EXISTS` handles this.

### "function public.is_admin() does not exist"
Use the alternative RLS policy in Step 2 that checks `fellows.role = 'admin'` directly.

### Realtime not working (conflict dialog never appears)
1. Confirm `framework_edits` is in the Realtime publication (Step 3 verify query)
2. Check that your Supabase project has Realtime enabled: **Project Settings > API > Realtime** should show "Enabled"
3. Check browser console for WebSocket connection errors

### Migration 013 shows "0 rows affected"
This means no fellows had boolean values for `agreementSigned`/`kycVerified`. This is fine — it means either there are no fellows yet, or the data was already in the correct format.

---

## After Completing All Steps

The following features will be fully functional:
- **Framework Editor** — admins can edit the 27-asset framework with changes saved to the database
- **Real-time sync** — edits by one admin appear for other admins immediately
- **Conflict resolution** — if two admins edit the same field, a dialog lets them choose which version to keep
- **Agreement/KYC dates** — admin and fellow dashboards show actual completion dates instead of checkmarks
