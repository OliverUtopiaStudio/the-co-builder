// ─── Pod Launch Playbook v2 — Default Templates ────────────────
// All default task data for hyper-granular pod launch setup.
// Sourced from Infrastructure Intelligence POD v2 presentation.

// ─── Helper ─────────────────────────────────────────────────────

function task(
  id: string,
  title: string,
  description: string | null = null
) {
  return { id, title, description, completed: false, completedAt: null, notes: null };
}

function preLaunchTask(
  id: string,
  title: string,
  owner: "pod_lead" | "fund" | "studio"
) {
  return { id, title, owner, completed: false, completedAt: null, notes: null };
}

// ─── Pre-Launch Defaults ────────────────────────────────────────

export const DEFAULT_PRE_LAUNCH = {
  checks: {
    thesisValidated: false,
    archetypeDefined: false,
    podLeadIdentified: false,
    podLeadName: null as string | null,
    corporatePartnersMapped: false,
    coInvestorsMapped: false,
    clustersDefined: false,
    toolsConfigured: false,
    communicationSetup: false,
  },
  weekMinus1: {
    tasks: [
      preLaunchTask("wm1-1", "Confirm pod lead assignment and availability", "pod_lead"),
      preLaunchTask("wm1-2", "Confirm fund team allocation for pod", "fund"),
      preLaunchTask("wm1-3", "Confirm studio team allocation for pod", "studio"),
      preLaunchTask("wm1-4", "Review and validate pod thesis with IC", "pod_lead"),
      preLaunchTask("wm1-5", "Identify resource gaps and budget requirements", "pod_lead"),
      preLaunchTask("wm1-6", "Map initial corporate partner targets by tier", "pod_lead"),
    ],
    completedAt: null as string | null,
  },
  week0: {
    tasks: [
      preLaunchTask("w0-1", "Set up CRM pipeline for pod deal tracking", "fund"),
      preLaunchTask("w0-2", "Configure Slack channel and meeting cadence", "studio"),
      preLaunchTask("w0-3", "Create pod workspace and shared drive", "studio"),
      preLaunchTask("w0-4", "Set up recruitment pipeline for fellow archetype", "studio"),
      preLaunchTask("w0-5", "Prepare sprint kickoff deck and KPI dashboard", "pod_lead"),
      preLaunchTask("w0-6", "Define deal evaluation criteria and IC memo template", "fund"),
    ],
    completedAt: null as string | null,
  },
  notes: null as string | null,
  completedAt: null as string | null,
};

// ─── Sprint 1 — Foundation (2 weeks) ───────────────────────────
// From Slides 8-10: Week 1 Foundation + Week 2 Activation

const SPRINT_1_WEEK_1 = {
  weekLabel: "Week 1 — Foundation",
  days: {
    monday: {
      dayLabel: "Sprint Kickoff",
      tasks: {
        pod_lead: task("s1w1-mon-pl", "Sprint kickoff & corporate partner mapping", "Lead kickoff meeting, set sprint goals, begin corporate mapping session"),
        fund: task("s1w1-mon-fn", "Deal database setup & initial pipeline research", "Configure CRM, begin sourcing 5+ target deals aligned to thesis"),
        studio: task("s1w1-mon-st", "Fellow persona definition & recruitment channels", "Define target fellow profile, identify recruitment channels"),
      },
    },
    tuesday: {
      dayLabel: "Role Alignment",
      tasks: {
        pod_lead: task("s1w1-tue-pl", "Role alignment & KPI setting, partner outreach begins", "Align team on KPIs, initiate outreach to top 3 corporate targets"),
        fund: task("s1w1-tue-fn", "Pipeline research & startup contact identification", "Research target startups, identify founders for outreach"),
        studio: task("s1w1-tue-st", "Recruitment channel activation & job postings", "Launch job postings, activate university and network channels"),
      },
    },
    wednesday: {
      dayLabel: "Progress Checkpoint",
      tasks: {
        pod_lead: task("s1w1-wed-pl", "Progress checkpoint & co-investor identification", "Mid-week sync, identify 5+ co-investor targets with thesis alignment"),
        fund: task("s1w1-wed-fn", "Startup outreach & initial screening calls", "Make contact with pipeline targets, conduct initial screens"),
        studio: task("s1w1-wed-st", "Job postings live & university partnership outreach", "Confirm postings are live, reach out to university contacts"),
      },
    },
    thursday: {
      dayLabel: "Resource Review",
      tasks: {
        pod_lead: task("s1w1-thu-pl", "Resource review & partnership pitch preparation", "Review resource utilization, prepare partnership pitch materials"),
        fund: task("s1w1-thu-fn", "Screening calls & deal qualification", "Continue screening calls, qualify deals against evaluation criteria"),
        studio: task("s1w1-thu-st", "Applications review & candidate shortlisting", "Review incoming applications, create initial shortlist"),
      },
    },
    friday: {
      dayLabel: "Week 1 Retrospective",
      tasks: {
        pod_lead: task("s1w1-fri-pl", "Week 1 retrospective & partnership feedback review", "Run retro, review partner outreach feedback, adjust strategy"),
        fund: task("s1w1-fri-fn", "Pipeline update & deal progress report", "Update CRM, prepare weekly deal flow report for pod lead"),
        studio: task("s1w1-fri-st", "Applications review & recruitment metrics update", "Compile application metrics, update recruitment dashboard"),
      },
    },
  },
};

const SPRINT_1_WEEK_2 = {
  weekLabel: "Week 2 — Activation",
  days: {
    monday: {
      dayLabel: "Pipeline Review",
      tasks: {
        pod_lead: task("s1w2-mon-pl", "Pipeline review & partnership meetings begin", "Review full pipeline, begin formal partnership meetings with corporates"),
        fund: task("s1w2-mon-fn", "Term sheet discussions with top prospects", "Initiate preliminary term discussions with qualified deals"),
        studio: task("s1w2-mon-st", "Fellow interviews begin", "Start conducting interviews with shortlisted candidates"),
      },
    },
    tuesday: {
      dayLabel: "Cross-Team Coordination",
      tasks: {
        pod_lead: task("s1w2-tue-pl", "Cross-team coordination & co-investor introductions", "Facilitate cross-team alignment, make co-investor introductions"),
        fund: task("s1w2-tue-fn", "Due diligence initiation on top deals", "Begin due diligence process on 3+ qualified deals"),
        studio: task("s1w2-tue-st", "Co-build assessment sessions", "Conduct co-build capability assessments with candidates"),
      },
    },
    wednesday: {
      dayLabel: "Mid-Week Checkpoint",
      tasks: {
        pod_lead: task("s1w2-wed-pl", "Mid-week checkpoint & strategic alignment review", "Check sprint progress, ensure strategic alignment across workstreams"),
        fund: task("s1w2-wed-fn", "Investment committee prep & memo drafting", "Prepare IC memos for top deal prospects"),
        studio: task("s1w2-wed-st", "Agreement negotiation & terms structuring", "Begin structuring co-build agreements for top candidates"),
      },
    },
    thursday: {
      dayLabel: "Systems Optimization",
      tasks: {
        pod_lead: task("s1w2-thu-pl", "Systems optimization & partnership finalization push", "Optimize workflows, push for partnership commitments"),
        fund: task("s1w2-thu-fn", "Portfolio construction & deal prioritization", "Rank deals by fit, begin portfolio construction view"),
        studio: task("s1w2-thu-st", "Onboarding preparation for incoming fellows", "Prepare onboarding materials and co-build workspace"),
      },
    },
    friday: {
      dayLabel: "Sprint 1 Completion",
      tasks: {
        pod_lead: task("s1w2-fri-pl", "Sprint completion review & go-to-market strategy", "Run sprint review, define go-to-market approach for sprint 2"),
        fund: task("s1w2-fri-fn", "Deal flow automation & pipeline health report", "Automate deal flow tracking, compile pipeline health report"),
        studio: task("s1w2-fri-st", "Fellow handoff preparation & recruitment report", "Prepare fellow handoff docs, compile recruitment metrics"),
      },
    },
  },
};

// ─── Sprint 2 — Construction & Conversion (2 weeks) ────────────
// Deeper execution: convert pipeline to commitments

const SPRINT_2_WEEK_1 = {
  weekLabel: "Week 1 — Deep Execution",
  days: {
    monday: {
      dayLabel: "Sprint 2 Kickoff",
      tasks: {
        pod_lead: task("s2w1-mon-pl", "Sprint 2 kickoff & partnership conversion strategy", "Set sprint 2 goals, focus on converting partnerships to commitments"),
        fund: task("s2w1-mon-fn", "IC submission for top deals", "Submit investment committee memos for qualified deals"),
        studio: task("s2w1-mon-st", "Fellow selection committee preparation", "Prepare selection committee materials for top candidates"),
      },
    },
    tuesday: {
      dayLabel: "Conversion Push",
      tasks: {
        pod_lead: task("s2w1-tue-pl", "Corporate pilot negotiation & terms discussion", "Negotiate pilot terms with engaged corporate partners"),
        fund: task("s2w1-tue-fn", "Deep due diligence & co-investor syndication", "Complete deep DD, initiate co-investor syndication conversations"),
        studio: task("s2w1-tue-st", "Selection committee & co-build agreement finalization", "Run selection committee, finalize co-build agreements"),
      },
    },
    wednesday: {
      dayLabel: "Mid-Sprint Check",
      tasks: {
        pod_lead: task("s2w1-wed-pl", "Mid-sprint checkpoint & co-investor meeting series", "Run check-in, schedule co-investor meeting series"),
        fund: task("s2w1-wed-fn", "Deal structuring & term sheet preparation", "Structure deal terms, prepare term sheets for IC-approved deals"),
        studio: task("s2w1-wed-st", "Fellow onboarding kickoff for confirmed candidates", "Begin onboarding first confirmed fellow(s)"),
      },
    },
    thursday: {
      dayLabel: "Pipeline Depth",
      tasks: {
        pod_lead: task("s2w1-thu-pl", "Pod marketing campaign launch & deal flow amplification", "Launch pod marketing materials, amplify deal flow channels"),
        fund: task("s2w1-thu-fn", "Term negotiations & co-investor commitment tracking", "Negotiate terms with founders, track co-investor commitments"),
        studio: task("s2w1-thu-st", "Co-build workspace setup & fellow integration", "Set up co-build workspaces, integrate fellows with pod teams"),
      },
    },
    friday: {
      dayLabel: "Week Review",
      tasks: {
        pod_lead: task("s2w1-fri-pl", "Week review & partnership commitment status", "Review partnership conversion rate, adjust strategy for final week"),
        fund: task("s2w1-fri-fn", "Pipeline health review & IC status update", "Update pipeline health, compile IC decision status"),
        studio: task("s2w1-fri-st", "Fellow progress report & onboarding metrics", "Report on fellow onboarding progress and engagement metrics"),
      },
    },
  },
};

const SPRINT_2_WEEK_2 = {
  weekLabel: "Week 2 — Close & Commit",
  days: {
    monday: {
      dayLabel: "Final Push",
      tasks: {
        pod_lead: task("s2w2-mon-pl", "Final partnership push & commitment confirmations", "Push for final partnership commitments, confirm all engagements"),
        fund: task("s2w2-mon-fn", "Final IC decisions & deal documentation", "Obtain final IC decisions, begin deal documentation"),
        studio: task("s2w2-mon-st", "Fellow confirmation & co-build kickoff planning", "Confirm all fellows, plan co-build kickoff sessions"),
      },
    },
    tuesday: {
      dayLabel: "Documentation",
      tasks: {
        pod_lead: task("s2w2-tue-pl", "Co-investor closing & strategic alignment confirmation", "Close co-investor commitments, confirm strategic alignment"),
        fund: task("s2w2-tue-fn", "Investment documentation & legal review initiation", "Prepare investment docs, initiate legal review"),
        studio: task("s2w2-tue-st", "Onboarding documentation & fellow workspace handoff", "Complete all onboarding docs, hand off workspaces to fellows"),
      },
    },
    wednesday: {
      dayLabel: "Operational Prep",
      tasks: {
        pod_lead: task("s2w2-wed-pl", "Operational rhythm design & weekly cadence setup", "Design post-sprint operational rhythm, set up recurring cadences"),
        fund: task("s2w2-wed-fn", "Portfolio monitoring setup & value-add framework", "Set up portfolio monitoring dashboard, define value-add framework"),
        studio: task("s2w2-wed-st", "Co-build progress tracking setup & milestone definition", "Configure progress tracking, define fellow milestones"),
      },
    },
    thursday: {
      dayLabel: "Systems Check",
      tasks: {
        pod_lead: task("s2w2-thu-pl", "All-systems check & pod infrastructure audit", "Audit all pod systems, confirm everything is operational"),
        fund: task("s2w2-thu-fn", "Deal pipeline handoff to operational tracking", "Transition deal pipeline to operational portfolio tracking"),
        studio: task("s2w2-thu-st", "Fellow integration check & support system activation", "Verify fellow integration, activate support systems"),
      },
    },
    friday: {
      dayLabel: "Sprint 2 Completion",
      tasks: {
        pod_lead: task("s2w2-fri-pl", "Sprint completion review & operational state declaration", "Final review — declare pod operational or identify gaps"),
        fund: task("s2w2-fri-fn", "Final pipeline report & active deal status", "Compile final pipeline report with all deal statuses"),
        studio: task("s2w2-fri-st", "Fellow status report & ongoing recruitment plan", "Final fellow status report, plan for ongoing recruitment"),
      },
    },
  },
};

// ─── Default Sprints Array ──────────────────────────────────────

export const DEFAULT_SPRINTS = [
  {
    sprintNumber: 1,
    label: "Sprint 1 — Foundation & Activation",
    startDate: null as string | null,
    endDate: null as string | null,
    status: "pending" as "pending" | "active" | "completed",
    week1: SPRINT_1_WEEK_1,
    week2: SPRINT_1_WEEK_2,
    kpis: {
      fellowsSourced: { target: 5, current: 0 },
      dealsSourced: { target: 5, current: 0 },
      partnersReachedOut: { target: 10, current: 0 },
      partnersConverted: { target: 0, current: 0 },
      coInvestorsMapped: { target: 5, current: 0 },
    },
    summary: null as string | null,
  },
  {
    sprintNumber: 2,
    label: "Sprint 2 — Construction & Conversion",
    startDate: null as string | null,
    endDate: null as string | null,
    status: "pending" as "pending" | "active" | "completed",
    week1: SPRINT_2_WEEK_1,
    week2: SPRINT_2_WEEK_2,
    kpis: {
      fellowsSourced: { target: 3, current: 0 },
      dealsSourced: { target: 3, current: 0 },
      partnersReachedOut: { target: 5, current: 0 },
      partnersConverted: { target: 3, current: 0 },
      coInvestorsMapped: { target: 3, current: 0 },
    },
    summary: null as string | null,
  },
];

// ─── Role KPIs ──────────────────────────────────────────────────

export const DEFAULT_ROLE_KPIS = {
  pod_lead: {
    dealFlowVelocity: { target: 5, current: 0, unit: "deals/week" },
    crossTeamCoordination: { target: 8, current: 0, unit: "score /10" },
    pipelineConversion: { target: 20, current: 0, unit: "%" },
    partnershipMeetings: { target: 3, current: 0, unit: "meetings/week" },
    corporatePilots: { target: 2, current: 0, unit: "pilots" },
  },
  fund: {
    dealsSourcedPerWeek: { target: 5, current: 0, unit: "deals/week" },
    termDiscussions: { target: 3, current: 0, unit: "discussions" },
    ddCompletions: { target: 2, current: 0, unit: "completions/month" },
    icApprovals: { target: 1, current: 0, unit: "approvals" },
  },
  studio: {
    fellowApplications: { target: 15, current: 0, unit: "applications" },
    assessmentCompletions: { target: 5, current: 0, unit: "assessments" },
    coBuildAgreements: { target: 2, current: 0, unit: "agreements" },
    onboardingSuccessRate: { target: 90, current: 0, unit: "%" },
  },
};

// ─── Operational Rhythm ─────────────────────────────────────────

export const DEFAULT_OPERATIONAL_RHYTHM = {
  mode: "live" as "live" | "learn" | "farm",
  weeklySchedule: {
    monday: {
      focus: "POD Team Standup",
      description: "Pipeline review & weekly planning — align all workstreams on priorities",
    },
    tuesday: {
      focus: "Partner & Co-investor Outreach",
      description: "Relationship building — corporate partner meetings, co-investor introductions",
    },
    wednesday: {
      focus: "Fellow Interviews & Assessments",
      description: "Co-build assessment sessions — evaluate candidates, conduct technical interviews",
    },
    thursday: {
      focus: "Deal Review & Due Diligence",
      description: "Deep dives — DD sessions, IC prep, portfolio construction reviews",
    },
    friday: {
      focus: "Weekly Retrospective",
      description: "Pipeline data analysis — optimize sourcing channels, review metrics, plan next week",
    },
  },
  weekLog: [] as Array<{
    weekNumber: number;
    startDate: string;
    notes: string;
    mode: "live" | "learn" | "farm";
    metrics?: {
      dealsSourced?: number;
      dealsAdvanced?: number;
      partnersContacted?: number;
      fellowsInterviewed?: number;
      coInvestorsIntroduced?: number;
    };
  }>,
  dailyTasks: {} as Record<string, Record<string, { id: string; title: string; completed: boolean; notes?: string }>>,
  monthlyMetrics: [] as Array<{
    month: string; // YYYY-MM
    dealsSourced: number;
    dealsClosed: number;
    fellowsEmbedded: number;
    partnersEngaged: number;
    coInvestorsMapped: number;
    modeDistribution: { live: number; learn: number; farm: number };
  }>,
};

// ─── Implementation Timeline ────────────────────────────────────

export const DEFAULT_IMPLEMENTATION_TIMELINE = {
  milestones: [
    {
      id: "m-wm1",
      label: "Week -1",
      description: "Team role confirmation & resource allocation",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
    {
      id: "m-w0",
      label: "Week 0",
      description: "Tools setup — CRM, pipeline tracking, communication channels",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
    {
      id: "m-w12",
      label: "Week 1-2",
      description: "Execute foundation & activation sprints",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
    {
      id: "m-w3p",
      label: "Week 3+",
      description: "Operational rhythm with weekly optimization",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
    {
      id: "m-m2",
      label: "Month 2",
      description: "Scale successful channels & expand deal types",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
    {
      id: "m-m3",
      label: "Month 3",
      description: "First co-build fellow signed + 3 VC deals in pipeline",
      status: "pending" as "pending" | "active" | "completed",
      targetDate: null as string | null,
      completedAt: null as string | null,
    },
  ],
};

// ─── Deal Stage Templates ───────────────────────────────────────

export const DEAL_STAGE_TEMPLATES = {
  co_build_fellow: {
    label: "Co-Build Fellow",
    totalDuration: "12-18 months",
    stages: [
      { name: "Recruitment", durationLabel: "2-4 weeks" },
      { name: "Assessment", durationLabel: "1-2 weeks" },
      { name: "Negotiation", durationLabel: "1-2 weeks" },
      { name: "Onboarding", durationLabel: "2 weeks" },
      { name: "Build Phase", durationLabel: "12+ months" },
    ],
  },
  pre_seed_vc: {
    label: "Pre-Seed VC",
    totalDuration: "3-6 months",
    stages: [
      { name: "Sourcing", durationLabel: "2-4 weeks" },
      { name: "Initial DD", durationLabel: "2-3 weeks" },
      { name: "Deep DD", durationLabel: "3-4 weeks" },
      { name: "IC Process", durationLabel: "2-3 weeks" },
      { name: "Documentation", durationLabel: "2-4 weeks" },
    ],
  },
  seed_vc: {
    label: "Seed VC",
    totalDuration: "6-12 months",
    stages: [
      { name: "Pipeline Dev", durationLabel: "4-8 weeks" },
      { name: "Evaluation", durationLabel: "4-6 weeks" },
      { name: "DD Process", durationLabel: "6-8 weeks" },
      { name: "IC + Legal", durationLabel: "4-6 weeks" },
      { name: "Close", durationLabel: "2-4 weeks" },
    ],
  },
} as const;

// ─── Pod Cycle Stages ───────────────────────────────────────────

export const POD_CYCLE_STAGES = [
  { key: "define", label: "Define", description: "Set sourcing criteria, pod construction" },
  { key: "source", label: "Source", description: "Fellows, pre-seed/seed deals, campaigns" },
  { key: "evaluate", label: "Evaluate", description: "DD, IC memos, selection committee" },
  { key: "build", label: "Build", description: "Pod construction, value-add delivery" },
  { key: "scale", label: "Scale", description: "Fundraising, portfolio management" },
] as const;
