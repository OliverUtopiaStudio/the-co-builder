# Production Deployment Checklist

Step-by-step guide to deploying The Co-Builder from code to live production.

---

## 1. Environment Variables

Set these in your hosting platform (Vercel, etc.). All are required unless marked optional.

### Required — Core

| Variable | Source | Description |
|---|---|---|
| `DATABASE_URL` | Supabase > Settings > Database > Connection string | PostgreSQL connection string (use `pooler` URL for serverless) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL | e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon/public key | Public anonymous key |

### Required — Integrations

| Variable | Source | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | For AI classification (task extraction from Slack) |

### Optional — Integrations

| Variable | Source | Description |
|---|---|---|
| `GOOGLE_ACCESS_TOKEN` | Google Cloud Console | For Google Drive file operations |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Cloud Console | Alternative: service account credentials |
| `SLACK_BOT_TOKEN` | Slack API > Your App > OAuth | `xoxb-...` bot token |
| `SLACK_SIGNING_SECRET` | Slack API > Your App > Basic Info | For verifying Slack webhook signatures |
| `SLACK_WORKSPACE_DOMAIN` | Your Slack workspace | Defaults to `thestudiofellows` |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | Defaults to `https://the-co-builder.vercel.app` |
| `REPORT_PASSWORD` | Choose a password | Shared password for the `/report` stakeholder portfolio page |

---

## 2. Supabase Database Setup

Run these in order in **Supabase Dashboard > SQL Editor**:

### Step 1: Core Schema
If starting fresh, run `supabase-setup.sql` to create all base tables and RLS policies.

### Automatic Schema Drift Detection

The build automatically checks that all Drizzle schema columns exist in the database. If migrations are missing, the Vercel build fails with a clear message listing the exact missing columns. You can also run this manually:

```bash
npm run db:check
```

If the check fails, run the listed migrations in Supabase SQL Editor, then redeploy.

### Step 2: Migrations (run in order)
| Migration | File | What it does |
|---|---|---|
| 002 | `migrations/002_fellow_lifecycle.sql` | Fellow lifecycle stages |
| 003 | `migrations/003_stipend_milestones.sql` | Stipend tracking + RLS |
| 004 | `migrations/004_pod_launch_v2.sql` | Pod launch system |
| 005 | `migrations/005_user_roles.sql` | Role documentation |
| 006 | `migrations/006_pod_journey.sql` | Pod journey checkpoints |
| 007 | `migrations/007_living_thesis.sql` | Living thesis versioning |
| 008 | `migrations/008_seed_fellow_accounts.sql` | Seed fellow data |
| 009 | `migrations/009_add_fellow_resource_links.sql` | Fellow resource links |
| 010 | `migrations/010_seed_kpi_metrics.sql` | Seed KPI definitions |
| 011 | `migrations/011_restore_missing_data.sql` | Restore missing data |
| 012 | `migrations/012_framework_edits.sql` | Framework editor table |
| 013 | `migrations/013_fix_onboarding_status_types.sql` | Boolean to timestamp conversion |
| 014 | `migrations/014_framework_edit_history.sql` | Framework edit version history |
| 015 | `migrations/015_framework_notifications.sql` | Framework update notifications |

### Step 3: RLS for Framework Edits
```sql
ALTER TABLE framework_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on framework_edits"
  ON framework_edits FOR ALL
  USING (public.is_admin());
```

If `is_admin()` doesn't exist, use the alternative in `docs/SUPABASE_MIGRATION_GUIDE.md`.

### Step 4: Enable Realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE framework_edits;
```

---

## 3. Supabase Auth Configuration

In **Supabase Dashboard > Authentication > Settings**:

1. **Site URL**: Set to your production URL (e.g. `https://the-co-builder.vercel.app`)
2. **Redirect URLs**: Add:
   - `https://your-domain.com/callback`
   - `https://your-domain.com/reset-password`
   - `http://localhost:3000/callback` (for local dev)
3. **Email Templates**: Customize confirmation and password reset emails (optional)
4. **SMTP**: Configure if you want branded emails (Supabase uses their own SMTP by default)

---

## 4. Supabase Storage

In **Supabase Dashboard > Storage**:

1. Create a bucket called `uploads` (or verify it exists)
2. Set bucket policy to allow authenticated uploads:
   ```sql
   CREATE POLICY "Allow authenticated uploads"
     ON storage.objects FOR INSERT
     WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Allow authenticated reads"
     ON storage.objects FOR SELECT
     USING (auth.role() = 'authenticated');
   ```

---

## 5. Deploy to Vercel

### First-time Setup
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ANTHROPIC_API_KEY
# ... add others as needed
```

### Deploy
```bash
# Production deploy
vercel --prod
```

Or push to `main` branch — Vercel auto-deploys from GitHub.

---

## 6. Post-Deploy Verification

After deployment, verify each critical flow:

### Auth
- [ ] Navigate to `/login` — page renders
- [ ] Sign up a test user — email verification sent
- [ ] Log in — redirects to `/onboarding` or `/dashboard`
- [ ] Password reset flow works
- [ ] Unauthorized access to `/admin` redirects to login

### Fellow Flow
- [ ] Onboarding 7-step flow completes
- [ ] Dashboard loads with venture data
- [ ] Activity feed shows (or shows empty state gracefully)
- [ ] Create a venture — appears in dashboard
- [ ] Open an asset workflow — questions render
- [ ] Type in a text field — auto-saves (check no console errors)
- [ ] Upload a file — uploads to Supabase storage
- [ ] Mark an asset complete — completion tracked

### Admin Flow
- [ ] Navigate to `/admin` — dashboard shows fellow counts
- [ ] `/admin/fellows` — lists fellows with onboarding dates
- [ ] `/admin/fellows/[id]` — shows fellow detail with agreement/KYC dates
- [ ] `/admin/framework` — framework editor loads, edits save to DB
- [ ] `/admin/stipends` — stipend milestones display

### Studio Flow
- [ ] Navigate to `/studio` — KPI scoreboard loads
- [ ] `/studio/pods` — pod list renders
- [ ] `/studio/campaigns` — campaigns list renders

### API Health
- [ ] `GET /api/health` returns `{ status: "ok", version: "0.1.0" }`

---

## 7. Create Admin User

After first deployment, promote a user to admin:

```sql
UPDATE fellows
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

---

## 8. Optional: Slack Integration

If using Slack:

1. Create a Slack App at `api.slack.com`
2. Enable **Interactivity** — set Request URL to `https://your-domain.com/api/slack/interact`
3. Add bot scopes: `channels:read`, `chat:write`, `commands`
4. Install to workspace
5. Set `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` env vars

---

## 9. Optional: Google Drive Integration

If using Google Drive:

1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account or OAuth credentials
4. Set `GOOGLE_ACCESS_TOKEN` or `GOOGLE_SERVICE_ACCOUNT_JSON` env var

---

## Quick Reference: What's Live vs. Needs Setup

| Feature | Works out of the box | Needs env var | Needs Supabase config |
|---|---|---|---|
| Auth + onboarding | | SUPABASE_URL + ANON_KEY | Auth settings |
| Fellow dashboard + ventures | | DATABASE_URL | Base schema |
| Asset workflows + responses | | DATABASE_URL | Base schema |
| File uploads | | DATABASE_URL | Storage bucket |
| Framework editor | | DATABASE_URL | Migration 012 + RLS + Realtime |
| Agreement/KYC dates | | DATABASE_URL | Migration 013 |
| Activity feed | | DATABASE_URL | Base schema |
| Stipend tracking | | DATABASE_URL | Migration 003 |
| KPI scoreboard | | DATABASE_URL | Migration 010 |
| Slack integration | | SLACK_* vars | Slack App setup |
| Google Drive | | GOOGLE_* vars | Google Cloud setup |
| AI classification | | ANTHROPIC_API_KEY | None |
