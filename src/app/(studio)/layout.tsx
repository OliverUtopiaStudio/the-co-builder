"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

const config: SidebarConfig = {
  navItems: [
    { href: "/studio", label: "KPI Scoreboard" },
    { href: "/studio/pods", label: "Pods" },
    { href: "/studio/pod-launch", label: "Pod Launch" },
    { href: "/studio/pipeline", label: "Pipeline" },
    { href: "/studio/report", label: "Report" },
    { href: "/studio/wiki", label: "Wiki" },
  ],
  homeHref: "/studio",
  mobileTitle: "STUDIO",
  sidebarSubtitle: "Studio OS",
  sidebarBadge: "Dashboard",
  bottomLinks: [
    { href: "/admin", label: "Admin View" },
    { href: "/dashboard", label: "Fellow View" },
  ],
  requireStudio: true,
  maxWidth: "max-w-6xl",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
