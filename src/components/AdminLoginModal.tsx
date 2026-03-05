"use client";

import { useState, FormEvent } from "react";

export function AdminLoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Invalid password.");
        return;
      }

      setPassword("");
      onSuccess();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-surface border border-border p-6 w-full max-w-sm"
        style={{ borderRadius: 2 }}
      >
        <div className="label-uppercase mb-4">Admin Access</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-sm text-accent">{error}</div>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none"
            style={{ borderRadius: 2 }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm border border-border text-muted hover:text-foreground transition-colors"
              style={{ borderRadius: 2 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {loading ? "..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
