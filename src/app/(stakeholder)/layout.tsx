"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StakeholderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStakeholder() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?mode=stakeholder");
        return;
      }
      const { data: fellow } = await supabase
        .from("fellows")
        .select("role")
        .eq("auth_user_id", user.id)
        .single();

      if (!fellow || fellow.role !== "stakeholder") {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkStakeholder();
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
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/portfolio"
            className="text-foreground font-semibold text-sm hover:text-accent transition-colors"
          >
            Fellow Portfolio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">Stakeholder view</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
