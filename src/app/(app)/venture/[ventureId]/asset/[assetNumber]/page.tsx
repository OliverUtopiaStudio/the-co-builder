"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { stages } from "@/lib/data";
import {
  getWorkflowForAsset,
  type Question,
  type WorkflowStep,
} from "@/lib/questions";
import { formatFileSize } from "@/lib/utils";
import { saveAssetToDrive } from "@/app/actions/google-drive";
import { EXPERIENCE_PROFILE_LABELS } from "@/lib/onboarding";
import {
  getGuidanceTip,
  getAssetGuidance,
  getExperienceExample,
  getAssetResources,
  getAdaptiveDescription,
} from "@/lib/guidance";
import AssetNavigation from "@/components/navigation/AssetNavigation";
import { getAssetRequirementsForVenture } from "@/app/actions/ventures";

// Profile-specific contextual tip for framework questions (simplified vs detailed language)
const QUESTION_CONTEXT_TIPS: Record<string, string> = {
  first_time_builder:
    "Take your time with each question — there are no wrong answers at this stage. Add as much detail as feels useful.",
  experienced_founder:
    "You know the drill — be concise and specific. Quality over quantity.",
  corporate_innovator:
    "Think founder, not memo: be direct and actionable. Avoid corporate jargon.",
};

// Find asset metadata from data.ts
function findAsset(assetNumber: number) {
  for (const stage of stages) {
    for (const asset of stage.assets) {
      if (asset.number === assetNumber) {
        return { asset, stage };
      }
    }
  }
  return null;
}

// Get the next/prev asset numbers
function getAdjacentAssets(assetNumber: number) {
  const allAssets = stages.flatMap((s) => s.assets.map((a) => a.number));
  const idx = allAssets.indexOf(assetNumber);
  return {
    prev: idx > 0 ? allAssets[idx - 1] : null,
    next: idx < allAssets.length - 1 ? allAssets[idx + 1] : null,
  };
}

// Validate a single question's value
function validateQuestion(question: Question, value: unknown): string | null {
  // Required check
  if (question.required) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return "This field is required";
    }
  }

  // Skip further checks if empty and not required
  if (value === undefined || value === null || value === "") {
    return null;
  }

  // maxLength check
  if (question.maxLength && typeof value === "string" && value.length > question.maxLength) {
    return `Maximum ${question.maxLength} characters`;
  }

  // Number range checks
  if (question.type === "number" && typeof value === "number") {
    if (question.min !== undefined && value < question.min) {
      return `Minimum value is ${question.min}`;
    }
    if (question.max !== undefined && value > question.max) {
      return `Maximum value is ${question.max}`;
    }
  }

  // URL format check
  if (question.type === "url" && typeof value === "string" && value.length > 0) {
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return "Please enter a valid URL";
    }
  }

  return null;
}

// Get all required questions across all workflow steps
function getAllRequiredQuestions(workflow: { steps: WorkflowStep[] }): Question[] {
  return workflow.steps.flatMap((step) => step.questions.filter((q) => q.required));
}

export default function AssetWorkflowPage() {
  const { ventureId, assetNumber: assetNumStr } = useParams<{
    ventureId: string;
    assetNumber: string;
  }>();
  const router = useRouter();
  const assetNumber = parseInt(assetNumStr, 10);
  const assetInfo = findAsset(assetNumber);
  const workflow = getWorkflowForAsset(assetNumber);
  const { prev, next } = getAdjacentAssets(assetNumber);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [experienceProfile, setExperienceProfile] = useState<string | null>(null);
  const [completedAssets, setCompletedAssets] = useState<Set<number>>(new Set());
  const [assetRequirements, setAssetRequirements] = useState<Record<number, boolean>>({});
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Load existing responses
  const loadResponses = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
        const supabase = createClient();

        // Fetch responses
        const { data: respData } = await supabase
          .from("responses")
          .select("question_id, value")
          .eq("venture_id", ventureId)
          .eq("asset_number", assetNumber);

        if (respData) {
          const vals: Record<string, unknown> = {};
          respData.forEach((r: { question_id: string; value: unknown }) => {
            vals[r.question_id] = r.value;
          });
          setValues(vals);
        }

        // Check completion
        const { data: compData } = await supabase
          .from("asset_completion")
          .select("is_complete")
          .eq("venture_id", ventureId)
          .eq("asset_number", assetNumber)
          .single();

        if (compData) {
          setIsComplete(compData.is_complete);
        }

        // Load all completed assets for navigation
        const { data: allCompletions } = await supabase
          .from("asset_completion")
          .select("asset_number, is_complete")
          .eq("venture_id", ventureId)
          .eq("is_complete", true);

        if (allCompletions) {
          setCompletedAssets(new Set(allCompletions.map((c) => c.asset_number)));
        }

        // Load asset requirements
        const requirements = await getAssetRequirementsForVenture(ventureId);
        setAssetRequirements(requirements);

        // Fetch fellow's experience profile (for conditional guidance)
        const { data: ventureData } = await supabase
          .from("ventures")
          .select("fellow_id")
          .eq("id", ventureId)
          .single();

        if (ventureData?.fellow_id) {
          const { data: fellowData } = await supabase
            .from("fellows")
            .select("experience_profile")
            .eq("id", ventureData.fellow_id)
            .single();

          if (fellowData?.experience_profile) {
            setExperienceProfile(fellowData.experience_profile);
          }
        }
      } catch (err) {
        console.error("Failed to load responses:", err);
        setLoadError(err instanceof Error ? err.message : "Failed to load asset");
      } finally {
        setLoading(false);
      }
  }, [ventureId, assetNumber]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  // Auto-save a response
  const saveValue = useCallback(
    async (questionId: string, value: unknown) => {
      setSaving((prev) => ({ ...prev, [questionId]: true }));
      setSaved((prev) => ({ ...prev, [questionId]: false }));

      try {
        const supabase = createClient();

        // Upsert response
        const { data: existing } = await supabase
          .from("responses")
          .select("id")
          .eq("venture_id", ventureId)
          .eq("asset_number", assetNumber)
          .eq("question_id", questionId)
          .single();

        if (existing) {
          await supabase
            .from("responses")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase.from("responses").insert({
            venture_id: ventureId,
            asset_number: assetNumber,
            question_id: questionId,
            value,
          });
        }

        setSaved((prev) => ({ ...prev, [questionId]: true }));
        setTimeout(() => {
          setSaved((prev) => ({ ...prev, [questionId]: false }));
        }, 2000);
      } catch (err) {
        console.error("Failed to save:", err);
      } finally {
        setSaving((prev) => ({ ...prev, [questionId]: false }));
      }
    },
    [ventureId, assetNumber]
  );

  // Debounced change handler
  const handleChange = useCallback(
    (questionId: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [questionId]: value }));
      // Clear validation error when user starts typing
      setValidationErrors((prev) => ({ ...prev, [questionId]: null }));

      // Clear existing timeout
      if (saveTimeouts.current[questionId]) {
        clearTimeout(saveTimeouts.current[questionId]);
      }

      // Set new debounced save
      saveTimeouts.current[questionId] = setTimeout(() => {
        saveValue(questionId, value);
      }, 1500);
    },
    [saveValue]
  );

  // Immediate save on blur + validation
  const handleBlur = useCallback(
    (questionId: string, question?: Question) => {
      if (saveTimeouts.current[questionId]) {
        clearTimeout(saveTimeouts.current[questionId]);
      }
      const value = values[questionId];
      if (value !== undefined && value !== "") {
        saveValue(questionId, value);
      }
      // Run validation if question definition provided
      if (question) {
        const error = validateQuestion(question, value);
        setValidationErrors((prev) => ({ ...prev, [questionId]: error }));
      }
    },
    [saveValue, values]
  );

  // File upload handler
  const handleFileUpload = useCallback(
    async (questionId: string, file: File) => {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: true }));

      try {
        const supabase = createClient();
        const path = `${ventureId}/${assetNumber}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("venture-assets")
          .upload(path, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return;
        }

        // Save file info
        await supabase.from("uploads").insert({
          venture_id: ventureId,
          asset_number: assetNumber,
          question_id: questionId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: path,
        });

        // Save reference as response
        const fileValue = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storagePath: path,
        };
        setValues((prev) => ({ ...prev, [questionId]: fileValue }));
        await saveValue(questionId, fileValue);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploadingFiles((prev) => ({ ...prev, [questionId]: false }));
      }
    },
    [ventureId, assetNumber, saveValue]
  );

  // Save to Google Drive
  const handleSaveToDrive = useCallback(async () => {
    setSavingToDrive(true);
    setDriveSaveError(null);
    setDriveSaveSuccess(false);

    try {
      const title = assetInfo?.asset?.title ?? `Asset ${assetNumber}`;
      const result = await saveAssetToDrive(
        ventureId,
        assetNumber,
        title,
        values
      );

      if (result.success && result.fileUrl) {
        setDriveSaveSuccess(true);
        setTimeout(() => setDriveSaveSuccess(false), 3000);
      } else {
        setDriveSaveError(result.error || "Failed to save to Google Drive");
      }
    } catch (err) {
      console.error("Failed to save to Google Drive:", err);
      setDriveSaveError(err instanceof Error ? err.message : "Failed to save to Google Drive");
    } finally {
      setSavingToDrive(false);
    }
  }, [ventureId, assetNumber, assetInfo?.asset?.title, values]);

  // Mark asset complete/incomplete
  const toggleComplete = useCallback(async () => {
    try {
      const supabase = createClient();
      const newComplete = !isComplete;

      const { data: existing } = await supabase
        .from("asset_completion")
        .select("id")
        .eq("venture_id", ventureId)
        .eq("asset_number", assetNumber)
        .single();

      if (existing) {
        await supabase
          .from("asset_completion")
          .update({
            is_complete: newComplete,
            completed_at: newComplete ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("asset_completion").insert({
          venture_id: ventureId,
          asset_number: assetNumber,
          is_complete: newComplete,
          completed_at: newComplete ? new Date().toISOString() : null,
        });
      }

      setIsComplete(newComplete);
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  }, [ventureId, assetNumber, isComplete]);

  if (!assetInfo || !workflow) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Asset not found</h2>
        <Link
          href={`/venture/${ventureId}`}
          className="text-accent text-sm hover:underline mt-2 block"
        >
          Back to Venture
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading asset...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted">{loadError}</p>
        <button
          onClick={loadResponses}
          className="px-4 py-2 bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          style={{ borderRadius: 2 }}
        >
          Retry
        </button>
        <Link
          href={`/venture/${ventureId}`}
          className="text-sm text-accent hover:underline"
        >
          Back to Venture
        </Link>
      </div>
    );
  }

  const { asset, stage } = assetInfo;
  const currentStep = workflow.steps[currentStepIdx];
  const totalSteps = workflow.steps.length;

  // Calculate step completion
  function isStepComplete(step: WorkflowStep) {
    return step.questions
      .filter((q) => q.required)
      .every((q) => {
        const val = values[q.id];
        return val !== undefined && val !== "" && val !== null;
      });
  }

  const completedSteps = workflow.steps.filter(isStepComplete).length;

  // Find required fields that are still empty (for Mark Complete validation)
  const missingRequiredFields = getAllRequiredQuestions(workflow).filter((q) => {
    const val = values[q.id];
    return val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  });
  const canMarkComplete = missingRequiredFields.length === 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Navigation */}
      <AssetNavigation
        currentAssetNumber={assetNumber}
        ventureId={ventureId}
        currentStageNumber={stage.number}
        completedAssets={completedAssets}
        assetRequirements={assetRequirements}
      />

      {/* Header */}
      <div>
        <Link
          href={`/venture/${ventureId}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          ← Back to {stage.title}
        </Link>

        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 flex items-center justify-center text-lg font-medium shrink-0 ${
              isComplete
                ? "bg-accent text-white"
                : "bg-accent/10 text-accent"
            }`}
            style={{ borderRadius: 2 }}
          >
            {isComplete ? "✓" : `#${asset.number}`}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-medium">{asset.title}</h1>
            <p className="text-muted text-sm mt-1">{asset.purpose}</p>
          </div>
        </div>
      </div>

      {/* Core Question callout */}
      {asset.coreQuestion && (
        <div className="bg-accent/5 border border-accent/20 p-4" style={{ borderRadius: 2 }}>
          <div className="text-xs text-accent font-medium uppercase tracking-wide mb-1">
            Core Question
          </div>
          <p className="text-sm italic">&ldquo;{asset.coreQuestion}&rdquo;</p>
        </div>
      )}

      {/* Experience-based guidance tips */}
      {experienceProfile && (
        <>
          {/* Stage-level guidance */}
          {(() => {
            const stageTip = getGuidanceTip(experienceProfile, stage.number);
            if (!stageTip) return null;
            return (
              <div className="bg-blue-50 border border-blue-200 p-4" style={{ borderRadius: 2 }}>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                  💡 Stage Guidance for {EXPERIENCE_PROFILE_LABELS[experienceProfile as keyof typeof EXPERIENCE_PROFILE_LABELS]}
                </div>
                <p className="text-sm text-blue-800">{stageTip}</p>
              </div>
            );
          })()}
          
          {/* Asset-level guidance */}
          {(() => {
            const assetTip = getAssetGuidance(experienceProfile, assetNumber);
            if (!assetTip) return null;
            return (
              <div className="bg-purple-50 border border-purple-200 p-4" style={{ borderRadius: 2 }}>
                <div className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">
                  🎯 Asset-Specific Guidance
                </div>
                <p className="text-sm text-purple-800">{assetTip}</p>
              </div>
            );
          })()}
        </>
      )}

      {/* Step Progress */}
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
          <span className="text-xs text-muted">
            {completedSteps}/{totalSteps} steps complete
          </span>
        </div>
        <div className="flex gap-1.5">
          {workflow.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIdx(idx)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                idx === currentStepIdx
                  ? "bg-accent"
                  : isStepComplete(step)
                  ? "bg-accent/40"
                  : "bg-border"
              }`}
              title={step.title}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {workflow.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIdx(idx)}
              className={`flex-1 text-center transition-colors ${
                idx === currentStepIdx
                  ? "text-xs font-medium text-accent"
                  : "text-xs text-muted"
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <h2 className="text-lg font-semibold mb-1">{currentStep.title}</h2>
        {currentStep.description && (
          <p className="text-sm text-muted mb-6">{currentStep.description}</p>
        )}
        {experienceProfile && QUESTION_CONTEXT_TIPS[experienceProfile] && (
          <p className="text-xs text-muted italic mb-4 pl-3 border-l-2 border-accent/30">
            {QUESTION_CONTEXT_TIPS[experienceProfile]}
          </p>
        )}

        <div className="space-y-6">
          {currentStep.questions.map((question) => {
            // Get experience-specific example if available
            const experienceExample = experienceProfile
              ? getExperienceExample(assetNumber, question.id, experienceProfile)
              : null;
            
            // Get adaptive description if available
            const adaptiveDesc = experienceProfile
              ? getAdaptiveDescription(assetNumber, question.id, experienceProfile)
              : null;
            
            // Build question with experience-specific adaptations
            const questionAdapted = {
              ...question,
              ...(experienceExample ? { placeholder: experienceExample } : {}),
              ...(adaptiveDesc ? { description: adaptiveDesc } : {}),
            };
            
            return (
              <QuestionField
                key={question.id}
                question={questionAdapted}
                value={values[question.id]}
                onChange={(val) => handleChange(question.id, val)}
                onBlur={() => handleBlur(question.id, question)}
                onFileUpload={(file) => handleFileUpload(question.id, file)}
                isSaving={saving[question.id] || false}
                isSaved={saved[question.id] || false}
                isUploading={uploadingFiles[question.id] || false}
                validationError={validationErrors[question.id] || null}
              />
            );
          })}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
          disabled={currentStepIdx === 0}
          className="px-4 py-2 border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderRadius: 2 }}
        >
          ← Previous Step
        </button>

        {currentStepIdx < totalSteps - 1 ? (
          <button
            onClick={() =>
              setCurrentStepIdx(Math.min(totalSteps - 1, currentStepIdx + 1))
            }
            className="px-4 py-2 bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Next Step →
          </button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveToDrive}
                disabled={savingToDrive || Object.keys(values).length === 0}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  savingToDrive || Object.keys(values).length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : driveSaveSuccess
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                style={{ borderRadius: 2 }}
              >
                {savingToDrive
                  ? "Saving..."
                  : driveSaveSuccess
                  ? "✓ Saved to Drive"
                  : "Save to Drive"}
              </button>
              <button
                onClick={toggleComplete}
                disabled={!isComplete && !canMarkComplete}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  isComplete
                    ? "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
                    : canMarkComplete
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-accent/40 text-white/60 cursor-not-allowed"
                }`}
                style={{ borderRadius: 2 }}
              >
                {isComplete ? "✓ Marked Complete" : "Mark as Complete"}
              </button>
            </div>
            {driveSaveError && (
              <p className="text-xs text-red-600 text-right">{driveSaveError}</p>
            )}
            {!isComplete && !canMarkComplete && (
              <div className="text-right max-w-xs">
                <p className="text-red-500 text-xs">
                  {missingRequiredFields.length} required field{missingRequiredFields.length !== 1 ? "s" : ""} missing:{" "}
                  {missingRequiredFields.map((q) => q.label).join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resource Recommendations */}
      {experienceProfile && (() => {
        const resources = getAssetResources(experienceProfile, assetNumber);
        if (resources.length === 0) return null;
        return (
          <div className="bg-green-50 border border-green-200 p-4" style={{ borderRadius: 2 }}>
            <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-2">
              📚 Recommended Resources
            </div>
            <div className="space-y-2">
              {resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-green-800 hover:text-green-900 hover:underline"
                >
                  <span className="font-medium">{resource.label}</span>
                  {resource.description && (
                    <span className="text-xs text-green-700 ml-2">— {resource.description}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Asset Navigation */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        {prev !== null ? (
          <Link
            href={`/venture/${ventureId}/asset/${prev}`}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Asset #{prev}
          </Link>
        ) : (
          <div />
        )}
        {next !== null ? (
          <Link
            href={`/venture/${ventureId}/asset/${next}`}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Asset #{next} →
          </Link>
        ) : (
          <Link
            href={`/venture/${ventureId}`}
            className="text-sm text-accent hover:underline"
          >
            Back to Venture Overview
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Question Field Component ──────────────────────────────────

function QuestionField({
  question,
  value,
  onChange,
  onBlur,
  onFileUpload,
  isSaving,
  isSaved,
  isUploading,
  validationError,
}: {
  question: Question;
  value: unknown;
  onChange: (val: unknown) => void;
  onBlur: () => void;
  onFileUpload: (file: File) => void;
  isSaving: boolean;
  isSaved: boolean;
  isUploading: boolean;
  validationError: string | null;
}) {
  const strValue = typeof value === "string" ? value : "";
  const fileValue = value && typeof value === "object" && "fileName" in (value as Record<string, unknown>)
    ? (value as { fileName: string; fileSize: number; fileType: string })
    : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <label className="block text-sm font-medium">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-1 shrink-0">
          {isSaving && (
            <span className="text-xs text-muted animate-pulse">Saving...</span>
          )}
          {isSaved && (
            <span className="text-xs text-accent">✓ Saved</span>
          )}
        </div>
      </div>
      {question.description && (
        <p className="text-xs text-muted mb-2">{question.description}</p>
      )}

      {/* Text input */}
      {question.type === "text" && (
        <input
          type="text"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          style={{ borderRadius: 2 }}
        />
      )}

      {/* Textarea */}
      {question.type === "textarea" && (
        <textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          rows={4}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm resize-none"
          style={{ borderRadius: 2 }}
        />
      )}

      {/* Select */}
      {question.type === "select" && (
        <select
          value={strValue}
          onChange={(e) => {
            onChange(e.target.value);
            // Immediate save for selects
            setTimeout(() => onBlur(), 0);
          }}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          style={{ borderRadius: 2 }}
        >
          <option value="">Select...</option>
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Multiselect */}
      {question.type === "multiselect" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const selectedValues = Array.isArray(value)
              ? (value as string[])
              : [];
            const isSelected = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== opt.value)
                      : [...selectedValues, opt.value];
                    onChange(newValues);
                    setTimeout(() => onBlur(), 0);
                  }}
                  className="accent-accent"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Number */}
      {question.type === "number" && (
        <input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          onBlur={onBlur}
          min={question.min}
          max={question.max}
          placeholder={question.placeholder}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          style={{ borderRadius: 2 }}
        />
      )}

      {/* URL */}
      {question.type === "url" && (
        <input
          type="url"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={question.placeholder || "https://..."}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          style={{ borderRadius: 2 }}
        />
      )}

      {/* Rating */}
      {question.type === "rating" && (
        <div className="flex items-center gap-1">
          {Array.from(
            { length: question.max || 10 },
            (_, i) => i + (question.min || 1)
          ).map((n) => (
            <button
              key={n}
              onClick={() => {
                onChange(n);
                setTimeout(() => onBlur(), 0);
              }}
              className={`w-9 h-9 text-sm font-medium transition-colors ${
                value === n
                  ? "bg-accent text-white"
                  : "bg-border/50 hover:bg-border text-foreground"
              }`}
              style={{ borderRadius: 2 }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Date */}
      {question.type === "date" && (
        <input
          type="date"
          value={strValue}
          onChange={(e) => {
            onChange(e.target.value);
            setTimeout(() => onBlur(), 0);
          }}
          className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          style={{ borderRadius: 2 }}
        />
      )}

      {/* File Upload */}
      {question.type === "file" && (
        <div>
          {fileValue ? (
            <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20" style={{ borderRadius: 2 }}>
              <span className="text-accent">📄</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {fileValue.fileName}
                </div>
                <div className="text-xs text-muted">
                  {formatFileSize(fileValue.fileSize)}
                </div>
              </div>
              <button
                onClick={() => onChange(null)}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border p-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all" style={{ borderRadius: 2 }}>
              <input
                type="file"
                accept={question.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className="hidden"
              />
              {isUploading ? (
                <div className="text-sm text-muted animate-pulse">
                  Uploading...
                </div>
              ) : (
                <>
                  <span className="text-2xl mb-2">📎</span>
                  <span className="text-sm font-medium">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted mt-1">
                    {question.accept
                      ? `Accepted: ${question.accept
                          .split(",")
                          .map((t) => t.split("/").pop()?.toUpperCase())
                          .join(", ")}`
                      : "Any file type"}
                  </span>
                </>
              )}
            </label>
          )}
        </div>
      )}

      {/* Checklist */}
      {question.type === "checklist" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const selectedValues = Array.isArray(value)
              ? (value as string[])
              : [];
            const isChecked = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 border transition-colors cursor-pointer ${
                  isChecked
                    ? "border-accent/30 bg-accent/5"
                    : "border-border hover:border-border/80"
                }`}
                style={{ borderRadius: 2 }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const newValues = isChecked
                      ? selectedValues.filter((v) => v !== opt.value)
                      : [...selectedValues, opt.value];
                    onChange(newValues);
                    setTimeout(() => onBlur(), 0);
                  }}
                  className="accent-accent"
                />
                <span
                  className={`text-sm ${
                    isChecked ? "line-through text-muted" : ""
                  }`}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Table */}
      {question.type === "table" && (
        <TableInput
          question={question}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}

      {/* Character count for textareas with maxLength */}
      {question.maxLength && question.type === "textarea" && (
        <div className="flex items-center justify-between mt-1">
          <span />
          <span
            className={`text-xs ${
              strValue.length > question.maxLength ? "text-red-500" : "text-muted"
            }`}
          >
            {strValue.length} / {question.maxLength} characters
          </span>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}
    </div>
  );
}

// ─── Table Input Component ─────────────────────────────────────

function TableInput({
  question,
  value,
  onChange,
  onBlur,
}: {
  question: Question;
  value: unknown;
  onChange: (val: unknown) => void;
  onBlur: () => void;
}) {
  const columns = question.columns || [];
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const maxRows = question.maxRows || 10;

  function updateCell(rowIdx: number, colKey: string, cellValue: string) {
    const newRows = [...rows];
    if (!newRows[rowIdx]) {
      newRows[rowIdx] = {};
    }
    newRows[rowIdx] = { ...newRows[rowIdx], [colKey]: cellValue };
    onChange(newRows);
  }

  function addRow() {
    if (rows.length < maxRows) {
      const emptyRow: Record<string, string> = {};
      columns.forEach((col) => (emptyRow[col.key] = ""));
      onChange([...rows, emptyRow]);
    }
  }

  function removeRow(idx: number) {
    const newRows = rows.filter((_, i) => i !== idx);
    onChange(newRows);
    setTimeout(() => onBlur(), 0);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-2 py-1.5 border-b border-border font-medium text-muted"
              >
                {col.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col) => (
                <td key={col.key} className="px-1 py-1">
                  {col.type === "select" ? (
                    <select
                      value={row[col.key] || ""}
                      onChange={(e) => updateCell(rowIdx, col.key, e.target.value)}
                      onBlur={onBlur}
                      className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                    >
                      <option value="">Select...</option>
                      {col.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      value={row[col.key] || ""}
                      onChange={(e) => updateCell(rowIdx, col.key, e.target.value)}
                      onBlur={onBlur}
                      className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                  )}
                </td>
              ))}
              <td className="px-1 py-1">
                <button
                  onClick={() => removeRow(rowIdx)}
                  className="text-muted hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length < maxRows && (
        <button
          onClick={addRow}
          className="mt-2 text-xs text-accent hover:underline"
        >
          + Add row
        </button>
      )}
    </div>
  );
}
