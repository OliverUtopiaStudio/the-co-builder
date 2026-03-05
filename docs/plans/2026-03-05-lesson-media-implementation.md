# Lesson Media Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-lesson Loom video embeds and Google Drive template links, editable by admins, visible to all users.

**Architecture:** New `asset_media` DB table, admin auth via separate password cookie, two API routes (GET/PUT), and inline edit UI on the lesson detail page.

**Tech Stack:** Drizzle ORM + Postgres, Next.js 16 API routes, React 19 client components, Tailwind CSS 4.

---

### Task 1: Add `assetMedia` table to Drizzle schema

**Files:**
- Modify: `src/db/schema.ts` (append after line 191, before the `tasks` table)

**Step 1: Add the table definition**

Add this after the `slackChannelVentures` table in `src/db/schema.ts`:

```typescript
// ─── Asset Media (Loom videos + Drive templates per lesson) ─────
export const assetMedia = pgTable(
  "asset_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetNumber: integer("asset_number").notNull().unique(),
    loomUrl: text("loom_url"),
    driveTemplateUrl: text("drive_template_url"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_asset_media_asset_number").on(table.assetNumber),
  ]
);
```

**Step 2: Generate and run the migration**

Run: `npx drizzle-kit generate`
Then: `npx drizzle-kit push`

Expected: New `asset_media` table created in Supabase.

**Step 3: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add asset_media table for Loom videos and Drive templates"
```

---

### Task 2: Admin auth — API route + cookie

**Files:**
- Create: `src/app/api/auth/admin/route.ts`

**Step 1: Create the admin login API route**

```typescript
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "co_build_admin_auth";

export async function POST(request: NextRequest) {
  let password: string | undefined;

  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    // Ignore parse errors
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
```

**Step 2: Add `ADMIN_PASSWORD` to `.env.local`**

Add: `ADMIN_PASSWORD=<choose-a-password>`

**Step 3: Commit**

```bash
git add src/app/api/auth/admin/route.ts
git commit -m "feat: add admin auth API route with separate password"
```

---

### Task 3: Asset media API routes (GET + PUT)

**Files:**
- Create: `src/app/api/asset-media/[assetNumber]/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assetMedia } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_COOKIE_NAME = "co_build_admin_auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  const { assetNumber } = await params;
  const num = parseInt(assetNumber, 10);
  if (isNaN(num)) {
    return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
  }

  const rows = await db
    .select({
      loomUrl: assetMedia.loomUrl,
      driveTemplateUrl: assetMedia.driveTemplateUrl,
    })
    .from(assetMedia)
    .where(eq(assetMedia.assetNumber, num))
    .limit(1);

  return NextResponse.json(rows[0] ?? { loomUrl: null, driveTemplateUrl: null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  const isAdmin = request.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { assetNumber } = await params;
  const num = parseInt(assetNumber, 10);
  if (isNaN(num)) {
    return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
  }

  let body: { loomUrl?: string; driveTemplateUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date();

  await db
    .insert(assetMedia)
    .values({
      assetNumber: num,
      loomUrl: body.loomUrl ?? null,
      driveTemplateUrl: body.driveTemplateUrl ?? null,
      updatedBy: "admin",
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: assetMedia.assetNumber,
      set: {
        loomUrl: body.loomUrl ?? null,
        driveTemplateUrl: body.driveTemplateUrl ?? null,
        updatedBy: "admin",
        updatedAt: now,
      },
    });

  return NextResponse.json({ ok: true });
}
```

**Step 2: Commit**

```bash
git add src/app/api/asset-media/
git commit -m "feat: add GET/PUT API routes for asset media"
```

---

### Task 4: Admin login UI — small modal triggered from sidebar or detail page

**Files:**
- Create: `src/components/AdminLoginModal.tsx`

**Step 1: Create the admin login modal component**

```tsx
"use client";

import { useState, FormEvent } from "react";

export function AdminLoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Invalid password.");
        return;
      }

      setPassword("");
      onSuccess();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-surface border border-border p-6 w-full max-w-sm"
        style={{ borderRadius: 2 }}
      >
        <div className="label-uppercase mb-4">Admin Access</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="text-sm text-accent">{error}</div>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none"
            style={{ borderRadius: 2 }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm border border-border text-muted hover:text-foreground transition-colors"
              style={{ borderRadius: 2 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {loading ? "..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/AdminLoginModal.tsx
git commit -m "feat: add admin login modal component"
```

---

### Task 5: Asset media editor component (inline edit fields)

**Files:**
- Create: `src/components/AssetMediaEditor.tsx`

**Step 1: Create the editor component**

This is the inline form admins see to paste Loom/Drive URLs.

```tsx
"use client";

import { useState, FormEvent } from "react";

export function AssetMediaEditor({
  assetNumber,
  initialLoomUrl,
  initialDriveUrl,
  onSaved,
}: {
  assetNumber: number;
  initialLoomUrl: string | null;
  initialDriveUrl: string | null;
  onSaved: (loomUrl: string | null, driveUrl: string | null) => void;
}) {
  const [loomUrl, setLoomUrl] = useState(initialLoomUrl ?? "");
  const [driveUrl, setDriveUrl] = useState(initialDriveUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/asset-media/${assetNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loomUrl: loomUrl.trim() || null,
          driveTemplateUrl: driveUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error ?? "Save failed.");
        return;
      }

      setMessage("Saved");
      onSaved(loomUrl.trim() || null, driveUrl.trim() || null);
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="label-uppercase text-[10px] mb-1 block">
          Loom Video URL
        </label>
        <input
          type="url"
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          placeholder="https://www.loom.com/share/..."
          className={inputClass}
          style={{ borderRadius: 2 }}
        />
      </div>
      <div>
        <label className="label-uppercase text-[10px] mb-1 block">
          Google Drive Template URL
        </label>
        <input
          type="url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          placeholder="https://docs.google.com/..."
          className={inputClass}
          style={{ borderRadius: 2 }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          style={{ borderRadius: 2 }}
        >
          {saving ? "Saving..." : "Save Media"}
        </button>
        {message && (
          <span className={`text-xs ${message === "Saved" ? "text-green-600" : "text-accent"}`}>
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/AssetMediaEditor.tsx
git commit -m "feat: add AssetMediaEditor inline component"
```

---

### Task 6: Loom embed + Drive template display components

**Files:**
- Create: `src/components/LoomEmbed.tsx`
- Create: `src/components/DriveTemplateLink.tsx`

**Step 1: Create the Loom embed component**

Loom share URLs have the format `https://www.loom.com/share/<id>`. The embed URL is `https://www.loom.com/embed/<id>`.

```tsx
export function LoomEmbed({ url }: { url: string }) {
  // Convert share URL to embed URL
  const embedUrl = url.replace("/share/", "/embed/");

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase px-5 pt-4 pb-2">Lesson Video</div>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
```

**Step 2: Create the Drive template link component**

```tsx
export function DriveTemplateLink({ url }: { url: string }) {
  return (
    <div
      className="bg-surface border border-border p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase mb-2">Template</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-accent/30 text-accent hover:bg-accent/5 transition-colors"
        style={{ borderRadius: 2 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Open Template in Google Drive
      </a>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/LoomEmbed.tsx src/components/DriveTemplateLink.tsx
git commit -m "feat: add LoomEmbed and DriveTemplateLink display components"
```

---

### Task 7: Integrate everything into the lesson detail page

**Files:**
- Modify: `src/app/(app)/library/[number]/page.tsx`

**Step 1: Add imports and admin state + media fetch**

At the top of the file, add the new imports and a hook for fetching media + admin state. The page is `"use client"` already, so we can use `useState`/`useEffect`.

Add after existing imports (line 10):

```typescript
import { useState, useEffect } from "react";
import { LoomEmbed } from "@/components/LoomEmbed";
import { DriveTemplateLink } from "@/components/DriveTemplateLink";
import { AssetMediaEditor } from "@/components/AssetMediaEditor";
import { AdminLoginModal } from "@/components/AdminLoginModal";
```

**Step 2: Add state and data fetching inside the component**

Inside `AssetDetailPage()`, after the `nextAsset` declaration (line ~79), add:

```typescript
  // Admin mode + media state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loomUrl, setLoomUrl] = useState<string | null>(null);
  const [driveTemplateUrl, setDriveTemplateUrl] = useState<string | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Check admin cookie (simple client-side check via API)
  useEffect(() => {
    // Check if admin cookie exists by trying a PUT with empty body
    // Simpler: just check document.cookie won't work (httpOnly)
    // We'll check by reading a flag from a lightweight endpoint
    // For now, expose admin status via the GET response
    fetch(`/api/asset-media/${assetNumber}`)
      .then((r) => r.json())
      .then((data) => {
        setLoomUrl(data.loomUrl ?? null);
        setDriveTemplateUrl(data.driveTemplateUrl ?? null);
        setMediaLoaded(true);
      })
      .catch(() => setMediaLoaded(true));
  }, [assetNumber]);

  // Check admin status via a HEAD-like check
  useEffect(() => {
    fetch("/api/auth/admin-check")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, []);
```

**Step 3: Add the admin check API route**

Create `src/app/api/auth/admin-check/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const isAdmin = request.cookies.get("co_build_admin_auth")?.value === "1";
  return NextResponse.json({ isAdmin });
}
```

**Step 4: Add media sections to the JSX**

In the return JSX, add after the header section (after the `coreQuestion` div, around line 134), before the Purpose section:

```tsx
      {/* Loom Video */}
      {mediaLoaded && loomUrl && <LoomEmbed url={loomUrl} />}

      {/* Drive Template */}
      {mediaLoaded && driveTemplateUrl && (
        <DriveTemplateLink url={driveTemplateUrl} />
      )}

      {/* Admin: Media Editor */}
      {isAdmin && mediaLoaded && (
        <div
          className="bg-accent/5 border border-accent/20 p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase text-[10px] mb-3 text-accent">
            Admin — Edit Media
          </div>
          <AssetMediaEditor
            assetNumber={assetNumber}
            initialLoomUrl={loomUrl}
            initialDriveUrl={driveTemplateUrl}
            onSaved={(newLoom, newDrive) => {
              setLoomUrl(newLoom);
              setDriveTemplateUrl(newDrive);
            }}
          />
        </div>
      )}

      {/* Admin login toggle (small lock icon, bottom of page) */}
      {!isAdmin && (
        <button
          onClick={() => setShowAdminLogin(true)}
          className="text-muted-light hover:text-muted transition-colors"
          title="Admin login"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
      )}

      <AdminLoginModal
        open={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => {
          setShowAdminLogin(false);
          setIsAdmin(true);
        }}
      />
```

**Step 5: Commit**

```bash
git add src/app/(app)/library/[number]/page.tsx src/app/api/auth/admin-check/route.ts
git commit -m "feat: integrate Loom video, Drive template, and admin editing into lesson detail page"
```

---

### Task 8: Add ADMIN_PASSWORD to environment and test

**Step 1: Add env var locally**

Add to `.env.local`:
```
ADMIN_PASSWORD=your-chosen-admin-password
```

**Step 2: Manual test flow**

1. Visit `/library/1` — should see lesson content, no edit fields, no video/template (none set yet)
2. Click the small lock icon at bottom — admin login modal appears
3. Enter admin password — modal closes, edit fields appear in an accent-highlighted box
4. Paste a Loom URL (e.g. `https://www.loom.com/share/example123`) and a Drive URL — click Save
5. Reload page — Loom embed and Drive template button should appear for everyone
6. Open in incognito (enter site password only, not admin) — should see embed + button but NO edit fields

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: lesson media — Loom videos and Google Drive templates per lesson"
```

---

## Summary of files

| Action | File |
|--------|------|
| Modify | `src/db/schema.ts` — add `assetMedia` table |
| Create | `src/app/api/auth/admin/route.ts` — admin login/logout |
| Create | `src/app/api/auth/admin-check/route.ts` — admin status check |
| Create | `src/app/api/asset-media/[assetNumber]/route.ts` — GET/PUT media |
| Create | `src/components/AdminLoginModal.tsx` — admin password modal |
| Create | `src/components/AssetMediaEditor.tsx` — inline Loom/Drive editor |
| Create | `src/components/LoomEmbed.tsx` — Loom iframe embed |
| Create | `src/components/DriveTemplateLink.tsx` — Drive template button |
| Modify | `src/app/(app)/library/[number]/page.tsx` — wire everything together |
