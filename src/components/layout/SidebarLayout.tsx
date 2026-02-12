"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─── */

export interface NavItem {
  href: string;
  label: string;
}

export interface BottomLink {
  href: string;
  label: string;
}

export interface SidebarConfig {
  /** Array of navigation items shown in the sidebar */
  navItems: NavItem[];
  /** Home link — where logo + mobile header link to */
  homeHref: string;
  /** Short label shown in mobile header (e.g. "CO-BUILDER", "ADMIN", "STUDIO") */
  mobileTitle: string;
  /** Subtitle shown below "The Co-Builder" in sidebar (e.g. "Admin", "Studio OS") */
  sidebarSubtitle?: string;
  /** Accent label shown below subtitle (e.g. "Admin", "Dashboard") */
  sidebarBadge?: string;
  /** Links rendered at the bottom of the sidebar above Sign Out */
  bottomLinks?: BottomLink[];
  /** If true, checks user is admin before rendering (shows loading state) */
  requireAdmin?: boolean;
  /** If true, checks user is admin OR studio before rendering */
  requireStudio?: boolean;
  /** Max-width class for the main content area (default: "max-w-5xl") */
  maxWidth?: string;
}

/* ─── Component ─── */

export default function SidebarLayout({
  config,
  children,
}: {
  config: SidebarConfig;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const gateRequired = config.requireAdmin || config.requireStudio;
  const [authorized, setAuthorized] = useState(!gateRequired);
  const [loading, setLoading] = useState(!!gateRequired);

  // Role check for admin/studio routes
  useEffect(() => {
    if (!gateRequired) return;
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(
          config.requireStudio ? "/login?mode=studio" : "/login"
        );
        return;
      }
      const { data: fellow } = await supabase
        .from("fellows")
        .select("role")
        .eq("auth_user_id", user.id)
        .single();

      const allowed =
        config.requireAdmin
          ? fellow?.role === "admin"
          : config.requireStudio
            ? fellow?.role === "admin" || fellow?.role === "studio"
            : true;

      if (!fellow || !allowed) {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkRole();
  }, [router, config.requireAdmin, config.requireStudio, gateRequired]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Determine active state — exact match for home, startsWith for subroutes
  function isActive(href: string): boolean {
    if (href === config.homeHref) return pathname === href;
    return pathname.startsWith(href);
  }

  // Loading state for role-gated layouts
  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-sidebar-bg border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-sidebar-text"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2 4.5h16M2 10h16M2 15.5h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <Link href={config.homeHref} className="flex items-center gap-2">
          <span className="text-sidebar-text font-bold text-xs tracking-[2px]">
            {config.mobileTitle}
          </span>
        </Link>
        <div className="w-9" />
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-56 bg-sidebar-bg transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pt-6 pb-4">
          <Link
            href={config.homeHref}
            className="block"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="text-sidebar-text font-bold text-[10px] tracking-[2px] leading-relaxed">
              THE
              <br />
              UTOPIA
              <br />
              STUDIO
            </div>
            <div className="text-sidebar-text text-sm font-medium mt-3">
              {config.sidebarSubtitle || "The Co-Builder"}
            </div>
            {config.sidebarBadge && (
              <div className="inline-block text-[10px] tracking-[1.5px] uppercase font-semibold text-accent mt-1">
                {config.sidebarBadge}
              </div>
            )}
          </Link>
        </div>

        <div className="px-3 mt-2">
          <div
            className="label-uppercase px-2 mb-2 text-sidebar-muted"
            style={{ fontSize: 10 }}
          >
            Navigation
          </div>
          <nav className="space-y-0.5">
            {config.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-white/10 text-sidebar-text font-medium"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-text"
                }`}
                style={{ borderRadius: 2 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-5 pt-3 border-t border-white/10 space-y-0.5">
          {config.bottomLinks?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 text-sm text-sidebar-muted hover:text-sidebar-text hover:bg-white/5 transition-colors w-full"
              style={{ borderRadius: 2 }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center px-3 py-2 text-sm text-sidebar-muted hover:text-sidebar-text hover:bg-white/5 transition-colors w-full"
            style={{ borderRadius: 2 }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-56 min-h-screen">
        <div
          className={`${config.maxWidth || "max-w-5xl"} mx-auto px-6 py-8`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
