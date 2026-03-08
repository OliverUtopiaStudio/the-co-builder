"use client";

import { useState, FormEvent } from "react";
import { submitFeedback } from "@/app/actions/feedback";

export function FeedbackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [featureIdeas, setFeatureIdeas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function resetAndClose() {
    setName("");
    setLikes("");
    setDislikes("");
    setFeatureIdeas("");
    setError("");
    setSent(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await submitFeedback({
        name,
        likes,
        dislikes,
        featureIdeas,
      });

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-surface border border-border p-6 w-full max-w-md mx-4"
        style={{ borderRadius: 2 }}
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="text-lg font-medium text-foreground mb-2">
              Thank you!
            </div>
            <p className="text-sm text-muted mb-4">
              Your feedback has been sent to the team.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="label-uppercase mb-1">Share Feedback</div>
            <p className="text-xs text-muted mb-4">
              Help us improve the Co-Builder
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="text-sm text-accent">{error}</div>}

              <div>
                <label className="block text-xs text-muted mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">
                  What do you like?
                </label>
                <textarea
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  placeholder="What's working well for you..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none resize-none"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">
                  What do you dislike?
                </label>
                <textarea
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  placeholder="What could be improved..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none resize-none"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">
                  New feature ideas
                </label>
                <textarea
                  value={featureIdeas}
                  onChange={(e) => setFeatureIdeas(e.target.value)}
                  placeholder="What would you love to see..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none resize-none"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetAndClose}
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
                  {loading ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
