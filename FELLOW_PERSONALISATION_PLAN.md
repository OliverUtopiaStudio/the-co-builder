# Fellow Personalisation Build Plan

> Replace the generic content library with an identity-aware, personalised fellow experience.
> Each phase is independently deployable.

---

## Architecture Context

### Current Auth System
- **Site password** (`co_build_site_auth` cookie) → gates `/library`, `/fellows`, `/astrolabe`
- **Admin password** (`co_build_admin_auth` cookie) → unlocks media editor via lock button on asset pages
- No fellow identity — everyone sees the same view

### Existing Infrastructure (already built, not yet surfaced)
- **Diagnosis engine** (`src/app/actions/diagnosis.ts`) — calculates next critical action, velocity, estimated spinout date, blockers per venture
- **Playlist system** (`playlistItems` table) — per-venture curated asset sequences (table exists, no UI)
- **Guidance system** (`src/lib/guidance.ts`) — stage-specific tips, experience-profile aware
- **Asset completion tracking** (`assetCompletion` table) — per venture + asset, with timestamps
- **Response tracking** (`responses` table) — per venture + asset + question
- **27 assets** across 7 stages (00–06) with full question workflows (`src/lib/questions/`)

### Database (Drizzle ORM + PostgreSQL — new setup, not legacy)
- Schema: `src/db/schema.ts`
- Key tables: `fellows`, `ventures`, `milestones`, `todoItems`, `assetCompletion`, `playlistItems`, `responses`
- Existing admin CRUD: milestones, todos, categorised links (but NOT fellows/ventures themselves)

---

## Fellows to Seed

| Name | Startup |
|------|---------|
| Urav Shah | Evos |
| Alexandra Coleman | Azraq |
| Ganesh Sahane | Durian Labs |
| Dr. Haji | Mentix |
| Ruby Smith | Serve |
| Phares Kariuki | Ruckstack |
| Dr. Satheesh | Barrier Intelligence |

---

## Phase 1: Fellow Data Foundation

**Goal:** Fellows and ventures exist in the DB. Admin can manage them.

### 1.1 Add Server Actions
**File:** `src/app/actions/fellows.ts`

Add these actions (following existing admin-only pattern with `requireAdmin()`):

```typescript
// Fellow CRUD
createFellow({ fullName, email?, bio?, linkedinUrl?, websiteUrl?, domain?, experienceProfile? })
updateFellow(fellowId, { ...partial fields })
deleteFellow(fellowId) // soft delete or hard delete with cascade

// Venture CRUD
createVenture(fellowId, { name, description?, industry?, currentStage? })
updateVenture(ventureId, { ...partial fields })
```

### 1.2 Seed Script
Create `src/scripts/seed-fellows.ts` (or a server action) to insert the 7 fellows + their ventures.

Each fellow needs:
- `fullName` (required)
- `role`: "fellow" (default)
- A linked venture with `name` and `isActive: true`
- `currentStage`: default "00" (can be updated later)

### 1.3 Admin Management Page
**Route:** `/fellows/manage` (or add to existing `/fellows` page behind admin check)

**Features:**
- Table/list of all fellows with their venture name and current stage
- "Add Fellow" button → form with: name, email, venture name, industry, domain
- Edit button per row → inline edit or modal
- Creating a fellow auto-creates their venture record

**Pattern to follow:** Look at how `MilestonePlan.tsx` and `TodoList.tsx` handle admin-only inline forms.

---

## Phase 2: Two-Path Login

**Goal:** The app knows WHO is logged in, not just that someone has the site password.

### 2.1 Redesign Login Page
**File:** `src/app/(auth)/login/page.tsx`

Replace the single password form with two paths:

```
┌─────────────────────────────────┐
│                                 │
│     THE CO-BUILDER              │
│                                 │
│  ┌───────────┐ ┌───────────┐   │
│  │ I'm a     │ │ I'm       │   │
│  │ Fellow    │ │ Studio    │   │
│  └───────────┘ └───────────┘   │
│                                 │
│  [Selected path form here]      │
│                                 │
└─────────────────────────────────┘
```

**Fellow path:**
1. Enter site password (`SITE_PASSWORD`)
2. On success → show dropdown of fellow names (fetched from DB)
3. Select name → set `co_build_site_auth` cookie + `co_build_fellow_id` cookie (fellow UUID)
4. Redirect to `/dashboard`

**Studio/Admin path:**
1. Enter admin password (`ADMIN_PASSWORD`)
2. On success → set `co_build_admin_auth` cookie + `co_build_site_auth` cookie
3. Redirect to `/fellows` (admin overview)

### 2.2 New API Route
**File:** `src/app/api/auth/fellow-login/route.ts`

```typescript
POST /api/auth/fellow-login
Body: { password: string, fellowId: string }
→ Validates site password
→ Validates fellowId exists in DB
→ Sets co_build_site_auth + co_build_fellow_id cookies
→ Returns success
```

### 2.3 Update Middleware
**File:** `src/middleware.ts`

- Keep existing protected route logic
- Add: if `co_build_fellow_id` cookie exists and path is `/` or `/library`, redirect to `/dashboard`
- Admin users (with `co_build_admin_auth`) skip the redirect

### 2.4 Helper Functions
**File:** `src/app/actions/fellows.ts`

```typescript
getCurrentFellowId() // reads co_build_fellow_id cookie, returns UUID or null
getCurrentFellow()   // returns full fellow record + active venture for the logged-in fellow
```

Note: `getCurrentFellowId()` already exists as a placeholder returning null — update it to read the cookie.

### 2.5 Remove the Lock Button
**File:** `src/app/(app)/library/[number]/page.tsx`

- Remove the `AdminLoginModal` and lock icon
- Admin media editor now shows automatically if `co_build_admin_auth` cookie is set (already partially works this way)

---

## Phase 3: Fellow Dashboard

**Goal:** Fellows land on a personalised page that feels built just for them.

### 3.1 Dashboard Page
**Route:** `src/app/(app)/dashboard/page.tsx`

This is the fellow's home after login. Server component that fetches:
- Current fellow + active venture (from `getCurrentFellow()`)
- Asset completion data (from `assetCompletion` table)
- Milestones (from `getMilestones()`)
- Active todos (from `getTodoItems()`)
- Categorised links (from `getCategorizedLinks()`)
- Next critical action (from diagnosis engine)

### 3.2 Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│  Welcome back, {fellow.fullName}                 │
│  {venture.name} · Stage {XX}: {stageName}        │
│                                                  │
│  ████████░░░░░░░░░░░░  {n}/27 assets · {%}      │
│  Est. {weeks} weeks to spinout                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ⚡ YOUR NEXT STEP                               │
│  ┌──────────────────────────────────────────┐    │
│  │ Asset #{n}: {title}                      │    │
│  │ "{coreQuestion}"                         │    │
│  │ Why: {reason from diagnosis engine}      │    │
│  │                              [Start →]   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  YOUR JOURNEY                                    │
│  Stage 00 ██████████ [✓][✓]                      │
│  Stage 01 ██████████ [✓][✓]                      │
│  Stage 02 ██████████ [✓][✓][✓]                   │
│  Stage 03 ███░░░░░░░ [◻][◻][◻][◻][◻][◻]  ← you │
│  Stage 04 ░░░░░░░░░░ [◻]                        │
│  Stage 05 ░░░░░░░░░░ [◻][◻][◻][◻]              │
│  Stage 06 ░░░░░░░░░░ [◻][◻][◻][◻][◻][◻][◻][◻] │
│                                                  │
├────────────┬────────────┬────────────────────────┤
│ MILESTONES │ TO-DOS     │ KEY LINKS              │
│ (reuse     │ (reuse     │ (reuse                 │
│ Milestone  │ TodoList   │ CategorizedLinks       │
│ Plan.tsx)  │ .tsx)      │ .tsx)                  │
└────────────┴────────────┴────────────────────────┘
```

### 3.3 Components to Create

**`src/components/dashboard/ProgressHeader.tsx`**
- Fellow name, venture name, stage badge
- Progress bar (assets completed / 27)
- Estimated spinout date (from diagnosis engine)

**`src/components/dashboard/NextActionCard.tsx`**
- Uses diagnosis engine `getCriticalActions()` → takes first result
- Shows asset number, title, core question, reason
- Direct link to the asset page

**`src/components/dashboard/StageJourneyMap.tsx`**
- Visual representation of all 7 stages
- Each stage shows its asset slots as squares
- Completed = filled/checked, current stage highlighted, future = muted
- Uses data from `assetCompletion` table + stage definitions from `src/lib/data.ts`

### 3.4 Reuse Existing Components
The bottom section reuses (with minor adaptations):
- `MilestonePlan.tsx` — already supports fellow vs admin views
- `TodoList.tsx` — already supports filtering and status toggles
- `CategorizedLinks.tsx` — read-only for fellows

### 3.5 Server Actions
**File:** `src/app/actions/dashboard.ts` (new)

```typescript
getDashboardData(fellowId) {
  // Parallel fetch:
  const [fellow, venture, completion, milestones, todos, links, diagnosis] = await Promise.all([
    getFellowDetail(fellowId),
    getActiveVenture(fellowId),
    getAssetCompletion(ventureId),
    getMilestones(ventureId),
    getTodoItems(ventureId),
    getCategorizedLinks(ventureId),
    getCriticalActions(ventureId),
  ]);
  return { fellow, venture, completion, milestones, todos, links, nextAction: diagnosis[0] };
}
```

### 3.6 Navigation Update
**File:** `src/components/layout/SidebarLayout.tsx`

For fellows, the sidebar should show:
- Dashboard (home)
- Content Library
- My Venture (links to their fellow detail page)

For admin:
- Keep current nav (Astrolabe, Fellows, Content Library)
- Add: Dashboard (to preview any fellow's view)

---

## Phase 4: Personalised Content Library

**Goal:** The 27 assets feel like a guided personal curriculum, not a flat catalogue.

### 4.1 Update Library Index
**File:** `src/app/(app)/library/page.tsx`

When a fellow is logged in (`co_build_fellow_id` cookie exists):

- Fetch their venture's `assetCompletion` records
- Fetch their playlist (if studio curated one)
- Add a **"Your Path" tab** (playlist view) alongside the existing "All Assets" view
- Each asset card now shows:
  - ✓ checkmark overlay if completed (with date)
  - "Recommended" badge if it's the next critical action
  - Current stage assets have a subtle highlight/border
  - Future stage assets are slightly muted

**If no fellow identity** (admin view): show the current flat library unchanged.

### 4.2 Update Asset Detail Page
**File:** `src/app/(app)/library/[number]/page.tsx`

When a fellow is logged in:

- **Pre-load their responses** from the `responses` table (show previously answered questions)
- **Show completion status** — checklist items reflect their `assetCompletion` state
- **Add "Mark Complete" button** — writes to `assetCompletion` table
- **Guidance adapts** — uses their `experienceProfile` from the fellows table
- **Remove lock button** — admin features show automatically for admin users

When admin is logged in:
- Show media editor inline (no lock needed)
- Show a "View as: [fellow dropdown]" to preview any fellow's state

### 4.3 Playlist UI
**Route:** Could be a tab on `/library` or `/dashboard`

If studio has curated a playlist for this venture:
- Show ordered list of assets/modules/links
- Position-based ordering
- Mix of framework assets + external links
- Progress indicator (completed items)

### 4.4 Server Actions
**File:** `src/app/actions/library.ts` (new or extend existing)

```typescript
getPersonalisedLibrary(ventureId) {
  const [completion, playlist, nextAction] = await Promise.all([
    getAssetCompletion(ventureId),
    getPlaylistItems(ventureId),
    getCriticalActions(ventureId),
  ]);
  return { completion, playlist, nextAction: nextAction[0] };
}

markAssetComplete(ventureId, assetNumber)
markAssetIncomplete(ventureId, assetNumber)
```

---

## Phase 5: Admin Convenience & Polish

**Goal:** Make management effortless for studio.

### 5.1 Admin Overview Dashboard
**Route:** `/fellows/manage` or enhance `/fellows`

Table view showing all fellows at a glance:
- Fellow name, venture name, current stage
- Progress % (assets completed)
- Active blockers count
- Last activity date
- Quick actions: edit, view as fellow, advance stage

### 5.2 Playlist Editor
**Route:** `/fellows/[fellowId]/playlist` or modal on admin page

- Drag-and-drop asset ordering per venture
- Add from the 27 assets or custom external links
- Reorder with position numbers
- Preview the fellow's view

### 5.3 Bulk Operations
- Advance multiple fellows to next stage
- Assign the same milestone/todo template to multiple ventures
- Export progress report (CSV/PDF)

### 5.4 Optional Enhancements
- Slack notifications when fellows complete assets
- Weekly digest email with progress summary
- Fellow activity feed (who did what, when)

---

## Dependency Graph

```
Phase 1 (Fellow Data)
   │
   ├──→ Phase 2 (Two-Path Login) ← needs fellows in DB for the dropdown
   │       │
   │       ├──→ Phase 3 (Fellow Dashboard) ← needs identity from login
   │       │       │
   │       │       └──→ Phase 4 (Personalised Library) ← needs identity + dashboard pattern
   │       │               │
   │       │               └──→ Phase 5 (Polish) ← everything working, now optimise
   │       │
   │       └──→ Lock button removal (can happen immediately in Phase 2)
   │
   └──→ Phase 5.1 (Admin management page — can start early, just needs Phase 1)
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| DB Schema | `src/db/schema.ts` |
| Fellow server actions | `src/app/actions/fellows.ts` |
| Diagnosis engine | `src/app/actions/diagnosis.ts` |
| Asset data (27 assets) | `src/lib/data.ts` |
| Question workflows | `src/lib/questions/` |
| Guidance system | `src/lib/guidance.ts` |
| Login page | `src/app/(auth)/login/page.tsx` |
| Middleware | `src/middleware.ts` |
| Sidebar layout | `src/components/layout/SidebarLayout.tsx` |
| Library index | `src/app/(app)/library/page.tsx` |
| Asset detail | `src/app/(app)/library/[number]/page.tsx` |
| Fellow components | `src/components/fellows/` |
| Auth API routes | `src/app/api/auth/` |

## Design Principles

1. **Data-driven, not template-driven** — one dashboard template, personalised by data. No custom pages per fellow.
2. **Studio manages data, views generate themselves** — add a fellow + venture → dashboard exists. Set stage → journey map updates. Add milestones → they appear.
3. **Incremental deployment** — each phase is useful on its own. Phase 3 alone transforms the experience.
4. **Reuse existing components** — MilestonePlan, TodoList, CategorizedLinks already handle admin/fellow views.
5. **Cookie-based identity** — simple, matches existing auth pattern. No need for Supabase user accounts yet.
