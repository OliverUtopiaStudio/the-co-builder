# The Co-Builder — Product Requirements Document

**Version:** 3.1 — Enhanced Diagnosis & Stakeholder Access
**Last updated:** 2026-02-12
**Author:** Oliver Graham-Yooll / Utopia Studio
**Status:** Active — MVP target Friday 2026-02-14

### Mission Statement

> Turn domain experts into world-leading founders with category-creating products — through a disciplined, first-principles method that takes them from invention thesis to investable company. The Co-Builder is their augmented co-founder: it meets them where they are, upskills them with modern build stacks, and creates the rigorous logic foundations that win customers and investors.

---

## 1. Purpose

The Co-Builder is a **unified venture-building platform** that serves four interconnected user groups through a single data model:

1. **The Studio Team** — running the studio: sourcing fellows, managing investment pods, tracking performance against Year 1 KPIs, and overseeing the programme's operational health
2. **Fellows** — building ventures daily: diagnosing their next highest-leverage action, working through the 27-asset Co-Build framework, and tracking their progress from onboarding to spin-out
3. **Stakeholders** — external investors and partners with read-only access to the fellow portfolio
4. **The AI Layer** — reviewing, teaching, and identifying quality gaps across all ventures (Phase 3+)

These three perspectives are not separate products. They are **three views of the same data graph**:

```
                        ┌─────────────────────────┐
                        │     STUDIO TEAM          │
                        │  Strategic & Operational  │
                        │  KPIs, Pods, Pipeline,    │
                        │  Framework, Stage Gates   │
                        └────────┬──────────────────┘
                                 │
                    WRITES: pod definitions, KPI targets,
                    pipeline roles, framework content,
                    experience profiles, stipend milestones,
                    lifecycle stage transitions
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      SHARED DATA         │
                    │  fellows, ventures,      │
                    │  pods, responses,        │
                    │  asset_completion,       │
                    │  stipend_milestones,     │
                    │  kpi_metrics             │
                    └────────┬──────────────────┘
                             │
            READS: next step guidance,      READS: quality gaps,
            stipend status, framework,      venture maturity,
            pod context, progress           cohort patterns
                             │                      │
                             ▼                      ▼
              ┌──────────────────┐    ┌──────────────────┐
              │    FELLOWS       │    │    AI LAYER       │
              │  Daily Building  │    │  Review & Teach   │
              │  Assets, Upload, │    │  Investor Lens,   │
              │  Iterate, Export │    │  Customer Lens    │
              └──────────────────┘    └──────────────────┘
```

The studio team's operational decisions (which pods to pursue, which fellows to source, what framework content to emphasise) flow downstream into the fellow experience. The fellow's daily work (asset completion, response quality, velocity) flows upstream into the studio team's KPIs and diagnostic views. The AI layer sits across both, identifying quality gaps before humans need to.

### The core problem

Before The Co-Builder, the studio's venture-building process lived across Slack conversations, Google Drive folders, and a standalone React dashboard prototype. There were three interrelated failures:

**For the studio team:** No unified view of programme health. KPIs were tracked in a separate app (localStorage-based), fellow lifecycle data lived in spreadsheets, pod strategy lived in documents, and the recruitment pipeline lived in Ashby with no connection back to venture outcomes. The team couldn't answer: "Are we on track for Year 1 targets, and which fellows need the most attention right now?"

**For fellows:** No clear path from day one. Fellows — many of them domain experts, not experienced builders — didn't know what good looked like, what order to work in, or how to turn their expertise into the rigorous logic that investors and customers demand. No daily diagnostic that says "here's your next highest-leverage move."

**For the programme:** No feedback loop. The studio team's investment thesis (pods) was disconnected from fellow progress. There was no way to see whether a pod's sourcing strategy was producing quality ventures, or whether the framework itself needed adjustment based on where fellows got stuck.

### How The Co-Builder solves it

**One platform, three perspectives, shared data:**

- **Studio Team** sees programme health: KPIs trending against Year 1 targets, pod investment theses with assigned fellows and their progress, the recruitment pipeline feeding future fellows, and diagnostic views that surface which ventures need attention
- **Fellows** see their daily workspace: what to work on next (highest-leverage action), their progress through 27 assets toward spin-out, stipend status, and the tools/resources they need to build at pace
- **The AI Layer** (Phase 3+) reviews quality across all ventures: flagging weak reasoning, suggesting improvements, evaluating from investor and customer lenses

The framework is fixed — 27 assets across 7 stages — but the **requirements within each asset adapt** to the venture's context. The same rigorous methodology, tailored to each venture's reality by the studio team.

It must be a **toothbrush product** — something fellows open every single day, instinctively. If it's not the first tab they reach for each morning, the product isn't working hard enough. Every session ends with a reason to come back tomorrow.

---

## 2. Users & Data Ownership

### 2.1 Studio Team (Strategic & Operational)

The studio team runs Utopia Studio's venture-building programme. They operate across three modes, each with a dedicated interface:

#### Studio View (`/studio`) — Programme Operations

The strategic command centre. The studio team tracks whether the programme is meeting its Year 1 targets and manages the investment thesis structure.

**Owns and writes:**
- **KPI Metrics** — 7+ Year 1 targets (equity acquired, ventures spun out, fellows hired, etc.) with current values, targets, and pipeline notes
- **Investment Pods** — Themed investment clusters (e.g., "Climate Tech", "HealthTech") with thesis, market gap, target archetype, corporate partners, co-investors, and sourcing strategy
- **Pod Launch Playbooks** — Operational setup for pod launches with pre-launch planning, sprint models, deal timelines, role KPIs, and implementation timelines
- **Recruitment Pipeline** — Role-by-role funnel tracking (leads → review → screening → interview → offer → hired) for Ashby-sourced candidates

**Reads from fellows:**
- Fellow assignments to pods (which fellows are in which investment thesis)
- Fellow ratings (global potential, Qatar impact) and equity allocation
- Aggregate venture progress across pods (future: auto-calculated from asset completion)

#### Admin View (`/admin`) — Fellow Lifecycle Management

The operational dashboard. The studio team manages individual fellows through their entire lifecycle.

**Owns and writes:**
- **Fellow lifecycle stage** — SOURCED → ONBOARDING → BUILDING → SPIN-OUT → GRADUATED
- **Onboarding progress** — Admin-controlled steps (agreement signed, KYC verified) + visibility into fellow-controlled steps (toolstack setup, compute budget acknowledged)
- **Experience profiles** — First-time builder / experienced founder / corporate innovator (drives guidance level)
- **Stipend milestones** — Global milestone definitions ($2,500 × 2) + per-fellow payment tracking (milestone met date, payment released date)
- **Framework content** — Asset titles, questions, checklists, guidance text (editable without code changes)
- **Asset requirements** — Global defaults + per-venture overrides (required/optional toggles)
- **Fellow details** — Domain, background, selection rationale (imported from Ashby)

**Reads from fellows:**
- Venture creation status, asset completion progress, response quality
- Onboarding step completion (self-tracked items)

**Reads from studio:**
- Pod assignments (which pod this fellow belongs to)

#### The Studio Team's Core Needs

1. **"Is the programme on track?"** — KPI scoreboard showing Year 1 targets vs. actuals, with pipeline notes explaining the gap
2. **"Which fellows need attention?"** — Diagnostic view that surfaces stuck ventures, incomplete onboarding, and quality concerns
3. **"Is the framework working?"** — Cohort-level patterns showing where fellows get stuck and whether the methodology needs adjustment
4. **"Are the pods producing?"** — Per-pod view of assigned fellows, their venture progress, and whether the investment thesis is translating into quality ventures
5. **"Who's coming next?"** — Pipeline visibility showing the recruitment funnel feeding future cohorts

### 2.2 Fellows (Venture Builders)

Fellows are domain and industry experts building ventures through the 27-asset Co-Build framework. They see one interface: the fellow dashboard.

#### Fellow View (`/dashboard`, `/onboarding`, `/venture/*`, `/tools`, `/profile`)

The daily workspace. Everything a fellow needs to build their venture at pace.

**Owns and writes:**
- **Venture data** — Name, description, industry, Google Drive URL
- **Asset responses** — Answers to guided questions across 27 assets
- **Asset completion** — Toggle per asset (self-reported, subject to studio team review)
- **File uploads** — Documents, images, data attached to specific assets
- **Onboarding steps** — Self-tracked items (toolstack setup, compute budget acknowledged, browser setup, framework introduction)
- **Profile** — Bio, LinkedIn URL, avatar

**Reads from studio team:**
- **Next step guidance** — "Start Asset #X" based on completion status and prerequisites
- **Stipend status** — Which milestones are met, which payments are released
- **Framework content** — The questions, checklists, and guidance for each asset
- **Lifecycle stage** — Where they are in the journey (onboarding → building → spin-out)
- **Experience profile** — Drives the level of guidance shown throughout

**Does NOT see:**
- Other fellows' ventures or progress
- KPIs, pod strategy, or pipeline data
- Studio team's internal notes or ratings

#### The Fellow's Core Needs

1. **"What should I work on right now?"** — Daily diagnosis of the next highest-leverage action. Not just "Asset #3 is next" but "Asset #3 matters because it builds the evidence base for your pricing model in Asset #19"
2. **"Where am I on the journey?"** — Clear progress from onboarding through 27 assets to spin-out. Not just percentages but context: "You're in Stage 01 — building the problem evidence that makes investors take notice"
3. **"What does good look like?"** — Guided questions that provoke first-principles thinking, not compliance. The framework teaches the method as fellows use it
4. **"Is this going somewhere real?"** — Every asset connects to real customer outcomes and real investor conversations. The tool should feel like it's building a company, not filling forms
5. **"What's my financial status?"** — Stipend milestones, compute budget, and what triggers the next payment

### 2.5 The AI Layer (Phase 3+)

The Co-Builder itself acts as an always-available intelligence layer that operates across both perspectives:

**For fellows:**
- Teaches concepts and what "good" looks like, adapted to experience level
- Reviews responses and suggests improvements before studio team review
- Pre-fills or suggests answers based on other completed assets

**For studio team:**
- Reviews from an investor lens: "Would you fund this based on this evidence?"
- Reviews from a customer lens: "Would a customer pay for this?"
- Identifies quality gaps before the studio team needs to
- Surfaces cohort patterns: where fellows get stuck, which assets need better guidance

**Cross-cutting:**
- Quality scoring per asset (completeness, depth, consistency)
- Learns from patterns across all ventures to improve over time

### 2.4 Stakeholders (Read-Only Portfolio View)

External investors, partners, and domain experts who need visibility into the fellow portfolio without access to internal operations or individual venture details.

#### Stakeholder View (`/portfolio`)

A public-facing portfolio showcasing fellows and their progress.

**Reads from fellows:**
- Fellow profiles (name, bio, domain, LinkedIn)
- Lifecycle stage (onboarding, building, spin-out, graduated)
- Venture count per fellow
- Avatar images

**Does NOT see:**
- Email addresses or internal ratings
- Individual venture details or asset responses
- KPIs, pod strategy, or pipeline data
- Admin controls or studio team notes

**Access:**
- Stakeholders are created by admin (role set to "stakeholder" in Admin → Fellows)
- Login redirects to `/portfolio` automatically
- Read-only access enforced at route level

---

## 3. The Co-Build Framework

### 3.1 Structure

The framework consists of **7 stages** containing **27 assets** total:

| Stage | Name | Assets | Purpose |
|-------|------|--------|---------|
| 00 | The Invention Gate | #1-2 | Validate the risk-capital thesis and category ambition from first principles |
| 01 | Problem Deep Dive | #3-8 | Bottoms-up problem quantification with economic evidence, not assumptions |
| 02 | Solution Architecture | #9-14 | Design a genuinely defensible invention and competitive positioning |
| 03 | Market Validation | #15-18 | Prove demand through real customer evidence — the richest possible PRD |
| 04 | Business Engine | #19-22 | Build pricing, unit economics, and go-to-market — the path to cash-generating business |
| 05 | Investment Readiness | #23-25 | Package the venture to be investable with institutional-grade materials |
| 06 | Growth Architecture | #26-27 | Strategic options — scaling systems, exit strategies, and novel growth plays |

### 3.2 Asset Anatomy

Each asset has:
- **Title** — What it is
- **Purpose** — Why it matters
- **Core Question** — The one question the asset must definitively answer
- **Checklist** — Concrete deliverables that constitute completion
- **Guided Questions** — Step-by-step workflow that produces the asset (structured as multi-step forms)
- **Key Inputs** — What's needed before starting
- **Outputs** — What this asset feeds into downstream

### 3.3 Custom Requirements

The framework is fixed (27 assets, always) but the **requirements within each asset are customisable**:

- **Global defaults** — Every asset has a default set of requirements and checklist items
- **Per-venture overrides** — The studio team can adjust what's required for a specific venture based on industry, maturity, and context
- **Future: AI-suggested** — Eventually the AI layer will propose custom requirements based on venture context, but the studio team always has final say

### 3.4 Stage Gates

Each stage has a gate — a decision point where the studio team assesses whether the venture has earned the right to advance. This is a **human judgement call**, not an automated checkpoint:

- The studio team reviews the quality and rigour of completed assets, not just whether checkboxes are ticked
- Asset completion is a signal, but a poorly-reasoned "complete" asset can (and should) block advancement
- Gates are the primary mechanism for ensuring the "logic over completion" principle

### 3.5 Framework Evolution

The 27-asset framework is still evolving. The tool must support this:
- The studio team can modify asset content (questions, checklists, guidance) without code changes
- Ventures that started under a previous version should not break when the framework updates
- Changes should be versioned so the team can see what changed and why

---

## 4. Fellow Lifecycle

### 4.1 Lifecycle Stages

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SOURCED   │───→│  ONBOARDING │───→│  BUILDING   │───→│  SPIN-OUT   │───→│  GRADUATED  │
│  (Pipeline) │    │ (Co-Builder)│    │ (Co-Builder)│    │ (Co-Builder)│    │ (Completed) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     ▲                                       │                                      │
     │                                       ▼                                      ▼
  Studio:                              Studio: KPIs                          Studio: KPIs
  Pipeline                             update as                             track spin-outs
  tracks                               ventures                              & graduations
  candidates                           progress
```

**Sourced** → Candidate identified via Ashby. Pipeline page (`/studio/pipeline`) tracks the recruitment funnel. When hired, their profile data is imported into Co-Builder and they're assigned to a pod.

**Onboarding** → Fellow completes pre-build requirements:
- Participation agreement (signed externally, admin tracks status)
- KYC/identity verification (completed externally, admin tracks)
- Experience profile (set by studio team)
- Toolstack setup (guided in-app: Claude, Git, markdown)
- Compute budget orientation ($4,000 allocation guidance)
- Framework introduction (7 stages, 27 assets overview)
- Browser setup (Chrome toolbar shortcut)
- Venture creation (name, description, industry, Google Drive URL)

**Building** → Daily work through 27 assets. Studio team co-builds alongside fellows, challenges thinking, manages stipends. The fellow dashboard shows "what to work on next" — the highest-leverage action at any moment. KPI metrics update as ventures advance through stages.

**Spin-Out** → Framework substantially complete, studio team approves. Data room compiled from completed assets + additional materials (financial model, cap table, etc.).

**Graduated** → Venture has spun out. Fellow record becomes read-only archive. KPIs track successful spin-outs.

### 4.2 Onboarding Checklist

| Step | Owner | Description |
|------|-------|-------------|
| **Profile import** | Admin | Fellow's data imported — name, email, background, domain, selection rationale |
| **Participation agreement** | Admin-tracked | Signed externally (DocuSign). Admin marks "signed" with date. |
| **KYC / Identity** | Admin-tracked | Completed externally. Admin marks "verified" with date. |
| **Experience profile** | Admin-set | First-time builder / experienced founder / corporate innovator |
| **Toolstack setup** | Fellow | Guided setup: Claude, Git/GitHub, markdown workflow. Each tool has link + checkbox. |
| **Compute budget** | Fellow | $4,000 allocation guidance. Fellow acknowledges. |
| **Framework introduction** | Fellow | 7 stages, 27 assets overview. Fellow marks "understood." |
| **Browser setup** | Fellow | Chrome toolbar shortcut guide. Fellow marks "done." |
| **Venture creation** | Fellow | Creates venture with name, description, industry, Google Drive URL. |

### 4.3 Stipend & Compute Budget

**Cash stipend: $2,500 × 2**
- Fixed for all fellows
- Paid at admin-defined milestones (studio team sets triggers)
- Studio team marks milestones as met and payments as released
- Fellow dashboard shows stipend status

**Compute budget: $4,000**
- Recommended allocation (Claude Max ~$1,200, hosting ~$600, APIs ~$800, design ~$400, flexible ~$1,000)
- Guidance during onboarding, not enforced
- Studio team can customise recommended stack per cohort

### 4.4 Spin-Out & Data Room

**Auto-generated from Co-Builder:**
- 27 assets exported as structured markdown
- Executive summary from key assets (#1, #2, #12, #23, #24)
- Progress and review history

**Tracked manually (studio team defines requirements):**
- Financial model, capital plan, equity table, incorporation docs, IP assignments

---

## 5. System Architecture

### 5.1 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 | App shell, routing, SSR/CSR |
| Styling | Tailwind CSS 4 + Studio OS tokens | Design system (terracotta, TWK Lausanne, 2px radius) |
| Auth | Supabase Auth | Email/password login, session management |
| Database | Supabase Postgres + Drizzle ORM | Structured data storage |
| Storage | Supabase Storage | File uploads (venture-assets bucket) |
| Hosting | Vercel | Serverless deployment, edge network |

### 5.2 Data Model — Unified

The data model reflects the three-user architecture. Every table has a clear **owner** (who writes) and **readers** (who consumes):

```
STUDIO TEAM OWNED:
  pods ──────────────────────── Investment thesis clusters
    → READ BY: Admin (fellow assignment), Studio (pod directory)
  pod_launches ───────────────── Pod launch playbooks (v2: pre-launch, sprints, deal timelines, role KPIs, operational rhythm, implementation timeline)
    → READ BY: Studio team only
  kpi_metrics ────────────────── Year 1 programme targets
    → READ BY: Studio team only
  kpi_history ────────────────── Monthly KPI snapshots
    → READ BY: Studio team only
  ashby_pipeline ─────────────── Recruitment funnel per role
    → READ BY: Studio team only

ADMIN (STUDIO TEAM) OWNED:
  fellows ────────────────────── User profiles + lifecycle state
    ├── lifecycle_stage          (admin writes, fellow reads)
    ├── experience_profile       (admin writes, fellow reads implicitly)
    ├── role                     (admin writes: fellow/admin/studio/stakeholder)
    ├── onboarding_status        (admin + fellow write, both read)
    ├── pod_id → pods            (admin writes, studio reads)
    ├── equity_percentage        (admin writes, studio reads)
    ├── global_potential_rating  (admin writes, studio reads)
    └── qatar_impact_rating      (admin writes, studio reads)
  stipend_milestones ─────────── Payment tracking
    → WRITE: Admin (define, mark met/released)
    → READ: Fellow (status), Admin (management), Studio (aggregate)
  asset_requirements ─────────── Required/optional toggles
    → WRITE: Admin only
    → READ: Fellow (framework rendering)

FELLOW OWNED:
  ventures ───────────────────── Startup projects
    → READ BY: Admin (fellow detail), Studio (pod progress — future)
  responses ──────────────────── Asset question answers
    → READ BY: Admin (fellow detail), AI layer (review — future)
  asset_completion ───────────── Per-asset completion status
    → READ BY: Admin (progress view), Studio (KPI calculations — future)
  uploads ────────────────────── File attachments
    → READ BY: Admin (fellow detail)

FUTURE:
  tasks ──────────────────────── Slack action items (Phase 4)
  slack_channel_ventures ─────── Channel mapping (Phase 4)

NOTE: Stakeholders access fellow portfolio data via public API endpoint (`/api/fellows/portfolio`) which aggregates public-safe fields from `fellows` and `ventures` tables.
```

### 5.3 Route Architecture — Three Experiences

```
(auth)/           — Login with role-based routing (Fellow / Admin / Studio / Stakeholder)
(app)/            — FELLOW EXPERIENCE
  ├── dashboard/    → Daily workspace: next step, progress, stipends, ventures
  ├── onboarding/   → Guided setup flow (9 steps)
  ├── venture/      → Venture management + 27-asset workflows
  ├── tools/        → Co-Build tool resources (Claude, Cursor, Git)
  └── profile/      → Personal settings
(admin)/          — ADMIN EXPERIENCE (Studio Team)
  ├── admin/        → Overview dashboard with fellow stats + stipend summary
  ├── fellows/      → Fellow list + individual management
  ├── framework/    → 27-asset content editor
  ├── stipends/     → Milestone configuration + payment tracking
  └── settings/     → Asset requirement toggles
(studio)/         — STUDIO EXPERIENCE (Studio Team)
  ├── studio/       → KPI Scoreboard (Year 1 targets)
  ├── pods/         → Investment pod directory + detail views
  ├── pipeline/     → Recruitment funnel (Ashby data)
  ├── pod-launch/   → Pod launch playbook management
  └── wiki/         → Platform documentation and architecture guide
(stakeholder)/    — STAKEHOLDER EXPERIENCE
  └── portfolio/    → Read-only fellow portfolio view
api/              — Webhooks (Slack integration — future)
  └── fellows/portfolio → Public API for fellow portfolio data
```

**Navigation flow between experiences:**
- Login → Fellow View (default) | Admin View | Studio View | Stakeholder View
- Admin sidebar → bottom link to "Fellow View" and "Studio View"
- Studio sidebar → bottom link to "Admin View" and "Fellow View"
- Fellow sidebar → no cross-links (fellows don't see admin/studio/stakeholder)
- Stakeholder → single portfolio view, no cross-links

### 5.4 Data Interconnections

These are the critical data flows that make the three experiences a unified product:

| From | To | Data | How |
|------|-----|------|-----|
| Studio → Admin | Pod assignments | `fellows.pod_id` references `pods.id` — admin assigns fellows to pods, studio sees them in pod directory |
| Admin → Fellow | Lifecycle stage | `fellows.lifecycle_stage` — admin sets stage, fellow dashboard redirects based on it (onboarding → building) |
| Admin → Fellow | Stipend status | `stipend_milestones` — admin marks met/released, fellow reads status on dashboard |
| Admin → Fellow | Framework content | Framework editor outputs questions/checklists that fellows see in asset workflows |
| Admin → Fellow | Onboarding progress | Admin marks agreement/KYC, fellow sees progress bar advance |
| Fellow → Admin | Venture progress | `ventures` + `asset_completion` — admin sees completion % on fellow detail page |
| Fellow → Admin | Responses | `responses` — admin can view what fellows have written for each asset |
| Fellow → Studio (future) | KPI impact | Venture spin-outs count toward KPI targets; asset velocity informs programme health |
| Pipeline → Fellow (future) | Sourcing | Ashby pipeline hired → fellow created in system |
| Fellow → Stakeholder | Portfolio visibility | Public API exposes fellow profiles and progress (no sensitive data) |
| Studio → Stakeholder | Portfolio updates | Pod launch progress and fellow assignments visible in portfolio context |

### 5.5 Ecosystem Position

```
Ashby         ──→  Recruitment data → Pipeline page → Fellow creation (future: API integration)
DocuSign etc. ──→  Agreement signing (status tracked by admin in Co-Builder)
Google Drive  ←──→ Artefact storage (linked per venture) + data room documents
Slack         ──→  Action items captured into tasks (Phase 4)
Claude        ←──  Fellows use as AI co-pilot (set up during onboarding)
Git/GitHub    ←──  Fellows use for code/markdown (set up during onboarding)
IC / Spin-Out ←──  Data room exported for investment committee review
```

---

## 6. What's Built Today (v1.1)

### 6.1 Fellow Experience ✅
- [x] Email/password authentication with role-based login (Fellow / Admin / Studio / Stakeholder)
- [x] Dashboard with "what to work on next" (enhanced diagnosis system with critical actions, pathway visualization, velocity tracking)
- [x] Stipend status display (milestone progress + payment dates)
- [x] Venture creation with name, description, industry, Google Drive URL
- [x] 27-asset workflow system with guided questions
- [x] Multiple question types: text, textarea, select, multiselect, number, URL, file upload, table, checklist, rating, date
- [x] Auto-save with 1.5s debounce + blur save
- [x] Per-asset completion toggle
- [x] Step-based navigation within each asset
- [x] Asset-to-asset navigation
- [x] Stage-level progress tracking + overall venture progress bar
- [x] File uploads to Supabase Storage
- [x] Google Drive integration — save asset responses as markdown files to linked Drive folder
- [x] User profile page
- [x] Onboarding flow (9 steps: agreement, KYC, toolstack, compute budget, framework intro, browser setup, venture creation)
- [x] Co-Build Tools page (Claude, Cursor, Git resources with test projects)

### 6.2 Admin Experience ✅
- [x] Overview dashboard with fellow stats + lifecycle stage breakdown + stipend summary
- [x] Fellows list with lifecycle stage filter tabs
- [x] Fellow detail view: lifecycle controls, experience profile, onboarding progress, venture list
- [x] Admin-controlled onboarding steps (agreement signed, KYC verified)
- [x] Stipend management: global milestone config + per-fellow payment tracking
- [x] Framework editor: edit titles, questions, checklists per asset (localStorage + JSON export)
- [x] Asset requirement toggles (global defaults — required/optional per asset)
- [x] Cross-links: switch to Fellow View and Studio View

### 6.3 Studio Experience ✅
- [x] KPI Scoreboard: 7 Year 1 metrics with targets, current values, progress bars, pipeline notes
- [x] Inline KPI editing (current value + pipeline notes)
- [x] Pod directory: investment thesis cards with fellow counts
- [x] Pod detail: thesis, market gap, clusters, partners, assigned fellows with ratings
- [x] Pod Launch Playbook: operational setup with pre-launch, sprints, deal timelines, role KPIs, operational rhythm, implementation timeline
- [x] Recruitment pipeline: role-by-role funnel (leads → hired) with inline editing
- [x] Wiki page: platform documentation, architecture guide, and improvement roadmap
- [x] Cross-links: switch to Admin View and Fellow View

### 6.4 Stakeholder Experience ✅
- [x] Read-only portfolio view (`/portfolio`) showing fellows and their progress
- [x] Public API endpoint (`/api/fellows/portfolio`) for fellow portfolio data
- [x] Role-based access control (stakeholder role enforced at route level)
- [x] Public-safe data exposure (no emails, internal ratings, or venture details)

### 6.5 Architecture ✅
- [x] Shared `SidebarLayout` component (4 route groups: app, admin, studio, stakeholder)
- [x] UI primitives library (GlassCard, ProgressBar, SectionHeader)
- [x] Component extraction (auth styles, tools components, landing hero)
- [x] Type definitions (`src/types/`) and data separation (`src/data/`)
- [x] Studio OS design system throughout (terracotta, TWK Lausanne, 2px radius, dark sidebar)
- [x] 14+ database tables with clear ownership model (including `pod_launches`)
- [x] Supabase RLS with `SECURITY DEFINER` function (no infinite recursion)
- [x] Server actions for all CRUD (admin, studio, fellow, onboarding, stipends, responses, ventures, pod launches)
- [x] Diagnosis system: critical actions, pathway visualization, velocity tracking, spin-out estimation
- [x] Google Drive integration: save asset responses as markdown files

---

## 7. Feature Roadmap

### Phase 1: Fellow Toothbrush Product + Studio Operations (Current → MVP Friday 2026-02-14)

**Goal:** A fellow can sign up, complete onboarding, and immediately know what to work on every day. The studio team can manage the programme from sourcing through to venture tracking, all in one platform.

#### Friday MVP Cut — What Ships

| Feature | User | Status |
|---------|------|--------|
| Fellow onboarding flow (9 steps) | Fellow | ✅ Built |
| Dashboard with "work on next" guidance | Fellow | ✅ Built |
| Stipend status on fellow dashboard | Fellow | ✅ Built |
| 27-asset workflows | Fellow | ✅ Built |
| Co-Build Tools page | Fellow | ✅ Built |
| Admin fellow lifecycle management | Studio Team | ✅ Built |
| Admin stipend configuration + tracking | Studio Team | ✅ Built |
| Admin framework editor | Studio Team | ✅ Built |
| KPI Scoreboard | Studio Team | ✅ Built |
| Pod directory + detail | Studio Team | ✅ Built |
| Recruitment pipeline | Studio Team | ✅ Built |
| 3-way login (Fellow / Admin / Studio) | All | ✅ Built |

#### Phase 1 Completed (Post-Friday MVP)

| Feature | User | Status | Description |
|---------|------|--------|-------------|
| **Enhanced "next step" logic** | Fellow | ✅ COMPLETE | Diagnosis system implemented: critical actions with priorities, pathway visualization, velocity tracking, blockers identification, and spin-out estimation. Considers prerequisites and asset requirements. Provides actionable guidance beyond "first incomplete asset." |
| **Google Drive integration** | Fellow | ✅ COMPLETE | Asset responses can be saved as markdown files to linked Google Drive folders. Enables partial markdown export capability. |
| **Stakeholder portfolio** | Stakeholder | ✅ COMPLETE | Read-only portfolio view with public API endpoint. Stakeholders can view fellow profiles and progress without accessing sensitive data. |
| **Pod Launch Playbook v2** | Studio Team | ✅ COMPLETE | Enhanced pod launch features with pre-launch planning, sprint models, deal timelines, role KPIs, operational rhythm, and implementation timeline. |
| **Wiki documentation** | Studio Team | ✅ COMPLETE | Platform documentation page (`/studio/wiki`) covering architecture, data model, framework, lifecycle, and improvement roadmap. |

#### Phase 1 Remaining (Post-Friday)

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **Onboarding → building auto-transition** | Both | HIGH | When fellow completes onboarding and creates venture, auto-advance lifecycle stage. Currently requires admin manual update. |
| **Agreement/KYC status tracking** | Studio Team | MEDIUM | Date fields for when signed/verified, not just boolean toggles |
| **Framework editor → DB persistence** | Studio Team | MEDIUM | Currently localStorage + JSON export. Persist to database so edits are shared across the studio team. |
| **Experience profile → guidance adaptation** | Fellow | MEDIUM | The experience profile field exists but doesn't yet drive different guidance levels in the asset workflows |
| **Google Drive sync** | Fellow | ✅ COMPLETE | Asset responses can be saved as markdown files to linked Google Drive folders. |
| **Stakeholder portfolio** | Stakeholder | ✅ COMPLETE | Read-only portfolio view with public API endpoint. |

#### Friday MVP Deferred (Correct)

| Feature | Reason |
|---------|--------|
| Full Ashby import/API | Use manual fellow creation for now |
| Framework versioning + change notifications | Editor works, versioning is Phase 2 |
| Stage gate review UI | Studio team approves informally for now |
| Quality-aware "what to work on next" | Needs AI layer (Phase 3) |
| Auto-calculated KPIs from venture data | KPIs manually entered for now |

### Phase 2: Review Workflows + Data Interconnection (Weeks 3-6)

**Goal:** Build the human review loop and start connecting studio data to fellow outcomes.

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **Asset comments/feedback** | Both | HIGH | Studio team leaves inline comments on specific answers. Fellows get notified and respond. Creates coaching conversation within each asset. |
| **Review status per asset** | Both | HIGH | Draft → submitted → reviewed → approved. Studio team requests revisions with notes. |
| **Stage gate review UI** | Studio Team | HIGH | Formal approve/reject per stage gate. Fellows see review status. |
| **Custom requirements per venture** | Studio Team | HIGH | Per-venture asset requirement overrides from admin UI. Builds on existing `asset_requirements` table. |
| **KPI auto-calculation** | Studio Team | MEDIUM | KPIs auto-update from venture data: ventures created, assets completed, fellows in each lifecycle stage. Pipeline hires count toward "fellows hired" KPI. |
| **Pod → venture progress** | Studio Team | MEDIUM | Pod detail page shows aggregate asset completion for assigned fellows' ventures. Studio team sees which pods are producing quality work. |
| **Markdown export** | Fellow | ✅ PARTIAL | Google Drive integration allows saving individual asset responses as markdown. Full venture export (all assets) still pending. |
| **Dashboard improvements** | Fellow | MEDIUM | Better venture cards, recent activity feed, progress visualisation. |
| **Framework versioning** | Studio Team | MEDIUM | Framework editor stores version history. Notify fellows when assets update. |

### Phase 3: Intelligence Layer (Weeks 6-10)

**Goal:** AI reviews quality at scale, across both fellow and studio team perspectives.

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **AI answer review** | Both | HIGH | AI reviews responses, suggests improvements, flags weak answers before studio team review. |
| **Investor lens** | Studio Team | HIGH | AI evaluates assets from investor perspective. Surfaces ventures that aren't reaching investable quality. |
| **Customer lens** | Fellow | MEDIUM | AI evaluates problem/solution fit from customer perspective. |
| **Smart suggestions** | Fellow | MEDIUM | AI pre-fills based on other completed assets. |
| **Quality scoring** | Both | MEDIUM | Per-asset quality score (completeness, depth, consistency). Feeds into "what to work on next" — prioritise improving low-quality assets over starting new ones. |
| **Cohort patterns** | Studio Team | MEDIUM | AI identifies where fellows get stuck collectively. Informs framework evolution. |

### Phase 4: Ecosystem Integration (Weeks 10-14)

**Goal:** Connect The Co-Builder to Slack, Google Drive, and the recruitment pipeline.

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **Slack integration** | Both | HIGH | Push action items from Slack into venture tasks. AI classifies against 27 assets. |
| **Pipeline → fellow creation** | Studio Team | HIGH | When a pipeline candidate is marked "hired", auto-create their fellow record with imported data. |
| **Google Drive sync** | Fellow | MEDIUM | Auto-detect new documents in linked Drive folders. Suggest which asset they relate to. |
| **Pitch deck generator** | Fellow | MEDIUM | Auto-generate pitch deck sections from completed assets. |
| **Cohort analytics** | Studio Team | LOW | Aggregated cohort progress, common bottlenecks, benchmark comparisons. |

### Phase 5: Spin-Out Readiness (Weeks 14-18)

**Goal:** Complete the lifecycle from framework to investment-ready data room.

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **Data room builder** | Both | HIGH | Auto-generate from completed assets. Studio team defines additional requirements. Track completion. |
| **Spin-out checklist** | Both | HIGH | Admin-configurable. Progress visible to both fellow and studio team. |
| **Full markdown export** | Fellow | HIGH | All assets exported with guidance on converting to decks and AI inputs. |
| **Notification strategy** | Both | MEDIUM | Email, in-app, Slack notifications for comments, reviews, gate decisions, stipend releases. |

### Phase 6: Scale & Maturity (Weeks 18+)

| Feature | User | Priority | Description |
|---------|------|----------|-------------|
| **Multi-cohort support** | Studio Team | HIGH | Separate cohorts with timelines. KPIs track per-cohort. |
| **Ashby API integration** | Studio Team | HIGH | Direct API replaces manual pipeline data. Auto-import on "Accepted." |
| **Template ventures** | Fellow | MEDIUM | Pre-filled examples showing what "great" looks like. |
| **Learning system** | Studio Team | MEDIUM | Aggregate insights: "What patterns do successful Stage 03 ventures share?" |
| **KPI trend charts** | Studio Team | MEDIUM | `kpi_history` table enables month-over-month visualisation. |

---

## 8. Design Principles

### North Star
> Every feature, every decision, every line of code should serve one outcome: **ensuring ventures move forward with solid logic foundations to get to customer paid engagements.**

### Principles

1. **Logic over completion** — A well-reasoned Asset #3 is worth more than a hastily completed Stage 01. Every feature pushes toward deeper, more defensible thinking.

2. **Three users, one product** — Studio team, fellows, and AI are not separate products. Every feature considers how data flows between them. A fellow completing an asset updates the studio team's view. A studio team editing the framework changes what the fellow sees tomorrow.

3. **Toothbrush product** — Fellows open it daily, instinctively. Every session ends with a reason to come back tomorrow — a next step, a pending review, a studio team challenge.

4. **Augmented co-founder, not a form** — Guided questions provoke thinking, not compliance. If it feels like paperwork, we've failed.

5. **Show the journey, not just status** — Not "40% done" but "here's what's weak and what needs to happen before you're investable." For studio team: not "5 fellows active" but "3 ventures advancing well, 2 need attention on Stage 01."

6. **Diagnosis over dashboard** — The studio team doesn't need more charts. They need answers: "Which fellow needs help right now?" "Is Pod #3's thesis producing quality ventures?" "Are we on track for Year 1?"

7. **Central hub, not another tab** — Connect to Google Drive, Slack, Ashby. Don't replace them.

8. **Evolve with the programme** — Framework editor makes it easy to update methodology. KPI targets adjust as the programme matures. Pod strategy evolves with market learning.

9. **Daily use, both sides** — The studio team should open the KPI scoreboard daily to update pipeline notes. Fellows should open the dashboard daily to see their next action. If either side goes stale, the product isn't sticky enough.

---

## 9. Success Metrics

### Primary: Quality of Venture Outputs
_"Do the assets produced give this fellow the logic foundations to build a world-beating product and an investable company?"_

Measured by:
- **Studio team review scores** per asset (Phase 2)
- **AI quality scores** against investor and customer lenses (Phase 3)
- **Downstream conversion** — ventures that raise funding, acquire paying customers, or achieve category positioning

### Programme Health (Studio Team)
- **KPI target tracking** — Are Year 1 targets being met? Which are ahead/behind?
- **Pipeline conversion** — What % of sourced candidates become active fellows?
- **Pod performance** — Which investment theses produce the strongest ventures?
- **Time-to-quality** — How quickly do ventures reach "review-ready" quality?

### Fellow Engagement
- **Daily active usage** — Is The Co-Builder the toothbrush product?
- **Time-to-first-asset** — How quickly do fellows complete onboarding and start Asset #1?
- **Framework adherence** — % of ventures completing all required assets per stage before advancing
- **Fellow confidence** — Do fellows feel more capable after using the tool?

### Interconnection Health
- **Data freshness** — Are KPIs updated weekly? Are pipeline numbers current?
- **Bidirectional flow** — When a fellow completes an asset, does it surface in the admin view immediately?
- **Cross-view navigation** — Do studio team members use all three views (Studio, Admin, Fellow) regularly?

---

## 10. Technical Decisions & Constraints

### Why Supabase + Drizzle (not Prisma, not raw SQL)
- Supabase provides auth, DB, storage, and realtime in one platform
- Drizzle ORM gives type-safe queries with minimal abstraction
- The Proxy pattern handles Vercel serverless cold starts

### Why Server Actions + Client Components (not RSC-heavy)
- Most pages need real-time state (auto-save, progress updates, inline editing)
- Server actions provide type-safe RPC without manual API routes
- Admin/studio pages use client-side role checks (not middleware) to avoid DB queries in Edge runtime

### Why No Middleware Auth
- Edge middleware can't query Postgres directly
- Supabase session cookies validated on client side per-route-group
- Admin role checks in layout.tsx (client-side redirect)

### Why Three Route Groups (not one admin panel)
- Studio (`/studio`) = strategic/operational (KPIs, pods, pipeline) — for programme-level decisions
- Admin (`/admin`) = lifecycle management (fellows, stipends, framework) — for per-fellow decisions
- Fellow (`/app`) = daily building (dashboard, ventures, assets) — for individual work
- Same underlying auth (admin role), but different mental models and data density. Combining them would create cognitive overload.

### Why Studio OS Design (not Material/Tailwind UI)
- Studio OS tokens: terracotta #CC5536, TWK Lausanne, 2px borders, dark sidebar, no shadows
- Consistency across all Utopia Studio touchpoints
- All three experiences share the same visual language

---

## 11. Decisions Register

### Previously Resolved
- ✅ **Custom requirements**: Studio team sets manually per venture (future: AI suggests)
- ✅ **Framework stability**: Still evolving — admin framework editor is Phase 1 priority
- ✅ **Primary user**: Both fellows and studio team equally — collaborative by default
- ✅ **AI priority**: Phase 3 — get human review workflow right first
- ✅ **Studio OS integration**: Unified platform, not separate app (resolved 2026-02-11)

### Resolved in Review (2026-02-11)

1. **Stage gate criteria** — Studio team approval only. Asset completion is a signal, not a hard gate.

2. **Notification strategy** — All three channels: email, in-app, Slack. Configurable per fellow. Phase 5 feature, data model designed from Phase 2.

3. **Multi-venture support** — One venture per fellow. Data model supports multiple but UI emphasises the active venture.

4. **Data privacy** — Private by default, opt-in sharing. Each venture visible only to fellow + studio team.

5. **Framework versioning** — Notify and suggest. Existing answers preserved when framework updates. Phase 2 feature.

6. **Onboarding adaptation** — Studio team sets experience profile. Drives guidance level throughout.

7. **Fellow-to-fellow benchmarks** — Not yet. Revisit at 20+ ventures.

8. **Export format** — Markdown files with toolchain guidance.

### Fellow Lifecycle Decisions (2026-02-11)

9. **Ashby handoff** — Export, not live integration (Phase 6 for API).

10. **Stipend structure** — Fixed: $2,500 × 2 cash + $4,000 compute. Admin-defined milestone triggers.

11. **Compute budget model** — Recommended stack with links, not enforced.

12. **Participation agreements** — Sign externally, track in Co-Builder.

13. **Payment triggers** — Admin-defined milestones. Co-Builder is tracking system, not payment system.

14. **Data room contents** — Auto-generated assets + manually tracked additional materials.

### Platform Architecture Decisions (2026-02-12)

15. **Four-experience model** — Studio (strategic), Admin (lifecycle), Fellow (daily building), Stakeholder (read-only portfolio). Same auth, separate route groups, shared data model. Studio team uses Studio/Admin/Fellow views; fellows see only their view; stakeholders see only portfolio.

16. **KPI calculation** — Manual for MVP, auto-calculated from venture data in Phase 2. Pipeline hires feed "fellows sourced" KPI. Venture spin-outs feed "spin-outs completed" KPI.

17. **Pod ↔ Fellow relationship** — Fellows assigned to pods via `fellows.pod_id`. One pod per fellow. Pod performance measured by aggregate venture progress of assigned fellows (Phase 2).

18. **Framework editor persistence** — localStorage + JSON export for MVP. Database-backed with version history in Phase 2. The studio team needs to share edits across team members.

19. **Stakeholder access** — Read-only portfolio view implemented. Stakeholders created by admin setting role to "stakeholder" in Admin → Fellows. Public API endpoint exposes fellow portfolio data without sensitive information.

20. **Diagnosis system** — Enhanced "next step" logic implemented with critical actions, pathway visualization, velocity tracking, blockers identification, and spin-out estimation. Addresses Phase 1 "Enhanced next step logic" requirement.

21. **Google Drive integration** — Asset responses can be saved as markdown files to linked Google Drive folders. Partial markdown export capability (individual assets). Full venture export pending.

22. **Pod Launch Playbook v2** — Enhanced pod launch features with pre-launch planning, sprint models (v2 JSONB structure), deal timelines, role KPIs, operational rhythm, and implementation timeline. Supports expanded operational setup beyond v1 pre-work/sprint structure.
