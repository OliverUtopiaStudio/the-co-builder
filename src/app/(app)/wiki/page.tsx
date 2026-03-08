"use client";

import { useState, FormEvent } from "react";
import { submitFeatureRequest } from "@/app/actions/feature-request";

const SECTIONS = [
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I log in?",
        a: 'Choose "I\'m Studio" on the login screen and enter the admin password. You\'ll land on the Astrolabe — the programme\'s living overview document.',
      },
      {
        q: "What is the Astrolabe?",
        a: "The Astrolabe is the programme's north-star document. It outlines the cohort's thesis, the studio's approach, and the team behind it. Every fellow and studio member lands here first.",
      },
    ],
  },
  {
    title: "Fellows",
    items: [
      {
        q: "How do I view a fellow's venture or dashboard?",
        a: 'Go to "Fellows" in the sidebar to see all fellows. Click any fellow to open their dashboard — the same view they see (current stage, next action, milestones, to-dos, key links, and studio services).',
      },
      {
        q: "How do I update a fellow's milestones or to-dos?",
        a: "Open the fellow's page from Fellows. You can add, edit, reorder, or complete milestones and to-do items directly. Changes are saved automatically.",
      },
      {
        q: "How do I manage fellows?",
        a: 'From the Fellows page, click "Manage Fellows" to add new fellows, edit their details, or link them to ventures.',
      },
    ],
  },
  {
    title: "Content Library",
    items: [
      {
        q: "What is the Content Library?",
        a: "The library contains all programme assets — worksheets, frameworks, and animated lessons. Each asset has a number, a video/lesson, and links to Google Drive templates.",
      },
      {
        q: "How do I add or edit Loom videos?",
        a: "As a Studio user, you can paste Loom embed URLs directly on any asset page. If no Loom is set, the system shows an animated lesson as a placeholder.",
      },
    ],
  },
  {
    title: "Feedback & Feature Requests",
    items: [
      {
        q: "How do I send feedback?",
        a: 'Click the "Feedback" button in the sidebar (or the floating button on mobile). Your feedback goes straight to the #user-testing channel in Slack.',
      },
      {
        q: "How do I request a new feature?",
        a: "Use the feature request form at the bottom of this page. Describe what you need, set a priority, and it'll post directly to the team's Slack channel.",
      },
    ],
  },
];

export default function WikiPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  // Feature request form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "nice-to-have" | "important" | "critical"
  >("nice-to-have");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function toggleItem(key: string) {
    setOpenIndex(openIndex === key ? null : key);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await submitFeatureRequest({
        name,
        title,
        description,
        priority,
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

  function resetForm() {
    setName("");
    setTitle("");
    setDescription("");
    setPriority("nice-to-have");
    setError("");
    setSent(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="label-uppercase text-[10px] mb-1 text-muted">Wiki</h1>
        <p className="text-xl font-medium text-foreground">
          How to use Co-builder OS
        </p>
        <p className="text-sm text-muted mt-1">
          Everything you need to navigate the platform. Can&apos;t find what
          you&apos;re looking for? Submit a feature request below.
        </p>
      </div>

      {/* Guide Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="label-uppercase text-[10px] mb-3 text-muted">
              {section.title}
            </h2>
            <div className="border border-border divide-y divide-border">
              {section.items.map((item, idx) => {
                const key = `${section.title}-${idx}`;
                const isOpen = openIndex === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleItem(key)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.q}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    {isOpen && (
                      <p className="text-sm text-muted mt-2 pr-6">{item.a}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Request Form */}
      <div className="border-t border-border pt-8">
        <h2 className="label-uppercase text-[10px] mb-1 text-muted">
          Feature Requests
        </h2>
        <p className="text-lg font-medium text-foreground mb-1">
          Request a new feature
        </p>
        <p className="text-sm text-muted mb-4">
          Describe what you need and it&apos;ll be posted to the team in Slack.
        </p>

        {sent ? (
          <div
            className="bg-surface border border-border p-6 text-center"
            style={{ borderRadius: 2 }}
          >
            <div className="text-lg font-medium text-foreground mb-2">
              Request sent!
            </div>
            <p className="text-sm text-muted mb-4">
              Your feature request has been posted to Slack. The team will review
              it shortly.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Submit another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-border p-5 space-y-4"
            style={{ borderRadius: 2 }}
          >
            {error && <div className="text-sm text-accent">{error}</div>}

            <div>
              <label className="block text-xs text-muted mb-1">
                Your name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who's asking?"
                required
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Feature title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short name for the feature"
                required
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does this solve? What should it do?"
                required
                rows={4}
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-accent focus:outline-none resize-none"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Priority</label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "nice-to-have", label: "Nice to have" },
                    { value: "important", label: "Important" },
                    { value: "critical", label: "Critical" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      priority === opt.value
                        ? "border-accent text-accent bg-accent/10"
                        : "border-border text-muted hover:text-foreground hover:border-foreground/30"
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {loading ? "Sending..." : "Submit Feature Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
