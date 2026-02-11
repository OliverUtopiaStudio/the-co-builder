"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type LoginMode = "choose" | "admin" | "fellow" | "reset";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" as LoginMode : "choose" as LoginMode;
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/callback?next=/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: fellow } = await supabase
          .from("fellows")
          .select("role")
          .eq("auth_user_id", user.id)
          .single();

        if (mode === "admin") {
          if (fellow?.role === "admin") {
            router.push("/admin");
            router.refresh();
            return;
          } else {
            setError("This account does not have admin access.");
            await supabase.auth.signOut();
            return;
          }
        }

        if (fellow?.role === "admin") {
          router.push("/admin");
          router.refresh();
          return;
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

  // Reset password screen
  if (mode === "reset") {
    return (
      <div className="bg-surface rounded-sm overflow-hidden" style={{ borderRadius: 2 }}>
        <div className="bg-accent px-10 pt-10 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white font-bold text-xs tracking-[2px] leading-relaxed mb-5">
                THE<br />UTOPIA<br />STUDIO
              </div>
              <h1 className="text-[28px] font-medium text-white leading-tight">Reset Password</h1>
              <p className="text-white/80 text-sm mt-1.5">
                {resetSent ? "Check your email" : "Enter your email to receive a reset link"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode("choose");
                setError("");
                setResetSent(false);
              }}
              className="text-white/60 hover:text-white transition-colors text-sm mt-1"
            >
              ← Back
            </button>
          </div>
        </div>

        {resetSent ? (
          <div className="px-10 py-8">
            <div className="bg-green-50 border border-green-200 rounded-sm p-4 text-sm text-green-700" style={{ borderRadius: 2 }}>
              Password reset email sent to <strong>{email}</strong>. Check your inbox and follow the link to set a new password.
            </div>
            <button
              type="button"
              onClick={() => {
                setMode("choose");
                setEmail("");
                setResetSent(false);
              }}
              className="w-full mt-5 py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Back to Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="px-10 py-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-700" style={{ borderRadius: 2 }}>
                {error}
              </div>
            )}
            <div>
              <label htmlFor="reset-email" className="label-uppercase block mb-2">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
                style={{ borderRadius: 2 }}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: 2 }}
            >
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>
          </form>
        )}

        <div className="px-10 pb-6 text-center">
          <p className="text-xs text-muted-light">The Utopia Studio — Internal Use Only</p>
        </div>
      </div>
    );
  }

  // Choose screen
  if (mode === "choose") {
    return (
      <div className="bg-surface rounded-sm overflow-hidden" style={{ borderRadius: 2 }}>
        {/* Terracotta header */}
        <div className="bg-accent px-10 pt-10 pb-8">
          <div className="text-white font-bold text-xs tracking-[2px] leading-relaxed mb-5">
            THE<br />UTOPIA<br />STUDIO
          </div>
          <h1 className="text-[28px] font-medium text-white leading-tight">The Co-Builder</h1>
          <p className="text-white/80 text-sm mt-1.5">Choose how you&apos;d like to sign in</p>
        </div>

        {/* Login options */}
        <div className="px-10 py-8 space-y-3">
          <button
            onClick={() => setMode("fellow")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-sm bg-background border border-border hover:border-accent/40 transition-colors text-left group"
            style={{ borderRadius: 2 }}
          >
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">Fellow Login</div>
              <div className="text-xs text-muted mt-0.5">Access your venture workspace</div>
            </div>
            <span className="text-muted group-hover:text-accent transition-colors">→</span>
          </button>

          <button
            onClick={() => setMode("admin")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-sm bg-background border border-border hover:border-accent/40 transition-colors text-left group"
            style={{ borderRadius: 2 }}
          >
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">Admin Login</div>
              <div className="text-xs text-muted mt-0.5">Manage fellows and ventures</div>
            </div>
            <span className="text-muted group-hover:text-accent transition-colors">→</span>
          </button>
        </div>

        <div className="px-10 pb-6">
          <p className="text-center text-xs text-muted-light">
            New fellow?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Login form (admin or fellow)
  const isAdmin = mode === "admin";

  return (
    <div className="bg-surface rounded-sm overflow-hidden" style={{ borderRadius: 2 }}>
      {/* Terracotta header */}
      <div className="bg-accent px-10 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white font-bold text-xs tracking-[2px] leading-relaxed mb-5">
              THE<br />UTOPIA<br />STUDIO
            </div>
            <h1 className="text-[28px] font-medium text-white leading-tight">
              {isAdmin ? "Admin Sign In" : "Fellow Sign In"}
            </h1>
            <p className="text-white/80 text-sm mt-1.5">
              {isAdmin ? "Access the admin dashboard" : "Continue your Co-Build journey"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode("choose");
              setEmail("");
              setPassword("");
              setError("");
            }}
            className="text-white/60 hover:text-white transition-colors text-sm mt-1"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-10 py-8 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-700" style={{ borderRadius: 2 }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label-uppercase block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder={isAdmin ? "admin@company.com" : "you@example.com"}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="password" className="label-uppercase">
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
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: 2 }}
        >
          {loading
            ? "Signing in..."
            : isAdmin
            ? "Sign In as Admin →"
            : "Sign In →"}
        </button>
      </form>

      {!isAdmin && (
        <div className="px-10 pb-6 -mt-2">
          <p className="text-center text-xs text-muted-light">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>
      )}

      <div className="px-10 pb-6 text-center">
        <p className="text-xs text-muted-light">The Utopia Studio — Internal Use Only</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface p-6 text-center" style={{ borderRadius: 2 }}>
          <div className="text-muted text-sm">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
