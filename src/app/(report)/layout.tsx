"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
  authErrorStyle,
} from "@/components/auth/styles";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if report_session cookie exists (client-side check for UI only)
    const token = getCookie("report_session");
    setAuthenticated(!!token);
    setChecking(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid password");
        return;
      }
      setAuthenticated(true);
      setPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/report/logout", { method: "POST" });
    setAuthenticated(false);
    router.refresh();
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  /* ─── Password gate ─── */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: 420 }}>
          <GlassCard>
            <div className="px-10 pt-10 pb-8">
              <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
                THE<br />UTOPIA<br />STUDIO
              </div>
              <h1 className="text-[28px] font-medium text-white leading-tight">
                Fellow Portfolio
              </h1>
              <p className="text-white/50 text-sm mt-1.5">
                Enter the report password to view
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-8 space-y-5">
              {error && (
                <div className="border p-3 text-sm" style={authErrorStyle}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="report-password" className={authLabelClass}>
                  Password
                </label>
                <input
                  id="report-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={authInputClass}
                  style={{ borderRadius: 2 }}
                  placeholder="Enter report password"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={authButtonClass}
                style={{ borderRadius: 2 }}
              >
                {loading ? "Verifying..." : "View Report →"}
              </button>
            </form>

            <div className="px-10 pb-6 text-center">
              <p className="text-xs text-white/25">
                The Utopia Studio — Stakeholder Report
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  /* ─── Authenticated report view ─── */
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/report"
            className="text-foreground font-semibold text-sm hover:text-accent transition-colors"
          >
            Fellow Portfolio
          </a>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">Report view</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
