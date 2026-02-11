"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/fellows", label: "Fellows" },
  { href: "/admin/framework", label: "Framework" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: fellow } = await supabase
        .from("fellows")
        .select("role")
        .eq("auth_user_id", user.id)
        .single();

      if (!fellow || fellow.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
            <path d="M2 4.5h16M2 10h16M2 15.5h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-sidebar-text font-bold text-xs tracking-[2px]">ADMIN</span>
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
            href="/admin"
            className="block"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="text-sidebar-text font-bold text-[10px] tracking-[2px] leading-relaxed">
              THE<br />UTOPIA<br />STUDIO
            </div>
            <div className="text-sidebar-text text-sm font-medium mt-3">The Co-Builder</div>
            <div className="inline-block text-[10px] tracking-[1.5px] uppercase font-semibold text-accent mt-1">
              Admin
            </div>
          </Link>
        </div>

        <div className="px-3 mt-2">
          <div className="label-uppercase px-2 mb-2 text-sidebar-muted" style={{ fontSize: 10 }}>Navigation</div>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
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
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 text-sm text-sidebar-muted hover:text-sidebar-text hover:bg-white/5 transition-colors w-full"
            style={{ borderRadius: 2 }}
          >
            Fellow View
          </Link>
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
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
