"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

const config: SidebarConfig = {
  navItems: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/tools", label: "Co-Build Tools" },
    { href: "/profile", label: "Profile" },
  ],
  homeHref: "/dashboard",
  mobileTitle: "CO-BUILDER",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
