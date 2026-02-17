# Co-Build OS — SRE Plan & Testing Guide

**Last updated:** 2026-02-12  
**Purpose:** Stabilise the platform, identify bugs, establish SRE practices for reliable operation.

---

## 1. Testing Plan

### 1.1 Manual Test Checklist

Run through these flows before each release. Target: **< 2 min per flow** for good UX.

| Flow | Steps | Expected | Pass? |
|------|-------|----------|-------|
| **Auth — Login** | Landing → Fellow Sign In → enter credentials → submit | Redirect to /dashboard or /onboarding | |
| **Auth — Studio Login** | Landing → Studio → login as admin/studio | Redirect to /studio | |
| **Auth — Stakeholder Login** | Landing → Stakeholder → login as stakeholder | Redirect to /portfolio | |
| **Auth — Signup** | Create account → verify email (if required) | Fellow created, redirect to dashboard | |
| **Auth — Reset Password** | Login → Forgot password → submit email | Reset email sent confirmation | |
| **Dashboard** | Log in as fellow → /dashboard | Loads in &lt; 3s, shows ventures + next action | |
| **Venture Create** | Dashboard → New Venture → fill form → submit | Venture created, redirect to venture page | |
| **Venture Overview** | Click venture from dashboard | Loads in &lt; 2s, shows stages + assets | |
| **Asset Workflow** | Venture → click asset → answer questions → save | Auto-save works, completion toggle works | |
| **File Upload** | Asset with file question → upload file | File uploads, appears in UI | |
| **Admin — Fellows** | Login as admin → Admin → Fellows | List loads, role filter works | |
| **Admin — Fellow Detail** | Fellows → click fellow → change role/lifecycle | Saves, no errors | |
| **Studio — KPI** | Login as studio → Studio → KPI Scoreboard | KPIs load, inline edit works | |
| **Studio — Pods** | Studio → Pods → click pod | Pod detail loads | |
| **Portfolio (Stakeholder)** | Login as stakeholder → /portfolio | Fellow portfolio loads | |

### 1.2 Automated Tests (To Add)

- **E2E (Playwright/Cypress):** Login → Dashboard → Venture → Asset save
- **API:** `/api/upload` auth + venture ownership, `/api/fellows` validation
- **Unit:** `safe-redirect`, `sanitizeFileName`, `verifyVentureAccess`

---

## 2. Known Bugs & Improvement Areas

### 2.1 Potential Bugs (From Codebase Analysis)

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| **No fellow record on login** | Login flow | User gets redirected to /dashboard but dashboard returns early if !fellowData → empty state | Create fellow on first login if missing |
| **Signup: fellow API failure silent** | signup/page.tsx | `if (!res.ok) console.error` — user still redirected, may hit empty dashboard | Show error + retry or block redirect |
| **Dashboard: loading never clears on redirect** | dashboard/page.tsx | `router.push("/onboarding")` inside load() — loading stays true until unmount | Set loading(false) before redirect |
| **Asset page: no error UI on load fail** | asset/[assetNumber]/page.tsx | `catch` only logs; user sees empty form | Add error state + retry button |
| **Race: rapid navigation** | Multiple pages | useEffect fetch + unmount → "Can't perform state update on unmounted component" | Use AbortController, ignore updates if unmounted |
| **GenerativeArt: blank flash** | auth/layout.tsx | `ssr: false` + canvas init → flash of empty before art | Add static placeholder or delay content |

### 2.2 Error Handling Gaps

- **Supabase errors:** Many `.single()` calls can return `{ data: null, error }` — often only `data` is checked.
- **Server actions:** Errors thrown from actions (e.g. `verifyVentureAccess`) bubble to client but may show generic "Something went wrong".
- **API routes:** 500 responses don't include correlation IDs for debugging.

### 2.3 Performance Issues

| Issue | Cause | Recommendation |
|-------|-------|----------------|
| **All pages client-rendered** | "use client" + useEffect fetch | Convert data-heavy pages to Server Components with async fetch |
| **Dashboard: 4+ sequential/waterfall requests** | user → fellow → ventures+stipend → completions → diagnosis | Already parallelised ventures+stipend; diagnosis runs after. Consider loading diagnosis in parallel with ventures. |
| **Asset page: 4 parallel but no cache** | Every navigation re-fetches | Add React Query or SWR for caching + stale-while-revalidate |
| **GenerativeArt: CPU on auth pages** | Canvas animation runs continuously | Consider `requestAnimationFrame` throttle or pause when tab hidden |
| **Large lib/data.ts** | stages + assets imported on every page | Already static; consider code-splitting if bundle grows |
| **No prefetch on Link hover** | Next.js prefetches route, not data | Prefetch venture/asset data on link hover (future) |

---

## 3. SRE Runbook

### 3.1 SLIs (Service Level Indicators)

| SLI | Target | Measurement |
|-----|--------|-------------|
| **Availability** | 99.5% | Uptime checks (e.g. Vercel, Better Uptime) |
| **Latency p95** | &lt; 3s | Vercel Analytics / Real User Monitoring |
| **Error rate** | &lt; 1% | 5xx responses / total |
| **Auth success** | &gt; 99% | Login + callback success (manual/Sentry) |

### 3.2 SLOs (Service Level Objectives)

- **Uptime:** 99.5% over 30 days
- **Dashboard load:** p95 &lt; 3s
- **API 5xx:** &lt; 0.5% of requests

### 3.3 Monitoring Setup (Recommended)

1. **Error tracking:** Sentry (or similar) for client + server errors
2. **Uptime:** Vercel monitoring or external (e.g. Better Uptime)
3. **Logs:** Vercel logs, Supabase logs
4. **Performance:** Vercel Analytics, Web Vitals

### 3.4 Alerting

| Alert | Condition | Action |
|-------|-----------|--------|
| **Site down** | Uptime check fails 2× in 5 min | Page on-call, check Vercel/Supabase status |
| **High error rate** | 5xx &gt; 5% over 10 min | Check logs, Supabase health |
| **Auth failures spike** | Login errors &gt; 10% | Check Supabase Auth, email config |

### 3.5 Incident Response

1. **Detect:** Alert or user report
2. **Triage:** Is it auth, DB, API, or frontend?
3. **Mitigate:** Rollback deploy if recent; disable feature if possible
4. **Resolve:** Fix root cause, deploy
5. **Post-mortem:** Document in STATUS_REPORT or separate doc

### 3.6 Health Check Endpoint

Add `/api/health` for uptime monitors:

```ts
// Optional: src/app/api/health/route.ts
export async function GET() {
  try {
    // Optional: ping Supabase
    return Response.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: "degraded" }, { status: 503 });
  }
}
```

---

## 4. Quick Wins for Stability & Speed

### 4.1 Immediate (Low Effort)

- [ ] Add `/api/health` for uptime checks
- [ ] Fix dashboard: set `loading(false)` before `router.push("/onboarding")`
- [ ] Add `AbortController` to dashboard + venture + asset useEffect fetches
- [ ] Replace generic "Loading..." with skeleton loaders on dashboard, venture, asset pages

### 4.2 Short-Term (1–2 days)

- [ ] Integrate Sentry for error tracking
- [ ] Add retry logic for transient Supabase failures (exponential backoff)
- [ ] Validate `.single()` Supabase responses for `error` and show user-facing message
- [ ] Add React Query or SWR for dashboard + venture data caching

### 4.3 Medium-Term (1–2 weeks)

- [ ] Convert dashboard, venture overview to Server Components
- [ ] Add E2E test suite (Playwright)
- [ ] Set up Vercel Analytics + Web Vitals
- [ ] Create runbook doc with actual runbook steps for common incidents

---

## 5. Environment & Dependencies

### 5.1 Required Env Vars

| Var | Purpose | Missing = |
|-----|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | Auth fails |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Auth fails |
| `DATABASE_URL` | Postgres (Drizzle) | Server actions fail |
| `SLACK_BOT_TOKEN` | Slack integration | Slack features fail |
| `ANTHROPIC_API_KEY` | AI classify | AI features fail |

### 5.2 Dependency Hygiene

- Run `npm audit` before each release
- Keep `overrides` for esbuild until drizzle-kit updates

---

## 6. Checklist Before Deploy

- [ ] `npm run build` succeeds
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] Manual smoke test: login → dashboard → venture → asset
- [ ] Env vars set in Vercel
- [ ] Supabase RLS policies enabled
- [ ] Error boundary in place (error.tsx)
