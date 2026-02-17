// ─── Onboarding Types & Defaults ─────────────────────────────────
// The onboarding_status JSONB column on fellows stores this shape.
// Each step is either a boolean (self-reported), a date string (admin-tracked),
// or null (not yet completed).

export interface OnboardingStatus {
  agreementSigned: string | null;       // ISO date when signed
  agreementSignedBy?: string | null;    // Admin fellow id who marked it
  agreementSignedByName?: string | null;  // Admin name for display
  agreementSignedMarkedAt?: string | null;  // ISO when admin set it
  kycVerified: string | null;           // ISO date when verified
  kycVerifiedBy?: string | null;        // Admin fellow id who marked it
  kycVerifiedByName?: string | null;    // Admin name for display
  kycVerifiedMarkedAt?: string | null;  // ISO when admin set it
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

// Profile-specific "Why you need this" for toolstack items
export const TOOLSTACK_WHY_NEED_THIS: Record<
  string,
  Partial<Record<ExperienceProfile, string[]>>
> = {
  claude: {
    first_time_builder: [
      "→ Review your asset responses before submission — get AI feedback on clarity",
      "→ Learn concepts as you build — ask questions when stuck",
      "→ Get step-by-step guidance on unfamiliar topics",
    ],
    experienced_founder: [
      "→ Speed up research and writing — you know the playbook, let AI handle the drafts",
      "→ Get a second opinion on your venture logic",
      "→ Learn this ecosystem's specifics quickly",
    ],
    corporate_innovator: [
      "→ Bridge the gap between corporate and founder speed — use AI to move faster",
      "→ Translate enterprise concepts into startup language",
      "→ Get founder-style feedback without the bias of internal stakeholders",
    ],
  },
  github: {
    first_time_builder: [
      "→ Track changes to your venture documents — every edit is saved",
      "→ Collaborate with your studio team on feedback",
      "→ Build a portfolio of your work for investors",
    ],
    experienced_founder: [
      "→ Version control for assets — standard practice",
      "→ Collaborate with studio team on reviews",
      "→ Keep your venture docs in one place",
    ],
    corporate_innovator: [
      "→ Version control — different from SharePoint, but same principle",
      "→ Collaborate with studio team on feedback",
      "→ Demonstrates technical fluency to stakeholders",
    ],
  },
  markdown: {
    first_time_builder: [
      "→ Export assets as markdown files for sharing",
      "→ Create pitch decks and documents easily",
      "→ Standard format that works with AI tools",
    ],
    experienced_founder: [
      "→ Export assets to markdown for pitch decks",
      "→ Standard format for AI and collaboration",
      "→ Keeps deliverables portable",
    ],
    corporate_innovator: [
      "→ Markdown is the lingua franca of startups — learn it once",
      "→ Export assets for stakeholder updates",
      "→ Works seamlessly with Claude and other AI tools",
    ],
  },
};

// Profile-specific "How you'll use it" for toolstack
export const TOOLSTACK_HOW_USE_IT: Record<
  string,
  Partial<Record<ExperienceProfile, string>>
> = {
  claude: {
    first_time_builder: "Daily: Review and improve your work | Weekly: Deep dives on concepts you're learning",
    experienced_founder: "Daily: Draft and refine assets | Weekly: Stress-test your venture logic",
    corporate_innovator: "Daily: Accelerate research and writing | Weekly: Reframe enterprise thinking for startups",
  },
  github: {
    first_time_builder: "Daily: Commit your asset work | Weekly: Review changes with studio team",
    experienced_founder: "Daily: Commit asset updates | Weekly: Sync with studio feedback",
    corporate_innovator: "Daily: Commit your work | Weekly: Review changes with studio team",
  },
  markdown: {
    first_time_builder: "Daily: Write asset responses | Weekly: Export to Google Drive",
    experienced_founder: "Daily: Write assets | Weekly: Export for pitch materials",
    corporate_innovator: "Daily: Write asset responses | Weekly: Export for stakeholder updates",
  },
};

// Profile-specific onboarding resource recommendations
export const ONBOARDING_RESOURCES: Record<
  ExperienceProfile,
  { label: string; description: string; link: string }[]
> = {
  first_time_builder: [
    { label: "YC Startup Library", description: "Classic founder resources for first-timers", link: "https://www.ycombinator.com/library" },
    { label: "Paul Graham Essays", description: "Founder thinking in plain language", link: "https://paulgraham.com/articles.html" },
    { label: "Lenny's Newsletter", description: "Product and growth for early-stage", link: "https://www.lennysnewsletter.com" },
  ],
  experienced_founder: [
    { label: "First Round Review", description: "Operator perspectives for scaling", link: "https://review.firstround.com" },
    { label: "NFX Signal", description: "Network effects and venture-building", link: "https://www.nfx.com/signal" },
    { label: "Stripe Atlas", description: "Launch resources and guides", link: "https://stripe.com/atlas" },
  ],
  corporate_innovator: [
    { label: "Corporate Innovation Playbook", description: "From corporate to founder mindset", link: "https://www.ycombinator.com/library" },
    { label: "Steve Blank - Corporate Innovation", description: "Lean startup for intrapreneurs", link: "https://steveblank.com" },
    { label: "a16z Startup School", description: "Startup fundamentals for corporate builders", link: "https://a16z.com/startupschool" },
  ],
};

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
