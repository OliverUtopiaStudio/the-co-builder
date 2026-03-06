"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getLimitlessTopicBySlug, limitlessTopics } from "@/lib/limitless";

export default function LimitlessTopicPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const topic = slug ? getLimitlessTopicBySlug(slug) : undefined;

  if (!slug || !topic) {
    return (
      <div className="space-y-6">
        <div className="bg-surface border border-border p-12 text-center" style={{ borderRadius: 2 }}>
          <h2 className="text-lg font-medium">Topic not found</h2>
          <p className="text-muted text-sm mt-2">
            This guide page doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/library/limitless"
            className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
          >
            ← Back to Becoming Limitless
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = limitlessTopics.findIndex((t) => t.slug === slug);
  const prevTopic = currentIndex > 0 ? limitlessTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < limitlessTopics.length - 1
      ? limitlessTopics[currentIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/library" className="hover:text-accent transition-colors">
          Library
        </Link>
        <span>/</span>
        <Link
          href="/library/limitless"
          className="hover:text-accent transition-colors"
        >
          Becoming Limitless
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{topic.title}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium">{topic.title}</h1>
        <p className="text-muted text-sm mt-1">{topic.shortDescription}</p>
      </div>

      {/* Body */}
      <div
        className="bg-surface border border-border p-6 whitespace-pre-line text-sm leading-relaxed"
        style={{ borderRadius: 2 }}
      >
        {topic.body}
      </div>

      {/* Video links */}
      {topic.videoLinks.length > 0 && (
        <div
          className="bg-surface border border-border p-5"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase mb-3">Videos & links</div>
          <ul className="space-y-2">
            {topic.videoLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topic.videoLinks.length === 0 && (
        <p className="text-xs text-muted">
          Video and resource links for this topic can be added in the data file
          and will appear here.
        </p>
      )}

      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex-1">
          {prevTopic ? (
            <Link
              href={`/library/limitless/${prevTopic.slug}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Previous</div>
              <div className="text-sm font-medium">{prevTopic.title}</div>
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="flex-1">
          {nextTopic ? (
            <Link
              href={`/library/limitless/${nextTopic.slug}`}
              className="block p-3 border border-border hover:border-accent/30 bg-surface transition-all text-right"
              style={{ borderRadius: 2 }}
            >
              <div className="text-xs text-muted mb-1">Next</div>
              <div className="text-sm font-medium">{nextTopic.title}</div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/library/limitless"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← All Becoming Limitless topics
        </Link>
      </div>
    </div>
  );
}
