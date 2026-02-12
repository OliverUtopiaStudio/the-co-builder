"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

const config: SidebarConfig = {
  navItems: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/fellows", label: "Fellows" },
    { href: "/admin/framework", label: "Framework" },
    { href: "/admin/stipends", label: "Stipends" },
    { href: "/admin/settings", label: "Settings" },
  ],
  homeHref: "/admin",
  mobileTitle: "ADMIN",
  sidebarSubtitle: "The Co-Builder",
  sidebarBadge: "Admin",
  bottomLinks: [{ href: "/dashboard", label: "Fellow View" }],
  requireAdmin: true,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
