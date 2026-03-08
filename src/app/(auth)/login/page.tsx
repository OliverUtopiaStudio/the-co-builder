"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const LuminousNetwork = dynamic(() => import("@/components/LuminousNetwork"), {
  ssr: false,
});

type FellowOption = { id: string; fullName: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<null | "fellow" | "studio">(null);
  const [password, setPassword] = useState("");
  const [fellowId, setFellowId] = useState("");
  const [fellows, setFellows] = useState<FellowOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFellowPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/fellow-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Invalid password.");
        setLoading(false);
        return;
      }
      if (data.fellows?.length) {
        setFellows(data.fellows);
      } else {
        setError("No fellows found. Contact admin.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFellowSelect(e: FormEvent) {
    e.preventDefault();
    if (!fellowId || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/fellow-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, fellowId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "Invalid password.") {
          setFellows([]);
          setError("Session expired. Enter password again.");
          setLoading(false);
          return;
        }
        setError(data?.error ?? "Failed to sign in.");
        setLoading(false);
        return;
      }
      router.push(searchParams.get("redirect") || "/dashboard");
      router.refresh();
      return;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStudioPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const [authRes, siteRes] = await Promise.all([
        fetch("/api/auth/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }),
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }),
      ]);
      if (!authRes.ok) {
        const data = await authRes.json().catch(() => ({}));
        setError(data?.error ?? "Invalid password.");
        setLoading(false);
        return;
      }
      await siteRes;
      router.push(searchParams.get("redirect") || "/fellows");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "fellow" && fellows.length === 0) {
    return (
      <>
        <LuminousNetwork />
        <div className="login-page">
          <div className="login-brand">THE CO-BUILDER</div>
          <div className="login-spacer" />
          <div className="login-card">
            <form onSubmit={handleFellowPassword} className="login-form-inner">
              {error && <div className="login-error">{error}</div>}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                placeholder="Enter site password"
              />
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? "Checking..." : "Continue \u2192"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setError("");
                setPassword("");
              }}
              className="mt-3 text-xs text-muted hover:text-foreground"
            >
              ← Back
            </button>
          </div>
          <p className="login-footer">The Utopia Studio</p>
        </div>
      </>
    );
  }

  if (mode === "fellow" && fellows.length > 0) {
    return (
      <>
        <LuminousNetwork />
        <div className="login-page">
          <div className="login-brand">THE CO-BUILDER</div>
          <div className="login-spacer" />
          <div className="login-card">
            <form onSubmit={handleFellowSelect} className="login-form-inner">
              {error && <div className="login-error">{error}</div>}
              <label className="block text-left text-xs text-muted mb-1.5">
                Select your name
              </label>
              <select
                value={fellowId}
                onChange={(e) => setFellowId(e.target.value)}
                required
                className="login-input w-full"
              >
                <option value="">— Select —</option>
                {fellows.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !fellowId}
                className="login-button"
              >
                {loading ? "Signing in..." : "Enter workspace \u2192"}
              </button>
            </form>
          </div>
          <p className="login-footer">The Utopia Studio</p>
        </div>
      </>
    );
  }

  if (mode === "studio") {
    return (
      <>
        <LuminousNetwork />
        <div className="login-page">
          <div className="login-brand">THE CO-BUILDER</div>
          <div className="login-spacer" />
          <div className="login-card">
            <form onSubmit={handleStudioPassword} className="login-form-inner">
              {error && <div className="login-error">{error}</div>}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                placeholder="Enter admin password"
              />
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? "Checking..." : "Enter studio \u2192"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setError("");
                setPassword("");
              }}
              className="mt-3 text-xs text-muted hover:text-foreground"
            >
              ← Back
            </button>
          </div>
          <p className="login-footer">The Utopia Studio</p>
        </div>
      </>
    );
  }

  return (
    <>
      <LuminousNetwork />
      <div className="login-page">
        <div className="login-brand">THE CO-BUILDER</div>
        <div className="login-spacer" />
        <div className="login-card">
          <div className="login-form-inner space-y-3">
            <p className="text-sm text-muted text-center mb-4">
              How are you signing in?
            </p>
            <button
              type="button"
              onClick={() => setMode("fellow")}
              className="login-button w-full"
            >
              I&apos;m a Fellow
            </button>
            <button
              type="button"
              onClick={() => setMode("studio")}
              className="login-button w-full bg-white/10 hover:bg-white/15 text-white border border-white/20"
            >
              I&apos;m Studio
            </button>
          </div>
        </div>
        <p className="login-footer">The Utopia Studio</p>
      </div>
    </>
  );
}
