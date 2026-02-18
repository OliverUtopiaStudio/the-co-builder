# Enriched Report Dual-Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `/report` to show a rich internal view for admin/studio users while keeping the curated stakeholder view unchanged.

**Architecture:** Server-side dual mode — the `/api/report/data` route detects auth type (Supabase session vs password cookie) and returns an `isInternal` flag + enriched data. Components receive `isInternal` as a prop and conditionally render richer layouts. No schema changes needed — all fields already exist in the database.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM, Supabase Auth, Tailwind CSS 4

**Design doc:** `docs/plans/2026-02-18-enriched-report-dual-mode-design.md`

---

## Task 1: API — Add Supabase Auth Detection

**Files:**
- Modify: `src/app/api/report/data/route.ts`

**Context:** Currently the API only validates the password cookie. We need to check for a Supabase session first (admin/studio role) and set `isInternal: true` if found. If no session, fall through to existing password check.

**Step 1: Add Supabase import and auth detection**

At the top of `route.ts`, add the Supabase server client import:

```typescript
import { createClient } from "@/lib/supabase/server";
import { fellows } from "@/db/schema"; // already imported, just need fellows
import { eq } from "drizzle-orm"; // already imported
```

**Step 2: Create internal auth check function**

Add this function before the `GET` handler:

```typescript
async function checkInternalAuth(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const [fellow] = await db
      .select({ role: fellows.role })
      .from(fellows)
      .where(eq(fellows.authUserId, user.id))
      .limit(1);

    return fellow?.role === "admin" || fellow?.role === "studio";
  } catch {
    return false;
  }
}
```

**Step 3: Update the GET handler auth flow**

Replace the auth check at the top of `GET`:

```typescript
export async function GET(request: NextRequest) {
  // 1. Check for internal (admin/studio) user via Supabase session
  const isInternal = await checkInternalAuth();

  // 2. If not internal, require password cookie (stakeholder)
  if (!isInternal && !validateReportAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ... rest of handler ...

  const result: Record<string, unknown> = { config: configMap, isInternal };
```

**Step 4: Verify existing behavior is preserved**

Run the dev server and confirm:
- Accessing `/report` without auth still returns 401
- Accessing `/report` with password cookie still works (returns `isInternal: false`)
- Accessing `/report` while logged in as admin returns `isInternal: true`

```bash
npm run dev
```

**Step 5: Commit**

```bash
git add src/app/api/report/data/route.ts
git commit -m "feat(report): Add Supabase auth detection for internal dual-mode"
```

---

## Task 2: API — Enrich Pod Data for Internal View

**Files:**
- Modify: `src/app/api/report/data/route.ts`

**Context:** Currently pods only return `id, name, tagline, color, clusters, displayOrder, fellowCount`. Internal view needs `thesis, marketGap, targetArchetype, optimalFellowProfile, currentJourneyStage, corporatePartners, coInvestors`.

**Step 1: Update pod query for internal mode**

Replace the pods section in the GET handler. The key change: when `isInternal`, select all fields instead of just the surface ones:

```typescript
if (visibleKeys.has("pods")) {
  const allPods = await db.select().from(pods).orderBy(pods.displayOrder);
  const fellowCounts = await db
    .select({
      podId: fellows.podId,
      count: sql<number>`count(*)::int`,
    })
    .from(fellows)
    .where(sql`${fellows.podId} IS NOT NULL`)
    .groupBy(fellows.podId);
  const countMap = new Map(fellowCounts.map((fc) => [fc.podId, fc.count]));

  let podData = allPods.map((pod) => ({
    id: pod.id,
    name: pod.name,
    tagline: pod.tagline,
    color: pod.color,
    clusters: pod.clusters,
    displayOrder: pod.displayOrder,
    fellowCount: countMap.get(pod.id) || 0,
    // Internal-only fields
    ...(isInternal && {
      thesis: pod.thesis,
      marketGap: pod.marketGap,
      targetArchetype: pod.targetArchetype,
      optimalFellowProfile: pod.optimalFellowProfile,
      currentJourneyStage: pod.currentJourneyStage,
      corporatePartners: pod.corporatePartners,
      coInvestors: pod.coInvestors,
    }),
  }));

  // Apply highlight filter (stakeholder only — internal sees all)
  if (!isInternal) {
    const podCfg = configMap["pods"];
    if (
      podCfg?.highlightMode === "highlighted_only" &&
      Array.isArray(podCfg.highlightedIds) &&
      (podCfg.highlightedIds as string[]).length > 0
    ) {
      const hl = new Set(podCfg.highlightedIds as string[]);
      podData = podData.filter((p) => hl.has(p.id));
    }
  }
  result.pods = podData;
}
```

**Step 2: Commit**

```bash
git add src/app/api/report/data/route.ts
git commit -m "feat(report): Enrich pod data for internal view"
```

---

## Task 3: API — Enrich Fellow Data for Internal View

**Files:**
- Modify: `src/app/api/report/data/route.ts`

**Context:** Currently fellows return `id, fullName, avatarUrl, bio, linkedinUrl, domain, lifecycleStage, ventureCount`. Internal view needs ratings, equity, pod info, background, experience, selection rationale, and venture details.

**Step 1: Update fellow query for internal mode**

Replace the fellows section:

```typescript
if (visibleKeys.has("fellows")) {
  const selectFields = isInternal
    ? {
        id: fellows.id,
        fullName: fellows.fullName,
        avatarUrl: fellows.avatarUrl,
        bio: fellows.bio,
        linkedinUrl: fellows.linkedinUrl,
        domain: fellows.domain,
        lifecycleStage: fellows.lifecycleStage,
        // Internal-only
        podId: fellows.podId,
        equityPercentage: fellows.equityPercentage,
        globalPotentialRating: fellows.globalPotentialRating,
        qatarImpactRating: fellows.qatarImpactRating,
        experienceProfile: fellows.experienceProfile,
        background: fellows.background,
        selectionRationale: fellows.selectionRationale,
      }
    : {
        id: fellows.id,
        fullName: fellows.fullName,
        avatarUrl: fellows.avatarUrl,
        bio: fellows.bio,
        linkedinUrl: fellows.linkedinUrl,
        domain: fellows.domain,
        lifecycleStage: fellows.lifecycleStage,
      };

  const fellowData = await db
    .select(selectFields)
    .from(fellows)
    .where(eq(fellows.role, "fellow"))
    .orderBy(fellows.createdAt);

  const vCounts = await db
    .select({
      fellowId: ventures.fellowId,
      count: sql<number>`count(*)::int`,
    })
    .from(ventures)
    .groupBy(ventures.fellowId);
  const vCountMap = new Map(vCounts.map((c) => [c.fellowId, c.count]));

  // For internal: get pod names for badge display
  let podNameMap = new Map<string, { name: string; color: string | null }>();
  if (isInternal) {
    const allPodNames = await db
      .select({ id: pods.id, name: pods.name, color: pods.color })
      .from(pods);
    podNameMap = new Map(allPodNames.map((p) => [p.id, { name: p.name, color: p.color }]));
  }

  // For internal: get venture details per fellow
  let venturesByFellow = new Map<string, Array<{ name: string; alignmentScore: string | null; isActive: boolean }>>();
  if (isInternal) {
    const allVentures = await db
      .select({
        fellowId: ventures.fellowId,
        name: ventures.name,
        podAlignmentScore: ventures.podAlignmentScore,
        isActive: ventures.isActive,
      })
      .from(ventures);
    for (const v of allVentures) {
      const list = venturesByFellow.get(v.fellowId) || [];
      list.push({ name: v.name, alignmentScore: v.podAlignmentScore, isActive: v.isActive });
      venturesByFellow.set(v.fellowId, list);
    }
  }

  let fellowResult = fellowData.map((f) => ({
    ...f,
    ventureCount: vCountMap.get(f.id) ?? 0,
    ...(isInternal && {
      podName: (f as any).podId ? podNameMap.get((f as any).podId)?.name ?? null : null,
      podColor: (f as any).podId ? podNameMap.get((f as any).podId)?.color ?? null : null,
      ventures: venturesByFellow.get(f.id) || [],
    }),
  }));

  // Apply highlight filter (stakeholder only)
  if (!isInternal) {
    const fellowCfg = configMap["fellows"];
    if (
      fellowCfg?.highlightMode === "highlighted_only" &&
      Array.isArray(fellowCfg.highlightedIds) &&
      (fellowCfg.highlightedIds as string[]).length > 0
    ) {
      const hl = new Set(fellowCfg.highlightedIds as string[]);
      fellowResult = fellowResult.filter((f) => hl.has(f.id));
    }
  }
  result.fellows = fellowResult;
}
```

**Step 2: Commit**

```bash
git add src/app/api/report/data/route.ts
git commit -m "feat(report): Enrich fellow data for internal view"
```

---

## Task 4: API — Enrich Pipeline & Impact for Internal View

**Files:**
- Modify: `src/app/api/report/data/route.ts`

**Context:** Pipeline needs conversion rates and priority. Impact needs per-venture and per-pod breakdowns.

**Step 1: Update pipeline section**

Replace the pipeline section:

```typescript
if (visibleKeys.has("pipeline")) {
  const pipelineData = await db
    .select()
    .from(ashbyPipeline)
    .orderBy(ashbyPipeline.displayOrder);

  if (isInternal) {
    // Add conversion rates
    result.pipeline = pipelineData.map((role) => ({
      ...role,
      conversionRates: {
        leadsToReview: role.leads && role.review ? Math.round((role.review / role.leads) * 100) : null,
        reviewToScreening: role.review && role.screening ? Math.round((role.screening / role.review) * 100) : null,
        screeningToInterview: role.screening && role.interview ? Math.round((role.interview / role.screening) * 100) : null,
        interviewToOffer: role.interview && role.offer ? Math.round((role.offer / role.interview) * 100) : null,
        offerToHired: role.offer && role.hired ? Math.round((role.hired / role.offer) * 100) : null,
        overallConversion: role.applicants && role.hired ? Math.round((role.hired / role.applicants) * 100) : null,
      },
    }));
  } else {
    result.pipeline = pipelineData;
  }
}
```

**Step 2: Update impact section**

After the existing impact calculation, add internal-only data:

```typescript
if (visibleKeys.has("impact")) {
  // ... keep all existing impact calculation code ...

  if (isInternal) {
    // Per-venture alignment details
    const ventureDetails = await db
      .select({
        id: ventures.id,
        name: ventures.name,
        podAlignmentScore: ventures.podAlignmentScore,
        isActive: ventures.isActive,
        fellowId: ventures.fellowId,
      })
      .from(ventures);

    // Per-pod breakdown
    const podList = await db
      .select({ id: pods.id, name: pods.name, color: pods.color })
      .from(pods);

    const fellowsWithPod = await db
      .select({
        podId: fellows.podId,
        qatarImpactRating: fellows.qatarImpactRating,
        globalPotentialRating: fellows.globalPotentialRating,
      })
      .from(fellows)
      .where(eq(fellows.role, "fellow"));

    const podBreakdown = podList.map((pod) => {
      const podFellows = fellowsWithPod.filter((f) => f.podId === pod.id);
      const qr = podFellows.map((f) => f.qatarImpactRating).filter((r): r is number => r !== null);
      const gr = podFellows.map((f) => f.globalPotentialRating).filter((r): r is number => r !== null);
      return {
        podId: pod.id,
        podName: pod.name,
        podColor: pod.color,
        fellowCount: podFellows.length,
        avgQatarImpact: qr.length > 0 ? Math.round((qr.reduce((a, b) => a + b, 0) / qr.length) * 10) / 10 : null,
        avgGlobalPotential: gr.length > 0 ? Math.round((gr.reduce((a, b) => a + b, 0) / gr.length) * 10) / 10 : null,
      };
    });

    // Rating distribution (buckets of 20: 0-19, 20-39, 40-59, 60-79, 80-100)
    const bucketize = (ratings: number[]) => {
      const buckets = [0, 0, 0, 0, 0]; // 0-19, 20-39, 40-59, 60-79, 80-100
      for (const r of ratings) {
        const idx = Math.min(Math.floor(r / 20), 4);
        buckets[idx]++;
      }
      return buckets;
    };

    (result.impact as any).ventureDetails = ventureDetails;
    (result.impact as any).podBreakdown = podBreakdown;
    (result.impact as any).ratingDistribution = {
      qatar: bucketize(qatarRatings),
      global: bucketize(globalRatings),
    };
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/report/data/route.ts
git commit -m "feat(report): Enrich pipeline and impact data for internal view"
```

---

## Task 5: Page — Pass `isInternal` to Components

**Files:**
- Modify: `src/app/(report)/report/page.tsx`

**Context:** The report page fetches data from the API and renders section components. We need to pass `isInternal` through and add page-level UI for internal users.

**Step 1: Update types and component map**

Update the `ReportData` type to include `isInternal`:

```typescript
type ReportData = {
  isInternal: boolean;
  config: Record<string, SectionConfig>;
  kpis?: any[];
  pods?: any[];
  fellows?: any[];
  pipeline?: any[];
  impact?: any;
};
```

Update `SECTION_COMPONENTS` to pass `isInternal`:

```typescript
const SECTION_COMPONENTS: Record<
  string,
  (data: ReportData, config: SectionConfig) => React.ReactNode
> = {
  kpis: (data) =>
    data.kpis ? <ReportKPIsSection kpis={data.kpis} /> : null,
  pods: (data, config) =>
    data.pods ? (
      <ReportPodsSection
        pods={data.pods}
        isInternal={data.isInternal}
        highlightedIds={
          Array.isArray(config.highlightedIds)
            ? (config.highlightedIds as string[])
            : undefined
        }
      />
    ) : null,
  fellows: (data, config) =>
    data.fellows ? (
      <ReportFellowsSection
        fellows={data.fellows}
        isInternal={data.isInternal}
        highlightedIds={
          Array.isArray(config.highlightedIds)
            ? (config.highlightedIds as string[])
            : undefined
        }
      />
    ) : null,
  pipeline: (data) =>
    data.pipeline ? (
      <ReportPipelineSection pipeline={data.pipeline} isInternal={data.isInternal} />
    ) : null,
  impact: (data) =>
    data.impact ? <ReportImpactSection impact={data.impact} isInternal={data.isInternal} /> : null,
};
```

**Step 2: Add page-level internal UI**

Replace the header section in the return JSX:

```tsx
return (
  <div className="space-y-10">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-medium">
          {data.isInternal ? "Stakeholder Report — Internal View" : "Stakeholder Report"}
        </h1>
        {data.isInternal && (
          <span
            className="text-[10px] font-semibold tracking-[1px] uppercase px-2 py-0.5 bg-accent/10 text-accent"
            style={{ borderRadius: 2 }}
          >
            Internal
          </span>
        )}
      </div>
      <p className="text-muted text-sm">
        The Utopia Studio programme overview
      </p>
      {data.isInternal && (
        <div className="flex items-center gap-4 mt-3">
          <a
            href="/studio/report"
            className="text-xs text-accent hover:underline"
          >
            Edit Report Config →
          </a>
        </div>
      )}
    </div>

    {/* Sticky section nav — internal only */}
    {data.isInternal && visibleSections.length > 1 && (
      <nav
        className="sticky top-0 lg:top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border -mx-6 px-6 py-2 -mt-4"
      >
        <div className="flex gap-4 overflow-x-auto">
          {visibleSections.map((section) => (
            <a
              key={section.sectionKey}
              href={`#section-${section.sectionKey}`}
              className="text-xs text-muted hover:text-foreground whitespace-nowrap transition-colors"
            >
              {section.narrativeTitle || DEFAULT_TITLES[section.sectionKey] || section.sectionKey}
            </a>
          ))}
        </div>
      </nav>
    )}

    {visibleSections.length === 0 && (
      <div
        className="bg-surface border border-border p-12 text-center text-muted"
        style={{ borderRadius: 2 }}
      >
        No report sections are currently configured.
      </div>
    )}

    {visibleSections.map((section) => {
      const renderer = SECTION_COMPONENTS[section.sectionKey];
      if (!renderer) return null;
      const content = renderer(data, section);
      if (!content) return null;

      return (
        <section key={section.sectionKey} id={`section-${section.sectionKey}`}>
          <NarrativeBlock
            title={section.narrativeTitle}
            text={section.narrativeText}
          />
          {!section.narrativeTitle && !section.narrativeText && (
            <h2 className="text-xl font-medium mb-4 text-foreground">
              {DEFAULT_TITLES[section.sectionKey] || section.sectionKey}
            </h2>
          )}
          {content}
        </section>
      );
    })}
  </div>
);
```

**Step 3: Commit**

```bash
git add src/app/(report)/report/page.tsx
git commit -m "feat(report): Pass isInternal flag to components, add page-level internal UI"
```

---

## Task 6: Pods Component — Rich Thesis Cards

**Files:**
- Modify: `src/app/(report)/report/components/ReportPodsSection.tsx`

**Context:** Internal view should show thesis, market gap, founder profile, journey stage, and partner/investor counts. Stakeholder view stays exactly as-is. Reference `src/data/pod-journey.ts` for `POD_JOURNEY_STAGES` stage labels.

**Step 1: Update the Pod type and add internal card**

Replace the entire file with the dual-mode version. The stakeholder card rendering stays identical — internal adds an expanded section below:

```tsx
import { POD_JOURNEY_STAGES } from "@/data/pod-journey";

type Pod = {
  id: string;
  name: string;
  tagline: string | null;
  color: string | null;
  clusters: unknown;
  displayOrder: number | null;
  fellowCount: number;
  // Internal-only fields
  thesis?: string | null;
  marketGap?: string | null;
  targetArchetype?: string | null;
  optimalFellowProfile?: string | null;
  currentJourneyStage?: string | null;
  corporatePartners?: unknown;
  coInvestors?: unknown;
};

export default function ReportPodsSection({
  pods,
  isInternal = false,
  highlightedIds,
}: {
  pods: Pod[];
  isInternal?: boolean;
  highlightedIds?: string[];
}) {
  // ... keep existing empty state check ...

  const hlSet = new Set(highlightedIds || []);
  const totalFellows = pods.reduce((s, p) => s + p.fellowCount, 0);

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        {pods.length} investment thesis pods — {totalFellows} fellows assigned
      </p>

      <div className={isInternal ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {pods.map((pod) => {
          const clusters = Array.isArray(pod.clusters)
            ? (pod.clusters as string[])
            : [];
          const isHighlighted = hlSet.size > 0 && hlSet.has(pod.id);
          const journeyStage = pod.currentJourneyStage
            ? POD_JOURNEY_STAGES.find((s) => s.key === pod.currentJourneyStage)
            : null;
          const partnerCount = Array.isArray(pod.corporatePartners) ? pod.corporatePartners.length : 0;
          const investorCount = Array.isArray(pod.coInvestors) ? pod.coInvestors.length : 0;

          if (isInternal) {
            return (
              <div
                key={pod.id}
                className="bg-surface border border-border p-0"
                style={{ borderRadius: 2 }}
              >
                {/* Color bar */}
                <div className="h-1" style={{ backgroundColor: pod.color || "#CC5536" }} />

                <div className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className="inline-block text-[10px] font-semibold tracking-[1px] px-1.5 py-0.5 mb-2"
                        style={{
                          backgroundColor: `${pod.color || "#CC5536"}15`,
                          color: pod.color || "#CC5536",
                          borderRadius: 2,
                        }}
                      >
                        POD {pod.displayOrder}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{pod.name}</h3>
                      {pod.tagline && (
                        <p className="text-sm text-muted mt-1">{pod.tagline}</p>
                      )}
                    </div>
                    {journeyStage && (
                      <span
                        className="text-[10px] font-medium tracking-[0.5px] uppercase px-2 py-0.5 bg-background border border-border text-muted"
                        style={{ borderRadius: 2 }}
                      >
                        {journeyStage.label}
                      </span>
                    )}
                  </div>

                  {/* Thesis */}
                  {pod.thesis && (
                    <div className="mb-4">
                      <div className="label-uppercase text-muted mb-1 text-[10px]">Thesis</div>
                      <p className="text-sm text-foreground leading-relaxed">{pod.thesis}</p>
                    </div>
                  )}

                  {/* Market Gap */}
                  {pod.marketGap && (
                    <div className="mb-4 bg-background border border-border p-3" style={{ borderRadius: 2 }}>
                      <div className="label-uppercase text-muted mb-1 text-[10px]">Market Gap</div>
                      <p className="text-xs text-foreground leading-relaxed">{pod.marketGap}</p>
                    </div>
                  )}

                  {/* Clusters */}
                  {clusters.length > 0 && (
                    <div className="mb-4">
                      <div className="label-uppercase text-muted mb-2 text-[10px]">Clusters</div>
                      <div className="flex flex-wrap gap-1.5">
                        {clusters.map((cluster, i) => (
                          <span
                            key={i}
                            className="text-[11px] text-foreground bg-background px-2.5 py-1 border border-border"
                            style={{ borderRadius: 2 }}
                          >
                            {cluster.split("(")[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimal Founder */}
                  {pod.optimalFellowProfile && (
                    <div className="mb-4">
                      <div className="label-uppercase text-muted mb-1 text-[10px]">Optimal Founder Profile</div>
                      <p className="text-xs text-muted leading-relaxed">{pod.optimalFellowProfile}</p>
                    </div>
                  )}

                  {/* Footer stats */}
                  <div className="flex items-center gap-4 text-xs text-muted border-t border-border pt-3 mt-3">
                    <span>
                      <span className="font-semibold text-foreground">{pod.fellowCount}</span>{" "}
                      {pod.fellowCount === 1 ? "fellow" : "fellows"}
                    </span>
                    {partnerCount > 0 && (
                      <span>
                        <span className="font-semibold text-foreground">{partnerCount}</span> partners
                      </span>
                    )}
                    {investorCount > 0 && (
                      <span>
                        <span className="font-semibold text-foreground">{investorCount}</span> co-investors
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Stakeholder view — unchanged from current
          return (
            <div
              key={pod.id}
              className={`bg-surface border p-0 ${
                isHighlighted ? "border-accent/40" : "border-border"
              }`}
              style={{ borderRadius: 2 }}
            >
              <div className="h-1" style={{ backgroundColor: pod.color || "#CC5536" }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div
                      className="inline-block text-[10px] font-semibold tracking-[1px] px-1.5 py-0.5 mb-2"
                      style={{
                        backgroundColor: `${pod.color || "#CC5536"}15`,
                        color: pod.color || "#CC5536",
                        borderRadius: 2,
                      }}
                    >
                      POD {pod.displayOrder}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{pod.name}</h3>
                  </div>
                </div>
                {pod.tagline && <p className="text-xs text-muted mb-3">{pod.tagline}</p>}
                {clusters.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {clusters.map((cluster, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-muted bg-background px-2 py-0.5 border border-border"
                        style={{ borderRadius: 2 }}
                      >
                        {cluster.split("(")[0].trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted border-t border-border pt-3 mt-3">
                  <span className="font-semibold text-foreground">{pod.fellowCount}</span>{" "}
                  {pod.fellowCount === 1 ? "fellow" : "fellows"} assigned
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify both modes render correctly**

Check `/report` as stakeholder (password) — should look identical to before.
Check `/report` as admin — should show enriched thesis cards.

**Step 3: Commit**

```bash
git add src/app/(report)/report/components/ReportPodsSection.tsx
git commit -m "feat(report): Add rich thesis pod cards for internal view"
```

---

## Task 7: Fellows Component — Context-Rich Cards

**Files:**
- Modify: `src/app/(report)/report/components/ReportFellowsSection.tsx`

**Context:** Internal view adds pod badge, ratings, equity, background, ventures. Stakeholder view unchanged. Keep existing imports (`Link`, `LIFECYCLE_STAGE_LABELS`).

**Step 1: Update types**

Add internal-only fields to the `PortfolioFellow` type:

```typescript
type PortfolioFellow = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  domain: string | null;
  lifecycleStage: string | null;
  ventureCount: number;
  // Internal-only
  podId?: string | null;
  podName?: string | null;
  podColor?: string | null;
  equityPercentage?: string | null;
  globalPotentialRating?: number | null;
  qatarImpactRating?: number | null;
  experienceProfile?: string | null;
  background?: string | null;
  selectionRationale?: string | null;
  ventures?: Array<{ name: string; alignmentScore: string | null; isActive: boolean }>;
};
```

**Step 2: Add `isInternal` prop and internal card rendering**

Update the component signature:

```typescript
export default function ReportFellowsSection({
  fellows,
  isInternal = false,
  highlightedIds,
}: {
  fellows: PortfolioFellow[];
  isInternal?: boolean;
  highlightedIds?: string[];
}) {
```

Inside the `.map()`, after the existing stakeholder card, add an internal branch at the top:

```tsx
{fellows.map((fellow) => {
  const isHighlighted = hlSet.size > 0 && hlSet.has(fellow.id);

  if (isInternal) {
    return (
      <div
        key={fellow.id}
        className="bg-surface border border-border p-5"
        style={{ borderRadius: 2 }}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {fellow.avatarUrl ? (
              <img
                src={fellow.avatarUrl}
                alt={fellow.fullName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-medium">
                {fellow.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{fellow.fullName}</h3>
              {fellow.podName && (
                <span
                  className="text-[10px] font-semibold tracking-[0.5px] px-1.5 py-0.5 flex-shrink-0"
                  style={{
                    backgroundColor: `${fellow.podColor || "#CC5536"}15`,
                    color: fellow.podColor || "#CC5536",
                    borderRadius: 2,
                  }}
                >
                  {fellow.podName}
                </span>
              )}
            </div>
            {fellow.domain && (
              <p className="text-muted text-xs">{fellow.domain}</p>
            )}

            {/* Ratings row */}
            <div className="flex flex-wrap gap-2 mt-2">
              {fellow.qatarImpactRating != null && (
                <span className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground" style={{ borderRadius: 2 }}>
                  Qatar: <span className="font-semibold">{fellow.qatarImpactRating}</span>/100
                </span>
              )}
              {fellow.globalPotentialRating != null && (
                <span className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground" style={{ borderRadius: 2 }}>
                  Global: <span className="font-semibold">{fellow.globalPotentialRating}</span>/100
                </span>
              )}
              {fellow.equityPercentage && Number(fellow.equityPercentage) > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground" style={{ borderRadius: 2 }}>
                  Equity: <span className="font-semibold">{fellow.equityPercentage}%</span>
                </span>
              )}
              {fellow.lifecycleStage && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-medium ${
                    STAGE_COLORS[fellow.lifecycleStage] ?? "bg-border/50 text-muted"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  {LIFECYCLE_STAGE_LABELS[fellow.lifecycleStage as LifecycleStage] ?? fellow.lifecycleStage}
                </span>
              )}
            </div>

            {/* Bio or background */}
            {(fellow.background || fellow.bio) && (
              <p className="text-muted text-xs mt-2 line-clamp-2">
                {fellow.background || fellow.bio}
              </p>
            )}

            {/* Ventures */}
            {fellow.ventures && fellow.ventures.length > 0 && (
              <div className="mt-3 border-t border-border pt-2">
                <div className="label-uppercase text-muted mb-1 text-[9px]">Ventures</div>
                <div className="flex flex-wrap gap-1.5">
                  {fellow.ventures.map((v, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-background border border-border"
                      style={{ borderRadius: 2 }}
                    >
                      {v.name}
                      {v.alignmentScore && (
                        <span className="text-muted ml-1">({Number(v.alignmentScore).toFixed(0)}%)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 mt-2">
              {fellow.linkedinUrl && (
                <a href={fellow.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                  LinkedIn →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stakeholder view — keep current Link-based card exactly as-is
  return (
    <Link ... >
      {/* ... existing stakeholder card JSX ... */}
    </Link>
  );
})}
```

Keep the existing stakeholder card rendering unchanged inside the else branch.

**Step 3: Commit**

```bash
git add src/app/(report)/report/components/ReportFellowsSection.tsx
git commit -m "feat(report): Add context-rich fellow cards for internal view"
```

---

## Task 8: Pipeline Component — Enhanced Funnel

**Files:**
- Modify: `src/app/(report)/report/components/ReportPipelineSection.tsx`

**Context:** Internal view adds conversion rate labels between funnel stages and priority badges. Stakeholder view unchanged.

**Step 1: Update type and add `isInternal` prop**

```typescript
type PipelineRole = {
  id: string;
  roleTitle: string;
  department: string | null;
  applicants: number | null;
  leads: number | null;
  review: number | null;
  screening: number | null;
  interview: number | null;
  offer: number | null;
  hired: number | null;
  priority?: string | null;
  conversionRates?: {
    leadsToReview: number | null;
    reviewToScreening: number | null;
    screeningToInterview: number | null;
    interviewToOffer: number | null;
    offerToHired: number | null;
    overallConversion: number | null;
  };
};
```

Update the component signature to accept `isInternal`:

```typescript
export default function ReportPipelineSection({
  pipeline,
  isInternal = false,
}: {
  pipeline: PipelineRole[];
  isInternal?: boolean;
}) {
```

**Step 2: Add conversion rates below funnel bars (internal only)**

After the existing funnel `grid-cols-6` div, add (inside the same card, conditional on `isInternal`):

```tsx
{/* Conversion rates — internal only */}
{isInternal && role.conversionRates && (
  <div className="grid grid-cols-5 gap-2 mt-2 px-1">
    {[
      { rate: role.conversionRates.leadsToReview, label: "→ Review" },
      { rate: role.conversionRates.reviewToScreening, label: "→ Screen" },
      { rate: role.conversionRates.screeningToInterview, label: "→ Interview" },
      { rate: role.conversionRates.interviewToOffer, label: "→ Offer" },
      { rate: role.conversionRates.offerToHired, label: "→ Hired" },
    ].map((step, i) => (
      <div key={i} className="text-center">
        <div className="text-[10px] text-muted">{step.label}</div>
        <div className="text-xs font-semibold text-foreground">
          {step.rate != null ? `${step.rate}%` : "—"}
        </div>
      </div>
    ))}
  </div>
)}
```

Add priority badge next to the role title (internal only):

```tsx
<div className="flex items-start justify-between mb-4">
  <div className="flex items-center gap-2">
    <h3 className="text-sm font-semibold text-foreground">{role.roleTitle}</h3>
    {isInternal && role.priority && role.priority !== "medium" && (
      <span
        className={`text-[9px] font-semibold uppercase tracking-[0.5px] px-1.5 py-0.5 ${
          role.priority === "high" || role.priority === "urgent"
            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            : "bg-background text-muted"
        }`}
        style={{ borderRadius: 2 }}
      >
        {role.priority}
      </span>
    )}
    {role.department && <div className="text-xs text-muted">{role.department}</div>}
  </div>
  <div className="text-right">
    <div className="text-lg font-semibold text-foreground">{role.applicants}</div>
    <div className="text-[10px] text-muted uppercase tracking-wider">Applicants</div>
    {isInternal && role.conversionRates?.overallConversion != null && (
      <div className="text-[10px] text-accent font-medium mt-0.5">
        {role.conversionRates.overallConversion}% overall
      </div>
    )}
  </div>
</div>
```

**Step 3: Commit**

```bash
git add src/app/(report)/report/components/ReportPipelineSection.tsx
git commit -m "feat(report): Add conversion rates and priority to pipeline internal view"
```

---

## Task 9: Impact Component — Deeper Metrics

**Files:**
- Modify: `src/app/(report)/report/components/ReportImpactSection.tsx`

**Context:** Internal view adds per-venture alignment table, rating distribution bars, and per-pod breakdown. Stakeholder view unchanged.

**Step 1: Update type and add `isInternal` prop**

```typescript
type ImpactData = {
  // ... existing fields ...
  // Internal-only
  ventureDetails?: Array<{
    id: string;
    name: string;
    podAlignmentScore: string | null;
    isActive: boolean;
  }>;
  podBreakdown?: Array<{
    podId: string;
    podName: string;
    podColor: string | null;
    fellowCount: number;
    avgQatarImpact: number | null;
    avgGlobalPotential: number | null;
  }>;
  ratingDistribution?: {
    qatar: number[];
    global: number[];
  };
};
```

Add to component signature:

```typescript
export default function ReportImpactSection({
  impact,
  isInternal = false,
}: {
  impact: ImpactData;
  isInternal?: boolean;
}) {
```

**Step 2: Add internal-only sections**

After the existing key numbers grid, add:

```tsx
{/* Per-pod breakdown — internal only */}
{isInternal && impact.podBreakdown && impact.podBreakdown.length > 0 && (
  <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
    <div className="label-uppercase text-muted mb-3 text-[10px]">Impact by Pod</div>
    <div className="space-y-3">
      {impact.podBreakdown.map((pod) => (
        <div key={pod.podId} className="flex items-center gap-4">
          <div
            className="w-2 h-8 flex-shrink-0"
            style={{ backgroundColor: pod.podColor || "#CC5536", borderRadius: 1 }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">{pod.podName}</div>
            <div className="text-xs text-muted">{pod.fellowCount} fellows</div>
          </div>
          <div className="flex gap-4 text-xs text-right">
            <div>
              <div className="text-muted">Qatar</div>
              <div className="font-semibold text-foreground">
                {pod.avgQatarImpact != null ? pod.avgQatarImpact : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted">Global</div>
              <div className="font-semibold text-foreground">
                {pod.avgGlobalPotential != null ? pod.avgGlobalPotential : "—"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Rating distribution — internal only */}
{isInternal && impact.ratingDistribution && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {(["qatar", "global"] as const).map((type) => {
      const buckets = impact.ratingDistribution![type];
      const maxBucket = Math.max(...buckets, 1);
      const labels = ["0-19", "20-39", "40-59", "60-79", "80-100"];
      return (
        <div key={type} className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
          <div className="label-uppercase text-muted mb-3 text-[10px]">
            {type === "qatar" ? "Qatar Impact" : "Global Potential"} Distribution
          </div>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {buckets.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full"
                  style={{
                    height: Math.max((count / maxBucket) * 60, 2),
                    backgroundColor: count > 0 ? "#CC5536" : "#E3E1E2",
                    borderRadius: 1,
                    opacity: count > 0 ? 0.7 + (count / maxBucket) * 0.3 : 0.3,
                  }}
                />
                <div className="text-[9px] text-muted mt-1">{labels[i]}</div>
                <div className="text-[10px] font-semibold text-foreground">{count}</div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
)}

{/* Venture alignment table — internal only */}
{isInternal && impact.ventureDetails && impact.ventureDetails.length > 0 && (
  <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
    <div className="label-uppercase text-muted mb-3 text-[10px]">Venture Alignment Scores</div>
    <div className="space-y-1.5">
      {impact.ventureDetails
        .sort((a, b) => Number(b.podAlignmentScore || 0) - Number(a.podAlignmentScore || 0))
        .map((v) => {
          const score = v.podAlignmentScore ? Number(v.podAlignmentScore) : null;
          return (
            <div key={v.id} className="flex items-center gap-3 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.isActive ? "bg-green-500" : "bg-border"}`} />
              <span className="flex-1 text-foreground truncate">{v.name}</span>
              {score != null ? (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-background overflow-hidden" style={{ borderRadius: 1 }}>
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(score, 100)}%`,
                        backgroundColor: score >= 80 ? "#2E7D32" : score >= 60 ? "#D97706" : "#CC5536",
                        borderRadius: 1,
                      }}
                    />
                  </div>
                  <span className="text-muted w-8 text-right">{score.toFixed(0)}%</span>
                </div>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          );
        })}
    </div>
  </div>
)}
```

**Step 3: Commit**

```bash
git add src/app/(report)/report/components/ReportImpactSection.tsx
git commit -m "feat(report): Add per-pod breakdown and rating distribution for internal view"
```

---

## Task 10: Seed Pod Thesis Content

**Files:**
- Create: `src/app/api/report/seed-pods/route.ts`

**Context:** The pod thesis data from Pod Alignment v1.md needs to be seeded into existing database fields. This is a one-time admin-only endpoint. All 5 pods already exist in the database — we're updating their `thesis`, `marketGap`, `targetArchetype`, `optimalFellowProfile` fields with summarized content.

**Step 1: Create the seed endpoint**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { fellows, pods } from "@/db/schema";
import { eq } from "drizzle-orm";

const POD_SEED_DATA: Record<string, {
  thesis: string;
  marketGap: string;
  targetArchetype: string;
  optimalFellowProfile: string;
}> = {
  "Infra Intelligence": {
    thesis: "Intelligence layer for $106T of aging critical infrastructure — energy grids, data centers, industrial assets — where AI-native software replaces manual inspection, reactive maintenance, and siloed operations.",
    marketGap: "Manual inspection, reactive maintenance, and siloed operations persist across aging infrastructure worth $106T globally. The shift from analog to intelligent infrastructure creates a massive opportunity for AI-native operating systems.",
    targetArchetype: "Deep infrastructure domain expertise combined with AI/ML capability. Ex-utility engineers, grid operators, industrial IoT builders who understand the physical constraints of infrastructure systems.",
    optimalFellowProfile: "Technical founders with 5-10+ years in energy, data centers, or industrial operations. Strong ML/AI skills applied to physical systems. Experience with sensor data, digital twins, or predictive analytics in infrastructure contexts.",
  },
  "Decarb Industry": {
    thesis: "Industrial decarbonization reframed as an optimization problem — reducing emissions through smarter logistics, lower-carbon materials, and extended asset lifecycles rather than pure substitution.",
    marketGap: "Emissions reduction is treated as a cost center rather than an optimization opportunity. Industrial supply chains, materials production, and asset management remain largely unoptimized for carbon efficiency.",
    targetArchetype: "Industrial process expertise combined with sustainability quantification. Supply chain engineers, materials scientists, and industrial operations specialists who can quantify and optimize carbon impact.",
    optimalFellowProfile: "Founders from industrial logistics, materials science, or manufacturing operations. Ability to measure and reduce embodied carbon, optimize cross-border routing, or extend asset lifecycles through predictive analytics.",
  },
  "Sovereign Systems": {
    thesis: "National-scale digital, compute, and energy infrastructure for GCC, Southeast Asia, and Africa — building sovereign capability rather than dependence on foreign platforms for critical national systems.",
    marketGap: "Emerging nations depend on foreign platforms for critical national infrastructure — data sovereignty, energy grids, identity systems. This creates strategic vulnerability and limits economic self-determination.",
    targetArchetype: "Government and institutional understanding combined with deep tech capability. Former civil servants, national infrastructure builders, and GovTech operators who can navigate public-sector procurement.",
    optimalFellowProfile: "Founders who understand sovereign technology requirements in GCC, SEA, or Africa. Experience building national-scale platforms (identity, health, payments, energy) with strong public-sector relationships and regulatory navigation skills.",
  },
  "Flow Rails": {
    thesis: "Programmable economic infrastructure — replacing fragmented payment corridors, opaque wealth management, and exclusionary SME lending with software-native financial rails built for emerging markets.",
    marketGap: "Fragmented payment rails, opaque wealth management, and exclusionary lending persist across emerging markets. Cross-border transactions remain expensive, tokenized assets inaccessible, and SME credit scarce.",
    targetArchetype: "Financial infrastructure expertise combined with regulatory navigation. Ex-payments operators, central bank technologists, and fintech infrastructure builders who understand corridor economics.",
    optimalFellowProfile: "Founders from payments infrastructure, central banking, or financial inclusion. Deep understanding of cross-border settlement, stablecoin/CBDC mechanics, or alternative credit underwriting for underserved markets.",
  },
  "Domain Experiments": {
    thesis: "Vertical AI for healthcare, industry, and research — purpose-built AI systems for domains where horizontal tools fail due to regulatory complexity, safety requirements, or specialized workflow needs.",
    marketGap: "Horizontal AI tools fail in regulated, safety-critical, and workflow-complex domains. Healthcare documentation, clinical diagnostics, and industrial research require purpose-built AI that understands domain constraints.",
    targetArchetype: "Deep domain expertise in healthcare or research combined with AI product capability. Clinicians-turned-founders, research scientists, and domain workflow specialists.",
    optimalFellowProfile: "Founders with direct clinical, research, or industrial operations experience who understand why generic AI fails in their domain. Strong product sense for building compliant, safety-aware AI systems.",
  },
};

export async function POST() {
  // Admin-only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [fellow] = await db
    .select({ role: fellows.role })
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow || fellow.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: Array<{ pod: string; status: string }> = [];

  for (const [podName, data] of Object.entries(POD_SEED_DATA)) {
    const [existing] = await db
      .select({ id: pods.id, thesis: pods.thesis })
      .from(pods)
      .where(eq(pods.name, podName))
      .limit(1);

    if (!existing) {
      results.push({ pod: podName, status: "not_found" });
      continue;
    }

    await db
      .update(pods)
      .set({
        thesis: data.thesis,
        marketGap: data.marketGap,
        targetArchetype: data.targetArchetype,
        optimalFellowProfile: data.optimalFellowProfile,
        updatedAt: new Date(),
      })
      .where(eq(pods.id, existing.id));

    results.push({ pod: podName, status: "updated" });
  }

  return NextResponse.json({ results });
}
```

**Step 2: Test by calling the endpoint**

```bash
# While logged in as admin, call from browser console or curl:
# POST /api/report/seed-pods
```

**Step 3: Commit**

```bash
git add src/app/api/report/seed-pods/route.ts
git commit -m "feat(report): Add one-time pod thesis seeding endpoint"
```

---

## Task 11: Build Verification & Manual Testing

**Step 1: Run the build**

```bash
npm run build
```

Fix any TypeScript errors that surface.

**Step 2: Manual verification checklist**

1. **Stakeholder view** (access via password): All 5 sections render exactly as before. No visual changes.
2. **Internal view** (access as admin): All 5 sections show enriched data. Page header shows "Internal View" badge and sticky nav.
3. **Pod cards** (internal): Show thesis, market gap, clusters, founder profile, journey stage.
4. **Fellow cards** (internal): Show pod badge, ratings, equity, ventures.
5. **Pipeline** (internal): Show conversion rates between stages, priority badges.
6. **Impact** (internal): Show per-pod breakdown, rating distribution, venture alignment table.
7. **KPIs**: Unchanged in both modes.

**Step 3: Run seed**

Call `POST /api/report/seed-pods` while logged in as admin to populate pod thesis content.

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(report): Address build issues from enriched report implementation"
```
