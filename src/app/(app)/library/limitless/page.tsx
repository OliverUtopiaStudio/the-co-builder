"use client";

import Link from "next/link";
import { limitlessTopics } from "@/lib/limitless";

export default function BecomingLimitlessPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/library"
        className="text-sm text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
      >
        ← Back to Content Library
      </Link>
      <div>
        <h1 className="text-2xl font-medium">Becoming Limitless</h1>
        <p className="text-muted text-sm mt-1">
          A guide for Fellows to work on their psyche and abilities — curiosity,
          invention, action, storytelling, systems thinking, resilience, and
          how you organise yourself.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {limitlessTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/library/limitless/${topic.slug}`}
            className="block bg-surface border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
            style={{ borderRadius: 2 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors">
                {topic.title}
              </h3>
              <p className="text-muted text-xs mt-2 line-clamp-3 flex-1">
                {topic.shortDescription}
              </p>
              <span className="text-xs text-accent font-medium mt-3 inline-flex items-center gap-1">
                Open guide →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted">
        More topics can be added to this guide over time. Each card opens a
        page with full text and video links.
      </p>
    </div>
  );
}
