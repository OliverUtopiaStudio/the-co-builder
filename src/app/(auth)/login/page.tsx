"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
  authErrorStyle,
} from "@/components/auth/styles";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Invalid password.");
        return;
      }

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden login-bg">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="login-keyhole">
          <div className="login-keyhole-stars" />
          <div className="login-astronaut" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: 420 }}>
          <GlassCard>
            <div className="px-10 pt-10 pb-8">
              <div className="text-white/40 font-bold text-xs tracking-[2px] leading-relaxed mb-5">
                THE
                <br />
                UTOPIA
                <br />
                STUDIO
              </div>
              <h1 className="text-[28px] font-medium text-white leading-tight">
                Enter Co-Build OS
              </h1>
              <p className="text-white/50 text-sm mt-1.5">
                This workspace is protected by a shared access password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-8 space-y-5">
              {error && (
                <div className="border p-3 text-sm" style={authErrorStyle}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className={authLabelClass}>
                  Access password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={authInputClass}
                  style={{ borderRadius: 2 }}
                  placeholder="Enter the shared password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={authButtonClass}
                style={{ borderRadius: 2 }}
              >
                {loading ? "Checking..." : "Enter workspace →"}
              </button>
            </form>

            <div className="px-10 pb-6 text-center">
              <p className="text-xs text-white/25">
                The Utopia Studio — Internal Use Only
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

