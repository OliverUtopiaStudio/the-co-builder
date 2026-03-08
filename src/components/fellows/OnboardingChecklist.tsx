"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Loader2 } from "lucide-react";
import type { OnboardingStatus } from "@/lib/onboarding";
import {
  ONBOARDING_CHECKLIST_STEPS,
  formatOnboardingDate,
  isOnboardingStepComplete,
} from "@/lib/onboarding";
import { updateFellowOnboarding } from "@/app/actions/fellows";

const STIPEND_EMAIL = "Koleen@utopia-studio.co";

type Props = {
  status: OnboardingStatus | null;
  fellowName: string;
  /** Fellow view: read-only + Request stipend. Studio view: can mark agreement/KYC. */
  readOnly: boolean;
  fellowId?: string;
};

export default function OnboardingChecklist({
  status,
  fellowName,
  readOnly,
  fellowId,
}: Props) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMarkComplete = async (key: "agreementSigned" | "kycVerified") => {
    if (!fellowId || readOnly) return;
    setUpdating(key);
    setError(null);
    try {
      const date = new Date().toISOString().split("T")[0];
      await updateFellowOnboarding(fellowId, { [key]: date });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const requestStipendUrl = `mailto:${STIPEND_EMAIL}?subject=${encodeURIComponent(
    `Stipend request – ${fellowName}`
  )}&body=${encodeURIComponent(
    `Hi Koleen,\n\nI would like to request my stipend.\n\nFellow: ${fellowName}\n\nThank you.`
  )}`;

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {ONBOARDING_CHECKLIST_STEPS.map(({ key, label, adminOnly }) => {
          const complete = isOnboardingStepComplete(status, key);
          const value = status?.[key];
          const isDateField = key === "agreementSigned" || key === "kycVerified";
          const formattedDate =
            isDateField && value != null && value !== false
              ? formatOnboardingDate(value as string)
              : null;

          return (
            <li
              key={key}
              className="flex items-center gap-3 text-sm"
            >
              {complete ? (
                <Check
                  className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                  aria-hidden
                />
              ) : (
                <Circle
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden
                />
              )}
              <span className={complete ? "text-foreground" : "text-muted"}>
                {label}
              </span>
              {formattedDate && (
                <span className="text-xs text-muted ml-auto">
                  {formattedDate}
                </span>
              )}
              {!readOnly && fellowId && adminOnly && (
                <span className="ml-auto">
                  {complete ? (
                    <span className="text-xs text-muted">Done</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkComplete(key as "agreementSigned" | "kycVerified")}
                      disabled={!!updating}
                      className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                    >
                      {updating === key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                      ) : (
                        "Mark complete"
                      )}
                    </button>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {readOnly && (
        <div className="pt-2">
          <a
            href={requestStipendUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity touch-manipulation min-h-[44px]"
            style={{ borderRadius: 2 }}
          >
            Request stipend
          </a>
          <p className="text-xs text-muted mt-1.5">
            Opens your email to {STIPEND_EMAIL}
          </p>
        </div>
      )}
    </div>
  );
}
