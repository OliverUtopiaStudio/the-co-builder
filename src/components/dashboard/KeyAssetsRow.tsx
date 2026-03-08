"use client";

import { ExternalLink } from "lucide-react";
import type { CategorizedLinks } from "@/app/actions/fellows";

const CATEGORY_LABELS: Record<keyof CategorizedLinks, string> = {
  product: "Product",
  gtm: "GTM",
  investment: "Investment",
};

type Props = {
  links: CategorizedLinks;
};

export default function KeyAssetsRow({ links }: Props) {
  const flat = (Object.entries(links) as [keyof CategorizedLinks, { title: string; url: string }[]][])
    .flatMap(([key, arr]) =>
      arr.map((item) => ({ ...item, category: CATEGORY_LABELS[key] }))
    );

  if (flat.length === 0) {
    return (
      <section>
        <h2 className="label-uppercase text-[10px] mb-3 text-muted">
          Key assets
        </h2>
        <p className="text-muted text-sm">No key links added yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="label-uppercase text-[10px] mb-3 text-muted">
        Key assets
      </h2>
      <div className="flex flex-wrap gap-2">
        {flat.map((link, i) => (
          <a
            key={`${link.category}-${i}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-surface border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors min-h-[44px]"
            style={{ borderRadius: 2 }}
          >
            <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-[220px]">
              {link.title}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}
