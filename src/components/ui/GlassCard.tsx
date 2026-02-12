import type { ReactNode } from "react";

/**
 * Frosted glass card used on auth pages over the GenerativeArt background.
 * Provides backdrop blur, subtle white border, and deep shadow.
 *
 * Usage:
 *   <GlassCard>
 *     <div className="px-10 pt-10 pb-8">...</div>
 *   </GlassCard>
 */
export default function GlassCard({
  children,
  className = "",
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden backdrop-blur-xl ${animate ? "animate-fade-in" : ""} ${className}`}
      style={{
        borderRadius: 2,
        background: "rgba(255, 255, 255, 0.07)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 24px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
    >
      {children}
    </div>
  );
}
