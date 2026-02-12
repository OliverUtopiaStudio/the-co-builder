/**
 * Horizontal progress bar — used in tools test projects, KPI cards, onboarding.
 * Accepts a 0-1 ratio and an optional accent color.
 *
 * Usage:
 *   <ProgressBar progress={3/6} color="#CC7832" />
 */
export default function ProgressBar({
  progress,
  color = "var(--accent)",
  className = "",
}: {
  /** 0 to 1 ratio */
  progress: number;
  /** CSS color value */
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`h-1 bg-border overflow-hidden ${className}`}
      style={{ borderRadius: 2 }}
    >
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(progress, 1) * 100}%`,
          background: color,
        }}
      />
    </div>
  );
}
