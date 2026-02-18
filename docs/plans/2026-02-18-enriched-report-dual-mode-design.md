# Enriched Report: Dual-Mode Internal/Stakeholder View

**Date:** 2026-02-18
**Status:** Approved

## Problem

The `/report` page currently shows surface-level data (6 fields from pods with 41+ available, basic fellow cards, flat KPI grid). The database has rich thesis, alignment, journey, and rating data that is completely unexposed. Meanwhile, the team needs both a rich internal view for operations and a curated published view for stakeholders — currently there's only the stakeholder view.

## Decision

**Server-side dual mode on `/report`** — the API detects authentication type (Supabase session = internal admin/studio user, password cookie = external stakeholder) and returns enriched data + an `isInternal` boolean. Components conditionally render richer layouts for internal users while stakeholders see the curated view controlled by admin config.

### Why this approach

- Single URL, single component tree — no route duplication
- Stakeholder view stays exactly as admin configures it via `/studio/report`
- Internal view surfaces the rich data already in the database
- No new auth mechanisms needed — reuses existing Supabase + password cookie
- Components receive `isInternal` prop and conditionally expand

## Architecture

### Auth Detection Flow

```
GET /api/report/data
  ├── Check Supabase session (admin/studio role)
  │   ├── Valid → isInternal: true, return ALL data (enriched)
  │   └── Invalid → fall through
  ├── Check password cookie (stakeholder)
  │   ├── Valid → isInternal: false, return curated data (current behavior)
  │   └── Invalid → 401
```

### API Changes (`/api/report/data/route.ts`)

1. Add Supabase auth check before password check
2. When `isInternal: true`:
   - Pods: include `thesis`, `marketGap`, `targetArchetype`, `optimalFellowProfile`, `currentJourneyStage`, `corporatePartners`, `coInvestors`
   - Fellows: include `equityPercentage`, `globalPotentialRating`, `qatarImpactRating`, `experienceProfile`, `background`, `selectionRationale`, `podId` (+ pod name)
   - Pipeline: include conversion rates between stages, priority field
   - Impact: include per-venture alignment scores, per-fellow rating breakdowns
3. When `isInternal: false`: current behavior unchanged
4. Return `isInternal` flag in response

### Response Shape

```typescript
type ReportData = {
  isInternal: boolean;
  config: Record<string, SectionConfig>;
  kpis?: KPIMetric[];           // unchanged — same table format
  pods?: PodData[];             // enriched when internal
  fellows?: FellowData[];       // enriched when internal
  pipeline?: PipelineData[];    // enriched when internal
  impact?: ImpactData;          // enriched when internal
};
```

## Section-by-Section Design

### 1. KPIs — No changes

Keep the existing KPI table/grid as-is. It already shows Year 1 in-progress values and Year 5 targets with progress bars. No trend sparklines or `kpiHistory` integration needed.

### 2. Pods — Rich Thesis Cards (internal only)

**Stakeholder view:** Current cards (name, tagline, cluster chips, fellow count) — unchanged.

**Internal view adds:**
- Full thesis statement (1-2 sentence summary from `thesis` field)
- Market gap callout (from `marketGap` field)
- Target archetype / optimal founder profile (from `optimalFellowProfile`)
- Cluster chips with short descriptions (from enriched `clusters` JSON)
- Journey stage indicator (from `currentJourneyStage` mapped to `pod-journey.ts` stage labels)
- Corporate partners count and co-investors count
- Expandable details section for full thesis text

**Pod content seeding** — data from Pod Alignment v1.md to be seeded into existing database fields:

| Pod | Thesis (summary) | Market Gap | Clusters | Optimal Founder |
|-----|------------------|------------|----------|-----------------|
| Infra Intelligence | Intelligence layer for $106T of aging critical infrastructure — energy grids, data centers, industrial assets | Manual inspection, reactive maintenance, siloed operations across aging infrastructure | Energy Intelligence, Data Center Intelligence, Maintenance & Performance | Deep infrastructure domain + AI/ML. Ex-utility engineers, grid operators, industrial IoT builders |
| Decarb Industry | Industrial decarbonization as optimization — smarter logistics, lower-carbon materials, extended asset lifecycles | Emissions reduction treated as cost center, not optimization opportunity | Industrial Logistics Decarb, Low-Carbon Materials, Asset Longevity & Rollout Readiness | Industrial process expertise + sustainability quantification. Supply chain engineers, materials scientists |
| Sovereign Systems | National-scale digital, compute, and energy infrastructure for GCC, SEA, and Africa | Dependence on foreign platforms for critical national infrastructure | Sovereign Data & Risk Intelligence, Sovereign Energy & Grid Resilience, National Digital Stacks | Government/institutional understanding + deep tech. Former civil servants, GovTech operators |
| Flow Rails | Programmable economic infrastructure replacing fragmented corridors, opaque wealth management, exclusionary SME lending | Fragmented payment rails, opaque wealth management, exclusionary lending in emerging markets | Cross-Border Rails, Wealth Architecture, SME Finance Rails | Financial infrastructure expertise + regulatory navigation. Ex-payments operators, central bank technologists |
| Domain Experiments | Vertical AI for healthcare, industry, and research where horizontal tools fail | Horizontal AI tools failing in regulated, safety-critical, workflow-complex domains | Health System Productivity, (additional clusters being defined) | Deep domain expertise in healthcare/research + AI product capability. Clinicians-turned-founders |

### 3. Fellows — Context-Rich Portfolio Cards (internal only)

**Stakeholder view:** Current cards (avatar, name, domain, bio, lifecycle badge, venture count, LinkedIn) — unchanged.

**Internal view adds:**
- Pod assignment badge (color-coded to pod)
- Ratings: Qatar Impact (x/100) and Global Potential (x/100) as small score pills
- Equity percentage
- Experience profile / background summary
- Selection rationale (expandable)
- Venture names with alignment scores

### 4. Pipeline — Enhanced Funnel (internal only)

**Stakeholder view:** Current funnel per role (leads → review → screen → interview → offer → hired) — unchanged.

**Internal view adds:**
- Conversion rates between adjacent stages (e.g., "42% pass rate")
- Priority indicator per role (high/medium/low badge)
- Pod tag showing which pod the role feeds into (if applicable)
- Total funnel conversion rate (applicants → hired %)

### 5. Impact — Deeper Metrics (internal only)

**Stakeholder view:** Current metric cards + lifecycle bar + key numbers — unchanged.

**Internal view adds:**
- Per-venture alignment scores table (venture name, pod, score, active status)
- Rating distribution visualization (how many fellows at each score range)
- Per-pod impact breakdown (avg ratings grouped by pod)

### 6. Page-Level Changes

**Internal view only:**
- "Internal View" badge in page header (subtle indicator)
- Sticky section nav (jump links to each section)
- "Edit Report Config" link to `/studio/report` for admin users
- Title changes to "Stakeholder Report — Internal View"

**Both modes:**
- No layout changes — same page structure, same section ordering from `reportConfig`

## Data Seeding

A server action or migration script will:
1. Look up each pod by name
2. Update `thesis`, `marketGap`, `targetArchetype`, `optimalFellowProfile`, `corporatePartners`, `coInvestors` fields with summarized content from the Pod Alignment v1 document
3. Ensure `clusters` field contains structured objects (not just strings) with name + short description
4. Set `currentJourneyStage` to appropriate stage based on pod maturity

## Files to Create/Modify

### Modified files:
- `src/app/api/report/data/route.ts` — add Supabase auth check, enriched data queries
- `src/app/(report)/report/page.tsx` — pass `isInternal` to components, add page-level UI
- `src/app/(report)/report/components/ReportPodsSection.tsx` — dual-mode pod cards
- `src/app/(report)/report/components/ReportFellowsSection.tsx` — dual-mode fellow cards
- `src/app/(report)/report/components/ReportPipelineSection.tsx` — dual-mode pipeline
- `src/app/(report)/report/components/ReportImpactSection.tsx` — dual-mode impact
- `src/app/(report)/report/components/ReportKPIsSection.tsx` — no changes (keep as-is)

### New files:
- `src/app/api/report/seed-pods/route.ts` — one-time seed endpoint for pod thesis content

### Not modified:
- `src/app/(studio)/studio/report/page.tsx` — admin curation stays as-is
- `src/components/layout/SidebarLayout.tsx` — no changes needed
- `src/db/schema.ts` — no schema changes (all fields already exist)

## Design System

All new UI follows existing patterns:
- `borderRadius: 2` on all cards/containers
- `label-uppercase` class for section labels
- Accent color `#CC5536` for highlights
- `text-[10px]` for micro labels, `text-xs` for secondary text
- `bg-surface border border-border` for card backgrounds
- No external chart libraries — CSS-only visualizations
