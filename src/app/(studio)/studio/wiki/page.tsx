"use client";

import Link from "next/link";

export default function WikiPage() {
  return (
    <div className="space-y-12 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium text-foreground mb-2">
          Co-Build OS Wiki
        </h1>
        <p className="text-muted text-sm">
          How the platform works, who owns what, and where we&apos;re headed.
        </p>
      </div>

      {/* ─── How the Site Works ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">1. How the Site Works</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Co-Build OS is a unified venture-building platform. One data model,
          three user perspectives. Fellows build ventures; the Studio team runs
          the programme; Stakeholders view the portfolio. Data flows between all
          three.
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-foreground mb-1">User Types</h3>
            <ul className="list-disc list-inside text-muted space-y-0.5">
              <li>
                <strong className="text-foreground">Fellow</strong> — Co-Build
                app: dashboard, ventures, 27-asset framework, stipend status
              </li>
              <li>
                <strong className="text-foreground">Studio</strong> — Studio OS:
                KPIs, pods, pipeline, pod launch playbooks
              </li>
              <li>
                <strong className="text-foreground">Admin</strong> — Fellow
                lifecycle: onboarding, stipends, framework editor, asset
                requirements
              </li>
              <li>
                <strong className="text-foreground">Stakeholder</strong> —
                Read-only fellow portfolio view
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-1">Route Structure</h3>
            <ul className="text-muted space-y-0.5 font-mono text-xs">
              <li>/dashboard, /venture/*, /profile, /tools → Fellow</li>
              <li>/studio/* → Studio (KPI, pods, pipeline, pod-launch)</li>
              <li>/admin/* → Admin (fellows, framework, stipends, settings)</li>
              <li>/portfolio → Stakeholder</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-1">
              Tech Stack
            </h3>
            <p className="text-muted">
              Next.js 16, React 19, Tailwind 4, Supabase (Auth + Postgres +
              Storage), Drizzle ORM, Vercel.
            </p>
          </div>
        </div>
      </section>

      {/* ─── The 27-Asset Framework ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">
          2. The 27-Asset Co-Build Framework
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Fellows work through 7 stages and 27 assets. Each asset has a core
          question, checklist, and guided workflow. Progress is tracked per
          venture. The framework is fixed (27 assets always) but requirements
          can be customised per venture (required vs optional).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Stage</th>
                <th className="text-left py-2 font-medium">Assets</th>
                <th className="text-left py-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border/50">
                <td className="py-2">00 — Invention Gate</td>
                <td>#1–2</td>
                <td>Validate risk-capital thesis and category ambition</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">01 — Problem Deep Dive</td>
                <td>#3–8</td>
                <td>Quantify the problem with economic evidence</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">02 — Solution Architecture</td>
                <td>#9–14</td>
                <td>Design defensible invention and positioning</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">03 — Market Validation</td>
                <td>#15–18</td>
                <td>Prove demand with customer evidence</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">04 — Business Engine</td>
                <td>#19–22</td>
                <td>Pricing, unit economics, go-to-market</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">05 — Investment Readiness</td>
                <td>#23–25</td>
                <td>Package venture for institutional investment</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">06 — Growth Architecture</td>
                <td>#26–27</td>
                <td>Scaling systems, exit strategies, growth plays</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Data Model ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">3. Data Model</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Clear ownership: who writes, who reads.
        </p>
        <ul className="text-sm text-muted space-y-2">
          <li>
            <strong className="text-foreground">Studio-owned:</strong> pods,
            kpi_metrics, kpi_history, ashby_pipeline
          </li>
          <li>
            <strong className="text-foreground">Admin-owned:</strong> fellows
            (lifecycle, experience profile, onboarding), stipend_milestones,
            asset_requirements
          </li>
          <li>
            <strong className="text-foreground">Fellow-owned:</strong> ventures,
            responses, asset_completion, uploads
          </li>
        </ul>
        <p className="text-xs text-muted mt-4">
          Fellows are assigned to pods via fellows.pod_id. Ventures belong to
          fellows. Responses and asset_completion link to ventures.
        </p>
      </section>

      {/* ─── Fellow Lifecycle ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">4. Fellow Lifecycle</h2>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Sourced → Onboarding → Building → Spin-Out → Graduated
        </p>
        <ul className="text-sm text-muted space-y-1">
          <li>
            <strong>Onboarding</strong> — Agreement, KYC, toolstack, compute
            budget, venture creation. Admin tracks agreement/KYC; fellow
            self-tracks toolstack, framework intro, venture.
          </li>
          <li>
            <strong>Building</strong> — Daily work through 27 assets. Dashboard
            shows &quot;what to work on next.&quot;
          </li>
          <li>
            <strong>Stipend</strong> — $2,500 × 2 cash + $4,000 compute. Admin
            defines milestones, marks met/released.
          </li>
        </ul>
      </section>

      {/* ─── Improvement Areas ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">5. Improvement Areas</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Prioritised roadmap from the PRD. Explore and add to this list as the
          programme evolves.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Quick Wins (Technical)
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>Convert heavy pages to server components for faster initial load</li>
              <li>Add React Query/SWR for data caching and background refetch</li>
              <li>Prefetch venture data when hovering links to asset pages</li>
              <li>Add loading skeletons instead of generic &quot;Loading...&quot; spinners</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Phase 1 (Post-MVP)
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>Enhanced &quot;next step&quot; logic — prerequisites, stage gates</li>
              <li>Onboarding → Building auto-transition when venture created</li>
              <li>Framework editor → DB persistence (currently localStorage)</li>
              <li>Experience profile → guidance adaptation in asset workflows</li>
              <li>Date fields for agreement/KYC (not just boolean toggles)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Phase 2 — Review & Interconnection
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>Asset comments/feedback from studio team</li>
              <li>Review status per asset (draft → submitted → reviewed)</li>
              <li>Stage gate review UI (formal approve/reject)</li>
              <li>Custom requirements per venture in admin UI</li>
              <li>KPI auto-calculation from venture data</li>
              <li>Pod detail → aggregate venture progress for assigned fellows</li>
              <li>Markdown export for fellows</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Phase 3 — AI Layer
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>AI answer review and improvement suggestions</li>
              <li>Investor lens — evaluate assets from investor perspective</li>
              <li>Customer lens — problem/solution fit evaluation</li>
              <li>Quality scoring per asset</li>
              <li>Cohort patterns — where fellows get stuck</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Phase 4+ — Ecosystem
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>Slack integration — action items into venture tasks</li>
              <li>Pipeline → fellow creation (Ashby API)</li>
              <li>Google Drive sync</li>
              <li>Data room builder for spin-out</li>
              <li>Multi-cohort support</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Known Gaps &amp; Trade-offs
            </h3>
            <ul className="text-sm text-muted space-y-0.5 list-disc list-inside">
              <li>Framework editor: localStorage only — edits not shared across team</li>
              <li>Pipeline: manual data entry — no Ashby API yet</li>
              <li>Stage gates: informal approval — no formal review UI</li>
              <li>KPIs: manual entry — not yet auto-calculated from venture data</li>
              <li>Stakeholders/Studio users: created by admin changing role in Fellows</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Design Principles ─── */}
      <section
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 className="text-lg font-semibold mb-4">6. Design Principles</h2>
        <ul className="text-sm text-muted space-y-1 list-disc list-inside">
          <li>
            <strong className="text-foreground">Logic over completion</strong> —
            Well-reasoned assets beat rushed checkboxes
          </li>
          <li>
            <strong className="text-foreground">Toothbrush product</strong> —
            Fellows open it daily; every session ends with a reason to return
          </li>
          <li>
            <strong className="text-foreground">Diagnosis over dashboard</strong>{" "}
            — Answer &quot;who needs help?&quot; not just &quot;how many?&quot;
          </li>
          <li>
            <strong className="text-foreground">Central hub</strong> — Connect
            Drive, Slack, Ashby; don&apos;t replace them
          </li>
        </ul>
      </section>

      <div className="text-sm text-muted pt-4 border-t border-border">
        Full PRD in <code className="bg-border/50 px-1 py-0.5" style={{ borderRadius: 2 }}>PRD.md</code>.
        Admin manages fellows in{" "}
        <Link href="/admin/fellows" className="text-accent hover:underline">
          Admin → Fellows
        </Link>
        .
      </div>
    </div>
  );
}
