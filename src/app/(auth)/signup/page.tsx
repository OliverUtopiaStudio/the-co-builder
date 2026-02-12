"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
  authErrorStyle,
} from "@/components/auth/styles";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const res = await fetch("/api/fellows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email }),
        });
        if (!res.ok) {
          console.error("Failed to create fellow profile");
        }
      }

      router.push("/dashboard");
      router.refresh();
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
          {/* Header with accent line */}
          <div className="px-10 pt-10 pb-8 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />
            <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
              THE<br />UTOPIA<br />STUDIO
            </div>
            <h1 className="text-[28px] font-medium text-white leading-tight">
              Create Account
            </h1>
            <p className="text-white/50 text-sm mt-1.5">
              Join as a Fellow and start building your venture. Studio and
              Stakeholder access is by invite only.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 pb-8 space-y-5">
            {error && (
              <div className="border p-3 text-sm" style={authErrorStyle}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className={authLabelClass}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={authInputClass}
                style={{ borderRadius: 2 }}
                placeholder="Jane Smith"
              />
            </div>

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
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={authLabelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={authInputClass}
                style={{ borderRadius: 2 }}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={authLabelClass}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={authInputClass}
                style={{ borderRadius: 2 }}
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={authButtonClass}
              style={{ borderRadius: 2 }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="px-10 pb-6 -mt-2">
            <p className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>

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
