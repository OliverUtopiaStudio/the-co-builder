import Link from "next/link";
import { stages, keyTakeaways } from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              CB
            </div>
            <span className="font-bold">The Co-Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login?redirect=/admin"
              className="text-xs text-muted/50 hover:text-muted transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            Utopia Studio
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The Co-Builder
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            27 sequenced assets from Invention to Spinout. A step-by-step
            framework for AI-native venture building.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-accent text-white font-medium text-lg hover:bg-accent/90 transition-colors"
            >
              Start as a Fellow
            </Link>
            <a
              href="#framework"
              className="px-8 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-surface transition-colors"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { num: "27", label: "Sequenced Assets" },
            { num: "7", label: "Stage Groups" },
            { num: "13", label: "Decision Gates" },
            { num: "1", label: "Spinout" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-accent">{stat.num}</div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Key Insight */}
        <section className="mb-20">
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-6">
            <p className="text-sm font-semibold text-gold uppercase tracking-wide mb-2">
              Key Insight
            </p>
            <p className="text-lg">
              Most ventures fail because they skip steps. Co-Build forces rigor:
              you can&apos;t build before you&apos;ve proven the problem, and
              you can&apos;t sell before you&apos;ve proven the AI works.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Create Your Account",
                desc: "Sign up as a Fellow and create a venture profile with your AI business idea.",
              },
              {
                step: "2",
                title: "Work Through Each Asset",
                desc: "Answer action-based questions, upload deliverables, and build your venture step by step.",
              },
              {
                step: "3",
                title: "Build to Spinout",
                desc: "Complete all 27 assets across 7 stages to build a venture-ready company from invention to spinout.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-surface border border-border rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Framework Overview */}
        <section id="framework" className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">
            The 7 Stages
          </h2>
          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="bg-surface border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                    {stage.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{stage.title}</h3>
                    <p className="text-sm text-muted">{stage.subtitle}</p>
                  </div>
                  <div className="text-xs text-muted">
                    {stage.assets.length} assets
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Key Takeaways
          </h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {keyTakeaways.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border"
              >
                <span className="w-7 h-7 shrink-0 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16 border-t border-border">
          <h2 className="text-2xl font-bold mb-3">
            Ready to Build Your Venture?
          </h2>
          <p className="text-muted mb-6">
            Join as a Fellow and start your Co-Build journey today.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-3 rounded-lg bg-accent text-white font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Create Your Account
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted">
          The Co-Build Framework — Utopia Studio
        </p>
      </footer>
    </div>
  );
}
