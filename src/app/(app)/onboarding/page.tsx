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
      if (result.success) {
        setState((prev) =>
          prev ? { ...prev, status: result.status } : prev
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
              Signed on{" "}
              {new Date(status.agreementSigned).toLocaleDateString()}
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
              Verified on{" "}
              {new Date(status.kycVerified).toLocaleDateString()}
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
        <div className="mt-4 space-y-3">
          {TOOLSTACK_ITEMS.map((tool) => (
            <div
              key={tool.id}
              className="flex items-start gap-3 p-3 bg-background"
              style={{ borderRadius: 2 }}
            >
              <input
                type="checkbox"
                checked={toolChecks[tool.id] || false}
                onChange={(e) => handleToolCheck(tool.id, e.target.checked)}
                disabled={status.toolstackComplete || saving === "toolstackComplete"}
                className="mt-1 accent-accent"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tool.name}</span>
                  <span className="text-muted text-xs">
                    ({tool.recommended})
                  </span>
                </div>
                <p className="text-muted text-sm mt-0.5">
                  {tool.description}
                </p>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent text-sm hover:underline mt-1 inline-block"
                >
                  {tool.link} &rarr;
                </a>
              </div>
            </div>
          ))}
          {saving === "toolstackComplete" && (
            <div className="text-muted text-sm">Saving...</div>
          )}
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
        <button
          onClick={handleComplete}
          disabled={!status.ventureCreated || completing}
          className="px-6 py-3 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderRadius: 2 }}
        >
          {completing ? "Setting up..." : "Begin Building \u2192"}
        </button>
        {!status.ventureCreated && (
          <p className="text-muted text-sm mt-3">
            Create your venture above to unlock this step.
          </p>
        )}
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
