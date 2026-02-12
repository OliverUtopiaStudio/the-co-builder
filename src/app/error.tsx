"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-medium text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted text-sm mb-6">
          We&apos;ve logged the error. Please try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 border border-border text-foreground text-sm font-medium hover:border-accent/50 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
