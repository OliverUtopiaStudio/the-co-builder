"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <div className="bg-surface rounded-sm overflow-hidden" style={{ borderRadius: 2 }}>
      <div className="bg-accent px-10 pt-10 pb-8">
        <div className="text-white font-bold text-xs tracking-[2px] leading-relaxed mb-5">
          THE<br />UTOPIA<br />STUDIO
        </div>
        <h1 className="text-[28px] font-medium text-white leading-tight">
          {success ? "Password Updated" : "Set New Password"}
        </h1>
        <p className="text-white/80 text-sm mt-1.5">
          {success ? "You can now sign in with your new password" : "Choose a new password for your account"}
        </p>
      </div>

      {success ? (
        <div className="px-10 py-8">
          <div
            className="bg-green-50 border border-green-200 rounded-sm p-4 text-sm text-green-700"
            style={{ borderRadius: 2 }}
          >
            Your password has been updated successfully.
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full mt-5 py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Sign In →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-10 py-8 space-y-5">
          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-700"
              style={{ borderRadius: 2 }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="label-uppercase block mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
              style={{ borderRadius: 2 }}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="label-uppercase block mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
              style={{ borderRadius: 2 }}
              placeholder="Re-enter your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 2 }}
          >
            {loading ? "Updating..." : "Update Password →"}
          </button>
        </form>
      )}

      <div className="px-10 pb-6 text-center">
        <p className="text-xs text-muted-light">The Utopia Studio — Internal Use Only</p>
      </div>
    </div>
  );
}
