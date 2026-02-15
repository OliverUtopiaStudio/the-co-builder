"use client";

/**
 * Small indicator for framework editor: saving state and optional "last updated" from realtime.
 */
export default function RealTimeIndicator({
  saving,
  lastUpdated,
}: {
  saving?: boolean;
  lastUpdated?: Date | null;
}) {
  return (
    <span className="text-xs text-muted">
      {saving ? (
        "Saving…"
      ) : lastUpdated ? (
        <>Saved · updated {lastUpdated.toLocaleTimeString()}</>
      ) : null}
    </span>
  );
}
