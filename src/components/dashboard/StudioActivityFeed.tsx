"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getActivityFeed, type ActivityItem } from "@/app/actions/activity";

export default function StudioActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const feed = await getActivityFeed(15);
        if (!cancelled) {
          setActivities(feed);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load activity");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activityIcons = {
    review: "📝",
    approval: "✅",
    comment: "💬",
    stipend: "💰",
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <div className="text-muted text-sm">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="label-uppercase">Studio Team Activity</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-muted">Studio team is here</span>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm">
            Unable to load activity feed
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm mb-2">
            No recent activity yet
          </div>
          <div className="text-xs text-muted">
            Activity will appear here as you complete assets and reach milestones
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-background border border-border p-3 hover:border-accent/30 transition-all"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg">{activityIcons[activity.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">{activity.title}</div>
                  <div className="text-xs text-muted mb-2">{activity.message}</div>
                  <div className="text-xs text-muted">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                  {activity.assetNumber && activity.ventureId && (
                    <Link
                      href={`/venture/${activity.ventureId}/asset/${activity.assetNumber}`}
                      className="text-accent text-xs font-medium hover:underline mt-1 inline-block"
                    >
                      View feedback →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <Link
          href="/dashboard#activity"
          className="text-accent text-sm font-medium hover:underline mt-4 inline-block"
        >
          View all activity →
        </Link>
      )}
    </div>
  );
}
