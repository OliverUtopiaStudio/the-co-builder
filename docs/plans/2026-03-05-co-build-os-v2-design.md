# Co-Build OS v2 — Systematic Redesign

**Date:** 2026-03-05
**Approach:** Surgical Prune (keep codebase, delete unused, refactor core)
**Status:** Design in progress

---

## Motivation

The program model has evolved. The current app was built around individual fellow identity with admin lifecycle management, studio operations, and stakeholder reporting. The new model is a **password-gated, self-serve framework tool** focused on the 27-asset workbench.

---

## Current State (Feature Map)

### User Surfaces (4 — reducing to 1)

| Surface | Who | Routes | Verdict |
|---------|-----|--------|---------|
| **Fellow App** | Program fellows | `/dashboard`, `/onboarding`, `/venture/*`, `/profile`, `/tools` | **KEEP (refactor)** |
| **Admin Panel** | Admins | `/admin/*` (fellows, framework, stipends, settings, venture management) | **REMOVE** |
| **Studio OS** | Studio team | `/studio/*` (KPIs, pods, campaigns, pod launches, pipeline, wiki, report config) | **REMOVE** |
| **Stakeholder Report** | External/Internal | `/report` (public view + enriched internal view) | **REMOVE** |

### Current Features by Area

**Fellow Experience (7 features)**
1. 7-step adaptive onboarding flow — **REMOVE**
2. 27-asset Co-Build framework workbench (questions, checklists, file uploads) — **KEEP**
3. AI-powered asset guidance (Claude, adapts to experience profile) — **KEEP**
4. Venture creation & management — **REFACTOR** (admin-created, not fellow-created)
5. Dashboard with next-action prompts, progress, diagnosis — **REFACTOR** (becomes venture carousel)
6. Stipend milestone tracking — **REMOVE**
7. Google Drive export of asset responses — **KEEP**

**Admin Tools (5 features) — ALL REMOVE**
1. Fellow lifecycle management
2. Framework editor
3. Framework edit history & audit trail
4. Stipend milestone management & payment release
5. Per-venture asset requirement toggles

**Studio Operations (7 features) — ALL REMOVE**
1. KPI scoreboard
2. Pod management
3. Pod sourcing campaigns
4. Pod launch playbooks
5. Recruitment pipeline (Ashby integration)
6. Report configuration
7. Activity feed

**Integrations (4 — all keep)**
1. Supabase (auth + DB) — **KEEP** (simplified to password gate + data storage)
2. Anthropic Claude (AI guidance) — **KEEP**
3. Slack ("Push to Co-Builder" task classification) — **KEEP**
4. Google Drive (file listing & markdown export) — **KEEP**

### Current Database Tables (23)

| Table | Verdict | Reason |
|-------|---------|--------|
| `fellows` | **SIMPLIFY** | Remove auth/lifecycle fields, keep basic identity for playlist assignment |
| `ventures` | **KEEP** | Admin-created, fellows select from carousel |
| `responses` | **KEEP** | Asset question responses |
| `assetCompletion` | **KEEP** | Track which assets are done |
| `uploads` | **KEEP** | File attachments per asset |
| `assetRequirements` | **KEEP** | Which assets are in each venture's playlist |
| `tasks` | **KEEP** | Slack-pushed tasks with AI classification |
| `slackChannelVentures` | **KEEP** | Slack channel to venture mapping |
| `pods` | **REMOVE** | Studio pod management |
| `podCampaigns` | **REMOVE** | Sourcing campaigns |
| `podLaunches` | **REMOVE** | Pod launch playbooks |
| `kpiMetrics` | **REMOVE** | Studio KPIs |
| `kpiHistory` | **REMOVE** | KPI history |
| `ashbyPipeline` | **REMOVE** | Recruitment pipeline |
| `stipendMilestones` | **REMOVE** | Stipend tracking |
| `frameworkEdits` | **REMOVE** | Admin framework customization |
| `frameworkEditHistory` | **REMOVE** | Edit audit trail |
| `frameworkNotifications` | **REMOVE** | Fellow notifications |
| `reportConfig` | **REMOVE** | Report section configuration |

---

## New Model

### Core Concept

A **password-gated, self-serve framework tool** where:
- Single shared password to enter (no user accounts)
- Fellows land on a **venture carousel** (cards with venture names)
- Each venture has a **curated playlist** of assets (preset by studio team)
- Playlists can include: 27-asset framework items, custom modules, Loom video links, downloadable doc links
- AI guidance, Slack integration, Google Drive all remain
- Ventures are created by studio team (via DB/scripts), not by fellows

### Auth Model

- Single shared password stored as `SITE_PASSWORD` env var
- On correct entry, set an HTTP-only cookie
- Middleware checks cookie on all `(app)` routes
- No Supabase user auth, no accounts, no profiles

### User Flow

```
Password gate → Venture carousel → Select venture → Playlist view → Work on assets
```

---

## Design: Architecture & Routes

### New Route Structure

```
src/app/
  (auth)/
    login/page.tsx              — Single password input, no accounts

  (app)/
    page.tsx                    — Venture carousel (cards with venture names)
    venture/
      [ventureId]/
        page.tsx                — Playlist view (assigned assets + custom modules)
        asset/
          [assetNumber]/
            page.tsx            — Asset workbench (questions, checklists, uploads)

  api/
    health/route.ts             — Health check (keep)
    guidance/asset/[assetNumber]/route.ts — AI asset guidance (keep)
    slack/interact/route.ts     — Slack webhook (keep)
    google-drive/files/route.ts — Drive file listing (keep)
    google-drive/files/create/route.ts — Drive file creation (keep)
    upload/route.ts             — File uploads (keep)
```

### Routes to Delete

- `(admin)/*` — entire route group
- `(studio)/*` — entire route group
- `(report)/*` — entire route group
- `(app)/onboarding` — removed
- `(app)/profile` — removed
- `(app)/tools` — removed (Loom videos become custom playlist modules)
- `(app)/venture/new` — removed (ventures are admin-created)
- `(auth)/signup` — removed
- `(auth)/reset-password` — removed
- `(auth)/callback` — removed

### API Routes to Delete

- `/api/report/*` — all report endpoints
- `/api/fellows/*` — fellow CRUD (no accounts)
- `/api/admin/*` — admin framework endpoints
- `/api/studio/*` — studio activity feed
- `/api/guidance/onboarding/*` — onboarding guidance

### Server Actions to Delete

- `admin.ts` — all admin actions
- `studio.ts` — all studio actions
- `report-config.ts` — report configuration
- `onboarding.ts` — onboarding flow
- `profile.ts` — profile updates
- `stipends.ts` — stipend management
- `framework.ts` — framework editing
- `activity.ts` — activity feed

### Server Actions to Keep

- `ventures.ts` — refactor (remove createVenture from fellow side, keep getVentures/getVenture)
- `responses.ts` — keep (save/get responses)
- `diagnosis.ts` — keep (venture health scoring)
- `guidance.ts` — keep (AI asset guidance)
- `google-drive.ts` — keep (Drive export)
- `connections.ts` — evaluate (may simplify)

### Venture Creation

Studio team creates ventures via:
- Direct DB inserts (Supabase dashboard or seed scripts)
- Optional: simple CLI script (`npx tsx scripts/create-venture.ts`)
- NOT via an in-app admin panel

### Playlist / Custom Modules

The `assetRequirements` table already tracks which assets belong to each venture. Extend this concept to support:
- Standard assets (existing 27-asset framework items)
- Custom modules (extra asset-like content)
- External links (Loom videos, downloadable docs)

This may require a new `playlistItems` table or extending `assetRequirements` with a `type` field.

---

## Design Sections Still Pending

- [ ] Playlist data model (how custom modules + links are stored)
- [ ] Dashboard/carousel component design
- [ ] Middleware refactor (password gate logic)
- [ ] Database migration plan (which tables to drop, which to modify)
- [ ] Component cleanup (which components to keep/delete)
- [ ] Testing strategy

---

## Decommission Checklist

### Route Groups to Delete
- [ ] `src/app/(admin)/` — entire directory
- [ ] `src/app/(studio)/` — entire directory (note: currently under `src/app/(app)/studio/` based on routes)
- [ ] `src/app/(report)/` — entire directory
- [ ] `src/app/(auth)/signup/`
- [ ] `src/app/(auth)/reset-password/`
- [ ] `src/app/(auth)/callback/`
- [ ] `src/app/(app)/onboarding/`
- [ ] `src/app/(app)/profile/`
- [ ] `src/app/(app)/tools/`
- [ ] `src/app/(app)/venture/new/`

### API Routes to Delete
- [ ] `src/app/api/report/`
- [ ] `src/app/api/fellows/`
- [ ] `src/app/api/admin/`
- [ ] `src/app/api/studio/`
- [ ] `src/app/api/guidance/onboarding/`

### Server Actions to Delete
- [ ] `src/app/actions/admin.ts`
- [ ] `src/app/actions/studio.ts`
- [ ] `src/app/actions/report-config.ts`
- [ ] `src/app/actions/onboarding.ts`
- [ ] `src/app/actions/profile.ts`
- [ ] `src/app/actions/stipends.ts`
- [ ] `src/app/actions/framework.ts`
- [ ] `src/app/actions/activity.ts`

### Components to Evaluate
- [ ] `src/components/auth/` — refactor for password gate
- [ ] `src/components/layout/SidebarLayout` — simplify (remove admin/studio nav)
- [ ] `src/components/dashboard/` — refactor for venture carousel
- [ ] `src/components/navigation/AssetNavigation` — keep
- [ ] `src/components/diagnosis/` — keep
- [ ] `src/components/connections/` — evaluate
- [ ] `src/components/google-drive/` — keep
- [ ] `src/components/tools/` — remove (Loom embeds move to playlist modules)

### Database Tables to Drop
- [ ] `pods`
- [ ] `podCampaigns`
- [ ] `podLaunches`
- [ ] `kpiMetrics`
- [ ] `kpiHistory`
- [ ] `ashbyPipeline`
- [ ] `stipendMilestones`
- [ ] `frameworkEdits`
- [ ] `frameworkEditHistory`
- [ ] `frameworkNotifications`
- [ ] `reportConfig`

### Database Tables to Simplify
- [ ] `fellows` — strip auth/lifecycle fields, keep name + basic identity for playlist assignment

### Middleware
- [ ] Replace Supabase auth check with password cookie check
- [ ] Remove legacy redirect rules (`/portfolio/*` → `/report/*`)
- [ ] Remove password reset code interception
