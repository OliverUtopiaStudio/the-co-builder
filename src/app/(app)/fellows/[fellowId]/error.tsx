"use client";

export default function FellowDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="bg-surface border border-border p-8 text-center max-w-md space-y-4"
        style={{ borderRadius: 2 }}
      >
        <p className="text-sm text-muted">
          Unable to load this fellow&apos;s page. Please sign in and try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-xs bg-accent text-white hover:bg-accent/90 transition-colors"
          style={{ borderRadius: 2 }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
