"use client";

import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   Meet the Team — Astrolabes
   Grid of team member cards grouped by organisation
   ───────────────────────────────────────────────────────────── */

/* ── Team data ── */

interface TeamMember {
  name: string;
  role: string;
}

interface TeamGroup {
  org: string;
  description: string;
  accent: string;       // colour for the avatar ring / org badge
  members: TeamMember[];
}

const TEAMS: TeamGroup[] = [
  {
    org: "The Utopia Studio",
    description: "The venture studio team — building, shipping, and operating.",
    accent: "#CC5536",
    members: [
      { name: "Ollie", role: "CPO" },
      { name: "Karan", role: "CTO" },
      { name: "JJ", role: "Head of Portfolio" },
      { name: "Mo", role: "Founders Associate" },
      { name: "TBC", role: "Agentic Lead" },
      { name: "Michael", role: "Marketing & Comms Lead" },
      { name: "TBC", role: "Product Engineer" },
      { name: "TBC", role: "Product Engineer" },
      { name: "TBC", role: "Product Engineer" },
      { name: "TBC", role: "Head of Design" },
      { name: "TBC", role: "Head of BD & Partnerships" },
      { name: "Koleen", role: "Head of Ops & Compliance" },
      { name: "Dianne", role: "Finance & Admin Lead" },
    ],
  },
  {
    org: "Utopia Platform",
    description: "The holding company and strategic leadership.",
    accent: "#3B82F6",
    members: [
      { name: "Alina", role: "CEO, Founding Partner" },
      { name: "Roo", role: "CEO, Founding Partner" },
      { name: "Shamona", role: "CFO" },
      { name: "Kon", role: "CSO" },
    ],
  },
  {
    org: "A-Typical Fund",
    description: "Our investment arm — sourcing and backing breakout ventures.",
    accent: "#8B5CF6",
    members: [
      { name: "Ahmad", role: "Principal" },
      { name: "Aly", role: "Venture Partner" },
    ],
  },
  {
    org: "Radical Fund",
    description: "Deep-conviction capital for radical ideas.",
    accent: "#10B981",
    members: [
      { name: "Steve", role: "Senior Associate" },
      { name: "Alex", role: "Associate" },
      { name: "May", role: "Chief of Staff" },
    ],
  },
];

/* ── Helpers ── */

/** Extract up to two initials from a name. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ── Page ── */

export default function MeetTheTeamPage() {
  return (
    <div className="space-y-14 max-w-3xl pb-16">
      {/* ── Breadcrumb ── */}
      <div>
        <Link
          href="/astrolabe"
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          ← Back to Astrolabes
        </Link>
      </div>

      {/* ── Header ── */}
      <div>
        <div className="label-uppercase mb-3">The People Behind Utopia</div>
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          Meet the <span className="text-accent">Team</span>
        </h1>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          Four organisations, one shared mission — build the future of venture
          from the Gulf. Here are the people making it happen.
        </p>
      </div>

      {/* ── Team Groups ── */}
      {TEAMS.map((group) => (
        <section key={group.org} className="space-y-4">
          {/* Org header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2 h-2 flex-shrink-0"
                style={{ backgroundColor: group.accent, borderRadius: 1 }}
              />
              <h2 className="font-medium text-base tracking-tight">
                {group.org}
              </h2>
            </div>
            <p className="text-muted text-xs leading-relaxed pl-4">
              {group.description}
            </p>
          </div>

          {/* Member cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.members.map((member, idx) => (
              <div
                key={`${member.name}-${member.role}-${idx}`}
                className="group flex items-center gap-3.5 p-4 bg-surface border border-border hover:border-accent/40 hover:shadow-sm transition-all"
                style={{ borderRadius: 2 }}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-white text-xs font-medium tracking-wide"
                  style={{
                    backgroundColor:
                      member.name === "TBC"
                        ? "var(--muted-light)"
                        : group.accent,
                    borderRadius: "50%",
                    opacity: member.name === "TBC" ? 0.55 : 1,
                  }}
                >
                  {initials(member.name)}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h3
                    className={`font-medium text-sm leading-tight truncate ${
                      member.name === "TBC"
                        ? "text-muted italic"
                        : "group-hover:text-accent transition-colors"
                    }`}
                  >
                    {member.name}
                  </h3>
                  <p className="text-muted text-xs mt-0.5 truncate">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Footer ── */}
      <p className="text-xs text-muted">
        Roles marked TBC are being actively recruited. Reach out if you know
        someone exceptional.
      </p>
    </div>
  );
}
