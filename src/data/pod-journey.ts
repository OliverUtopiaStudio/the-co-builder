// ─── POD Journey: Thesis Formation → Network Effects POD ──────────────
// Clear journey from initial thesis formation to fully operational network effects POD

export type JourneyStage = 
  | "thesis_formation"
  | "pod_definition"
  | "network_design"
  | "infrastructure_setup"
  | "network_activation"
  | "network_effects_operational";

export interface JourneyCheckpoint {
  id: string;
  stage: JourneyStage;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: string | null;
  dependencies?: string[]; // IDs of checkpoints that must be completed first
}

export interface JourneyStageInfo {
  key: JourneyStage;
  label: string;
  description: string;
  checkpoints: JourneyCheckpoint[];
  order: number;
}

// ─── Journey Stages ──────────────────────────────────────────────────

export const POD_JOURNEY_STAGES: JourneyStageInfo[] = [
  {
    key: "thesis_formation",
    label: "Thesis Formation",
    description: "Define the investment thesis, market gap, and category ambition",
    order: 1,
    checkpoints: [
      {
        id: "th-1",
        stage: "thesis_formation",
        label: "Investment Thesis Defined",
        description: "Clear, defensible investment thesis with category-creating potential",
        required: true,
        completed: false,
      },
      {
        id: "th-2",
        stage: "thesis_formation",
        label: "Market Gap Identified",
        description: "Specific market gap or opportunity validated through research",
        required: true,
        completed: false,
      },
      {
        id: "th-3",
        stage: "thesis_formation",
        label: "Target Archetype Defined",
        description: "Clear profile of ideal fellow/venture that fits this thesis",
        required: true,
        completed: false,
      },
      {
        id: "th-4",
        stage: "thesis_formation",
        label: "Thesis Validated with IC",
        description: "Investment committee review and approval of thesis",
        required: true,
        completed: false,
        dependencies: ["th-1", "th-2", "th-3"],
      },
    ],
  },
  {
    key: "pod_definition",
    label: "Pod Definition",
    description: "Structure the pod with clusters, partners, and sourcing strategy",
    order: 2,
    checkpoints: [
      {
        id: "pd-1",
        stage: "pod_definition",
        label: "Clusters Defined",
        description: "Investment clusters within the pod thesis (e.g., verticals, use cases)",
        required: true,
        completed: false,
        dependencies: ["th-4"],
      },
      {
        id: "pd-2",
        stage: "pod_definition",
        label: "Corporate Partners Mapped",
        description: "Tier 1 and Tier 2 corporate partners identified and mapped",
        required: true,
        completed: false,
        dependencies: ["th-4"],
      },
      {
        id: "pd-3",
        stage: "pod_definition",
        label: "Co-Investors Identified",
        description: "Strategic co-investors aligned with pod thesis",
        required: true,
        completed: false,
        dependencies: ["th-4"],
      },
      {
        id: "pd-4",
        stage: "pod_definition",
        label: "Sourcing Strategy Defined",
        description: "Clear strategy for sourcing fellows and deals aligned to thesis",
        required: true,
        completed: false,
        dependencies: ["pd-1"],
      },
      {
        id: "pd-5",
        stage: "pod_definition",
        label: "Pod Lead Identified",
        description: "Pod lead assigned with clear ownership and accountability",
        required: true,
        completed: false,
      },
    ],
  },
  {
    key: "network_design",
    label: "Network Design",
    description: "Design the network effects architecture and value exchange",
    order: 3,
    checkpoints: [
      {
        id: "nd-1",
        stage: "network_design",
        label: "Network Effects Model Defined",
        description: "Clear model of how network effects compound value (e.g., data network, marketplace, platform)",
        required: true,
        completed: false,
        dependencies: ["pd-1", "pd-2"],
      },
      {
        id: "nd-2",
        stage: "network_design",
        label: "Value Exchange Designed",
        description: "How value flows between fellows, partners, co-investors, and the pod",
        required: true,
        completed: false,
        dependencies: ["nd-1"],
      },
      {
        id: "nd-3",
        stage: "network_design",
        label: "Network Metrics Defined",
        description: "KPIs that measure network health and compounding effects",
        required: true,
        completed: false,
        dependencies: ["nd-1"],
      },
      {
        id: "nd-4",
        stage: "network_design",
        label: "Activation Strategy Designed",
        description: "How to activate the network and achieve critical mass",
        required: true,
        completed: false,
        dependencies: ["nd-2", "nd-3"],
      },
    ],
  },
  {
    key: "infrastructure_setup",
    label: "Infrastructure Setup",
    description: "Build the operational infrastructure to support the network",
    order: 4,
    checkpoints: [
      {
        id: "is-1",
        stage: "infrastructure_setup",
        label: "Tools & CRM Configured",
        description: "Deal tracking, pipeline management, and communication tools set up",
        required: true,
        completed: false,
        dependencies: ["pd-5"],
      },
      {
        id: "is-2",
        stage: "infrastructure_setup",
        label: "Communication Channels Established",
        description: "Slack channels, meeting cadences, and collaboration spaces created",
        required: true,
        completed: false,
        dependencies: ["pd-5"],
      },
      {
        id: "is-3",
        stage: "infrastructure_setup",
        label: "Operational Rhythm Defined",
        description: "Weekly cadence, meeting structures, and review processes established",
        required: true,
        completed: false,
        dependencies: ["is-1", "is-2"],
      },
      {
        id: "is-4",
        stage: "infrastructure_setup",
        label: "Network Platform Ready",
        description: "Platform/tools for network interactions and value exchange operational",
        required: false,
        completed: false,
        dependencies: ["nd-4"],
      },
    ],
  },
  {
    key: "network_activation",
    label: "Network Activation",
    description: "Activate the network through sourcing and initial connections",
    order: 5,
    checkpoints: [
      {
        id: "na-1",
        stage: "network_activation",
        label: "First Fellows Embedded",
        description: "2+ fellows embedded and actively building within the pod",
        required: true,
        completed: false,
        dependencies: ["is-3", "pd-4"],
      },
      {
        id: "na-2",
        stage: "network_activation",
        label: "Corporate Partners Engaged",
        description: "3+ corporate partners actively engaged with pod fellows/ventures",
        required: true,
        completed: false,
        dependencies: ["na-1", "pd-2"],
      },
      {
        id: "na-3",
        stage: "network_activation",
        label: "Co-Investors Activated",
        description: "5+ co-investors introduced and engaged with pod pipeline",
        required: true,
        completed: false,
        dependencies: ["na-1", "pd-3"],
      },
      {
        id: "na-4",
        stage: "network_activation",
        label: "Deal Pipeline Active",
        description: "3+ deals in active pipeline (co-build fellows + VC deals)",
        required: true,
        completed: false,
        dependencies: ["na-1"],
      },
      {
        id: "na-5",
        stage: "network_activation",
        label: "Network Interactions Started",
        description: "First network effects visible (e.g., introductions, data sharing, collaborations)",
        required: true,
        completed: false,
        dependencies: ["na-2", "na-3", "na-4"],
      },
    ],
  },
  {
    key: "network_effects_operational",
    label: "Network Effects Operational",
    description: "Network effects are compounding and the POD is self-sustaining",
    order: 6,
    checkpoints: [
      {
        id: "ne-1",
        stage: "network_effects_operational",
        label: "Critical Mass Achieved",
        description: "Sufficient density of fellows, partners, and deals for network effects",
        required: true,
        completed: false,
        dependencies: ["na-5"],
      },
      {
        id: "ne-2",
        stage: "network_effects_operational",
        label: "Network Effects Measurable",
        description: "Network metrics showing compounding value (e.g., deal velocity, partner engagement, fellow success)",
        required: true,
        completed: false,
        dependencies: ["ne-1", "nd-3"],
      },
      {
        id: "ne-3",
        stage: "network_effects_operational",
        label: "Self-Sustaining Pipeline",
        description: "Deal flow and fellow sourcing happening organically through network",
        required: true,
        completed: false,
        dependencies: ["ne-1"],
      },
      {
        id: "ne-4",
        stage: "network_effects_operational",
        label: "Value Exchange Operational",
        description: "Value flowing between all network participants (fellows ↔ partners ↔ co-investors)",
        required: true,
        completed: false,
        dependencies: ["ne-2", "nd-2"],
      },
      {
        id: "ne-5",
        stage: "network_effects_operational",
        label: "Network Compounding",
        description: "Network effects visibly compounding (each new participant increases value for all)",
        required: true,
        completed: false,
        dependencies: ["ne-3", "ne-4"],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getJourneyStage(key: JourneyStage): JourneyStageInfo | undefined {
  return POD_JOURNEY_STAGES.find((s) => s.key === key);
}

export function getJourneyProgress(checkpoints: JourneyCheckpoint[]): {
  total: number;
  completed: number;
  byStage: Record<JourneyStage, { total: number; completed: number }>;
} {
  const byStage: Record<JourneyStage, { total: number; completed: number }> = {
    thesis_formation: { total: 0, completed: 0 },
    pod_definition: { total: 0, completed: 0 },
    network_design: { total: 0, completed: 0 },
    infrastructure_setup: { total: 0, completed: 0 },
    network_activation: { total: 0, completed: 0 },
    network_effects_operational: { total: 0, completed: 0 },
  };

  let total = 0;
  let completed = 0;

  for (const cp of checkpoints) {
    total++;
    if (cp.completed) completed++;
    byStage[cp.stage].total++;
    if (cp.completed) byStage[cp.stage].completed++;
  }

  return { total, completed, byStage };
}

export function getNextCheckpoint(
  checkpoints: JourneyCheckpoint[]
): JourneyCheckpoint | null {
  // Find first incomplete checkpoint where all dependencies are met
  for (const cp of checkpoints) {
    if (cp.completed) continue;
    if (!cp.dependencies || cp.dependencies.length === 0) {
      return cp;
    }
    const allDepsMet = cp.dependencies.every((depId) => {
      const dep = checkpoints.find((c) => c.id === depId);
      return dep?.completed;
    });
    if (allDepsMet) {
      return cp;
    }
  }
  return null;
}

export function getCurrentStage(checkpoints: JourneyCheckpoint[]): JourneyStage | null {
  const next = getNextCheckpoint(checkpoints);
  return next?.stage || null;
}
