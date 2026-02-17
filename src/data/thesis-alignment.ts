// ─── Thesis Alignment System ────────────────────────────────────────
// Living thesis alignment tracking and scoring

export type EvidenceType = "validates" | "challenges" | "neutral" | "refinement";
export type EvidenceSource = "venture" | "fellow" | "market" | "partner" | "deal" | "external";

export interface ThesisVersion {
  version: number;
  thesis: string;
  marketGap: string | null;
  targetArchetype: string | null;
  updatedAt: string;
  updatedBy: string | null;
  rationale: string; // Why this version changed
  changes: string[]; // What changed from previous version
}

export interface AlignmentCriterion {
  id: string;
  criterion: string; // e.g., "Market gap alignment", "Technical feasibility"
  weight: number; // 0-1, how important this criterion is
  description: string;
  category: "market" | "team" | "technology" | "business_model" | "impact";
}

export interface EvidenceEntry {
  id: string;
  type: EvidenceType;
  source: EvidenceSource;
  sourceId: string | null; // ID of venture/fellow/deal/etc
  sourceName: string; // Name for display
  description: string;
  date: string;
  impact: "high" | "medium" | "low";
  tags: string[];
  relatedVersion?: number; // Which thesis version this relates to
}

export interface AlignmentScore {
  overall: number; // 0-100
  byCriterion: Record<string, number>; // Score per criterion
  breakdown: {
    market: number;
    team: number;
    technology: number;
    businessModel: number;
    impact: number;
  };
  lastCalculated: string;
}

// ─── Default Alignment Criteria ────────────────────────────────────

export const DEFAULT_ALIGNMENT_CRITERIA: AlignmentCriterion[] = [
  {
    id: "market-gap",
    criterion: "Market Gap Alignment",
    weight: 0.25,
    description: "How well the venture addresses the identified market gap",
    category: "market",
  },
  {
    id: "archetype-fit",
    criterion: "Target Archetype Fit",
    weight: 0.20,
    description: "How well the fellow/venture matches the target archetype",
    category: "team",
  },
  {
    id: "technical-feasibility",
    criterion: "Technical Feasibility",
    weight: 0.15,
    description: "Technical viability within the pod's thesis",
    category: "technology",
  },
  {
    id: "business-model",
    criterion: "Business Model Alignment",
    weight: 0.15,
    description: "Alignment with expected business model patterns",
    category: "business_model",
  },
  {
    id: "qatar-impact",
    criterion: "Qatar Impact Potential",
    weight: 0.15,
    description: "Potential for meaningful impact in Qatar",
    category: "impact",
  },
  {
    id: "global-scale",
    criterion: "Global Scale Potential",
    weight: 0.10,
    description: "Potential for global scale and category creation",
    category: "impact",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

export function calculateAlignmentScore(
  criteria: AlignmentCriterion[],
  scores: Record<string, number>
): AlignmentScore {
  const breakdown: AlignmentScore["breakdown"] = {
    market: 0,
    team: 0,
    technology: 0,
    businessModel: 0,
    impact: 0,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const criterion of criteria) {
    const score = scores[criterion.id] || 0;
    const weighted = score * criterion.weight;
    weightedSum += weighted;
    totalWeight += criterion.weight;

    // Add to category breakdown (map snake_case to camelCase)
    const breakdownKey = criterion.category === "business_model" ? "businessModel" : criterion.category;
    breakdown[breakdownKey as keyof typeof breakdown] += weighted;
  }

  const overall = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;

  // Normalize breakdown by category weights
  const categoryWeights: Record<string, number> = {};
  for (const criterion of criteria) {
    categoryWeights[criterion.category] = (categoryWeights[criterion.category] || 0) + criterion.weight;
  }

  for (const key of Object.keys(breakdown) as Array<keyof typeof breakdown>) {
    const weight = categoryWeights[key] || 1;
    breakdown[key] = weight > 0 ? Math.round((breakdown[key] / weight) * 100) / 100 : 0;
  }

  return {
    overall: Math.round(overall * 100) / 100,
    byCriterion: scores,
    breakdown,
    lastCalculated: new Date().toISOString(),
  };
}

export function getEvidenceImpactColor(type: EvidenceType): string {
  switch (type) {
    case "validates":
      return "#16a34a"; // green
    case "challenges":
      return "#dc2626"; // red
    case "refinement":
      return "#2563eb"; // blue
    default:
      return "#8F898B"; // gray
  }
}

export function getAlignmentColor(score: number): string {
  if (score >= 80) return "#16a34a"; // green
  if (score >= 60) return "#eab308"; // yellow
  if (score >= 40) return "#f97316"; // orange
  return "#dc2626"; // red
}
