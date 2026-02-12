"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
  authErrorStyle,
  authSuccessStyle,
} from "@/components/auth/styles";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full" style={{ maxWidth: 420 }}>
        <GlassCard>
          <div className="px-10 pt-10 pb-8 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />
            <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
              THE<br />UTOPIA<br />STUDIO
            </div>
            <h1 className="text-[28px] font-medium text-white leading-tight">
              {success ? "Password Updated" : "Set New Password"}
            </h1>
            <p className="text-white/50 text-sm mt-1.5">
              {success
                ? "You can now sign in with your new password"
                : "Choose a new password for your account"}
            </p>
          </div>

          {success ? (
            <div className="px-10 pb-8">
              <div className="border p-4 text-sm" style={authSuccessStyle}>
                Your password has been updated successfully.
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className={authButtonClass + " mt-5"}
                style={{ borderRadius: 2 }}
              >
                Sign In →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-10 pb-8 space-y-5">
              {error && (
                <div className="border p-3 text-sm" style={authErrorStyle}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className={authLabelClass}>
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={authInputClass}
                  style={{ borderRadius: 2 }}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className={authLabelClass}>
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={authInputClass}
                  style={{ borderRadius: 2 }}
                  placeholder="Re-enter your new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={authButtonClass}
                style={{ borderRadius: 2 }}
              >
                {loading ? "Updating..." : "Update Password →"}
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
