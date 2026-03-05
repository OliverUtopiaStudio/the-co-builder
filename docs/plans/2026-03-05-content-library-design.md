# Content Library Reskin — Design Document

**Date**: 2026-03-05
**Status**: Approved
**Summary**: Pivot the Co-Build OS from a venture-centric framework tool to a read-only content library for Co-Build assets and custom modules.

---

## Context

The app currently requires fellows to pick a venture, then work through a curated playlist of framework assets. This pivot strips the venture layer and replaces it with a flat, browsable content library — password-gated for fellows only.

## Audience

Co-Build fellows only. Password-gated using the existing shared `SITE_PASSWORD` mechanism (unchanged).

## Key Decisions

| Decision | Choice |
|----------|--------|
| Navigation model | Flat catalog with tag filters (not stage-grouped) |
| Custom modules format | Same `Asset` structure as core 27 |
| Content management | Code-only (`data.ts`) |
| Interactivity | Read-only reference content (no responses, completion tracking, or uploads) |

---

## 1. Data Model

### Extend the `Asset` interface

```ts
export interface Asset {
  number: number;
  title: string;
  purpose: string;
  details?: string;
  keyInputs?: string[];
  outputs?: string[];
  coreQuestion?: string;
  table?: { header: string[]; rows: string[][] };
  bullets?: string[];
  feedsInto?: string;
  checklist: ChecklistItem[];

  // NEW
  tags: string[];           // e.g. ["market", "stage-00", "core"]
  isCustomModule: boolean;  // false for the 27 core assets, true for add-ons
}
```

### New exports alongside existing `stages` array

```ts
// Flatten core assets from stages, auto-tag with stage info
export const allAssets: Asset[] = stages.flatMap(s =>
  s.assets.map(a => ({
    ...a,
    tags: [`stage-${s.number}`, "core"],
    isCustomModule: false,
  }))
);

// Custom modules — same Asset shape, different numbering (100+)
export const customModules: Asset[] = [
  // Added by editing this file
];

// Combined flat catalog
export const library: Asset[] = [...allAssets, ...customModules];
```

The existing `stages` array remains untouched for backwards compatibility.

---

## 2. Routes

### New

| Route | Purpose |
|-------|---------|
| `/library` | Flat catalog — the new homepage |
| `/library/[number]` | Read-only asset detail page |

### Removed

| Route | Disposition |
|-------|-------------|
| `/dashboard` | Redirect to `/library` |
| `/venture/[ventureId]` | Removed |
| `/venture/[ventureId]/asset/[n]` | Removed (replaced by `/library/[n]`) |
| `/venture/[ventureId]/stage/[id]` | Removed |

### Unchanged

| Route | Notes |
|-------|-------|
| `/login` | Password gate, unchanged |
| `/api/auth/login` | Auth API, unchanged |
| `/api/health` | Health check, unchanged |

### Middleware update

Update `src/middleware.ts` to protect `/library` instead of `/venture/`.

---

## 3. Library Page (`/library`)

The new homepage. A flat grid of all assets + custom modules.

### UI Elements

- **Header**: "Co-Build Content Library" with brief description
- **Filter bar**: Clickable tag pills (e.g. "All", "Stage 00", "Stage 01", ..., "Custom"). Active filter highlighted.
- **Search**: Text input filtering by title + purpose
- **Card grid**: Responsive grid (1-3 columns)

### Card design

Each card shows:
- Asset number badge (or "M" for custom modules)
- Title
- Purpose (truncated to 2 lines)
- Tag pills (small, muted)
- Click → navigates to `/library/[number]`

### No progress tracking — purely browse-and-read.

---

## 4. Asset Detail Page (`/library/[number]`)

Read-only reference view of a single asset or custom module.

### Sections shown

1. **Header**: Number, title, core question
2. **Purpose**: Full purpose text
3. **Key Inputs / Outputs**: Bullet lists (if present)
4. **Details**: Extended description (if present)
5. **Checklist**: Displayed as a reference list (static checkmarks, not interactive)
6. **AI Guidance**: Contextual tips from `guidance.ts`
7. **Navigation**: ← Back to Library | ← Previous | Next →

### Sections removed (from current asset page)

- Question/response form
- File upload UI
- Completion tracking and progress bar
- Venture context (header, breadcrumb)
- Google Drive integration
- Experience profile tips

---

## 5. What Gets Removed

### Pages & components
- `/src/app/(app)/dashboard/page.tsx`
- `/src/app/(app)/venture/[ventureId]/page.tsx`
- `/src/app/(app)/venture/[ventureId]/asset/[assetNumber]/page.tsx`
- `/src/app/(app)/venture/[ventureId]/stage/[stageId]/page.tsx`
- `/src/app/(app)/venture/[ventureId]/layout.tsx`
- Venture-specific components (VentureConnectionsDisplay, DriveFiles, AssetNavigation)

### Hooks & client-side data
- `useVentures`, `useVenture` hooks
- Supabase client-side queries for responses, completions, requirements

### API routes (unused but not deleted — just dead code)
- `/api/playlist/[ventureId]` — no longer called

### Not deleted (just unused)
- Database schema (`src/db/schema.ts`) — kept for potential future use
- `stages` array in `data.ts` — kept for tag generation
- `questions.ts` / workflows — kept for reference display on detail pages

---

## 6. Migration Path

This is a narrowing change — no database migrations needed. The DB tables remain but are simply not queried by the new UI. If the interactive worksheet model returns later, the schema is ready.

---

## 7. File Changes Summary

| Action | Files |
|--------|-------|
| **Create** | `/src/app/(app)/library/page.tsx`, `/src/app/(app)/library/[number]/page.tsx` |
| **Modify** | `src/lib/data.ts` (add tags, isCustomModule, flat exports), `src/middleware.ts` (route protection), `src/app/page.tsx` (redirect to /library), `src/app/(app)/layout.tsx` (nav link update) |
| **Remove** | Dashboard page, venture pages, venture layout, stage page, venture-specific components |
