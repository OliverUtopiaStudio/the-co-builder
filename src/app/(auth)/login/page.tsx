"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type LoginMode = "choose" | "admin" | "fellow";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" as LoginMode : "choose" as LoginMode;
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Check role to determine redirect
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

        // Fellow mode — admins can also use fellow view
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

  // Choose screen
  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to The Co-Builder</h1>
            <p className="text-muted text-sm mt-1">
              Choose how you&apos;d like to sign in
            </p>
          </div>

          <div className="space-y-3">
            {/* Fellow login */}
            <button
              onClick={() => setMode("fellow")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-accent/50 bg-background hover:bg-accent/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl shrink-0">
                🚀
              </div>
              <div className="flex-1">
                <div className="font-semibold group-hover:text-accent transition-colors">
                  Fellow Login
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Access your venture workspace and Co-Build framework
                </div>
              </div>
              <svg
                className="w-5 h-5 text-muted group-hover:text-accent transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Admin login */}
            <button
              onClick={() => setMode("admin")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-gold/50 bg-background hover:bg-gold/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-xl shrink-0">
                🔑
              </div>
              <div className="flex-1">
                <div className="font-semibold group-hover:text-gold transition-colors">
                  Admin Login
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Manage fellows, ventures, and asset requirements
                </div>
              </div>
              <svg
                className="w-5 h-5 text-muted group-hover:text-gold transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted">
          New fellow?{" "}
          <Link
            href="/signup"
            className="text-accent hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  // Login form (admin or fellow)
  const isAdmin = mode === "admin";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        {/* Back button + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("choose");
              setEmail("");
              setPassword("");
              setError("");
            }}
            className="p-1.5 rounded-lg hover:bg-background transition-colors text-muted hover:text-foreground"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {isAdmin ? "Admin Sign In" : "Fellow Sign In"}
            </h1>
            <p className="text-muted text-xs">
              {isAdmin
                ? "Access the admin dashboard"
                : "Continue your Co-Build journey"}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isAdmin
                  ? "bg-gold/10 text-gold"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {isAdmin ? "Admin" : "Fellow"}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder={isAdmin ? "admin@company.com" : "you@example.com"}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdmin
              ? "bg-gold hover:bg-gold/90"
              : "bg-accent hover:bg-accent/90"
          }`}
        >
          {loading
            ? "Signing in..."
            : isAdmin
            ? "Sign In as Admin"
            : "Sign In"}
        </button>
      </div>

      {!isAdmin && (
        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <div className="text-muted">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
