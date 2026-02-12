"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui";
import LandingHero from "@/components/auth/LandingHero";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
  authErrorStyle,
  authSuccessStyle,
} from "@/components/auth/styles";
import { getSafeRedirect } from "@/lib/safe-redirect";

type LoginMode = "landing" | "fellow" | "studio" | "stakeholder" | "reset";

/* ─── Main login orchestrator ─── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: LoginMode =
    modeParam === "studio"
      ? "studio"
      : modeParam === "stakeholder"
        ? "stakeholder"
        : modeParam === "admin"
          ? "studio"
          : "landing";
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/callback?next=/reset-password`,
        });
      if (resetError) setError(resetError.message);
      else setResetSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const rawRedirect = searchParams.get("redirect");

      const { error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Unable to verify session. Please try again.");
        return;
      }

      const { data: fellow } = await supabase
        .from("fellows")
        .select("role, lifecycle_stage")
        .eq("auth_user_id", user.id)
        .single();

      const target = getSafeRedirect(rawRedirect, "") || getDefaultTarget(mode, fellow?.role);
      if (target) {
        router.push(target);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getDefaultTarget(
    mode: LoginMode,
    role: string | null | undefined
  ): string {
    if (mode === "stakeholder") {
      if (role === "stakeholder") return "/portfolio";
      setError(
        "This account does not have stakeholder access. Try Fellow or Studio sign in."
      );
      return "";
    }
    if (mode === "studio") {
      if (role === "admin" || role === "studio") return "/studio";
      setError(
        "This account does not have Studio access. Try Fellow sign in."
      );
      return "";
    }
    if (role === "stakeholder") return "/portfolio";
    if (role === "admin" || role === "studio") return "/studio";
    return "/dashboard";
  }

  function goBack() {
    setMode("landing");
    setEmail("");
    setPassword("");
    setError("");
    setResetSent(false);
  }

  /* ═══ LANDING ═══ */
  if (mode === "landing") {
    return <LandingHero onSelectMode={(target) => setMode(target)} />;
  }

  /* ═══ RESET PASSWORD ═══ */
  if (mode === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: 420 }}>
          <GlassCard>
            <div className="px-10 pt-10 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
                    THE<br />UTOPIA<br />STUDIO
                  </div>
                  <h1 className="text-[28px] font-medium text-white leading-tight">
                    Reset Password
                  </h1>
                  <p className="text-white/50 text-sm mt-1.5">
                    {resetSent
                      ? "Check your email"
                      : "Enter your email to receive a reset link"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="text-white/40 hover:text-white transition-colors text-sm mt-1"
                >
                  ← Back
                </button>
              </div>
            </div>

            {resetSent ? (
              <div className="px-10 pb-8">
                <div className="border p-4 text-sm" style={authSuccessStyle}>
                  Password reset email sent to <strong>{email}</strong>. Check
                  your inbox and follow the link to set a new password.
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className={authButtonClass + " mt-5"}
                  style={{ borderRadius: 2 }}
                >
                  Back to Sign In →
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleResetPassword}
                className="px-10 pb-8 space-y-5"
              >
                {error && (
                  <div className="border p-3 text-sm" style={authErrorStyle}>
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="reset-email" className={authLabelClass}>
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={authInputClass}
                    style={{ borderRadius: 2 }}
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={authButtonClass}
                  style={{ borderRadius: 2 }}
                >
                  {loading ? "Sending..." : "Send Reset Link →"}
                </button>
              </form>
            )}

            <div className="px-10 pb-6 text-center">
              <p className="text-xs text-white/25">
                The Utopia Studio — Internal Use Only
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  /* ═══ LOGIN FORM (Fellow / Studio / Stakeholder) ═══ */
  const isStaffOrStakeholder = mode === "studio" || mode === "stakeholder";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full" style={{ maxWidth: 420 }}>
        <GlassCard>
          <div className="px-10 pt-10 pb-8 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
                  THE<br />UTOPIA<br />STUDIO
                </div>
                <h1 className="text-[28px] font-medium text-white leading-tight">
                  {mode === "studio"
                    ? "Studio Sign In"
                    : mode === "stakeholder"
                      ? "Stakeholder Sign In"
                      : "Fellow Sign In"}
                </h1>
                <p className="text-white/50 text-sm mt-1.5">
                  {mode === "studio"
                    ? "Access the Studio dashboard"
                    : mode === "stakeholder"
                      ? "View fellow portfolio and ventures"
                      : "Continue your Co-Build journey"}
                </p>
              </div>
              <button
                type="button"
                onClick={goBack}
                className="text-white/40 hover:text-white transition-colors text-sm mt-1"
              >
                ← Back
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-10 pb-8 space-y-5">
            {error && (
              <div className="border p-3 text-sm" style={authErrorStyle}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className={authLabelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={authInputClass}
                style={{ borderRadius: 2 }}
                placeholder={
                  isStaffOrStakeholder ? "you@company.com" : "you@example.com"
                }
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor="password"
                  className={authLabelClass.replace(" block mb-2", "")}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setPassword("");
                    setError("");
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={authInputClass}
                style={{ borderRadius: 2 }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={authButtonClass}
              style={{ borderRadius: 2 }}
            >
              {loading
                ? "Signing in..."
                : mode === "studio"
                  ? "Sign In to Studio →"
                  : mode === "stakeholder"
                    ? "Sign In →"
                    : "Sign In →"}
            </button>
          </form>

          {!isStaffOrStakeholder && (
            <div className="px-10 pb-6 -mt-2">
              <p className="text-center text-xs text-white/30">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-accent hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          )}

          <div className="px-10 pb-6 text-center">
            <p className="text-xs text-white/25">
              The Utopia Studio — Internal Use Only
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/30 text-sm">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
