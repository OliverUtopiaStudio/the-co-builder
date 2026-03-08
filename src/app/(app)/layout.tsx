import { getCurrentFellowId } from "@/app/actions/fellows";
import AppSidebarWrapper from "@/components/layout/AppSidebarWrapper";
import type { SidebarConfig } from "@/components/layout/SidebarLayout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id: fellowId, isStudio } = await getCurrentFellowId();

  const config: SidebarConfig =
    fellowId && !isStudio
      ? {
          navItems: [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/library", label: "Content Library" },
            { href: `/fellows/${fellowId}`, label: "My Venture" },
          ],
          homeHref: "/dashboard",
          mobileTitle: "CO-BUILDER",
          sidebarSubtitle: "The Co-Builder",
          sidebarBadge: "Fellow",
        }
      : {
          navItems: [
            { href: "/astrolabe", label: "Astrolabe" },
            { href: "/fellows", label: "Fellows" },
            { href: "/library", label: "Content Library" },
            { href: "/dashboard", label: "Dashboard" },
          ],
          homeHref: "/library",
          mobileTitle: "CO-BUILDER",
          sidebarSubtitle: "The Co-Builder",
          sidebarBadge: "Studio",
        };

  return <AppSidebarWrapper config={config}>{children}</AppSidebarWrapper>;
}
