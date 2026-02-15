"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getOnboardingState,
  updateOnboardingStep,
  completeOnboarding,
} from "@/app/actions/onboarding";
import {
  type OnboardingStatus,
  TOOLSTACK_ITEMS,
  RECOMMENDED_COMPUTE_STACK,
  getOnboardingProgress,
  formatOnboardingDate,
} from "@/lib/onboarding";
import { stages } from "@/lib/data";

interface OnboardingState {
  fellow: {
    id: string;
    fullName: string;
    email: string;
    lifecycleStage: string | null;
    experienceProfile: string | null;
  };
  status: OnboardingStatus;
  hasVenture: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [toolChecks, setToolChecks] = useState<Record<string, boolean>>({
    claude: false,
    github: false,
    markdown: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getOnboardingState();
        setState(data as OnboardingState);

        // If toolstack is already complete, pre-check all tools
        if (data.status.toolstackComplete) {
          setToolChecks({ claude: true, github: true, markdown: true });
        }
      } catch (err) {
        console.error("Failed to load onboarding state:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStepUpdate(
    step: keyof OnboardingStatus,
    value: boolean
  ) {
    if (!state) return;
    setSaving(step as string);
    try {
      const result = await updateOnboardingStep(step, value);
      if (result.success && result.status != null) {
        setState((prev) =>
          prev ? { ...prev, status: result.status! } : prev
        );
      }
    } catch (err) {
      console.error("Failed to update step:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleToolCheck(toolId: string, checked: boolean) {
    const updated = { ...toolChecks, [toolId]: checked };
    setToolChecks(updated);

    // If all tools are checked, mark toolstack complete
    const allChecked = Object.values(updated).every(Boolean);
    if (allChecked && state && !state.status.toolstackComplete) {
      await handleStepUpdate("toolstackComplete", true);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const result = await completeOnboarding();
      if ("error" in result) {
        alert(result.error);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading onboarding...</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">
          Unable to load onboarding state. Please try refreshing.
        </div>
      </div>
    );
  }

  const { status, hasVenture, fellow } = state;
  const progress = getOnboardingProgress(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Onboarding</div>
        <h1 className="text-2xl font-medium">
          Welcome, {fellow.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted text-sm mt-1">
          Complete these steps to get started with The Co-Builder.
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="bg-surface border border-border p-4"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {progress.completed}/{progress.total} steps complete
          </span>
          <span className="text-muted text-sm">
            {Math.round((progress.completed / progress.total) * 100)}%
          </span>
        </div>
        <div
          className="w-full h-2 bg-background"
          style={{ borderRadius: 2 }}
        >
          <div
            className="h-2 bg-accent transition-all duration-300"
            style={{
              borderRadius: 2,
              width: `${(progress.completed / progress.total) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step 1: Participation Agreement */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 1</div>
            <h2 className="text-lg font-medium">Participation Agreement</h2>
            <p className="text-muted text-sm mt-1">
              Your fellowship participation agreement must be signed before
              proceeding.
            </p>
          </div>
          <StepIndicator complete={!!status.agreementSigned} />
        </div>
        <div className="mt-4">
          {status.agreementSigned ? (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 inline-block" style={{ borderRadius: 2 }}>
              Signed
              {formatOnboardingDate(status.agreementSigned) && formatOnboardingDate(status.agreementSigned) !== "Complete"
                ? ` on ${formatOnboardingDate(status.agreementSigned)}`
                : ""}
            </div>
          ) : (
            <div className="text-muted text-sm">
              Pending -- your studio team will mark this when complete.
            </div>
          )}
        </div>
      </div>

      {/* Step 2: KYC / Identity */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 2</div>
            <h2 className="text-lg font-medium">KYC / Identity Verification</h2>
            <p className="text-muted text-sm mt-1">
              Identity verification is required for compliance.
            </p>
          </div>
          <StepIndicator complete={!!status.kycVerified} />
        </div>
        <div className="mt-4">
          {status.kycVerified ? (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 inline-block" style={{ borderRadius: 2 }}>
              Verified
              {formatOnboardingDate(status.kycVerified) && formatOnboardingDate(status.kycVerified) !== "Complete"
                ? ` on ${formatOnboardingDate(status.kycVerified)}`
                : ""}
            </div>
          ) : (
            <div className="text-muted text-sm">
              Pending -- your studio team will mark this when complete.
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Toolstack Setup */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 3</div>
            <h2 className="text-lg font-medium">Toolstack Setup</h2>
            <p className="text-muted text-sm mt-1">
              Set up the core tools you will use throughout the programme.
            </p>
          </div>
          <StepIndicator complete={status.toolstackComplete} />
        </div>
        <div className="mt-4 space-y-4">
          {TOOLSTACK_ITEMS.map((tool) => (
            <div
              key={tool.id}
              className="bg-background border border-border p-4"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={toolChecks[tool.id] || false}
                  onChange={(e) => handleToolCheck(tool.id, e.target.checked)}
                  disabled={status.toolstackComplete || saving === "toolstackComplete"}
                  className="mt-1 accent-accent w-5 h-5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold">{tool.name}</span>
                    <span className="text-muted text-xs">
                      ({tool.recommended})
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    {tool.description}
                  </p>
                  
                  {/* Enhanced "Why you need this" section */}
                  <div className="bg-surface p-3 mb-3" style={{ borderRadius: 2 }}>
                    <div className="text-xs font-medium text-foreground mb-1">
                      Why you need this:
                    </div>
                    <ul className="text-xs text-foreground space-y-0.5">
                      {tool.id === "claude" && (
                        <>
                          <li>→ Review your asset responses before submission</li>
                          <li>→ Get suggestions for improvement</li>
                          <li>→ Learn concepts as you build</li>
                        </>
                      )}
                      {tool.id === "github" && (
                        <>
                          <li>→ Track changes to your venture documents</li>
                          <li>→ Collaborate with studio team</li>
                          <li>→ Build a portfolio of your work</li>
                        </>
                      )}
                      {tool.id === "markdown" && (
                        <>
                          <li>→ Export assets as markdown files</li>
                          <li>→ Create pitch decks and documents</li>
                          <li>→ Standard format for AI tools</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* "How you'll use it" section */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-muted mb-1 italic">
                      How you&apos;ll use it:
                    </div>
                    <div className="text-xs text-muted">
                      {tool.id === "claude" && "Daily: Review and improve your work | Weekly: Deep dives on complex concepts"}
                      {tool.id === "github" && "Daily: Commit your asset work | Weekly: Review changes with studio team"}
                      {tool.id === "markdown" && "Daily: Write asset responses | Weekly: Export to Google Drive"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-sm font-medium hover:underline"
                    >
                      Get Started →
                    </a>
                    {toolChecks[tool.id] && (
                      <span className="text-xs text-muted">Already have it?</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {saving === "toolstackComplete" && (
            <div className="text-muted text-sm">Saving...</div>
          )}
          
          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {Object.values(toolChecks).filter(Boolean).length}/{TOOLSTACK_ITEMS.length} tools ready
              </span>
            </div>
            <div className="w-full bg-border/50 h-2" style={{ borderRadius: 2 }}>
              <div
                className="h-full bg-accent transition-all"
                style={{
                  borderRadius: 2,
                  width: `${(Object.values(toolChecks).filter(Boolean).length / TOOLSTACK_ITEMS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Compute Budget */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 4</div>
            <h2 className="text-lg font-medium">Compute Budget</h2>
            <p className="text-muted text-sm mt-1">
              Review the recommended compute stack allocation for your
              fellowship.
            </p>
          </div>
          <StepIndicator complete={status.computeBudgetAcknowledged} />
        </div>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 font-medium">Tool</th>
                <th className="text-left py-2 pr-3 font-medium">Allocation</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {RECOMMENDED_COMPUTE_STACK.map((item) => (
                <tr key={item.tool} className="border-b border-border">
                  <td className="py-2 pr-3 font-medium">{item.tool}</td>
                  <td className="py-2 pr-3 text-accent font-medium">
                    {item.allocation}
                  </td>
                  <td className="py-2">
                    <span className="text-muted">{item.description}</span>
                    {item.link && (
                      <>
                        {" "}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          &rarr;
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!status.computeBudgetAcknowledged && (
            <button
              onClick={() =>
                handleStepUpdate("computeBudgetAcknowledged", true)
              }
              disabled={saving === "computeBudgetAcknowledged"}
              className="mt-4 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {saving === "computeBudgetAcknowledged"
                ? "Saving..."
                : "I understand"}
            </button>
          )}
        </div>
      </div>

      {/* Step 5: Framework Introduction */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 5</div>
            <h2 className="text-lg font-medium">Framework Introduction</h2>
            <p className="text-muted text-sm mt-1">
              The Co-Build framework guides your venture through 7 stages, each
              with specific assets to complete.
            </p>
          </div>
          <StepIndicator complete={status.frameworkIntroComplete} />
        </div>
        <div className="mt-4 space-y-2">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-start gap-3 p-3 bg-background"
              style={{ borderRadius: 2 }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent/10 text-accent text-sm font-semibold"
                style={{ borderRadius: 2 }}
              >
                {stage.number}
              </div>
              <div>
                <div className="text-sm font-medium">{stage.title}</div>
                <div className="text-muted text-sm">{stage.subtitle}</div>
                <div className="text-muted text-xs mt-0.5">
                  {stage.assets.length} asset
                  {stage.assets.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
          {!status.frameworkIntroComplete && (
            <button
              onClick={() =>
                handleStepUpdate("frameworkIntroComplete", true)
              }
              disabled={saving === "frameworkIntroComplete"}
              className="mt-2 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {saving === "frameworkIntroComplete" ? "Saving..." : "Got it"}
            </button>
          )}
        </div>
      </div>

      {/* Step 6: Browser Setup */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 6</div>
            <h2 className="text-lg font-medium">Browser Setup</h2>
            <p className="text-muted text-sm mt-1">
              Save The Co-Builder to your Chrome toolbar for quick daily access.
            </p>
          </div>
          <StepIndicator complete={status.browserSetupComplete} />
        </div>
        <div className="mt-4">
          <div
            className="p-3 bg-background text-sm text-muted"
            style={{ borderRadius: 2 }}
          >
            Click the three-dot menu in Chrome, then select &quot;Cast, save,
            and share&quot; and choose &quot;Install page as app&quot; or
            &quot;Create shortcut&quot;. This is your daily workspace.
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={status.browserSetupComplete}
              onChange={(e) =>
                handleStepUpdate("browserSetupComplete", e.target.checked)
              }
              disabled={
                status.browserSetupComplete ||
                saving === "browserSetupComplete"
              }
              className="accent-accent"
            />
            <span className="text-sm">
              {saving === "browserSetupComplete"
                ? "Saving..."
                : "I've added the shortcut"}
            </span>
          </label>
        </div>
      </div>

      {/* Step 7: Create Your Venture */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-uppercase mb-2">Step 7</div>
            <h2 className="text-lg font-medium">Create Your Venture</h2>
            <p className="text-muted text-sm mt-1">
              Set up your venture to begin working through the framework.
            </p>
          </div>
          <StepIndicator complete={status.ventureCreated} />
        </div>
        <div className="mt-4">
          {hasVenture ? (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 inline-block" style={{ borderRadius: 2 }}>
              Venture created
            </div>
          ) : (
            <Link
              href="/venture/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Create Your Venture &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Begin Building Button */}
      <div
        className="bg-surface border border-border p-6 text-center"
        style={{ borderRadius: 2 }}
      >
        {(() => {
          const allComplete = progress.completed === progress.total;
          const missingSteps: string[] = [];
          if (!status.agreementSigned) missingSteps.push("Participation Agreement");
          if (!status.kycVerified) missingSteps.push("KYC Verification");
          if (!status.toolstackComplete) missingSteps.push("Toolstack Setup");
          if (!status.computeBudgetAcknowledged) missingSteps.push("Compute Budget");
          if (!status.frameworkIntroComplete) missingSteps.push("Framework Introduction");
          if (!status.browserSetupComplete) missingSteps.push("Browser Setup");
          if (!status.ventureCreated) missingSteps.push("Create Venture");

          return (
            <>
              <button
                onClick={handleComplete}
                disabled={!allComplete || completing}
                className="px-6 py-3 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: 2 }}
              >
                {completing ? "Setting up..." : "Begin Building \u2192"}
              </button>
              {!allComplete && (
                <div className="mt-3">
                  <p className="text-muted text-sm">
                    Complete all steps above to begin building.
                  </p>
                  {missingSteps.length <= 3 && (
                    <p className="text-xs text-muted mt-1">
                      Remaining: {missingSteps.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

function StepIndicator({ complete }: { complete: boolean }) {
  return (
    <div
      className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-semibold ${
        complete
          ? "bg-green-100 text-green-700"
          : "bg-background text-muted"
      }`}
      style={{ borderRadius: 2 }}
    >
      {complete ? "\u2713" : "\u2022"}
    </div>
  );
}
