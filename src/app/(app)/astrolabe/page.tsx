"use client";

export default function AstrolabePage() {
  return (
    <div className="space-y-12 max-w-3xl">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Living Document</div>
        <h1 className="text-2xl font-medium tracking-tight">Astrolabe</h1>
        <p className="text-muted text-sm mt-2">
          Our ethos and build values. Long before GPS, the Gulf had its own
          navigators. This document is named after the instrument that told you
          exactly where you stood, so you could decide for yourself where to go.
        </p>
      </div>

      {/* Part One — The Platform */}
      <section className="space-y-6">
        <h2 className="label-uppercase text-foreground font-medium">
          Part One · The Platform
        </h2>
        <p className="text-sm text-foreground leading-relaxed">
          Welcome to the Utopia Platform. A venture platform of funds and studios
          — combining capital, technical and regional intelligence, and AI-native
          execution to co-build and back founders from idea to Series A across
          emerging markets.
        </p>

        <div>
          <h3 className="text-sm font-medium mb-3">One Platform. Three Entities.</h3>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Utopia Capital Management is the umbrella. Beneath it, three
            interconnected entities — two funds and a studio — share team, IP,
            data, and operating capability. The design is deliberate: capital
            and company-building run as one system, not as parallel tracks.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Emerging and frontier markets offer significant untapped growth
            potential. Venture capital is shifting towards being more dynamic,
            GTM-speed, and founder-focused. AI is rapidly reshaping how
            startups are built and scaled. Utopia is built for exactly this
            moment.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1">
          <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-accent mb-2">Fund · Middle East</div>
            <h4 className="font-medium text-sm mb-1">A-typical Ventures</h4>
            <p className="text-muted text-xs leading-relaxed">
              Early-stage venture fund investing across the Middle East.
              A-typical backs founders operating in markets that are often
              overlooked by conventional capital — where the structural gaps are
              largest and the timing is right. Works in close collaboration with
              The Studio to accelerate portfolio growth with shared IP and AI
              capabilities.
            </p>
          </div>
          <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-accent mb-2">Fund · Southeast Asia</div>
            <h4 className="font-medium text-sm mb-1">The Radical Fund</h4>
            <p className="text-muted text-xs leading-relaxed">
              Venture fund investing across Southeast Asia — one of the
              fastest-growing economic corridors in the world. Radical moves
              into markets with deep domain density and strong growth
              fundamentals. Like A-typical, it draws on The Studio&apos;s
              execution capability to compound value across portfolio companies
              and geographies.
            </p>
          </div>
          <div className="bg-surface border border-border p-5" style={{ borderRadius: 2 }}>
            <div className="label-uppercase text-accent mb-2">Venture Studio · Global</div>
            <h4 className="font-medium text-sm mb-1">The Utopia Studio</h4>
            <p className="text-muted text-xs leading-relaxed">
              The execution and innovation engine of the platform. The Studio
              builds new ventures from domain expertise and optimises existing
              companies with AI and frontier technologies. It is the bridge
              between the two funds — sharing team, IP, and data to create
              exponential value for portfolio companies expanding across
              regions.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed italic">
          The platform&apos;s power is in the integration. A company built in
          Doha through The Studio can be backed by A-typical, scaled into
          Southeast Asia through Radical&apos;s network, and optimised by shared
          AI infrastructure that no single fund could build alone. The benefit
          is not additive. It compounds.
        </p>
      </section>

      {/* Part One — How We Work */}
      <section className="space-y-6">
        <h2 className="label-uppercase text-foreground font-medium">
          How We Work
        </h2>

        <div>
          <h3 className="text-sm font-medium mb-3">What We Are Building</h3>
          <p className="text-sm text-muted leading-relaxed mb-4">
            The aim is simple to say and hard to earn: the best company builder
            in the world. Not eventually. As the benchmark we hold ourselves to
            right now, from day one, in every decision we make.
          </p>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Build the studio.</strong> The studio is a product. Every role here exists to make that product exceptional. We design the systems, the processes, the tools, and the team culture so that the studio gets faster and sharper with every cohort. We don&apos;t just build companies. We build the machine that builds companies.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Deliver with fellows.</strong> Fellows are domain experts who&apos;ve spent years inside systems that need fixing. Our job is to find them, back them, and co-build alongside them — combining their insight with our process, our capital, and our team&apos;s full force. Every spinout is proof that the studio works.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Operate as part of Utopia Capital.</strong> The studio does not operate in isolation. We are part of the Utopia Capital group — connected to patient, purposeful capital and a wider network of investors, operators, and advisors who share the same long-term thesis. The studio sources and builds. The group backs and scales.</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">What We Believe</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Domain experts are the unfair advantage.</strong> The best companies don&apos;t come from trend-watching. They come from people who&apos;ve spent years inside a broken system, quietly knowing exactly how to fix it.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Build the smallest true thing.</strong> Every new venture wants to be everything at once. We look for the single version of an idea that proves the logic — the one customer, the one workflow, the one decision that unlocks everything else.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Speed is a moral choice.</strong> When we move slowly, someone pays for it. Speed isn&apos;t about rushing — it&apos;s about respecting what&apos;s at stake.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Qatar is the lab. The world is the market.</strong> We operate here because the conditions are rare. Every company we build must answer: Why would someone in Singapore, São Paulo, or Stuttgart pay for this?</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Conviction over consensus.</strong> Good ideas rarely win a room on first hearing. We pressure-test hard, then we commit — and when we commit, we move as one.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">The standard is the best in the world.</strong> Not the best in Doha. Not the best in the region. Every process, every fellow, every company we co-build — it either raises the bar or it doesn&apos;t.</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">How We Work</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">We start with the problem, not the product.</strong> Every pod, every sprint, every pitch begins the same way: who is in pain, and why haven&apos;t they been able to fix it?</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Our gates are a gift.</strong> Each stage gate exists to protect people. Stopping a bad idea at Gate 2 isn&apos;t failure. It&apos;s the whole point.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Fellows are founders-in-training, not clients.</strong> We co-build. That means shared risk, shared accountability, and honest feedback that&apos;s only useful if it&apos;s real.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Every decision has a name on it.</strong> Discussion is open and loud. But when the conversation ends, one person owns the call — and that person is named before anyone leaves the room.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">↳</span>
              <span><strong className="text-foreground">Work lives in the open.</strong> We build in Notion, in demos, in weekly reviews that anyone can read. If something isn&apos;t visible, it doesn&apos;t exist in our operating system.</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">What Best Looks Like</h3>
          <p className="text-sm text-muted leading-relaxed">
            &quot;Best in the world&quot; is not a statement of ambition. It&apos;s
            an operating instruction. It applies at every level: the studio as a
            factory, the ventures we build inside it, and the individuals doing
            the work.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">What We Don&apos;t Do</h3>
          <ul className="space-y-2 text-sm text-muted list-disc list-inside">
            <li>Build solutions and then hunt for problems to justify them.</li>
            <li>Protect weak ideas to spare someone&apos;s feelings.</li>
            <li>Confuse a beautifully designed deck with a company that can survive contact with a real customer.</li>
            <li>Mistake a full calendar for meaningful progress.</li>
            <li>Build for Doha while forgetting the world is watching.</li>
          </ul>
        </div>

        <div className="bg-surface border border-border border-l-4 border-l-accent p-5" style={{ borderRadius: 2 }}>
          <p className="text-xs label-uppercase text-muted mb-1">The Standard</p>
          <p className="text-sm font-medium text-foreground">
            Is this the clearest, fastest, most honest version of what we&apos;re
            trying to do?
          </p>
          <p className="text-sm text-muted mt-2">
            Fixed stars. Open water. Know where you are — then move.
          </p>
        </div>
      </section>

      {/* Part Two — The Thesis */}
      <section className="space-y-6">
        <h2 className="label-uppercase text-foreground font-medium">
          Part Two · The Thesis
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          The biggest problems in the world&apos;s most important systems are
          invisible to outsiders. They are obvious to the people who have spent
          years inside them.
        </p>

        <div>
          <h3 className="text-sm font-medium mb-2">The Belief</h3>
          <p className="text-sm text-muted leading-relaxed">
            Venture returns are not random. They cluster around one condition: a
            real system gap that incumbents cannot close, met by a team that
            owns the domain. Technology is not the moat. What is scarce is the
            operator who spent a decade inside the system — who knows where the
            data lives, who the real buyer is, and why every previous attempt
            failed. We are not backing ideas. We are backing market structures
            that are broken in ways that only insiders can see. Those people are
            the asset. We go and find them.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">The Problems We Back</h3>
          <p className="text-sm text-muted leading-relaxed mb-4">
            We look for systems that are broken in a way the market will not
            self-correct: invisible enough that incumbents haven&apos;t solved
            it, structural enough that a startup cannot casually enter, painful
            enough that someone with a budget will pay to fix it.
          </p>
          <ul className="space-y-3 text-sm text-muted">
            <li><strong className="text-foreground">Hidden data.</strong> Systems with rich operational telemetry that no one aggregates, interprets, or acts on.</li>
            <li><strong className="text-foreground">High-frequency drift.</strong> Where processes deviate from policy daily, generating cost and risk that accumulates silently.</li>
            <li><strong className="text-foreground">Structural constraints.</strong> Regulatory requirements, safety standards, or uptime obligations that make change slow and expensive for incumbents.</li>
            <li><strong className="text-foreground">Knowledge concentration.</strong> Expertise that lives in a handful of people and will retire or move on. The company that captures it first owns the institutional memory of the sector.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">The Pods</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li><strong className="text-foreground">Infrastructure Intelligence.</strong> Critical infrastructure generates vast operational telemetry that sits in silos. We build AI systems that turn raw telemetry into real-time risk signals and operational decisions.</li>
            <li><strong className="text-foreground">Decarb Systems.</strong> Scope 3 reporting, carbon pricing, ESG disclosure, and supply chain compliance create enormous operational data problems. We build the systems that turn emissions data into audit-ready records.</li>
            <li><strong className="text-foreground">Sovereign Compute.</strong> Gulf nations cannot run national AI strategies on infrastructure they do not control. Qatar&apos;s position is a structural advantage no competitor can replicate cheaply.</li>
            <li><strong className="text-foreground">Programmable Flow Rails.</strong> Cross-border payments, trade finance, and compliance automation run on systems built in the 1970s. We build programmable infrastructure layers that sit on top of or bypass the legacy architecture.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Why Here. Why Now.</h3>
          <p className="text-sm text-muted leading-relaxed">
            Qatar is at an inflection point. A national AI strategy, a sovereign
            wealth platform, a mandate to diversify the economy, and a
            concentration of some of the world&apos;s most capital-intensive
            infrastructure in one geography — the window to build the companies
            that will define this region&apos;s technology stack is open now.
            The companies we build use Qatar as the proving ground and scale
            globally from there. The GCC is the wedge. The addressable market is
            the world&apos;s critical systems.
          </p>
        </div>
      </section>

      {/* Part Three — The Co-Build Framework */}
      <section className="space-y-6">
        <h2 className="label-uppercase text-foreground font-medium">
          Part Three · The Co-Build Framework
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          A discipline for building AI-native companies from domain expertise.
          Structured enough to produce results consistently. Flexible enough to
          meet a fellow where they are.
        </p>

        <div>
          <h3 className="text-sm font-medium mb-2">Why a Framework</h3>
          <p className="text-sm text-muted leading-relaxed">
            Most ventures built alongside domain experts fail at the same
            points. The expert knows the problem but does not know how to define
            the buyer. They build before validating. They price on instinct.
            These are not talent failures. They are sequencing failures. The
            framework exists to fix the sequence. AI-native building changes the
            economics — what used to take months can now be scoped in days. The
            framework compresses the cycle, raises the bar on what qualifies as
            validated, and encodes the AI-native approach into every asset.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">The Three Phases</h3>
          <ul className="space-y-4 text-sm text-muted">
            <li>
              <strong className="text-foreground">Phase 1 — Invent and Discover (Stages 00–04).</strong> Stage 00 is the Invention Gate. Stage 01 produces the Problem Deep Dive and Workflow Map. Stage 02 validates the buyer. Stage 03 establishes the AI and data foundation. Stage 04 is the PRD Culmination. Gate: build/kill decision.
            </li>
            <li>
              <strong className="text-foreground">Phase 2 — Build and Sell (Stage 05).</strong> Build and sales run in parallel. The Architecture Canvas defines what gets built. The LOI Pack and Pilot SOW convert warm conversations into signed commercial commitments. Gate: a signed LOI and a funded pilot.
            </li>
            <li>
              <strong className="text-foreground">Phase 3 — Scale and Spinout (Stages 06–07).</strong> Stage 06 proves the model is repeatable. Stage 07 completes the spinout: investor pack, data room, legal incorporation, board materials. Target: eighteen months from co-build start to Series A readiness.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">What the Framework Is Not</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>It is not a reporting tool. The assets exist for the venture, not for the studio.</li>
            <li>It is not a guarantee of success. It eliminates common failure modes and ensures we find out as early as possible, with as little capital destroyed as possible.</li>
            <li>It is not fixed. The framework improves with every cohort. It is a living system, not a sacred text.</li>
          </ul>
          <p className="text-sm text-muted mt-3">
            Eight stages. Twenty-seven assets. One spinout. Every venture earns its way forward.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t border-border">
        <p className="label-uppercase text-muted">
          Astrolabe · Living Document · Doha
        </p>
      </div>
    </div>
  );
}
