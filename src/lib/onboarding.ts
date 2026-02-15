// ─── Onboarding Types & Defaults ─────────────────────────────────
// The onboarding_status JSONB column on fellows stores this shape.
// Each step is either a boolean (self-reported), a date string (admin-tracked),
// or null (not yet completed).

export interface OnboardingStatus {
  agreementSigned: string | null;       // ISO date when admin marked signed
  kycVerified: string | null;           // ISO date when admin marked verified
  toolstackComplete: boolean;           // Fellow self-reports
  computeBudgetAcknowledged: boolean;   // Fellow self-reports
  frameworkIntroComplete: boolean;      // Fellow self-reports
  browserSetupComplete: boolean;        // Fellow self-reports
  ventureCreated: boolean;              // Auto-set when venture is created
}

export const DEFAULT_ONBOARDING_STATUS: OnboardingStatus = {
  agreementSigned: null,
  kycVerified: null,
  toolstackComplete: false,
  computeBudgetAcknowledged: false,
  frameworkIntroComplete: false,
  browserSetupComplete: false,
  ventureCreated: false,
};

export type LifecycleStage = "onboarding" | "building" | "spin_out" | "graduated";

export type ExperienceProfile = "first_time_builder" | "experienced_founder" | "corporate_innovator";

export const EXPERIENCE_PROFILE_LABELS: Record<ExperienceProfile, string> = {
  first_time_builder: "First-Time Builder",
  experienced_founder: "Experienced Founder",
  corporate_innovator: "Corporate Innovator",
};

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  onboarding: "Onboarding",
  building: "Building",
  spin_out: "Spin-Out",
  graduated: "Graduated",
};

export const LIFECYCLE_STAGE_COLORS: Record<LifecycleStage, string> = {
  onboarding: "bg-blue-100 text-blue-700",
  building: "bg-amber-100 text-amber-700",
  spin_out: "bg-purple-100 text-purple-700",
  graduated: "bg-green-100 text-green-700",
};

// Compute budget recommended stack
export const RECOMMENDED_COMPUTE_STACK = [
  {
    tool: "Claude Max",
    allocation: "~$1,200",
    description: "AI co-pilot for research, analysis, writing",
    link: "https://claude.ai/upgrade",
  },
  {
    tool: "Hosting (Vercel/similar)",
    allocation: "~$600",
    description: "Deploy prototypes and MVPs",
    link: "https://vercel.com",
  },
  {
    tool: "APIs & data",
    allocation: "~$800",
    description: "Third-party APIs for market data, analysis",
    link: null,
  },
  {
    tool: "Design tools",
    allocation: "~$400",
    description: "Figma, prototyping tools",
    link: "https://figma.com",
  },
  {
    tool: "Flexible/other",
    allocation: "~$1,000",
    description: "Domain-specific tools, testing, infrastructure",
    link: null,
  },
];

// Toolstack setup items
export const TOOLSTACK_ITEMS = [
  {
    id: "claude",
    name: "Claude",
    description: "AI co-pilot for research, analysis, and writing. We recommend the Max plan for full capability.",
    link: "https://claude.ai",
    recommended: "Max plan (~$1,200/yr)",
  },
  {
    id: "github",
    name: "Git / GitHub",
    description: "Version control for code and markdown. Essential for tracking changes and collaborating on technical assets.",
    link: "https://github.com",
    recommended: "Free tier",
  },
  {
    id: "markdown",
    name: "Markdown Editor",
    description: "Write structured documents. VS Code with markdown preview, or Obsidian for a dedicated experience.",
    link: "https://code.visualstudio.com",
    recommended: "VS Code (free)",
  },
];

// Admin-tracked fields: only admins can set these (timestamps)
export const ADMIN_TRACKED_FIELDS: (keyof OnboardingStatus)[] = [
  "agreementSigned",
  "kycVerified",
];

export function isAdminTrackedField(field: keyof OnboardingStatus): boolean {
  return ADMIN_TRACKED_FIELDS.includes(field);
}

/** Format a date string or legacy boolean for display (e.g. "Jan 15, 2024" or "Signed") */
export function formatOnboardingDate(
  value: string | boolean | null | undefined
): string | null {
  if (value == null) return null;
  if (typeof value === "boolean") return value ? "Complete" : null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

/** Latest completion date among agreementSigned and kycVerified (for list views) */
export function getLatestCompletionDate(
  status: OnboardingStatus | null
): string | null {
  if (!status) return null;
  const dates: string[] = [];
  if (typeof status.agreementSigned === "string") dates.push(status.agreementSigned);
  if (typeof status.kycVerified === "string") dates.push(status.kycVerified);
  if (dates.length === 0) return null;
  dates.sort();
  return dates[dates.length - 1];
}

/** Validate value for admin-only fields: null or ISO date string */
export function validateOnboardingUpdate(
  step: "agreementSigned" | "kycVerified",
  value: string | null
): { valid: true } | { valid: false; error: string } {
  if (value === null || value === "") return { valid: true };
  const trimmed = value.trim();
  if (!trimmed) return { valid: true }; // treat as null
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return { valid: false, error: "Invalid date; use ISO format (e.g. YYYY-MM-DD)." };
  return { valid: true };
}

/** Whether agreement/KYC value counts as complete (string date or legacy boolean true) */
function isAgreementOrKycComplete(value: string | boolean | null | undefined): boolean {
  if (value == null) return false;
  if (value === true) return true;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
}

// Count how many onboarding steps are complete
export function getOnboardingProgress(status: OnboardingStatus | null): { completed: number; total: number } {
  if (!status) return { completed: 0, total: 7 };
  const total = 7;
  let completed = 0;
  if (isAgreementOrKycComplete(status.agreementSigned)) completed++;
  if (isAgreementOrKycComplete(status.kycVerified)) completed++;
  if (status.toolstackComplete) completed++;
  if (status.computeBudgetAcknowledged) completed++;
  if (status.frameworkIntroComplete) completed++;
  if (status.browserSetupComplete) completed++;
  if (status.ventureCreated) completed++;
  return { completed, total };
}

export function isOnboardingComplete(status: OnboardingStatus | null): boolean {
  if (!status) return false;
  const { completed, total } = getOnboardingProgress(status);
  return completed === total;
}
