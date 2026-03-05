"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  /* Helper: 6 faces for a wireframe cube */
  const faces = (
    <>
      <div className="tess-face tess-front" />
      <div className="tess-face tess-back" />
      <div className="tess-face tess-right" />
      <div className="tess-face tess-left" />
      <div className="tess-face tess-top" />
      <div className="tess-face tess-bottom" />
    </>
  );

  return (
    <div className="login-page">
      {/* Brand */}
      <div className="login-brand">Co-Build OS</div>

      {/* Tesseract — 4 nested rotating wireframe cubes */}
      <div className="tesseract-scene">
        <div className="tess-cube tess-outer">
          {faces}
          <div className="tess-cube tess-second">
            {faces}
            <div className="tess-cube tess-third">
              {faces}
              <div className="tess-cube tess-inner">
                {faces}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="login-form-area">
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
  );
}
