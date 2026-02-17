/**
 * Experience-based guidance for fellows.
 * Used in asset workflows, dashboard, onboarding, and admin preview.
 */

export type ExperienceProfileKey =
  | "first_time_builder"
  | "experienced_founder"
  | "corporate_innovator";

// ─── Stage-Level Guidance ────────────────────────────────────────

export const GUIDANCE_TIPS: Record<
  ExperienceProfileKey,
  Record<string, string>
> = {
  first_time_builder: {
    "00": "The Invention Gate is your foundation. Take time to really understand why this market won't solve itself — it will save you from building the wrong thing later.",
    "01": "Start broad, then narrow. First-timers often commit to a solution too early — validate the problem space first.",
    "02": "Don't build in a vacuum. Even quick conversations with 3-5 potential users will save you months.",
    "03": "Your MVP doesn't need to be a product — a landing page, mockup, or even a pitch deck can validate demand.",
    "04": "Think about the business model early, even if it changes. Revenue thinking sharpens your proposition.",
    "05": "Document everything. As a first-timer, your learning curve IS your competitive advantage if you capture it.",
    "06": "Don't be afraid to pivot. The best ventures rarely look like the original idea.",
    "07": "Build in public where you can. Feedback loops accelerate learning dramatically.",
  },
  experienced_founder: {
    "00": "Skip the temptation to reuse your last pitch. This gate demands fresh logic — what's uniquely broken here, not your usual story.",
    "01": "You know the playbook — but watch for confirmation bias. Challenge your own assumptions harder than usual.",
    "02": "Leverage your network for fast validation, but also seek signal from outside your bubble.",
    "03": "You can move faster to MVP, but resist the temptation to over-engineer. Ship the simplest thing first.",
    "04": "Use your experience to build a stronger financial model earlier — investors will expect this from you.",
    "05": "Your biggest risk is assuming this market works like your last one. Stay curious.",
    "06": "Apply your fundraising experience, but be open to new funding models specific to this ecosystem.",
    "07": "Use your operational experience to set realistic milestones — but don't let past patterns limit ambition.",
  },
  corporate_innovator: {
    "00": "Think founder, not business case. This isn't a memo for approval — it's the argument for why you and only you should build this.",
    "01": "Think founder, not project manager. Startups need conviction under uncertainty, not perfect plans.",
    "02": "Your corporate network is gold for B2B validation — but learn to talk to real end-users too.",
    "03": "Ship something small and imperfect. Corporate quality bars can slow you down here.",
    "04": "Translate your enterprise experience into unit economics. The language is different but the logic transfers.",
    "05": "Your structured thinking is an asset, but practice making decisions with 30% of the data you're used to.",
    "06": "Corporate partnerships can be your unfair advantage — but don't let them define your entire strategy.",
    "07": "Build a team culture that's fast and scrappy, not process-heavy. This is the biggest mindset shift.",
  },
};

// ─── Asset-Level Guidance ──────────────────────────────────────────

export const ASSET_GUIDANCE: Record<
  ExperienceProfileKey,
  Record<number, string>
> = {
  first_time_builder: {
    1: "This is your foundation document. Don't rush it. Spend time researching why existing solutions fail — understanding market failures deeply will guide every decision you make later.",
    2: "Think big picture here. 'Category' means the space you'll dominate if you win. If you're unsure, you're probably thinking too small. Aim for something that could reshape an industry.",
    3: "Talk to real people experiencing this problem. Don't assume you know their pain — ask them to quantify it. How many hours? How much money? What's the emotional cost?",
    4: "User research doesn't need to be formal. Start with 5-10 conversations. Ask open-ended questions and listen more than you talk. Their words will reveal insights you can't predict.",
    5: "Your MVP can be anything that tests demand: a landing page, a Figma prototype, a manual process you run yourself. The goal is learning, not perfection.",
    6: "Don't build features users don't want. Every feature should solve a specific pain point you've validated. If you can't explain why it matters, cut it.",
    7: "Technical architecture matters, but don't over-engineer. Start with the simplest solution that works. You can refactor later when you know what users actually need.",
    8: "Pricing is hard. Start by understanding what users pay today (even if it's time or frustration). Then test willingness to pay with real conversations, not surveys.",
    9: "Go-to-market isn't just marketing. It's how you'll find your first 10 customers. Be specific: where do they hang out? What do they read? Who influences them?",
    10: "Your first customers are your co-founders. Treat them like partners. Their feedback is gold — listen closely and iterate fast based on what they tell you.",
    11: "Competition research isn't about copying. It's about understanding what's missing. What do competitors do well? What do they ignore? That gap is your opportunity.",
    12: "Your moat is what makes you hard to copy. It's not just your idea — it's your data, relationships, or unique insight. Be honest: what can't competitors replicate?",
    13: "Financial models feel intimidating, but start simple. Revenue = customers × price. Costs = what you need to deliver. Then iterate as you learn more.",
    14: "Unit economics are your reality check. If you can't make money on one customer, you can't make money on a million. Get this right before scaling.",
    15: "A PRD isn't a wishlist. It's a focused plan for what you'll build first. Every feature should trace back to a validated user need.",
    16: "Design isn't just pretty — it's how users understand your product. Start with user flows: what are they trying to accomplish? Then design the simplest path there.",
    17: "Technical specs don't need to be perfect. Focus on what's required to validate your core hypothesis. You can optimize performance later.",
    18: "Testing isn't optional. Even a simple manual test with 5 users will reveal problems you can't see. Test early, test often.",
    19: "Launch is just the beginning. Your first version will be wrong. Plan for iteration: how will you collect feedback? How will you prioritize fixes?",
    20: "Metrics help you learn. Pick 2-3 that matter most for your stage. Don't drown in data — focus on signals that tell you if you're solving real problems.",
    21: "Your team is your biggest advantage. Hire for learning speed, not just credentials. Early hires shape your culture — choose wisely.",
    22: "Fundraising is a skill you'll learn. Start by understanding what investors care about: traction, team, market size. Build those before you pitch.",
    23: "Partnerships can accelerate you, but choose carefully. The wrong partner can slow you down. Look for partners who share your vision and move fast.",
    24: "Your brand is what people say about you when you're not in the room. Start building it from day one through consistent actions, not just marketing.",
    25: "Scaling requires systems. Document processes early — what works for 10 customers needs to work for 100. Build habits that scale.",
    26: "Exit strategy isn't about selling out — it's about understanding your options. Know your goals: are you building to sell, to grow, or to change the world?",
    27: "Reflection is learning. Document what worked, what didn't, and why. Your journey is unique — capture the insights that will help you next time.",
  },
  experienced_founder: {
    1: "Resist reusing your last venture's logic. This market failure is unique — dig deeper than your usual pattern. What's structurally different here?",
    2: "You've seen category plays before. Apply that lens: is this truly category-defining, or just a better mousetrap? Investors will ask this immediately.",
    3: "You know how to validate problems. Push harder on quantification — get specific numbers that prove this pain is worth solving at scale.",
    4: "Your network is an asset, but don't just talk to your usual contacts. Seek signal from outside your bubble to avoid confirmation bias.",
    5: "You can move faster, but don't skip validation. Even experienced founders build the wrong thing when they assume they know the market.",
    6: "Feature discipline is harder when you know how to build. Resist the urge to add everything — focus beats features every time.",
    7: "Technical debt is real, but so is over-engineering. Ship the simplest version that validates your hypothesis. You can refactor with real data.",
    8: "Pricing strategy should leverage your experience. You know how to test willingness to pay — do it systematically, not intuitively.",
    9: "Go-to-market should be faster given your experience. But don't assume your last playbook works here — test channels systematically.",
    10: "Early customers are still your co-founders. Your experience helps you serve them better, but don't skip the listening phase.",
    11: "Competitive analysis should be deeper. You know how to read between the lines — what are competitors avoiding? Why?",
    12: "Moat thinking should be sharper. You've seen moats erode — what makes yours defensible for 5+ years, not just 18 months?",
    13: "Financial models should be more sophisticated. Investors expect experienced founders to understand unit economics deeply.",
    14: "Unit economics are non-negotiable. You know how to model them — do it rigorously. Assumptions matter more than precision.",
    15: "PRD discipline is critical. You know scope creep kills startups — keep this focused on validated needs only.",
    16: "Design should leverage your product sense. But don't skip user testing — even experienced founders misread user needs.",
    17: "Technical specs can be more detailed, but don't over-spec. Build what validates, optimize what works.",
    18: "Testing rigor should be higher. You know how to run proper tests — do it. Don't skip because you 'know' what works.",
    19: "Launch strategy should be more sophisticated. You know how to sequence launches — plan for iteration from day one.",
    20: "Metrics should be more nuanced. You know vanity metrics vs. real signals — pick metrics that drive decisions.",
    21: "Team building is your superpower. Use your experience to hire better, but don't assume your last team's structure works here.",
    22: "Fundraising should leverage your track record, but don't rest on it. This venture needs to stand on its own merits.",
    23: "Partnerships should be strategic, not just convenient. You know how to evaluate partners — be selective.",
    24: "Brand building should be more intentional. You know how brands evolve — start building equity from day one.",
    25: "Scaling systems should be better designed. You've scaled before — apply those lessons, but adapt to this market's specifics.",
    26: "Exit thinking should be clearer. You know your options — think through them early, but don't optimize for exit over building.",
    27: "Reflection should be deeper. You have patterns from past ventures — identify what's transferable and what's unique here.",
  },
  corporate_innovator: {
    1: "Think founder logic, not business case. This isn't about getting approval — it's about proving why YOU should build this, not a committee.",
    2: "Category thinking is different from market analysis. This isn't about TAM — it's about owning a category. Think bigger than your corporate role allowed.",
    3: "Problem validation requires talking to real users, not stakeholders. Leave your corporate lens behind and listen to actual pain.",
    4: "User research isn't a survey or focus group. It's messy conversations with people who are frustrated. Embrace the messiness.",
    5: "MVP mindset is the biggest shift. In corporate, you'd plan for perfection. Here, ship something that barely works and learn.",
    6: "Feature discipline is critical. Corporate products are feature-heavy — startups win with focus. Cut everything that doesn't validate core value.",
    7: "Technical architecture should be simple. Corporate systems are over-engineered — start minimal and add complexity only when needed.",
    8: "Pricing requires testing, not analysis. Corporate pricing is often set by committees. Here, you test with real customers and iterate.",
    9: "Go-to-market is scrappy, not strategic. Corporate GTM is planned for months. Here, you test channels quickly and double down on what works.",
    10: "Early customers are partners, not accounts. Corporate relationships are transactional. Here, you co-create with your first users.",
    11: "Competitive analysis is about gaps, not features. Corporate analysis compares feature lists. Here, you find what competitors ignore.",
    12: "Moat thinking is about defensibility, not market position. Corporate moats are often scale-based. Here, you need something harder to copy.",
    13: "Financial models are simpler, not more complex. Corporate models have 50 assumptions. Here, focus on the 5 that matter most.",
    14: "Unit economics are your reality check. Corporate products often have hidden costs. Here, every unit must be profitable or you're broken.",
    15: "PRD is focused, not comprehensive. Corporate PRDs are 50 pages. Here, 5 pages max — what are you building first and why?",
    16: "Design prioritizes speed over polish. Corporate design cycles are long. Here, you ship, test, and iterate quickly.",
    17: "Technical specs are minimal. Corporate specs document everything. Here, you spec what's needed to validate, nothing more.",
    18: "Testing is continuous, not a phase. Corporate testing is a gate before launch. Here, you test constantly and ship fixes daily.",
    19: "Launch is iterative, not a big bang. Corporate launches are events. Here, you launch quietly, learn, and improve.",
    20: "Metrics are actionable, not comprehensive. Corporate dashboards have 100 metrics. Here, pick 2-3 that drive decisions.",
    21: "Team building is about speed, not process. Corporate hiring is slow and structured. Here, you hire fast, fire faster if needed.",
    22: "Fundraising is storytelling, not presentation. Corporate pitches are data-heavy. Here, you tell a story investors want to believe.",
    23: "Partnerships are tactical, not strategic. Corporate partnerships take months to negotiate. Here, you partner quickly to test value.",
    24: "Brand is built through actions, not campaigns. Corporate brands are built with budgets. Here, you build through consistent delivery.",
    25: "Scaling requires systems, but simple ones. Corporate systems are complex. Here, you build the minimum process that enables growth.",
    26: "Exit thinking is about options, not plans. Corporate exits are planned. Here, you build value and keep options open.",
    27: "Reflection captures learning, not just outcomes. Corporate reviews focus on metrics. Here, you capture insights that make you better.",
  },
};

// ─── Experience-Specific Examples ──────────────────────────────────

export interface ExperienceExample {
  questionId?: string; // Specific question ID, or undefined for general asset examples
  first_time_builder: string;
  experienced_founder: string;
  corporate_innovator: string;
}

export const EXPERIENCE_EXAMPLES: Record<number, ExperienceExample[]> = {
  1: [
    {
      questionId: "1-q1",
      first_time_builder: "e.g. Hospital procurement is fragmented across 6,000 independent systems with no shared data layer, so no single buyer has enough leverage to force interoperability. Each hospital negotiates prices independently, creating massive information asymmetry.",
      experienced_founder: "e.g. The healthcare procurement market has structural fragmentation (6,000+ independent systems) preventing data aggregation. Unlike B2B SaaS where APIs enable integration, healthcare's regulatory constraints and trust barriers create a coordination failure that capital alone can't solve.",
      corporate_innovator: "e.g. Healthcare procurement suffers from a coordination failure: 6,000+ independent systems lack a shared data layer due to regulatory constraints (HIPAA, BAA requirements) and trust barriers. This isn't a technology problem — it's a structural market failure that prevents price transparency.",
    },
    {
      questionId: "1-q2",
      first_time_builder: "e.g. The data required sits inside regulated institutions that don't share externally. No amount of funding bypasses the trust barrier — you need actual relationships with hospital executives who've seen your work.",
      experienced_founder: "e.g. The moat isn't technology — it's trust and regulatory access. Even with $10M, an outsider can't get BAA agreements with health systems without clinical credibility. This requires 12-18 months per institution and relationships that take years to build.",
      corporate_innovator: "e.g. The barrier is regulatory and trust-based, not technical. BAA agreements require clinical credibility that takes 12-18 months per institution to establish. A well-funded outsider can't shortcut this — it requires domain expertise and relationship capital that can't be bought.",
    },
  ],
  3: [
    {
      questionId: "3-q1",
      first_time_builder: "e.g. Hospital pharmacies waste 15-20 hours per week manually comparing drug prices across distributors. There is no centralized system that aggregates pricing in real time, so purchasing decisions are made with incomplete data, resulting in 8-15% overspend on pharmaceutical procurement.",
      experienced_founder: "e.g. Chief Pharmacy Officers at mid-size hospitals (200-500 beds) waste 15-20 hours/week on manual price comparison across 6+ distributors. The lack of real-time price aggregation forces suboptimal purchasing decisions, resulting in 8-15% overspend ($2-4M annually per hospital) on a $20-50M drug budget.",
      corporate_innovator: "e.g. Healthcare procurement teams spend 15-20 hours/week manually aggregating pricing data from 6+ distributors due to lack of interoperability. This manual process creates 8-15% procurement overspend ($2-4M annually) on average $20-50M drug budgets, directly impacting hospital margins.",
    },
    {
      questionId: "3-q4",
      first_time_builder: "e.g. $2.4M/year per hospital (15hrs/week x $85/hr labor + 10% overspend on $20M avg drug budget)",
      experienced_founder: "e.g. $2.4M/year per hospital: $66K labor cost (15hrs/week × $85/hr × 52 weeks) + $2M overspend (10% of $20M avg drug budget). For a 200-hospital addressable market, this represents $480M in annual waste.",
      corporate_innovator: "e.g. $2.4M annual cost per hospital: $66K in labor inefficiency (15hrs/week × $85/hr × 52 weeks) plus $2M in procurement overspend (10% of $20M average drug budget). At scale across 200 similar hospitals, total addressable waste is $480M annually.",
    },
  ],
  4: [
    {
      questionId: "4-q1",
      first_time_builder: "e.g. I talked to 8 hospital pharmacy managers. They all said they spend 2-3 hours daily comparing prices manually. One said they overspent $400K last year because they didn't know about a better distributor price.",
      experienced_founder: "e.g. Conducted 12 interviews with Chief Pharmacy Officers (200-500 bed hospitals). 10/12 confirmed 15-20hrs/week manual price comparison. Quantified: avg $2.4M annual overspend per hospital. Key insight: they trust relationships over data, creating opportunity for data-driven tool.",
      corporate_innovator: "e.g. 15 structured interviews with procurement leaders across health systems. Pattern: manual price comparison takes 15-20hrs/week, resulting in 8-15% procurement overspend ($2-4M annually). Corporate constraint: existing vendor relationships prevent switching despite cost inefficiency.",
    },
  ],
  5: [
    {
      questionId: "5-q1",
      first_time_builder: "e.g. A simple landing page that shows how much hospitals could save, with a form to request a demo. If 20+ hospitals sign up, that proves demand before we build anything complex.",
      experienced_founder: "e.g. A Figma prototype of the price comparison dashboard + manual backend where we pull real pricing data for 3 pilot hospitals. Validates both UI/UX and data access feasibility in one test.",
      corporate_innovator: "e.g. A lightweight web app that aggregates pricing from 2-3 distributors via API integrations, showing real-time comparison for 5 pilot hospitals. Tests technical feasibility and user value simultaneously without full product build.",
    },
  ],
  8: [
    {
      questionId: "8-q1",
      first_time_builder: "e.g. We're thinking $5,000/month per hospital. That's based on saving them $200K/year, so they get 20x ROI. We talked to 3 hospitals and they said they'd pay that.",
      experienced_founder: "e.g. $5K/month per hospital (SaaS model). Rationale: saves $2.4M annually, so 40x ROI. Tested willingness to pay with 8 hospitals — 6 confirmed at $5K, 2 said $3K. Starting at $5K with annual discount to $4K to anchor higher.",
      corporate_innovator: "e.g. $5K/month subscription per hospital. Value prop: reduces $2.4M annual procurement waste. Pricing tested with 10 health systems — 7 confirmed $5K, 3 requested $3-4K. Using value-based pricing (percentage of savings) as alternative model for enterprise deals.",
    },
  ],
  13: [
    {
      questionId: "13-q1",
      first_time_builder: "e.g. Year 1: 10 hospitals × $60K = $600K revenue. Costs: $200K (2 people) + $100K (servers/tools) = $300K. Profit: $300K. Year 2: 50 hospitals = $3M revenue, $1M costs, $2M profit.",
      experienced_founder: "e.g. Year 1: 10 hospitals @ $60K ACV = $600K ARR. Costs: $400K (team of 3) + $150K (infrastructure) = $550K. Net: $50K. Year 2: 50 hospitals = $3M ARR, $1.2M costs (scaled team), $1.8M net. Unit economics: $6K CAC, 10:1 LTV:CAC, 24mo payback.",
      corporate_innovator: "e.g. Year 1: 10 hospitals @ $60K ACV = $600K ARR. OpEx: $450K (team) + $150K (infrastructure) = $600K. Break-even. Year 2: 50 hospitals = $3M ARR, $1.5M OpEx, $1.5M EBITDA. Unit economics: $5K CAC, 12:1 LTV:CAC, 20mo payback. Margin improves with scale.",
    },
  ],
  15: [
    {
      questionId: "15-q1",
      first_time_builder: "e.g. The AI copilot that turns raw customer feedback into prioritized product roadmaps in minutes, not weeks.",
      experienced_founder: "e.g. An AI-powered product intelligence platform that ingests customer feedback from support, sales, and surveys, then uses NLP to cluster themes, score urgency, and generate prioritized roadmap items — reducing PM research time from weeks to hours.",
      corporate_innovator: "e.g. An AI product intelligence platform that synthesizes unstructured customer feedback (support tickets, sales calls, surveys) into actionable product roadmaps using NLP clustering and urgency scoring — replacing manual analysis workflows that take product teams 2-3 weeks per quarter.",
    },
  ],
};

// ─── Resource Recommendations ─────────────────────────────────────

export interface ResourceRecommendation {
  label: string;
  description: string;
  link: string;
  assetNumbers?: number[]; // Specific assets this applies to, or undefined for general
}

export const ASSET_RESOURCES: Record<
  ExperienceProfileKey,
  Record<number, ResourceRecommendation[]>
> = {
  first_time_builder: {
    1: [
      {
        label: "Paul Graham: How to Get Startup Ideas",
        description: "Learn to identify real problems worth solving",
        link: "https://paulgraham.com/startupideas.html",
      },
      {
        label: "YC Startup School: Market Size",
        description: "Understanding why market failures create opportunities",
        link: "https://www.ycombinator.com/library",
      },
    ],
    3: [
      {
        label: "Steve Blank: The Four Steps to the Epiphany",
        description: "Customer discovery methodology for first-timers",
        link: "https://steveblank.com",
      },
      {
        label: "YC: How to Talk to Users",
        description: "Practical guide to user interviews",
        link: "https://www.ycombinator.com/library",
      },
    ],
    5: [
      {
        label: "Eric Ries: The Lean Startup",
        description: "MVP thinking for first-time builders",
        link: "https://theleanstartup.com",
      },
      {
        label: "YC: Minimum Viable Product",
        description: "What counts as an MVP and how to build one",
        link: "https://www.ycombinator.com/library",
      },
    ],
    13: [
      {
        label: "YC: Financial Modeling for Startups",
        description: "Startup financial models explained simply",
        link: "https://www.ycombinator.com/library",
      },
      {
        label: "First Round Review: Unit Economics",
        description: "Understanding unit economics as a founder",
        link: "https://review.firstround.com",
      },
    ],
  },
  experienced_founder: {
    1: [
      {
        label: "NFX: Market Failure Analysis",
        description: "Deep dive into structural market failures",
        link: "https://www.nfx.com",
      },
      {
        label: "a16z: Category Creation",
        description: "How to define and own a category",
        link: "https://a16z.com",
      },
    ],
    3: [
      {
        label: "First Round Review: Customer Research",
        description: "Advanced customer discovery techniques",
        link: "https://review.firstround.com",
      },
      {
        label: "Lenny's Newsletter: User Research",
        description: "Product research methods for experienced founders",
        link: "https://www.lennysnewsletter.com",
      },
    ],
    13: [
      {
        label: "a16z: Unit Economics Deep Dive",
        description: "Advanced unit economics modeling",
        link: "https://a16z.com",
      },
      {
        label: "Stripe Atlas: Financial Planning",
        description: "Financial models for scaling startups",
        link: "https://stripe.com/atlas",
      },
    ],
  },
  corporate_innovator: {
    1: [
      {
        label: "Steve Blank: Corporate Innovation",
        description: "Transitioning from corporate to startup thinking",
        link: "https://steveblank.com",
      },
      {
        label: "a16z Startup School: Founder Mindset",
        description: "Shifting from employee to founder logic",
        link: "https://a16z.com/startupschool",
      },
    ],
    3: [
      {
        label: "YC: Talking to Users (Startup Style)",
        description: "User research without corporate process",
        link: "https://www.ycombinator.com/library",
      },
      {
        label: "First Round Review: Customer Development",
        description: "Fast customer discovery for corporate innovators",
        link: "https://review.firstround.com",
      },
    ],
    5: [
      {
        label: "Eric Ries: MVP for Corporate Innovators",
        description: "Building MVPs without corporate quality gates",
        link: "https://theleanstartup.com",
      },
      {
        label: "YC: Ship Fast, Learn Faster",
        description: "Speed over perfection in startups",
        link: "https://www.ycombinator.com/library",
      },
    ],
    13: [
      {
        label: "a16z: Unit Economics for Enterprise",
        description: "Translating enterprise metrics to startup unit economics",
        link: "https://a16z.com",
      },
      {
        label: "First Round: Financial Models for Startups",
        description: "Startup financial modeling vs. corporate planning",
        link: "https://review.firstround.com",
      },
    ],
  },
};

// ─── Helper Functions ──────────────────────────────────────────────

export function getGuidanceTip(
  experienceProfile: string | null,
  stageNumber: string
): string | null {
  if (!experienceProfile) return null;
  const tips = GUIDANCE_TIPS[experienceProfile as ExperienceProfileKey];
  if (!tips) return null;
  return tips[stageNumber] || null;
}

export function getAssetGuidance(
  experienceProfile: string | null,
  assetNumber: number
): string | null {
  if (!experienceProfile) return null;
  const guidance = ASSET_GUIDANCE[experienceProfile as ExperienceProfileKey];
  if (!guidance) return null;
  return guidance[assetNumber] || null;
}

export function getExperienceExample(
  assetNumber: number,
  questionId: string,
  experienceProfile: string | null
): string | null {
  if (!experienceProfile) return null;
  const examples = EXPERIENCE_EXAMPLES[assetNumber];
  if (!examples) return null;
  const example = examples.find((e) => e.questionId === questionId);
  if (!example) return null;
  return example[experienceProfile as ExperienceProfileKey] || null;
}

export function getAssetResources(
  experienceProfile: string | null,
  assetNumber: number
): ResourceRecommendation[] {
  if (!experienceProfile) return [];
  const resources = ASSET_RESOURCES[experienceProfile as ExperienceProfileKey];
  if (!resources) return [];
  return resources[assetNumber] || [];
}

// ─── Adaptive Question Complexity ──────────────────────────────────

export interface AdaptiveDescription {
  questionId: string;
  first_time_builder?: string; // Simplified description
  experienced_founder?: string; // More advanced description
  corporate_innovator?: string; // Corporate-to-startup translation
}

export const ADAPTIVE_DESCRIPTIONS: Record<number, AdaptiveDescription[]> = {
  1: [
    {
      questionId: "1-q1",
      first_time_builder: "Think about why this problem hasn't been solved yet. Is it because of rules, lack of information, or people not working together? Explain in simple terms.",
      experienced_founder: "Identify the structural market failure — regulation, information asymmetry, misaligned incentives, or coordination failures. Be specific about the systemic barrier.",
      corporate_innovator: "This isn't a business case problem — it's a structural market failure. Think about why markets fail: regulation, information asymmetry, misaligned incentives. What's systemically broken?",
    },
  ],
  3: [
    {
      questionId: "3-q3",
      first_time_builder: "Rate each dimension from 1-10. Be honest — high scores mean this problem is really worth solving. Add a note explaining why you gave each score.",
      experienced_founder: "Score each dimension 1-10 with evidence. Total below 28 is a red flag. You know how to quantify problems — be rigorous here.",
      corporate_innovator: "Score 1-10 per dimension with supporting evidence. Corporate analysis often over-scores — be realistic. Below 28 total indicates weak problem-market fit.",
    },
  ],
  5: [
    {
      questionId: "5-q1",
      first_time_builder: "Your MVP is just something to test if people want what you're building. It doesn't need to be perfect — a simple version is fine. What's the smallest thing you can build to test your idea?",
      experienced_founder: "Define the minimum testable product that validates your core hypothesis. You know how to scope MVPs — focus on the one feature that proves value, nothing more.",
      corporate_innovator: "MVP means minimum viable, not minimum perfect. Corporate products are over-engineered. What's the absolute minimum you can build to test if users will pay? Ship it fast.",
    },
  ],
  8: [
    {
      questionId: "8-q1",
      first_time_builder: "Think about what your product is worth to customers. How much money does it save them or make them? Then pick a price that's fair but still profitable for you.",
      experienced_founder: "Use value-based pricing methodology: quantify customer value, test willingness to pay, anchor high, offer discounts. You know the playbook — apply it systematically.",
      corporate_innovator: "Startup pricing is different from corporate pricing. Don't price based on costs — price based on value delivered. Test willingness to pay with real customers, not internal analysis.",
    },
  ],
  13: [
    {
      questionId: "13-q1",
      first_time_builder: "Start simple: how much money will you make (revenue) and how much will it cost (expenses)? Don't worry about being perfect — just think through the basics.",
      experienced_founder: "Build a 3-year model with unit economics, CAC, LTV, payback period. Include assumptions and sensitivity analysis. Investors will expect this level of rigor.",
      corporate_innovator: "Create a startup financial model (not a corporate budget). Focus on unit economics, CAC/LTV, and cash flow. Enterprise planning assumptions don't apply here — model for uncertainty.",
    },
  ],
  14: [
    {
      questionId: "14-q1",
      first_time_builder: "Unit economics means: if you get one customer, do you make money or lose money? If you lose money on one customer, you'll lose money on many. Make sure each customer is profitable.",
      experienced_founder: "Calculate CAC, LTV, payback period, and margin per unit. Model how these improve with scale. Investors will scrutinize this — be rigorous.",
      corporate_innovator: "Unit economics are your reality check. Corporate products often hide costs in overhead. Here, every unit must be profitable or you're broken. Model explicitly: revenue per customer minus all costs.",
    },
  ],
};

export function getAdaptiveDescription(
  assetNumber: number,
  questionId: string,
  experienceProfile: string | null
): string | null {
  if (!experienceProfile) return null;
  const adaptives = ADAPTIVE_DESCRIPTIONS[assetNumber];
  if (!adaptives) return null;
  const adaptive = adaptives.find((a) => a.questionId === questionId);
  if (!adaptive) return null;
  return adaptive[experienceProfile as ExperienceProfileKey] || null;
}

/** Sample tips for admin preview — one per stage group */
export const GUIDANCE_PREVIEW_STAGES = ["00", "01", "04"] as const;
