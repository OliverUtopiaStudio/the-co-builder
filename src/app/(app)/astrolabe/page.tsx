"use client";

/* ─────────────────────────────────────────────────────────────
   Astrolabes — Living Document
   Content sourced from Astrolabes_UtopiaStudio_v2.html
   Styled to match the Co-Build app design system
   ───────────────────────────────────────────────────────────── */

export default function AstrolabePage() {
  return (
    <div className="space-y-14 max-w-3xl pb-16">
      {/* ── HERO ILLUSTRATION ── */}
      <AstrolabeHero />

      {/* ── COVER ── */}
      <div>
        <div className="label-uppercase mb-3">
          Living Document · The Utopia Studio · Doha · 2026
        </div>
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          Astro<span className="text-accent">labes</span>
        </h1>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          Long before GPS, the Gulf had its own navigators. This is the
          instrument that tells you exactly where you stand — so you can decide
          for yourself where to go.
        </p>

        {/* Intro letter */}
        <div
          className="bg-surface border border-border border-l-4 border-l-accent p-6 mt-8 max-w-2xl"
          style={{ borderRadius: 2 }}
        >
          <div className="label-uppercase text-accent mb-4">
            From · Ollie &amp; Karan · Studio Directors
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            Hi — we&apos;re <strong>Ollie and Karan</strong>, your Studio
            Directors.
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            You&apos;re reading this because you&apos;re either joining us,
            building with us, or seriously thinking about both. What follows is
            not an employee handbook. It&apos;s not a mission statement.
            It&apos;s the clearest version we could write of{" "}
            <strong>
              what we actually believe, how we actually work, and what
              we&apos;re actually building
            </strong>{" "}
            — and why it matters that we get it right.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            We named it after the astrolabe. Gulf navigators used them for
            centuries before GPS existed. An astrolabe doesn&apos;t tell you
            where to go. It tells you exactly where you are — so you can make
            that call yourself. That&apos;s the kind of team we&apos;re
            building.
          </p>
          <p className="text-sm text-muted italic mt-4">
            — Ollie Graham-Yooll &amp; Karan
          </p>
        </div>
      </div>

      {/* ── MASTER DIAGRAM ── */}
      <section className="space-y-4">
        <div className="label-uppercase">The System</div>
        <p className="text-sm text-muted leading-relaxed max-w-xl">
          The diagram below shows how the whole platform connects — from a
          fellow&apos;s domain insight to a company at Series A. Everything we
          do lives inside this loop.
        </p>
        <SystemFlowDiagram />
        <p className="text-xs text-muted italic border-l-2 border-accent/30 pl-3">
          Seven stages from hidden problem to strategic exit — Co-build is the
          engine at the centre, and every cohort makes the next iteration faster
          and sharper.
        </p>
      </section>

      <hr className="border-border" />

      {/* ── PART ONE: PLATFORM ── */}
      <section className="space-y-6">
        <div>
          <div className="label-uppercase mb-1">Part One</div>
          <h2 className="text-lg font-medium tracking-tight">The Platform</h2>
        </div>

        <p className="text-sm text-foreground leading-relaxed max-w-xl">
          Utopia Capital Management is the parent. Beneath it: two funds and a
          studio, sharing team, IP, data, and operating capability. Capital and
          company-building run as one system — not parallel tracks that
          occasionally meet at a board meeting.
        </p>
        <p className="text-sm text-muted leading-relaxed max-w-xl">
          The power is not in the individual entities. It&apos;s in the
          integration. A company built in Doha through the Studio can be backed
          by A-typical, scaled into Southeast Asia through Radical&apos;s
          network, and turbocharged by shared AI infrastructure that no single
          fund could build alone. The benefit is not additive. It compounds.
        </p>

        <PlatformStackDiagram />
        <p className="text-xs text-muted italic border-l-2 border-accent/30 pl-3">
          The Studio is the engine in the middle — what it builds, learns, and
          systemises becomes the shared advantage of the whole platform.
        </p>
      </section>

      <hr className="border-border" />

      {/* ── PART TWO: HOW WE WORK ── */}
      <section className="space-y-6">
        <div>
          <div className="label-uppercase mb-1">Part Two</div>
          <h2 className="text-lg font-medium tracking-tight">How We Work</h2>
        </div>

        {/* Moonshot callout */}
        <div
          className="border-2 border-accent p-5 relative mt-4"
          style={{ borderRadius: 2 }}
        >
          <span
            className="absolute -top-2.5 left-5 bg-white px-2 label-uppercase text-accent"
            style={{ fontSize: 10 }}
          >
            The Moonshot Standard
          </span>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            Google X calls it the <strong>10x rule</strong>: if you&apos;re
            trying to make something 10% better, you&apos;re competing with
            everyone else in the world who&apos;s already working on that
            problem. If you&apos;re trying to make it 10 times better,
            you&apos;ve left almost all of them behind.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            We apply that logic here.{" "}
            <strong>
              The aim is simple to say and hard to earn: the best company
              builder in the world.
            </strong>{" "}
            Not the best in Doha. Not the best in the region. Not &quot;one of
            the top studios in emerging markets.&quot; The best. From day one. In
            every decision we make.
          </p>
        </div>

        {/* What We Are Building */}
        <div>
          <h3 className="text-sm font-medium mb-3">What we are building</h3>
          <div className="space-y-4">
            <WorkItem
              icon="↳"
              title="Build the studio."
              body="The studio is a product. Every role exists to make that product exceptional. We design the systems, processes, tools, and team culture so that the studio gets faster and sharper with every cohort. We don't just build companies. We build the machine that builds companies."
            />
            <WorkItem
              icon="↳"
              title="Deliver with fellows."
              body="Fellows are domain experts who've spent years inside systems that need fixing. One of our early fellows spent eleven years as a procurement engineer at a major Gulf infrastructure operator. He knew exactly where the data was buried, exactly why previous software attempts had failed, and exactly who would sign the first contract. Our job was to remove every barrier between that knowledge and a working business. That's the model. Find the insider. Back the insider. Build with the insider."
            />
            <WorkItem
              icon="↳"
              title="Operate as part of Utopia Capital."
              body="The studio doesn't operate in isolation. We're connected to patient capital and a wider network of investors, operators, and advisors who share the same long-term thesis. The studio sources and builds. The group backs and scales."
            />
          </div>
        </div>

        <Divider />

        {/* What We Believe */}
        <div>
          <h3 className="text-sm font-medium mb-4">What we believe</h3>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <BeliefCard
              title="Domain experts are the unfair advantage."
              body="The best companies don't come from trend-watching. They come from people who've spent years inside a broken system, quietly knowing exactly how to fix it. Our fellows are those people."
            />
            <BeliefCard
              title="Build the smallest true thing."
              body="A fellow once came to us with a platform for the entire Gulf logistics sector. We spent the first two weeks narrowing it to one workflow, one buyer, one port. That was the company. Everything else was noise."
            />
            <BeliefCard
              title="Speed is a moral choice."
              body="When we move slowly, someone pays for it. The fellow loses months of momentum. The fund loses compounding time. Doha loses a company that could have been here first. Speed isn't about rushing — it's about respecting what's at stake."
            />
            <BeliefCard
              title="Qatar is the lab. The world is the market."
              body="We operate here because the conditions are rare. But we never mistake local traction for global validation. Every company we build must answer: why would someone in Singapore, São Paulo, or Stuttgart pay for this?"
            />
            <BeliefCard
              title="Conviction over consensus."
              body="Good ideas rarely win a room on first hearing. We don't govern by committee. We pressure-test hard, then we commit — and when we commit, we move as one."
            />
            <BeliefCard
              title="The standard is the best in the world."
              body="Every process we design, every fellow we take on, every company we co-build — it either raises the bar or it doesn't. We choose the former, every time."
            />
          </div>
        </div>

        <Divider />

        {/* How We Actually Work */}
        <div>
          <h3 className="text-sm font-medium mb-3">How we actually work</h3>
          <div className="space-y-0">
            <NumberedItem
              num="01"
              title="We start with the problem, not the product."
              body="Every pod, every sprint, every pitch begins the same way: who is in pain, and why haven't they been able to fix it? The product is just our best current answer to that question."
            />
            <NumberedItem
              num="02"
              title="Our gates are a gift."
              body="Each stage gate exists to protect people — the fellow's time, the studio's capital, the market's trust. Stopping a bad idea at Gate 2 isn't failure. It's the whole point. The gate didn't kill the company. The company was never there."
            />
            <NumberedItem
              num="03"
              title="Fellows are founders-in-training, not clients."
              body="We co-build. That means shared risk, shared accountability, and honest feedback. A fellow once showed us a prototype they'd spent six weeks building. We told them it was solving the wrong problem. That conversation cost us a difficult afternoon and saved twelve months of wasted build."
            />
            <NumberedItem
              num="04"
              title="Every decision has a name on it."
              body="Discussion here is open and loud. Debate is encouraged. But when the conversation ends, one person owns the call — and that person is named before anyone leaves the room. Ambiguity isn't humility. It's just a delayed argument."
            />
            <NumberedItem
              num="05"
              title="Work lives in the open."
              body="We build in Notion, in demos, in weekly reviews that anyone can read. If something isn't visible, it doesn't exist in our operating system. Brilliant thinking trapped in someone's head is worth nothing to the studio."
            />
          </div>
        </div>

        <Divider />

        {/* What We Don't Do */}
        <div>
          <h3 className="text-sm font-medium mb-3">What we don&apos;t do</h3>
          <div className="border-l-4 border-accent pl-5 space-y-0">
            <DontItem text="Build solutions and then hunt for problems to justify them." />
            <DontItem text="Protect weak ideas to spare someone's feelings." />
            <DontItem text="Confuse a beautifully designed deck with a company that can survive contact with a real customer." />
            <DontItem text="Mistake a full calendar for meaningful progress." />
            <DontItem text="Build for Doha while forgetting the world is watching." />
          </div>
        </div>
      </section>

      <hr className="border-border" />

      {/* ── PART THREE: THESIS ── */}
      <section className="space-y-6">
        <div>
          <div className="label-uppercase mb-1">Part Three</div>
          <h2 className="text-lg font-medium tracking-tight">
            The <span className="text-accent">Thesis</span>
          </h2>
        </div>

        <p className="text-sm text-foreground leading-relaxed max-w-xl" style={{ fontSize: 15 }}>
          The biggest problems in the world&apos;s most important systems are
          invisible to outsiders. They are obvious to the people who have spent
          years inside them.
        </p>

        {/* Dark callout */}
        <div
          className="bg-foreground p-6"
          style={{ borderRadius: 2 }}
        >
          <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.85)" }}>
            Venture returns are not random. They cluster around one condition: a
            real system gap that incumbents cannot close, met by a team that owns
            the domain.{" "}
            <strong className="text-white not-italic">
              Technology is not the moat. Technology is available to everyone.
            </strong>{" "}
            What is scarce is the operator who spent a decade inside the system —
            who knows where the data lives, who the real buyer is, and why every
            previous attempt failed.
          </p>
        </div>

        <p className="text-sm text-muted leading-relaxed max-w-xl">
          We are not backing ideas. We are backing market structures that are
          broken in ways that only insiders can see. The most defensible
          companies are built on hidden context — problems that look like
          technical failures but are structural ones. The solutions are in the
          heads of the people who have spent years trying to fix things from the
          inside.
        </p>

        <Divider />

        {/* Problem types diagram */}
        <div>
          <h3 className="text-sm font-medium mb-2">The problems we back</h3>
          <p className="text-sm text-muted leading-relaxed max-w-xl mb-4">
            The diagram below maps the four problem types we look for — by how
            visible they are to outsiders, and how structurally entrenched the
            dysfunction is.
          </p>
          <ProblemTypesDiagram />
          <p className="text-xs text-muted italic border-l-2 border-accent/30 pl-3 mt-3">
            The top-left quadrant — high structural entrenchment, low outsider
            visibility — is where we find the most defensible companies.
          </p>
        </div>

        <Divider />

        {/* Pods */}
        <div>
          <h3 className="text-sm font-medium mb-2">The pods</h3>
          <p className="text-sm text-muted leading-relaxed max-w-xl mb-4">
            Four domains. One thesis. Each pod starts from the same place: a
            system that is broken in ways only insiders can see.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <PodCard
              num="01"
              title="Infrastructure Intelligence"
              body="Critical infrastructure generates vast operational telemetry that sits in silos and is never synthesised. We build AI systems that turn raw telemetry into real-time risk signals and operational decisions."
            />
            <PodCard
              num="02"
              title="Decarb Systems"
              body="Scope 3 reporting, carbon pricing, ESG disclosure, and supply chain compliance create enormous operational data problems. We build the systems that turn emissions data into audit-ready records and policy-aligned reporting."
            />
            <PodCard
              num="03"
              title="Sovereign Compute"
              body="Gulf nations cannot run national AI strategies on infrastructure they do not control. Qatar's position — gas surplus, power availability, land, and a clear national AI mandate — is a structural advantage no competitor can replicate cheaply."
            />
            <PodCard
              num="04"
              title="Programmable Flow Rails"
              body="Cross-border payments, trade finance, and compliance automation run on systems built in the 1970s. We build programmable infrastructure layers that sit on top of or bypass the legacy architecture using regulated digital infrastructure."
            />
          </div>
        </div>
      </section>

      <hr className="border-border" />

      {/* ── PART FOUR: CO-BUILD FRAMEWORK ── */}
      <section className="space-y-6">
        <div>
          <div className="label-uppercase mb-1">Part Four</div>
          <h2 className="text-lg font-medium tracking-tight">
            The Co-Build <span className="text-accent">Framework</span>
          </h2>
        </div>

        <p className="text-sm text-foreground leading-relaxed max-w-xl">
          Most ventures built alongside domain experts fail at the same points.
          The expert knows the problem but doesn&apos;t know how to define the
          buyer. They build before validating. They price on instinct. They reach
          investors before the numbers are honest.
        </p>
        <p className="text-sm text-muted leading-relaxed max-w-xl">
          These are not talent failures. They are sequencing failures. The
          framework exists to fix the sequence.
        </p>

        {/* 10x framing */}
        <div
          className="border-2 border-accent p-5 relative"
          style={{ borderRadius: 2 }}
        >
          <span
            className="absolute -top-2.5 left-5 bg-white px-2 label-uppercase text-accent"
            style={{ fontSize: 10 }}
          >
            The 10x framing
          </span>
          <p className="text-sm text-foreground leading-relaxed">
            A traditional accelerator tries to make a good founder 10% better —
            more mentorship, more network, more pitch coaching. We&apos;re
            attempting something different: taking a domain expert who has never
            built a company and giving them the architecture, capital, and team
            to build a{" "}
            <strong className="text-accent">
              category-defining business in 90 days
            </strong>
            . That&apos;s not an incremental improvement on the accelerator
            model. It&apos;s a different thesis entirely.
          </p>
        </div>

        {/* Co-build pipeline diagram */}
        <div>
          <p className="text-sm text-muted leading-relaxed max-w-xl mb-4">
            The diagram below shows the full co-build pipeline — three phases,
            seven stages, two hard gates. Ventures earn their way forward at
            each gate. No extensions.
          </p>
          <CoBuildPipelineDiagram />
          <p className="text-xs text-muted italic border-l-2 border-accent/30 pl-3 mt-3">
            Most ventures fail at sequencing, not talent — the framework fixes
            the order of operations so the fellow finds out early, with as
            little capital destroyed as possible.
          </p>
        </div>

        <Divider />

        {/* What the framework is not */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            What the framework is not
          </h3>
          <div className="border-l-4 border-accent pl-5 space-y-0">
            <DontItem text="A reporting tool. The assets exist for the venture, not for the studio. If an asset is being produced to satisfy an internal review rather than to advance the venture, that is a waste of the fellow's time." />
            <DontItem text="A guarantee of success. The framework eliminates common failure modes. It does not eliminate market risk or execution risk. What it guarantees is that we find out as early as possible, with as little capital destroyed as possible." />
            <DontItem text="Fixed. It improves with every cohort. Any team member who identifies a better approach should say so. It is a living system, not a sacred text." />
          </div>
        </div>
      </section>

      <hr className="border-border" />

      {/* ── CLOSING ── */}
      <section className="text-center space-y-5 py-8">
        <div className="label-uppercase">The Standard</div>
        <h2 className="text-lg font-medium tracking-tight leading-snug max-w-md mx-auto">
          Fixed stars. Open water.
          <br />
          Know where you are —<br />
          then move.
        </h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          Is this the clearest, fastest, most honest version of what we&apos;re
          trying to do?
        </p>
        <div className="inline-block">
          <span
            className="border border-accent px-6 py-3 label-uppercase text-accent inline-block"
            style={{ borderRadius: 2 }}
          >
            Return to this before anything ships
          </span>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-6 border-t border-border flex justify-between items-center">
        <span className="label-uppercase text-muted">
          The Utopia Studio · Doha
        </span>
        <span className="label-uppercase text-muted">
          Astrolabes · Living Document · 2026
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function WorkItem({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 py-4 border-b border-border first:border-t">
      <span className="text-accent shrink-0 text-sm">{icon}</span>
      <div>
        <div className="text-sm font-medium text-foreground mb-1">{title}</div>
        <p className="text-sm text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function NumberedItem({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 py-4 border-b border-border first:border-t items-start">
      <span className="text-accent/30 font-medium text-lg shrink-0 w-6 text-right">
        {num}
      </span>
      <div>
        <div className="text-sm font-medium text-foreground mb-1">{title}</div>
        <p className="text-sm text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function BeliefCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-surface p-5 hover:bg-accent/5 transition-colors">
      <div className="text-sm font-medium text-foreground mb-2">
        <span className="text-accent mr-1">↑</span>
        {title}
      </div>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function PodCard({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="border border-border p-5 hover:border-accent/50 transition-all group relative overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      <div className="label-uppercase text-accent mb-2">Pod {num}</div>
      <div className="text-sm font-medium text-foreground mb-2 leading-snug">
        {title}
      </div>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function DontItem({ text }: { text: string }) {
  return (
    <div className="text-sm text-muted italic py-3 border-b border-border last:border-b-0">
      <span className="text-accent not-italic font-mono mr-1">—</span>
      {text}
    </div>
  );
}

function Divider() {
  return (
    <div className="label-uppercase text-border tracking-widest py-2">
      / &nbsp;/ &nbsp;/ &nbsp;/ &nbsp;/ &nbsp;/
    </div>
  );
}

/* ─────────────────────────────────────────────
   SVG Diagrams — colours mapped to app tokens
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Hero Illustration — Astrolabe navigator
   ───────────────────────────────────────────── */

function AstrolabeHero() {
  return (
    <div
      className="bg-foreground overflow-hidden relative -mt-8"
      style={{ borderRadius: 2 }}
    >
      <svg
        viewBox="0 0 800 320"
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="'SF Mono', 'Fira Code', monospace"
        className="w-full"
        style={{ display: "block" }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          {/* Radial glow behind astrolabe */}
          <radialGradient id="astroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC5536" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#CC5536" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <rect width="800" height="320" fill="url(#heroGrid)" />

        {/* Glow behind astrolabe */}
        <circle cx="310" cy="168" r="160" fill="url(#astroGlow)" />

        {/* ── HORIZON LINE + WAVES ── */}
        <path
          d="M0 238 Q50 234 100 238 Q150 242 200 238 Q250 234 300 238 Q350 242 400 238 Q450 234 500 238 Q550 242 600 238 Q650 234 700 238 Q750 242 800 238"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <path
          d="M0 248 Q60 244 120 248 Q180 252 240 248 Q300 244 360 248 Q420 252 480 248 Q540 244 600 248 Q660 252 720 248 Q780 244 800 248"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.8"
        />
        <text x="680" y="234" fontSize="8" fill="rgba(255,255,255,0.25)" letterSpacing="2">
          HORIZON
        </text>

        {/* ── STAR — top right ── */}
        <g transform="translate(620, 48)">
          {/* Star rays */}
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#CC5536" strokeWidth="1.5" />
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#CC5536" strokeWidth="1.5" />
          <line x1="-14" y1="-14" x2="14" y2="14" stroke="#CC5536" strokeWidth="0.8" />
          <line x1="14" y1="-14" x2="-14" y2="14" stroke="#CC5536" strokeWidth="0.8" />
          {/* Star core */}
          <circle cx="0" cy="0" r="4" fill="#CC5536" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="#CC5536" strokeWidth="0.5" opacity="0.4" />
        </g>
        <text x="620" y="82" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)" letterSpacing="2">
          POLARIS
        </text>

        {/* ── SIGHTING LINES ── */}
        {/* Eye → astrolabe → star (upper sighting) */}
        <line
          x1="128" y1="168"
          x2="620" y2="48"
          stroke="#CC5536"
          strokeWidth="0.8"
          strokeDasharray="6,4"
          opacity="0.5"
        />
        {/* Eye → astrolabe → horizon (lower sighting) */}
        <line
          x1="128" y1="168"
          x2="720" y2="238"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
          strokeDasharray="6,4"
        />

        {/* Angle arc between sighting lines */}
        <path
          d="M 430 140 A 130 130 0 0 1 460 210"
          fill="none"
          stroke="#CC5536"
          strokeWidth="0.8"
          opacity="0.4"
        />
        <text x="470" y="178" fontSize="7" fill="#CC5536" opacity="0.6">
          θ
        </text>

        {/* ── ASTROLABE INSTRUMENT ── */}
        <g transform="translate(310, 168)">
          {/* Outer ring — mater */}
          <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="0" cy="0" r="86" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Degree ticks — outer ring */}
          {Array.from({ length: 72 }, (_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const isMajor = i % 6 === 0;
            const r1 = isMajor ? 82 : 85;
            const r2 = 90;
            const cos = Math.round(Math.cos(angle) * 100) / 100;
            const sin = Math.round(Math.sin(angle) * 100) / 100;
            return (
              <line
                key={`tick-${i}`}
                x1={cos * r1}
                y1={sin * r1}
                x2={cos * r2}
                y2={sin * r2}
                stroke={isMajor ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}
                strokeWidth={isMajor ? 1 : 0.5}
              />
            );
          })}

          {/* Cardinal marks */}
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const cx = Math.round(Math.cos(a) * 74 * 100) / 100;
            const cy = Math.round((Math.sin(a) * 74 + 3) * 100) / 100;
            return (
              <text
                key={`card-${deg}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                fontSize="6.5"
                fill="rgba(255,255,255,0.2)"
              >
                {deg}°
              </text>
            );
          })}

          {/* Inner circles — rete pattern */}
          <circle cx="0" cy="0" r="64" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Cross-hairs */}
          <line x1="-68" y1="0" x2="68" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="0" y1="-68" x2="0" y2="68" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Ecliptic ring — offset circle (the rete's key feature) */}
          <circle cx="12" cy="-8" r="52" fill="none" stroke="#CC5536" strokeWidth="0.8" opacity="0.3" />

          {/* Star pointers on the rete */}
          {[
            { x: 38, y: -32, label: "★" },
            { x: -22, y: -48, label: "★" },
            { x: 52, y: 14, label: "★" },
            { x: -44, y: 20, label: "★" },
            { x: 8, y: 56, label: "★" },
          ].map((s, i) => (
            <g key={`rstar-${i}`}>
              <circle cx={s.x} cy={s.y} r="2" fill="#CC5536" opacity="0.6" />
              <line
                x1={s.x}
                y1={s.y}
                x2={s.x * 0.3}
                y2={s.y * 0.3}
                stroke="#CC5536"
                strokeWidth="0.5"
                opacity="0.25"
              />
            </g>
          ))}

          {/* Alidade (sighting rule) — the key mechanical element */}
          <line
            x1="-88"
            y1="10"
            x2="88"
            y2="-10"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
          />
          {/* Sighting holes */}
          <circle cx="-78" cy="9" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="78" cy="-9" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

          {/* Center pin */}
          <circle cx="0" cy="0" r="3" fill="#CC5536" />
          <circle cx="0" cy="0" r="6" fill="none" stroke="#CC5536" strokeWidth="0.5" opacity="0.5" />

          {/* Throne (suspension bracket at top) */}
          <path
            d="M-12 -90 Q-12 -106 0 -106 Q12 -106 12 -90"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
          <circle cx="0" cy="-110" r="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </g>

        {/* ── OBSERVER (minimalist profile) ── */}
        <g transform="translate(100, 168)">
          {/* Simple geometric head silhouette */}
          <path
            d="M 28 -16 Q 28 -36 12 -38 Q -4 -40 -8 -24 Q -12 -8 -6 0 Q -2 6 4 8 L 4 24 Q 4 28 8 28 L 20 28 Q 24 28 24 24 L 24 12 Q 28 6 28 -16 Z"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />
          {/* Eye position — the sighting point */}
          <circle cx="20" cy="-14" r="2.5" fill="#CC5536" opacity="0.8" />
          <circle cx="20" cy="-14" r="5" fill="none" stroke="#CC5536" strokeWidth="0.5" opacity="0.3" />

          {/* Hand holding astrolabe */}
          <path
            d="M 24 12 Q 36 8 56 4 Q 64 2 72 0"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* ── ANNOTATION LABELS ── */}
        <text x="160" y="296" fontSize="7" fill="rgba(255,255,255,0.2)" letterSpacing="1.5">
          OBSERVER
        </text>
        <text x="280" y="296" fontSize="7" fill="rgba(255,255,255,0.2)" letterSpacing="1.5">
          ASTROLABE
        </text>
        <text x="530" y="136" fontSize="7" fill="rgba(255,255,255,0.15)" letterSpacing="1">
          SIGHTING LINE
        </text>

        {/* ── TITLE overlay — bottom right ── */}
        <text x="780" y="290" textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.15)" letterSpacing="3">
          KNOW WHERE YOU ARE
        </text>
        <text x="780" y="304" textAnchor="end" fontSize="9" fill="#CC5536" opacity="0.4" letterSpacing="3">
          THEN MOVE
        </text>
      </svg>
    </div>
  );
}

const C = {
  accent: "#CC5536",
  accentLight: "#faf0ed",
  accentMid: "#d97a62",
  fg: "#1F1E1D",
  muted: "#8F898B",
  border: "#E3E1E2",
  surface: "#FFFFFF",
  bg: "#F8F7F5",
};

function SystemFlowDiagram() {
  return (
    <div
      className="bg-surface border border-border p-5 sm:p-8 overflow-x-auto"
      style={{ borderRadius: 2 }}
    >
      <svg
        viewBox="0 0 860 230"
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="'SF Mono', 'Fira Code', monospace"
        className="w-full min-w-[600px]"
      >
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill={C.fg} />
          </marker>
          <marker id="arrAccent" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill={C.accent} />
          </marker>
        </defs>

        {/* Feedback arc */}
        <path
          d="M790 71 Q790 18 424 18 Q58 18 58 71"
          fill="none"
          stroke={C.accent}
          strokeWidth="1"
          strokeDasharray="5,4"
          opacity={0.3}
        />
        <text x="424" y="12" textAnchor="middle" fontSize="7.5" fill={C.accent} opacity={0.5} letterSpacing="0.8">
          COMPOUNDS WITH EVERY COHORT ↺
        </text>

        {/* Node 1: Hidden Problems */}
        <rect x="10" y="71" width="96" height="58" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="58" y="93" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">HIDDEN</text>
        <text x="58" y="105" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">PROBLEMS</text>
        <text x="58" y="119" textAnchor="middle" fontSize="7" fill={C.muted}>Structural gaps</text>
        <text x="58" y="129" textAnchor="middle" fontSize="7" fill={C.muted}>insiders see first</text>

        <line x1="106" y1="100" x2="130" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 2: PODs */}
        <rect x="132" y="71" width="96" height="58" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="180" y="97" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">PODs</text>
        <text x="180" y="111" textAnchor="middle" fontSize="7" fill={C.muted}>Domain thesis</text>
        <text x="180" y="121" textAnchor="middle" fontSize="7" fill={C.muted}>defined &amp; scoped</text>

        <line x1="228" y1="100" x2="252" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 3: Source Fellows */}
        <rect x="254" y="71" width="96" height="58" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="302" y="97" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">SOURCE</text>
        <text x="302" y="109" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">FELLOWS</text>
        <text x="302" y="122" textAnchor="middle" fontSize="7" fill={C.muted}>Domain insiders</text>
        <text x="302" y="132" textAnchor="middle" fontSize="7" fill={C.muted}>recruited to lead</text>

        <line x1="350" y1="100" x2="374" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 4: Co-build — accent fill */}
        <rect x="376" y="59" width="96" height="82" fill={C.accent} />
        <text x="424" y="87" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="bold" letterSpacing="1">CO-BUILD</text>
        <text x="424" y="101" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)">90-day sprint</text>
        <text x="424" y="112" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)">AI-native build</text>
        <text x="424" y="123" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)">Gate: signed LOI</text>

        <line x1="472" y1="100" x2="496" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 5: Spin-out */}
        <rect x="498" y="71" width="96" height="58" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="546" y="97" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">SPIN-OUT</text>
        <text x="546" y="111" textAnchor="middle" fontSize="7" fill={C.muted}>Incorporated</text>
        <text x="546" y="121" textAnchor="middle" fontSize="7" fill={C.muted}>Investor-ready</text>

        <line x1="594" y1="100" x2="618" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 6: Support to Series A */}
        <rect x="620" y="71" width="96" height="58" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="668" y="93" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">SUPPORT TO</text>
        <text x="668" y="105" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">SERIES A</text>
        <text x="668" y="119" textAnchor="middle" fontSize="7" fill={C.muted}>Portfolio value</text>
        <text x="668" y="129" textAnchor="middle" fontSize="7" fill={C.muted}>creation · 18 mo</text>

        <line x1="716" y1="100" x2="740" y2="100" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Node 7: Strategic Exits */}
        <rect x="742" y="71" width="96" height="58" fill={C.bg} stroke={C.accent} strokeWidth="2" />
        <text x="790" y="93" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">STRATEGIC</text>
        <text x="790" y="105" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold" letterSpacing="0.8">EXITS</text>
        <text x="790" y="119" textAnchor="middle" fontSize="7" fill={C.muted}>5–10× MOIC</text>
        <text x="790" y="129" textAnchor="middle" fontSize="7" fill={C.muted}>target return</text>

        {/* Step numbers */}
        <text x="58" y="155" textAnchor="middle" fontSize="7" fill={C.border}>01</text>
        <text x="180" y="155" textAnchor="middle" fontSize="7" fill={C.border}>02</text>
        <text x="302" y="155" textAnchor="middle" fontSize="7" fill={C.border}>03</text>
        <text x="424" y="155" textAnchor="middle" fontSize="7" fill={C.accent} opacity={0.5}>04</text>
        <text x="546" y="155" textAnchor="middle" fontSize="7" fill={C.border}>05</text>
        <text x="668" y="155" textAnchor="middle" fontSize="7" fill={C.border}>06</text>
        <text x="790" y="155" textAnchor="middle" fontSize="7" fill={C.border}>07</text>
      </svg>
    </div>
  );
}

function PlatformStackDiagram() {
  return (
    <div
      className="bg-surface border border-border p-5 sm:p-8 overflow-x-auto"
      style={{ borderRadius: 2 }}
    >
      <svg
        viewBox="0 0 780 260"
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="'SF Mono', 'Fira Code', monospace"
        className="w-full min-w-[500px]"
      >
        {/* UCM umbrella */}
        <rect x="150" y="8" width="480" height="44" fill={C.fg} />
        <text x="390" y="26" textAnchor="middle" fontSize="9" fill="white" letterSpacing="2">UTOPIA CAPITAL MANAGEMENT</text>
        <text x="390" y="42" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">The umbrella · Shared team · Shared IP · Shared data</text>

        {/* Connectors */}
        <line x1="240" y1="52" x2="150" y2="88" stroke={C.border} strokeWidth="1" />
        <line x1="390" y1="52" x2="390" y2="88" stroke={C.border} strokeWidth="1" />
        <line x1="540" y1="52" x2="630" y2="88" stroke={C.border} strokeWidth="1" />

        {/* ATV */}
        <rect x="20" y="88" width="250" height="80" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="145" y="112" textAnchor="middle" fontSize="9" fill={C.accent} letterSpacing="1.5" fontWeight="bold">A-TYPICAL VENTURES</text>
        <text x="145" y="128" textAnchor="middle" fontSize="8" fill={C.muted}>Fund · Middle East</text>
        <text x="145" y="144" textAnchor="middle" fontSize="8" fill={C.muted}>Early-stage · Overlooked markets</text>
        <text x="145" y="158" textAnchor="middle" fontSize="8" fill={C.muted}>Structural gaps · Right timing</text>

        {/* Studio — accent fill */}
        <rect x="270" y="76" width="240" height="104" fill={C.accent} />
        <text x="390" y="104" textAnchor="middle" fontSize="9" fill="white" letterSpacing="1.5" fontWeight="bold">THE UTOPIA STUDIO</text>
        <text x="390" y="120" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">Venture Studio · Global</text>
        <text x="390" y="136" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">Build · Optimise · Bridge</text>
        <text x="390" y="152" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">Shared AI infrastructure</text>
        <text x="390" y="166" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.65)">← the execution engine →</text>

        {/* TRF */}
        <rect x="510" y="88" width="250" height="80" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="635" y="112" textAnchor="middle" fontSize="9" fill={C.accent} letterSpacing="1.5" fontWeight="bold">THE RADICAL FUND</text>
        <text x="635" y="128" textAnchor="middle" fontSize="8" fill={C.muted}>Fund · Southeast Asia</text>
        <text x="635" y="144" textAnchor="middle" fontSize="8" fill={C.muted}>Deep domain density</text>
        <text x="635" y="158" textAnchor="middle" fontSize="8" fill={C.muted}>Fast-growth corridors</text>

        {/* Shared layer */}
        <rect x="20" y="200" width="740" height="44" fill={C.bg} stroke={C.border} strokeWidth="1" />
        <text x="390" y="218" textAnchor="middle" fontSize="8" fill={C.muted} letterSpacing="1.2">SHARED OPERATING LAYER</text>
        <text x="390" y="234" textAnchor="middle" fontSize="8" fill={C.accent} letterSpacing="0.8">Team · IP · Data · AI Tooling · Portfolio Intelligence</text>

        {/* Dashed connectors to shared layer */}
        <line x1="145" y1="200" x2="145" y2="168" stroke={C.border} strokeWidth="1" strokeDasharray="4,3" />
        <line x1="390" y1="200" x2="390" y2="180" stroke={C.accent} strokeWidth="1" strokeDasharray="4,3" opacity={0.5} />
        <line x1="635" y1="200" x2="635" y2="168" stroke={C.border} strokeWidth="1" strokeDasharray="4,3" />
      </svg>
    </div>
  );
}

function ProblemTypesDiagram() {
  return (
    <div
      className="bg-surface border border-border p-5 sm:p-8 overflow-x-auto"
      style={{ borderRadius: 2 }}
    >
      <svg
        viewBox="0 0 700 360"
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="'SF Mono', 'Fira Code', monospace"
        className="w-full min-w-[480px]"
      >
        {/* Axes */}
        <line x1="80" y1="290" x2="660" y2="290" stroke={C.fg} strokeWidth="1.5" />
        <line x1="80" y1="290" x2="80" y2="20" stroke={C.fg} strokeWidth="1.5" />

        <text x="370" y="316" textAnchor="middle" fontSize="9" fill={C.muted} letterSpacing="1">VISIBILITY TO OUTSIDERS →</text>
        <text x="370" y="330" textAnchor="middle" fontSize="8" fill={C.border} letterSpacing="0.5">Low                                                          High</text>
        <text x="18" y="160" textAnchor="middle" fontSize="9" fill={C.muted} letterSpacing="1" transform="rotate(-90, 18, 160)">STRUCTURAL ENTRENCHMENT →</text>

        {/* Quadrant fills */}
        <rect x="80" y="155" width="290" height="135" fill={C.bg} />
        <rect x="370" y="155" width="290" height="135" fill={C.bg} opacity={0.4} />
        <rect x="80" y="20" width="290" height="135" fill={C.accentLight} opacity={0.5} />
        <rect x="370" y="20" width="290" height="135" fill={C.bg} opacity={0.4} />

        <text x="225" y="40" textAnchor="middle" fontSize="8" fill={C.accent} opacity={0.5} letterSpacing="0.8">OUR HUNTING GROUND</text>

        {/* Hidden Data */}
        <circle cx="160" cy="90" r="28" fill={C.accent} />
        <text x="160" y="86" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">HIDDEN</text>
        <text x="160" y="99" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">DATA</text>

        {/* Structural Constraints */}
        <circle cx="280" cy="60" r="28" fill={C.accent} />
        <text x="280" y="56" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">STRUCTURAL</text>
        <text x="280" y="69" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">CONSTRAINTS</text>

        {/* Knowledge Lock-in */}
        <circle cx="180" cy="230" r="28" fill={C.accentMid} />
        <text x="180" y="226" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">KNOWLEDGE</text>
        <text x="180" y="239" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">LOCK-IN</text>

        {/* High-Freq Drift */}
        <circle cx="480" cy="220" r="24" fill={C.bg} stroke={C.fg} strokeWidth="1.5" />
        <text x="480" y="216" textAnchor="middle" fontSize="8" fill={C.muted} fontWeight="bold">HIGH-FREQ</text>
        <text x="480" y="229" textAnchor="middle" fontSize="8" fill={C.muted} fontWeight="bold">DRIFT</text>

        {/* Annotations */}
        <text x="160" y="128" textAnchor="middle" fontSize="7.5" fill={C.accent}>Telemetry never</text>
        <text x="160" y="139" textAnchor="middle" fontSize="7.5" fill={C.accent}>converted</text>
        <text x="280" y="98" textAnchor="middle" fontSize="7.5" fill={C.accent}>Regulation = moat</text>
        <text x="180" y="268" textAnchor="middle" fontSize="7.5" fill={C.accentMid}>Expertise walks</text>
        <text x="180" y="279" textAnchor="middle" fontSize="7.5" fill={C.accentMid}>out the door</text>
        <text x="480" y="253" textAnchor="middle" fontSize="7.5" fill={C.muted}>Compliance says fine.</text>
        <text x="480" y="264" textAnchor="middle" fontSize="7.5" fill={C.muted}>Reality breaks.</text>
      </svg>
    </div>
  );
}

function CoBuildPipelineDiagram() {
  return (
    <div
      className="bg-surface border border-border p-5 sm:p-8 overflow-x-auto"
      style={{ borderRadius: 2 }}
    >
      <svg
        viewBox="0 0 760 300"
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="'SF Mono', 'Fira Code', monospace"
        className="w-full min-w-[540px]"
      >
        <defs>
          <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={C.fg} />
          </marker>
          <marker id="arrW" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="white" />
          </marker>
        </defs>

        {/* Phase bands */}
        <rect x="10" y="10" width="220" height="240" fill={C.bg} />
        <rect x="240" y="10" width="200" height="240" fill={C.accent} />
        <rect x="450" y="10" width="300" height="240" fill={C.bg} />

        {/* Phase labels */}
        <text x="120" y="32" textAnchor="middle" fontSize="8" fill={C.accent} letterSpacing="1.5" fontWeight="bold">PHASE 1</text>
        <text x="120" y="46" textAnchor="middle" fontSize="8" fill={C.muted} letterSpacing="0.8">Invent &amp; Discover</text>
        <text x="120" y="58" textAnchor="middle" fontSize="7" fill={C.muted}>Stages 00–04</text>

        <text x="340" y="32" textAnchor="middle" fontSize="8" fill="white" letterSpacing="1.5" fontWeight="bold">PHASE 2</text>
        <text x="340" y="46" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)" letterSpacing="0.8">Build &amp; Sell</text>
        <text x="340" y="58" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.65)">Stage 05</text>

        <text x="600" y="32" textAnchor="middle" fontSize="8" fill={C.accent} letterSpacing="1.5" fontWeight="bold">PHASE 3</text>
        <text x="600" y="46" textAnchor="middle" fontSize="8" fill={C.muted} letterSpacing="0.8">Scale &amp; Spinout</text>
        <text x="600" y="58" textAnchor="middle" fontSize="7" fill={C.muted}>Stages 06–07</text>

        {/* Phase 1 boxes */}
        <rect x="20" y="72" width="92" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="66" y="90" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">S00</text>
        <text x="66" y="102" textAnchor="middle" fontSize="7" fill={C.muted}>Invention</text>
        <text x="66" y="112" textAnchor="middle" fontSize="7" fill={C.muted}>Gate</text>

        <rect x="118" y="72" width="102" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="169" y="90" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">S01–S02</text>
        <text x="169" y="102" textAnchor="middle" fontSize="7" fill={C.muted}>Problem · Buyer</text>
        <text x="169" y="112" textAnchor="middle" fontSize="7" fill={C.muted}>Validation</text>

        <rect x="20" y="126" width="200" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="120" y="144" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">S03–S04</text>
        <text x="120" y="156" textAnchor="middle" fontSize="7" fill={C.muted}>AI Foundation · Data Advantage Contract · PRD</text>

        {/* Gate 0 */}
        <rect x="20" y="182" width="200" height="52" fill={C.fg} />
        <text x="120" y="202" textAnchor="middle" fontSize="8" fill="white" letterSpacing="1" fontWeight="bold">GATE 0</text>
        <text x="120" y="216" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.7)">Problem · Edge · Wedge · Gate</text>
        <text x="120" y="228" textAnchor="middle" fontSize="7" fill={C.accentLight}>Build or kill. No middle ground.</text>

        {/* Phase 2 boxes */}
        <rect x="250" y="72" width="180" height="44" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x="340" y="90" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">S05 · Architecture Canvas</text>
        <text x="340" y="104" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.75)">Build while selling. In parallel.</text>

        <rect x="250" y="126" width="180" height="44" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x="340" y="144" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">LOI Pack · Pilot SOW</text>
        <text x="340" y="158" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.75)">Warm conversation → signed deal</text>

        {/* Gate 1 */}
        <rect x="250" y="182" width="180" height="52" fill="rgba(255,255,255,0.9)" />
        <text x="340" y="202" textAnchor="middle" fontSize="8" fill={C.accent} letterSpacing="1" fontWeight="bold">GATE 1</text>
        <text x="340" y="216" textAnchor="middle" fontSize="7" fill={C.muted}>Signed LOI + funded pilot</text>
        <text x="340" y="228" textAnchor="middle" fontSize="7" fill={C.accent}>No paying customer = no advance.</text>

        {/* Phase 3 boxes */}
        <rect x="460" y="72" width="140" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="530" y="90" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">S06 · Repeatability</text>
        <text x="530" y="104" textAnchor="middle" fontSize="7" fill={C.muted}>Sales kit · Unit economics</text>

        <rect x="606" y="72" width="134" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="673" y="90" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">S07 · Spinout</text>
        <text x="673" y="104" textAnchor="middle" fontSize="7" fill={C.muted}>Investor pack · Data room</text>

        <rect x="460" y="126" width="280" height="44" fill="white" stroke={C.border} strokeWidth="1" />
        <text x="600" y="144" textAnchor="middle" fontSize="8" fill={C.accent} fontWeight="bold">Legal Incorporation · Board Materials</text>
        <text x="600" y="158" textAnchor="middle" fontSize="7" fill={C.muted}>Target: 18 months from co-build start to Series A ready</text>

        {/* Spinout */}
        <rect x="460" y="182" width="280" height="52" fill={C.accent} />
        <text x="600" y="202" textAnchor="middle" fontSize="8" fill="white" letterSpacing="1" fontWeight="bold">SPINOUT</text>
        <text x="600" y="216" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)">Incorporated · Investor-ready</text>
        <text x="600" y="228" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.65)">5–10× MOIC target</text>

        {/* Phase arrows */}
        <line x1="220" y1="155" x2="248" y2="155" stroke={C.fg} strokeWidth="1.5" markerEnd="url(#arr2)" />
        <line x1="430" y1="155" x2="448" y2="155" stroke="white" strokeWidth="1.5" markerEnd="url(#arrW)" />

        {/* Timing bar */}
        <rect x="10" y="264" width="210" height="20" fill={C.bg} stroke={C.border} strokeWidth="1" />
        <text x="115" y="277" textAnchor="middle" fontSize="7.5" fill={C.muted} letterSpacing="0.5">Weeks 1–8</text>
        <rect x="240" y="264" width="200" height="20" fill={C.accent} />
        <text x="340" y="277" textAnchor="middle" fontSize="7.5" fill="white" letterSpacing="0.5">Weeks 9–16</text>
        <rect x="450" y="264" width="300" height="20" fill={C.bg} stroke={C.border} strokeWidth="1" />
        <text x="600" y="277" textAnchor="middle" fontSize="7.5" fill={C.muted} letterSpacing="0.5">Months 4–18</text>
      </svg>
    </div>
  );
}
