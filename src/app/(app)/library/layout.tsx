"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/library", label: "Assets & Modules" },
  { href: "/library/limitless", label: "Becoming Limitless" },
];

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLimitless = pathname?.startsWith("/library/limitless");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-uppercase mb-2">Content Library</div>
        <nav className="flex gap-1 border-b border-border" role="tablist">
          {tabs.map((tab) => {
            const active =
              (tab.href === "/library" && pathname === "/library") ||
              (tab.href === "/library/limitless" && isLimitless);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={active}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
