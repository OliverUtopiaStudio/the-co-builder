"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getFellowById,
  getVenturesForFellow,
  updateFellowExperienceProfile,
  updateFellowLifecycleStage,
  updateFellowOnboardingAdmin,
  updateFellowDetails,
  getAllPods,
  updateFellowPod,
} from "@/app/actions/admin";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_COLORS,
  EXPERIENCE_PROFILE_LABELS,
  getOnboardingProgress,
} from "@/lib/onboarding";
import type {
  OnboardingStatus,
  LifecycleStage,
  ExperienceProfile,
} from "@/lib/onboarding";

// ─── Types ───────────────────────────────────────────────────────

interface Fellow {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  bio: string | null;
  linkedinUrl: string | null;
  lifecycleStage: string;
  experienceProfile: string | null;
  domain: string | null;
  background: string | null;
  selectionRationale: string | null;
  onboardingStatus: OnboardingStatus | null;
  podId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ROLE_LABELS: Record<string, string> = {
  fellow: "Fellow",
  studio: "Studio",
  admin: "Admin",
  stakeholder: "Stakeholder",
};

interface PodInfo {
  id: string;
  name: string;
  color: string | null;
}

interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  googleDriveUrl: string | null;
  createdAt: Date;
}

// ─── Onboarding step definitions ─────────────────────────────────

const ONBOARDING_STEPS: {
  key: keyof OnboardingStatus;
  label: string;
  adminTracked: boolean;
}[] = [
  { key: "agreementSigned", label: "Fellowship Agreement Signed", adminTracked: true },
  { key: "kycVerified", label: "KYC Verified", adminTracked: true },
  { key: "toolstackComplete", label: "Toolstack Setup", adminTracked: false },
  { key: "computeBudgetAcknowledged", label: "Compute Budget Acknowledged", adminTracked: false },
  { key: "frameworkIntroComplete", label: "Framework Introduction", adminTracked: false },
  { key: "browserSetupComplete", label: "Browser Setup", adminTracked: false },
  { key: "ventureCreated", label: "Venture Created", adminTracked: false },
];

// ─── Page Component ──────────────────────────────────────────────

export default function AdminFellowDetailPage() {
  const params = useParams();
  const fellowId = params.fellowId as string;

  const [fellow, setFellow] = useState<Fellow | null>(null);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [allPodsList, setAllPodsList] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Editable fellow detail fields
  const [domain, setDomain] = useState("");
  const [background, setBackground] = useState("");
  const [selectionRationale, setSelectionRationale] = useState("");

  // ─── Load data ─────────────────────────────────────────────────

  async function loadData() {
    try {
      const [fellowData, ventureData, podsData] = await Promise.all([
        getFellowById(fellowId),
        getVenturesForFellow(fellowId),
        getAllPods(),
      ]);
      if (fellowData) {
        setFellow(fellowData as Fellow);
        setDomain(fellowData.domain || "");
        setBackground(fellowData.background || "");
        setSelectionRationale(fellowData.selectionRationale || "");
      }
      if (ventureData) setVentures(ventureData as Venture[]);
      if (podsData) setAllPodsList(podsData as PodInfo[]);
    } catch (err) {
      console.error("Failed to load fellow:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fellowId]);

  // ─── Action handlers ──────────────────────────────────────────

  async function handleExperienceProfileChange(value: ExperienceProfile) {
    setSaving("experienceProfile");
    try {
      await updateFellowExperienceProfile(fellowId, value);
      setFellow((prev) => prev ? { ...prev, experienceProfile: value } : prev);
    } catch (err) {
      console.error("Failed to update experience profile:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleLifecycleStageChange(value: LifecycleStage) {
    setSaving("lifecycleStage");
    try {
      await updateFellowLifecycleStage(fellowId, value);
      setFellow((prev) => prev ? { ...prev, lifecycleStage: value } : prev);
    } catch (err) {
      console.error("Failed to update lifecycle stage:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleRoleChange(value: string) {
    setSaving("role");
    try {
      await updateFellowDetails(fellowId, { role: value });
      setFellow((prev) => prev ? { ...prev, role: value } : prev);
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleAgreementToggle() {
    if (!fellow) return;
    const onboarding = fellow.onboardingStatus || {
      agreementSigned: null,
      kycVerified: null,
      toolstackComplete: false,
      computeBudgetAcknowledged: false,
      frameworkIntroComplete: false,
      browserSetupComplete: false,
      ventureCreated: false,
    };
    const newValue = onboarding.agreementSigned ? null : new Date().toISOString();
    setSaving("agreement");
    try {
      await updateFellowOnboardingAdmin(fellowId, "agreementSigned", newValue);
      setFellow((prev) =>
        prev
          ? {
              ...prev,
              onboardingStatus: { ...onboarding, agreementSigned: newValue },
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to update agreement status:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleKycToggle() {
    if (!fellow) return;
    const onboarding = fellow.onboardingStatus || {
      agreementSigned: null,
      kycVerified: null,
      toolstackComplete: false,
      computeBudgetAcknowledged: false,
      frameworkIntroComplete: false,
      browserSetupComplete: false,
      ventureCreated: false,
    };
    const newValue = onboarding.kycVerified ? null : new Date().toISOString();
    setSaving("kyc");
    try {
      await updateFellowOnboardingAdmin(fellowId, "kycVerified", newValue);
      setFellow((prev) =>
        prev
          ? {
              ...prev,
              onboardingStatus: { ...onboarding, kycVerified: newValue },
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to update KYC status:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveDetails() {
    setSaving("details");
    try {
      await updateFellowDetails(fellowId, {
        domain,
        background,
        selectionRationale,
      });
      setFellow((prev) =>
        prev
          ? { ...prev, domain, background, selectionRationale }
          : prev
      );
    } catch (err) {
      console.error("Failed to update fellow details:", err);
    } finally {
      setSaving(null);
    }
  }

  async function handlePodChange(podId: string) {
    setSaving("pod");
    try {
      await updateFellowPod(fellowId, podId || null);
      setFellow((prev) => prev ? { ...prev, podId: podId || null } : prev);
    } catch (err) {
      console.error("Failed to update pod:", err);
    } finally {
      setSaving(null);
    }
  }

  // ─── Loading state ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading fellow details...</div>
      </div>
    );
  }

  if (!fellow) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Fellow not found.</p>
        <Link
          href="/admin/fellows"
          className="text-accent hover:underline mt-2 inline-block"
        >
          Back to Fellows
        </Link>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────

  const onboarding: OnboardingStatus = fellow.onboardingStatus || {
    agreementSigned: null,
    kycVerified: null,
    toolstackComplete: false,
    computeBudgetAcknowledged: false,
    frameworkIntroComplete: false,
    browserSetupComplete: false,
    ventureCreated: false,
  };
  const progress = getOnboardingProgress(onboarding);
  const stage = fellow.lifecycleStage as LifecycleStage;
  const stageLabel = LIFECYCLE_STAGE_LABELS[stage] || fellow.lifecycleStage;
  const stageColor = LIFECYCLE_STAGE_COLORS[stage] || "bg-gray-100 text-gray-700";
  const profileLabel = fellow.experienceProfile
    ? EXPERIENCE_PROFILE_LABELS[fellow.experienceProfile as ExperienceProfile] || fellow.experienceProfile
    : null;

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/admin/fellows"
        className="text-sm text-muted hover:text-foreground inline-block"
      >
        &larr; Back to Fellows
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 bg-accent/10 text-accent flex items-center justify-center font-medium text-xl flex-shrink-0"
            style={{ borderRadius: 2 }}
          >
            {fellow.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-medium">{fellow.fullName}</h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 ${stageColor}`}
                style={{ borderRadius: 2 }}
              >
                {stageLabel}
              </span>
              {profileLabel && (
                <span
                  className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent"
                  style={{ borderRadius: 2 }}
                >
                  {profileLabel}
                </span>
              )}
            </div>
            <p className="text-muted mt-1">{fellow.email}</p>
            <p className="text-xs text-muted mt-1">
              Joined {new Date(fellow.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── User & Lifecycle Controls ───────────────────────────── */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <p className="label-uppercase mb-4">User &amp; Lifecycle</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div>
            <label className="text-sm font-medium block mb-1">
              User Role
            </label>
            <select
              value={fellow.role || "fellow"}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={saving === "role"}
              className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
              style={{ borderRadius: 2 }}
            >
              {(["fellow", "studio", "admin", "stakeholder"] as const).map(
                (r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] || r}
                  </option>
                )
              )}
            </select>
            <p className="text-xs text-muted mt-1">
              Fellow: Co-Build app. Studio: Studio OS. Admin: full access.
              Stakeholder: read-only portfolio.
            </p>
            {saving === "role" && (
              <p className="text-xs text-muted mt-1">Saving...</p>
            )}
          </div>

          {/* Experience Profile */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Experience Profile
            </label>
            <select
              value={fellow.experienceProfile || ""}
              onChange={(e) =>
                handleExperienceProfileChange(e.target.value as ExperienceProfile)
              }
              disabled={saving === "experienceProfile"}
              className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
              style={{ borderRadius: 2 }}
            >
              <option value="">-- Select --</option>
              {(
                Object.entries(EXPERIENCE_PROFILE_LABELS) as [
                  ExperienceProfile,
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {saving === "experienceProfile" && (
              <p className="text-xs text-muted mt-1">Saving...</p>
            )}
          </div>

          {/* Lifecycle Stage */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Lifecycle Stage
            </label>
            <select
              value={fellow.lifecycleStage}
              onChange={(e) =>
                handleLifecycleStageChange(e.target.value as LifecycleStage)
              }
              disabled={saving === "lifecycleStage"}
              className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
              style={{ borderRadius: 2 }}
            >
              {(
                Object.entries(LIFECYCLE_STAGE_LABELS) as [
                  LifecycleStage,
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {saving === "lifecycleStage" && (
              <p className="text-xs text-muted mt-1">Saving...</p>
            )}
          </div>

          {/* Pod Assignment */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Pod Assignment
            </label>
            <select
              value={fellow.podId || ""}
              onChange={(e) => handlePodChange(e.target.value)}
              disabled={saving === "pod"}
              className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
              style={{ borderRadius: 2 }}
            >
              <option value="">-- No Pod --</option>
              {allPodsList.map((pod) => (
                <option key={pod.id} value={pod.id}>
                  {pod.name}
                </option>
              ))}
            </select>
            {saving === "pod" && (
              <p className="text-xs text-muted mt-1">Saving...</p>
            )}
          </div>

          {/* Agreement Status */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Fellowship Agreement
            </label>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 ${
                  onboarding.agreementSigned
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
                style={{ borderRadius: 2 }}
              >
                {onboarding.agreementSigned
                  ? `Signed ${new Date(onboarding.agreementSigned).toLocaleDateString()}`
                  : "Not signed"}
              </span>
              <button
                onClick={handleAgreementToggle}
                disabled={saving === "agreement"}
                className="text-xs px-3 py-1 border border-border hover:border-accent text-foreground"
                style={{ borderRadius: 2 }}
              >
                {saving === "agreement"
                  ? "Saving..."
                  : onboarding.agreementSigned
                    ? "Clear"
                    : "Mark Signed"}
              </button>
            </div>
          </div>

          {/* KYC Status */}
          <div>
            <label className="text-sm font-medium block mb-1">
              KYC Verification
            </label>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 ${
                  onboarding.kycVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
                style={{ borderRadius: 2 }}
              >
                {onboarding.kycVerified
                  ? `Verified ${new Date(onboarding.kycVerified).toLocaleDateString()}`
                  : "Not verified"}
              </span>
              <button
                onClick={handleKycToggle}
                disabled={saving === "kyc"}
                className="text-xs px-3 py-1 border border-border hover:border-accent text-foreground"
                style={{ borderRadius: 2 }}
              >
                {saving === "kyc"
                  ? "Saving..."
                  : onboarding.kycVerified
                    ? "Clear"
                    : "Mark Verified"}
              </button>
            </div>
          </div>
        </div>

        {/* Fellow Details (editable fields) */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="label-uppercase mb-4">Fellow Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Fintech, Healthcare, EdTech"
                className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Background
              </label>
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="e.g. Ex-McKinsey, 5 yrs product at Stripe"
                className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
                style={{ borderRadius: 2 }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">
                Selection Rationale
              </label>
              <textarea
                value={selectionRationale}
                onChange={(e) => setSelectionRationale(e.target.value)}
                placeholder="Why was this fellow selected for the program?"
                rows={3}
                className="w-full border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent resize-none"
                style={{ borderRadius: 2 }}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSaveDetails}
              disabled={saving === "details"}
              className="text-sm px-4 py-2 bg-accent text-white hover:bg-accent/90"
              style={{ borderRadius: 2 }}
            >
              {saving === "details" ? "Saving..." : "Save Details"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Onboarding Progress ────────────────────────────────── */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="label-uppercase">Onboarding Progress</p>
          <span className="text-sm text-muted">
            {progress.completed}/{progress.total} steps complete
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full bg-border h-2 mb-6"
          style={{ borderRadius: 2 }}
        >
          <div
            className="bg-accent h-2 transition-all"
            style={{
              borderRadius: 2,
              width: `${(progress.completed / progress.total) * 100}%`,
            }}
          />
        </div>

        <div className="space-y-3">
          {ONBOARDING_STEPS.map((step) => {
            const value = onboarding[step.key];
            const isComplete = step.adminTracked
              ? !!value
              : !!value;
            const dateStr =
              step.adminTracked && typeof value === "string"
                ? new Date(value).toLocaleDateString()
                : null;

            return (
              <div
                key={step.key}
                className="flex items-center justify-between py-2 px-3 border border-border"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 flex items-center justify-center text-xs ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {isComplete ? "\u2713" : "\u2013"}
                  </div>
                  <span className="text-sm">{step.label}</span>
                  {dateStr && (
                    <span className="text-xs text-muted">({dateStr})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {step.adminTracked ? (
                    <button
                      onClick={
                        step.key === "agreementSigned"
                          ? handleAgreementToggle
                          : handleKycToggle
                      }
                      disabled={
                        saving === "agreement" || saving === "kyc"
                      }
                      className="text-xs px-2 py-0.5 border border-border hover:border-accent text-foreground"
                      style={{ borderRadius: 2 }}
                    >
                      {isComplete ? "Clear" : "Mark Done"}
                    </button>
                  ) : (
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        isComplete
                          ? "text-green-700"
                          : "text-muted"
                      }`}
                    >
                      {isComplete ? "Complete" : "Pending"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ventures ───────────────────────────────────────────── */}
      <div>
        <p className="label-uppercase mb-4">
          Ventures ({ventures.length})
        </p>

        {ventures.length === 0 ? (
          <div
            className="bg-surface border border-border p-8 text-center"
            style={{ borderRadius: 2 }}
          >
            <p className="text-muted">
              This fellow hasn&apos;t created any ventures yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ventures.map((venture) => (
              <Link
                key={venture.id}
                href={`/admin/ventures/${venture.id}`}
                className="block bg-surface border border-border p-5 hover:border-accent/30 transition-colors"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{venture.name}</h3>
                    {venture.description && (
                      <p className="text-muted text-sm mt-1 line-clamp-2">
                        {venture.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {venture.industry && (
                        <span
                          className="text-xs px-2 py-1 bg-accent/10 text-accent font-medium"
                          style={{ borderRadius: 2 }}
                        >
                          {venture.industry}
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        Stage {venture.currentStage || "00"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm flex-shrink-0">
                    {venture.googleDriveUrl && (
                      <span className="text-xs text-accent">Drive linked</span>
                    )}
                    <p className="text-xs text-muted mt-1">
                      Created{" "}
                      {new Date(venture.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
