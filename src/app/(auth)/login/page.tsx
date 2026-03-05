"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const LuminousNetwork = dynamic(() => import("@/components/LuminousNetwork"), {
  ssr: false,
});

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
    <>
      {/* Three.js background */}
      <LuminousNetwork />

      {/* Content layer */}
      <div className="login-page">
        {/* Brand */}
        <div className="login-brand">Co-Build OS</div>

        {/* Spacer to push form below center (network occupies upper area) */}
        <div className="login-spacer" />

        {/* Login card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form-inner">
            {error && <div className="login-error">{error}</div>}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Enter access password"
            />

            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Checking..." : "Enter workspace \u2192"}
            </button>
          </form>

          <p className="login-footer">The Utopia Studio</p>
        </div>
      </div>
    </>
  );
}
