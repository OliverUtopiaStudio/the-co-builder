"use client";

import SidebarLayout from "./SidebarLayout";
import type { SidebarConfig } from "./SidebarLayout";

export default function AppSidebarWrapper({
  config,
  children,
}: {
  config: SidebarConfig;
  children: React.ReactNode;
}) {
  return <SidebarLayout config={config}>{children}</SidebarLayout>;
}
