"use client";

import dynamic from "next/dynamic";

const GenerativeArt = dynamic(() => import("@/components/GenerativeArt"), {
  ssr: false,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-bleed generative art background */}
      <div className="absolute inset-0 z-0">
        <GenerativeArt />
      </div>

      {/* Content layer — full width, pages handle their own centering */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
