# WO-18: Modern UI Component Library Integration

## 1. Current UI Component Structure

### 1.1 Directory layout

```
src/components/
├── ui/                          # Shared primitives (candidates for shadcn)
│   ├── SectionHeader.tsx        # Label + optional action (uses .label-uppercase)
│   ├── ProgressBar.tsx          # 0–1 progress bar (custom)
│   └── GlassCard.tsx            # Auth frosted-glass card
├── layout/
│   └── SidebarLayout.tsx        # App shell, nav, mobile menu
├── auth/
│   ├── LandingHero.tsx
│   ├── FellowsPortfolio.tsx
│   └── styles.ts
├── dashboard/
│   ├── PrimaryActionCard.tsx
│   ├── TodaysFocus.tsx
│   └── StudioActivityFeed.tsx
├── connections/
│   ├── ConnectionStatus.tsx
│   └── VentureConnections.tsx
├── diagnosis/
│   └── VentureDiagnosis.tsx
├── google-drive/
│   └── DriveFiles.tsx
├── tools/
│   ├── ToolCard.tsx
│   ├── AddVideoForm.tsx
│   ├── LoomEmbed.tsx
│   └── TestProject.tsx
├── GenerativeArt.tsx
```

### 1.2 Design system in use

- **Tokens** (from `globals.css`): `--background`, `--foreground`, `--accent`, `--surface`, `--border`, `--muted`, `--sidebar-*`, etc.
- **Tailwind theme**: `@theme inline` maps these to `color-background`, `color-accent`, etc.
- **Typography**: `.label-uppercase` (11px, 2px letter-spacing, uppercase, muted).
- **Radius**: Consistent `style={{ borderRadius: 2 }}` (2px) across cards and buttons.
- **Patterns**:
  - Cards: `bg-surface border border-border` + `borderRadius: 2`
  - Primary actions: `bg-accent text-white hover:bg-accent/90`
  - Secondary: `border border-border hover:border-accent/30`
  - Muted text: `text-muted`

### 1.3 Current UI primitives (no shadcn)

| Component       | Role                         | Used in |
|----------------|------------------------------|---------|
| **SectionHeader** | Uppercase label + optional action | Studio, tools, dashboard |
| **ProgressBar**   | Horizontal progress 0–1      | Tools, KPI cards, onboarding |
| **GlassCard**     | Auth frosted card            | Login, signup, reset-password |

### 1.4 Inline patterns (to be replaced by shadcn)

- **Buttons**: `className="... bg-accent text-white ..."` or `border border-border ...` (e.g. `PrimaryActionCard`, `ConnectionStatus`, `SidebarLayout`, forms).
- **Cards**: `className="bg-surface border border-border ..."` + `style={{ borderRadius: 2 }}` (e.g. `ToolCard`, `ConnectionStatus`, `PrimaryActionCard`, `TodaysFocus`, many pages).
- **Inputs**: Raw `<input className="... border border-border ...">` (e.g. venture/new, login, signup, admin forms).

---

## 2. Implementation plan overview

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Phase 0** | Tooling & theme | Install shadcn, align Tailwind 4 + Studio OS tokens |
| **Phase 1** | First 3 components | Button, Card, Progress in place; migrate 3 high-use call sites |
| **Phase 2** | Forms & feedback | Input, Label, Select, Alert, Skeleton |
| **Phase 3** | Layout & overlay | Sheet (mobile nav), Dialog, Separator |
| **Phase 4** | Remaining UI | SectionHeader → typography/slot; GlassCard kept or replaced |

---

## 3. Phase 0: Tooling and theme (prerequisite)

1. **Install shadcn**
   - Run: `npx shadcn@latest init`
   - Choose: New York style, Zinc slate (we will override with Studio OS).
   - Confirm `components.json` and `src/components/ui` usage.

2. **Tailwind 4 compatibility**
   - Project uses Tailwind 4 (`@tailwindcss/postcss`, `@import "tailwindcss"`).
   - shadcn defaults to Tailwind 3; if the CLI generates a `tailwind.config.*`, either:
     - Keep Tailwind 4 and manually add only the shadcn component CSS/classes and any needed utilities, or
     - Temporarily follow shadcn’s Tailwind 3 setup and document any Tailwind 4 re-enable steps.
   - Decision: Prefer **Tailwind 4**; copy component TSX and adapt styles to existing `globals.css` + `@theme inline` (no conflicting config).

3. **Theme alignment**
   - In `globals.css` (or where shadcn expects), ensure:
     - `--primary` = `--accent` (#CC5536)
     - `--background`, `--foreground`, `--muted`, `--border`, `--card` (surface) match current tokens.
   - Use `border-radius: 2px` (or equivalent token) for components that currently use `borderRadius: 2`.
   - Keep `.label-uppercase` and font-family as-is.

4. **Component path**
   - Use default `@/components/ui` so installed components live next to `SectionHeader`, `ProgressBar`, `GlassCard`.

---

## 4. First 3 components to migrate

### 4.1 Component 1: **Button**

- **Why first**: Used everywhere (PrimaryActionCard, ConnectionStatus, SidebarLayout, forms, admin/studio actions). Single primitive to unify primary/secondary/ghost/destructive and loading states.
- **shadcn component**: `Button` (with variants: default, destructive, outline, secondary, ghost, link).
- **Studio OS mapping**:
  - **Primary**: `default` variant → `bg-accent` (primary), `text-white`, `hover:bg-accent/90`, `borderRadius: 2`.
  - **Secondary**: `outline` → current `border border-border` style.
  - **Ghost**: `ghost` for nav and low-emphasis actions.
- **Migration steps**:
  1. Add: `npx shadcn@latest add button` (or copy `button.tsx` and adapt if CLI conflicts with Tailwind 4).
  2. In `components.json` / theme, set `--primary` to `var(--accent)` and radius to 2px.
  3. Replace inline button classes in **3 call sites**:
     - `PrimaryActionCard.tsx`: “Start Working on Asset #…” (primary), “View Full Pathway” (outline).
     - `ConnectionStatus.tsx`: “Verify Connection” (primary).
     - One admin or studio page (e.g. `admin/ventures/[ventureId]/slack/page.tsx`): “Link Slack Channel” (primary), “Unlink” (outline/destructive).
   - Use `Button` with `variant` and optional `size`; keep `asChild` for `<Link>` where needed.

**Deliverable**: `src/components/ui/button.tsx` (shadcn), 3 files updated to use `<Button>` / `<Button asChild><Link /></Button>`.

---

### 4.2 Component 2: **Card**

- **Why second**: The “surface + border + 2px radius” pattern is repeated across cards, connection status, tool cards, and dashboard blocks. One Card component (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) gives consistent structure and styling.
- **shadcn component**: `Card` (with subcomponents).
- **Studio OS mapping**:
  - Card root: `bg-surface border border-border`, `rounded-[2px]` (or token).
  - No change to inner layout; adopt CardHeader/Content/Footer only where it simplifies markup.
- **Migration steps**:
  1. Add: `npx shadcn@latest add card`.
  2. Theme card background/border to use `--surface` and `--border`; radius 2px.
  3. Replace in **3 call sites**:
     - `ConnectionStatus.tsx`: wrap content in `<Card>` and `<CardContent>` (and optional CardHeader for title).
     - `ToolCard.tsx`: replace outer `div` with `<Card>`; use CardContent for main block; keep color strip and TestProject as-is.
     - `PrimaryActionCard.tsx`: replace outer `div` with `<Card>`; use CardContent for “Why this matters”, CardFooter for the two buttons (already using Button from step 1).
   - Prefer composition over squeezing everything into Card; e.g. “Progress” in PrimaryActionCard can stay in a small custom block inside Card.

**Deliverable**: `src/components/ui/card.tsx` (shadcn), 3 files updated to use `<Card>` + subcomponents.

---

### 4.3 Component 3: **Progress**

- **Why third**: Replaces custom `ProgressBar` with an accessible, consistent Progress primitive. Used in onboarding, tools, KPI cards, and venture progress.
- **shadcn component**: `Progress` (single bar with value).
- **Studio OS mapping**:
  - Same 0–1 (or 0–100) semantics; same colors: track = `--border`, indicator = `--accent` (or optional override for KPI).
  - Height and 2px radius to match current `ProgressBar`.
- **Migration steps**:
  1. Add: `npx shadcn@latest add progress`.
  2. Theme track and indicator to use `--border` and `--primary` (accent); radius 2px.
  3. Replace `ProgressBar` in **3 call sites**:
     - `src/components/ui/ProgressBar.tsx`: re-export or replace implementation with shadcn `Progress`; keep the same API (`progress`, `color?`, `className?`) by wrapping Progress and mapping `color` to a style or data attribute if needed.
     - Two consumers: e.g. onboarding progress step, and one of tools test project or venture/dashboard progress (so one shared component + two pages).
   - If shadcn Progress doesn’t support a custom indicator color, extend with a thin wrapper that applies `style` to the indicator for KPI/colored bars.

**Deliverable**: `src/components/ui/progress.tsx` (shadcn); `ProgressBar.tsx` becomes a thin wrapper or is deprecated in favor of direct `Progress` usage; 2–3 call sites updated.

---

## 5. Order of work (first 3 components)

1. **Phase 0** (one-time): Init shadcn, align theme with Studio OS, confirm Tailwind 4 path.
2. **Button**: Add component → theme → migrate PrimaryActionCard, ConnectionStatus, one admin/studio page.
3. **Card**: Add component → theme → migrate ConnectionStatus, ToolCard, PrimaryActionCard.
4. **Progress**: Add component → theme → wrap or replace ProgressBar → migrate onboarding + one other (e.g. dashboard or tools).

---

## 6. Success criteria (first 3 components)

- [ ] shadcn init and theme use Studio OS tokens (accent, surface, border, 2px radius).
- [ ] Button: 3 call sites use `<Button variant="...">` or `<Button asChild><Link /></Button>` with no visual regressions.
- [ ] Card: 3 call sites use `<Card>` (+ CardContent/CardHeader/CardFooter where useful) with no visual regressions.
- [ ] Progress: ProgressBar replaced or implemented via Progress; 2–3 call sites updated; optional `color` prop preserved for KPI bars.
- [ ] No new runtime or build errors; existing layout and responsiveness preserved.

---

## 7. Future phases (brief)

- **Phase 2**: Input, Label, Select, Alert, Skeleton for forms and feedback.
- **Phase 3**: Sheet (mobile nav in SidebarLayout), Dialog, Separator.
- **Phase 4**: SectionHeader as a small typography/slot component or keep as-is; GlassCard keep or replace with Card variant.

---

## 8. References

- [shadcn/ui installation (Next.js)](https://ui.shadcn.com/docs/installation/next)
- [Button](https://ui.shadcn.com/docs/components/button)
- [Card](https://ui.shadcn.com/docs/components/card)
- [Progress](https://ui.shadcn.com/docs/components/progress)
- Project: `src/app/globals.css`, `src/components/ui/*`
