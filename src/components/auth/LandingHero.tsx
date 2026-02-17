"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LoginTarget = "fellow" | "studio";

/**
 * Toolbox-style landing: minimal copy, quick access.
 * Toothbrush product — get to work, not sold to.
 */
export default function LandingHero({
  onSelectMode,
}: {
  onSelectMode: (target: LoginTarget) => void;
}) {
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  function stagger(delayMs: number) {
    return {
      opacity: heroReady ? 1 : 0,
      transform: heroReady ? "translateY(0)" : "translateY(20px)",
      transition: `all 1s ease ${delayMs}ms`,
    } as const;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8 sm:py-12">
      {/* Top bar */}
      <div
        style={{
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "translateY(0)" : "translateY(-10px)",
          transition: "all 1s ease",
        }}
      >
        <div className="text-white/30 font-bold text-[10px] tracking-[3px] uppercase">
          The Utopia Studio
        </div>
      </div>

      {/* Hero copy — toolbox: minimal, functional */}
      <div className="max-w-2xl">
        <h1
          className="text-white text-[clamp(36px,6vw,56px)] font-medium leading-[1.1] tracking-[-0.02em]"
          style={stagger(100)}
        >
          Co-Build OS
        </h1>
        <p
          className="text-white/50 text-[clamp(15px,1.8vw,18px)] mt-3"
          style={stagger(200)}
        >
          Sign in to your workspace
        </p>
      </div>

      {/* Bottom — login buttons + signup link */}
      <div style={stagger(400)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3">
          <button
            onClick={() => onSelectMode("fellow")}
            className="px-5 py-2.5 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
            style={{ borderRadius: 2 }}
          >
            Sign in
          </button>
          <button
            onClick={() => onSelectMode("studio")}
            className="px-5 py-2.5 bg-white/8 border border-white/12 text-white/70 text-sm font-medium hover:text-white hover:border-white/25 transition-all"
            style={{ borderRadius: 2 }}
          >
            Studio
          </button>
          <span className="text-white/20 hidden sm:inline mx-1">|</span>

          <Link
            href="/signup"
            className="text-sm text-white/40 hover:text-accent transition-colors"
          >
            New? Create an account
          </Link>
        </div>

        <div className="mt-5 text-[11px] text-white/15 tracking-wide">
          Co-Build OS — Internal Platform
        </div>
      </div>
    </div>
  );
}
