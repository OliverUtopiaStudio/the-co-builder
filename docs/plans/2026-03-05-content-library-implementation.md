# Content Library Reskin — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the venture-centric framework tool with a flat, read-only content library for Co-Build assets and custom modules.

**Architecture:** Extend the `Asset` interface with tags and a custom-module flag, add flat `library` export. Create two new pages (`/library` index and `/library/[number]` detail). Remove venture routes and update middleware + nav. No DB changes.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS. All data in `src/lib/data.ts` (code-only, no CMS).

**Design doc:** `docs/plans/2026-03-05-content-library-design.md`

---

## Task 1: Extend the Asset data model

**Files:**
- Modify: `src/lib/data.ts` (lines 1-28 for interface, then append new exports after `stages` array)

**Step 1: Add `tags` and `isCustomModule` to the Asset interface**

In `src/lib/data.ts`, update the `Asset` interface (around line 6) to add two new fields:

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
  // Content library fields
  tags: string[];
  isCustomModule: boolean;
}
```

**Step 2: Add default values to all existing assets in `stages`**

Every asset object inside the `stages` array needs `tags: []` and `isCustomModule: false` added. Since there are 27 assets across 8 stages, the simplest approach: do a find-and-replace. Each asset currently ends with a `checklist: [...]` block. After each `checklist` array, add the two new fields.

For example, Asset 1 becomes:
```ts
{
  number: 1,
  title: "Risk Capital + Invention One-Pager",
  // ... existing fields ...
  checklist: [
    { id: "1-1", text: "Identified the structural market failure" },
    // ...
  ],
  tags: [],
  isCustomModule: false,
},
```

Repeat for all 27 assets. Tags will be auto-generated in the flat export (Step 3), so `tags: []` is fine here.

**Step 3: Add flat library exports at end of file**

Append after the `stages` array closing bracket:

```ts
// ─── Content Library Flat Exports ──────────────────────────────

/** All 27 core assets flattened from stages, auto-tagged with stage info */
export const allAssets: Asset[] = stages.flatMap((s) =>
  s.assets.map((a) => ({
    ...a,
    tags: [`stage-${s.number}`, "core", ...a.tags],
    isCustomModule: false,
  }))
);

/** Custom modules — same Asset shape, numbered 100+ to avoid collision */
export const customModules: Asset[] = [
  // Add custom modules here. Example:
  // {
  //   number: 101,
  //   title: "Partner Alignment Workshop",
  //   purpose: "Structured workshop to align co-founders on vision, roles, and equity.",
  //   checklist: [{ id: "101-1", text: "Completed alignment exercise" }],
  //   tags: ["custom", "team"],
  //   isCustomModule: true,
  // },
];

/** Combined flat catalog for the content library */
export const library: Asset[] = [...allAssets, ...customModules];

/** All unique tags across the library (for filter UI) */
export const allTags: string[] = [
  ...new Set(library.flatMap((a) => a.tags)),
].sort();
```

**Step 4: Verify the build compiles**

Run: `npm run build` (or `npx next build`)
Expected: Build succeeds (existing pages still reference `stages` which is unchanged). There will be type errors in existing asset pages because they spread assets that now require `tags`/`isCustomModule` — that's fine, those pages get deleted in Task 4.

**Step 5: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: extend Asset interface with tags and library exports"
```

---

## Task 2: Create the Library index page

**Files:**
- Create: `src/app/(app)/library/page.tsx`

**Step 1: Create the library directory and page**

Create `src/app/(app)/library/page.tsx` with the following content:

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { library, allTags } from "@/lib/data";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = library;
    if (activeTag) {
      items = items.filter((a) => a.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.purpose.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeTag]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Content Library</div>
        <h1 className="text-2xl font-medium">Co-Build Assets & Modules</h1>
        <p className="text-muted text-sm mt-1">
          Browse the full framework — 27 core assets and custom modules.
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by title or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
          style={{ borderRadius: 2 }}
        />
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTag === null
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          }`}
          style={{ borderRadius: 2 }}
        >
          All ({library.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTag === tag
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
            style={{ borderRadius: 2 }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search || activeTag) && (
        <p className="text-xs text-muted">
          Showing {filtered.length} of {library.length} items
        </p>
      )}

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-surface border border-border p-12 text-center"
          style={{ borderRadius: 2 }}
        >
          <p className="text-muted text-sm">
            No assets match your search. Try broadening your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <Link
              key={asset.number}
              href={`/library/${asset.number}`}
              className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${
                        asset.isCustomModule
                          ? "bg-gold/10 text-gold"
                          : "bg-accent/10 text-accent"
                      }`}
                      style={{ borderRadius: 2 }}
                    >
                      {asset.isCustomModule ? "M" : `#${asset.number}`}
                    </div>
                    <h3 className="font-medium text-sm leading-tight">
                      {asset.title}
                    </h3>
                  </div>
                  <p className="text-muted text-xs mt-1 line-clamp-2">
                    {asset.purpose}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 bg-border/50 text-muted"
                        style={{ borderRadius: 2 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-accent font-medium">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(app\)/library/page.tsx
git commit -m "feat: add content library index page with search and tag filters"
```

---

## Task 3: Create the Asset detail page

**Files:**
- Create: `src/app/(app)/library/[number]/page.tsx`

**Step 1: Create the detail page**

Create `src/app/(app)/library/[number]/page.tsx`:

```tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { library, stages } from "@/lib/data";
import { getGuidanceTip, getAssetResources } from "@/lib/guidance";
import {
  getWorkflowForAsset,
  type WorkflowStep,
} from "@/lib/questions";

function findAssetContext(assetNumber: number) {
  for (const stage of stages) {
    const asset = stage.assets.find((a) => a.number === assetNumber);
    if (asset) return { asset, stage };
  }
  // Check custom modules (not in stages)
  const custom = library.find(
    (a) => a.number === assetNumber && a.isCustomModule
  );
  if (custom) return { asset: custom, stage: null };
  return null;
}

export default function AssetDetailPage() {
  const { number } = useParams<{ number: string }>();
  const assetNumber = parseInt(number, 10);

  if (isNaN(assetNumber)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Invalid asset number</h2>
        <Link
          href="/library"
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const ctx = findAssetContext(assetNumber);
  if (!ctx) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Asset not found</h2>
        <Link
          href="/library"
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const { asset, stage } = ctx;

  // Get workflow questions for reference display
  let workflow: { steps: WorkflowStep[] } | null = null;
  try {
    workflow = getWorkflowForAsset(assetNumber);
  } catch {
    // Custom modules may not have workflows
  }

  // Get guidance tips (use first_time_builder as default for read-only view)
  const guidanceTip = stage
    ? getGuidanceTip("first_time_builder", stage.number)
    : null;

  // Get resources if available
  let resources: { title: string; url: string; type: string }[] = [];
  try {
    resources = getAssetResources(assetNumber) ?? [];
  } catch {
    // Not all assets have resources
  }

  // Find prev/next in the library array
  const libraryIndex = library.findIndex((a) => a.number === assetNumber);
  const prevAsset = libraryIndex > 0 ? library[libraryIndex - 1] : null;
  const nextAsset =
    libraryIndex < library.length - 1 ? library[libraryIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/library" className="hover:text-accent transition-colors">
          Library
        </Link>
        <span>/</span>
        {stage && (
          <>
            <span>{stage.title}</span>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">
          {asset.isCustomModule ? "Module" : `Asset #${asset.number}`}:{" "}
          {asset.title}
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-12 h-12 flex items-center justify-center text-sm font-medium ${
              asset.isCustomModule
                ? "bg-gold/10 text-gold"
                : "bg-accent/10 text-accent"
            }`}
            style={{ borderRadius: 2 }}
          >
            {asset.isCustomModule ? "M" : `#${asset.number}`}
          </div>
          <div>
            <h1 className="text-2xl font-medium">{asset.title}</h1>
            {stage && (
              <p className="text-xs text-muted mt-0.5">
                Stage {stage.number}: {stage.title}
              </p>
            )}
          </div>
        </div>
        {asset.coreQuestion && (
          <div
            className="bg-accent/5 border border-accent/20 px-4 py-3 mt-4"
            style={{ borderRadius: 2 }}
          >
            <div className="label-uppercase text-[10px] mb-1 text-accent">
              Core Question
            </div>
            <p className="text-sm font-medium">{asset.coreQuestion}</p>
          </div>
        )}
      </div>

      {/* Purpose */}
      <div
        className="bg-surface border border-border p-5"
        style={{ borderRadius: 2 }}
      >
        <div className="label-uppercase mb-2">Purpose</div>
        <p className="text-sm leading-relaxed">{asset.purpose}</p>
        {asset.details && (
          <p className="text-sm text-muted mt-3 leading-relaxed">
            {asset.details}
          </p>
        )}
      </div>

      {/* Key Inputs / Outputs */}
      {(asset.keyInputs?.length || asset.outputs?.length) && (
        <div className="grid gap-4 md:grid-cols-2">
          {asset.keyInputs && asset.keyInputs.length > 0 && (
            <div
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="label-uppercase mb-3">Key Inputs</div>
              <ul className="space-y-1.5">
                {asset.keyInputs.map((input, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    {input}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {asset.outputs && asset.outputs.length > 0 && (
            <div
              className="bg-surface border border-border p-5"
              style={{ borderRadius: 2 }}
            >
              <div className="label-uppercase mb-3">Outputs</div>
              <ul className="space-y-1.5">
                {asset.outputs.map((output, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Checklist (read-only) */}
      {asset.checklist.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Completion Checklist</div>
          <ul className="space-y-2">
            {asset.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <div
                  className="w-5 h-5 border border-border flex-shrink-0 mt-0.5"
                  style={{ borderRadius: 2 }}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workflow Questions (reference) */}
      {workflow && workflow.steps.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Framework Questions</div>
          <p className="text-xs text-muted mb-4">
            These questions guide fellows through this asset.
          </p>
          <div className="space-y-4">
            {workflow.steps.map((step) => (
              <div key={step.id}>
                <h4 className="text-sm font-medium mb-2">{step.title}</h4>
                {step.description && (
                  <p className="text-xs text-muted mb-2">{step.description}</p>
                )}
                <ul className="space-y-1.5 pl-4">
                  {step.questions.map((q) => (
                    <li key={q.id} className="text-sm text-muted">
                      <span className="text-foreground">{q.label}</span>
                      {q.required && (
                        <span className="text-accent ml-1 text-xs">*</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidance */}
      {guidanceTip && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-2">Guidance</div>
          <p className="text-sm text-muted leading-relaxed">{guidanceTip}</p>
        </div>
      )}

      {/* Tags */}
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((tag) => (
            <Link
              key={tag}
              href={`/library?tag=${tag}`}
              className="text-xs px-2 py-1 bg-surface border border-border text-muted hover:text-foreground transition-colors"
              style={{ borderRadius: 2 }}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex-1">
          {prevAsset ? (
            <Link
              href={`/library/${prevAsset.number}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Previous</div>
              <div className="text-sm font-medium">
                {prevAsset.isCustomModule ? "Module" : `#${prevAsset.number}`}:{" "}
                {prevAsset.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="flex-1">
          {nextAsset ? (
            <Link
              href={`/library/${nextAsset.number}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all text-right"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Next</div>
              <div className="text-sm font-medium">
                {nextAsset.isCustomModule ? "Module" : `#${nextAsset.number}`}:{" "}
                {nextAsset.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(app\)/library/[number]/page.tsx
git commit -m "feat: add read-only asset detail page at /library/[number]"
```

---

## Task 4: Update routing, middleware, and navigation

**Files:**
- Modify: `src/app/page.tsx` (root redirect)
- Modify: `src/middleware.ts` (route matcher)
- Modify: `src/app/(app)/layout.tsx` (nav config)

**Step 1: Update root redirect**

In `src/app/page.tsx`, change the redirect from `/dashboard` to `/library`:

```tsx
import { redirect } from "next/navigation";

export default function LandingPage() {
  redirect("/library");
}
```

**Step 2: Update middleware route matcher**

In `src/middleware.ts`, update the `config.matcher` array to protect `/library` instead of `/dashboard` and `/venture`:

```ts
export const config = {
  matcher: ["/", "/library/:path*", "/login"],
};
```

**Step 3: Update app layout nav config**

In `src/app/(app)/layout.tsx`, update the sidebar config:

```tsx
"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

const config: SidebarConfig = {
  navItems: [{ href: "/library", label: "Content Library" }],
  homeHref: "/library",
  mobileTitle: "CO-BUILDER",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
```

**Step 4: Commit**

```bash
git add src/app/page.tsx src/middleware.ts src/app/\(app\)/layout.tsx
git commit -m "feat: update routing, middleware, and nav for content library"
```

---

## Task 5: Remove venture pages and dead code

**Files:**
- Delete: `src/app/(app)/dashboard/page.tsx`
- Delete: `src/app/(app)/venture/[ventureId]/page.tsx`
- Delete: `src/app/(app)/venture/[ventureId]/asset/[assetNumber]/page.tsx`
- Delete: `src/app/(app)/venture/[ventureId]/stage/[stageId]/page.tsx`
- Delete: `src/app/(app)/venture/[ventureId]/layout.tsx`

**Step 1: Delete venture route files**

```bash
rm src/app/\(app\)/dashboard/page.tsx
rm -rf src/app/\(app\)/venture/
```

**Step 2: Verify the build**

Run: `npx next build`
Expected: Build succeeds. The only routes under `(app)` should be `/library` and `/library/[number]`.

If there are import errors (components that referenced venture-specific code), fix them in this step. Likely candidates:
- `src/components/navigation/AssetNavigation.tsx` — no longer imported by any page. Leave it (dead code) or delete it.
- `src/components/google-drive/DriveFiles.tsx` — no longer imported. Leave or delete.
- `src/components/connections/VentureConnections.tsx` — no longer imported. Leave or delete.
- `src/lib/hooks/use-fellow-ventures.ts` — no longer imported. Leave or delete.

Recommendation: delete them to keep the codebase clean.

```bash
rm src/components/navigation/AssetNavigation.tsx
# Delete other dead components if they exist and cause no import issues
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove venture pages and dead code"
```

---

## Task 6: Verify and smoke-test

**Step 1: Clean build**

```bash
rm -rf .next
npx next build
```

Expected: Build succeeds with no errors.

**Step 2: Run dev server and verify**

```bash
npm run dev
```

Manual checks:
1. Visit `/` — should redirect to `/library`
2. Visit `/library` — should show the flat catalog with all 27 assets
3. Click a tag filter — should filter the grid
4. Type in search — should filter by title/purpose
5. Click an asset card — should navigate to `/library/[number]`
6. Asset detail page shows: title, purpose, core question, inputs/outputs, checklist, questions, guidance
7. Previous/Next navigation works
8. Visit `/login` while logged out — should show password form
9. Visit `/library` while logged out — should redirect to `/login`
10. Sidebar nav shows "Content Library" and links to `/library`

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address any issues found during smoke test"
```

---

## Summary of commits

| # | Message | Files touched |
|---|---------|---------------|
| 1 | `feat: extend Asset interface with tags and library exports` | `src/lib/data.ts` |
| 2 | `feat: add content library index page with search and tag filters` | `src/app/(app)/library/page.tsx` |
| 3 | `feat: add read-only asset detail page at /library/[number]` | `src/app/(app)/library/[number]/page.tsx` |
| 4 | `feat: update routing, middleware, and nav for content library` | `src/app/page.tsx`, `src/middleware.ts`, `src/app/(app)/layout.tsx` |
| 5 | `chore: remove venture pages and dead code` | Delete venture routes + dead components |
| 6 | `fix: address any issues found during smoke test` | Any fixes |
