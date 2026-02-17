"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { getActivityFeed, type ActivityItem } from "@/app/actions/activity";

type ActivityType = "review" | "approval" | "comment" | "stipend" | "all";

export default function StudioActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ActivityType>("all");
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 15,
    hasMore: false,
    total: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const loadingMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadActivities = useCallback(
    async (offset: number = 0, reset: boolean = false) => {
      if (loadingMoreRef.current && !reset) return;

      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          loadingMoreRef.current = true;
        }

        const result = await getActivityFeed({
          limit: pagination.limit,
          offset,
          type: filterType === "all" ? undefined : filterType,
        });

        if (reset) {
          setActivities(result.activities);
        } else {
          setActivities((prev) => [...prev, ...result.activities]);
        }

        setPagination({
          offset,
          limit: pagination.limit,
          hasMore: result.hasMore,
          total: result.total,
        });
      } catch (e) {
        if (reset) {
          setError(e instanceof Error ? e.message : "Failed to load activity");
        }
        console.error("Error loading activities:", e);
      } finally {
        setLoading(false);
        loadingMoreRef.current = false;
        setRefreshing(false);
      }
    },
    [filterType, pagination.limit]
  );

  // Initial load and filter changes
  useEffect(() => {
    loadActivities(0, true);
  }, [filterType]);

  // Periodic refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      loadActivities(0, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadActivities]);

  // Infinite scroll observer
  useEffect(() => {
    if (!pagination.hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMoreRef.current) {
          loadActivities(activities.length, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, activities.length, loadActivities, loading]);

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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities(0, true);
  };

  return (
    <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="label-uppercase">Your Activity</div>
        <div className="flex items-center gap-3">
          {refreshing && (
            <div className="text-xs text-muted">Refreshing...</div>
          )}
          <button
            onClick={handleRefresh}
            className="text-xs text-muted hover:text-accent transition-colors"
            disabled={refreshing}
          >
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted">Live</span>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "review", "approval", "stipend"] as ActivityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              filterType === type
                ? "bg-accent text-white"
                : "bg-background border border-border text-muted hover:border-accent/30"
            }`}
            style={{ borderRadius: 2 }}
          >
            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading && activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm">Loading activity...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm mb-2">
            Unable to load activity feed
          </div>
          <button
            onClick={() => loadActivities(0, true)}
            className="text-accent text-xs font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm mb-2">
            No recent activity yet
          </div>
          <div className="text-xs text-muted">
            {filterType !== "all"
              ? `No ${filterType} activity found`
              : "Activity will appear here as you complete assets and reach milestones"}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-background border border-border p-3 hover:border-accent/30 transition-all"
                style={{ borderRadius: 2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg flex-shrink-0">{activityIcons[activity.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">{activity.title}</div>
                    <div className="text-xs text-muted mb-2">{activity.message}</div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-xs text-muted">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                      {activity.ventureName && activity.ventureId && (
                        <Link
                          href={`/venture/${activity.ventureId}`}
                          className="text-accent text-xs font-medium hover:underline"
                        >
                          {activity.ventureName}
                        </Link>
                      )}
                    </div>
                    {activity.assetNumber && activity.ventureId && (
                      <Link
                        href={`/venture/${activity.ventureId}/asset/${activity.assetNumber}`}
                        className="text-accent text-xs font-medium hover:underline mt-2 inline-block"
                      >
                        View asset →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {pagination.hasMore && (
            <div ref={loadMoreRef} className="text-center py-4">
              {loadingMoreRef.current ? (
                <div className="text-xs text-muted">Loading more...</div>
              ) : (
                <div className="text-xs text-muted">Scroll for more</div>
              )}
            </div>
          )}

          {!pagination.hasMore && activities.length > 0 && (
            <div className="text-center py-4">
              <div className="text-xs text-muted">
                Showing {activities.length} of {pagination.total} activities
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
