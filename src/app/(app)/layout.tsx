"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

const config: SidebarConfig = {
  navItems: [{ href: "/", label: "Venture Playlist" }],
  homeHref: "/",
  mobileTitle: "CO-BUILDER",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
