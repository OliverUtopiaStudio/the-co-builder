export interface ChecklistItem {
  id: string;
  text: string;
}

export interface Asset {
  number: number;
  title: string;
  purpose: string;
  details?: string;
  keyInputs?: string[];
  outputs?: string[];
  coreQuestion?: string;
  table?: { header: string[]; rows: string[][] };
  bullets?: string[];
  feedsInto?: string;
  /** Plain-language link to Product, GTM, and investability. Shown as "What this unlocks". */
  connections?: string;
  checklist: ChecklistItem[];
  // Content library fields
  tags: string[];
  isCustomModule: boolean;
}

export interface Stage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  /** Plain-language link to Product, GTM, investability. Shown as "What this unlocks". */
  connections?: string;
  gateDecision: string;
  assets: Asset[];
}

export const stages: Stage[] = [
  {
    id: "00",
    number: "00",
    title: "The Invention Gate",
    subtitle: "Why this market won't solve itself",
    description:
      "Start here. Answer one thing: why will this problem still be unsolved unless someone like you builds the solution? If the market would fix it anyway, you don't have a venture.",
    connections:
      "Product: Your invention one-pager becomes the spine for what you build and what you don't. GTM: Same story explains why customers should care and why you can win. Investability: Investors back teams that can explain why the market won't solve this and why you can.",
    gateDecision:
      "Only proceed to Stage 01 if both assets are complete and pass the world-beating test.",
    assets: [
      {
        number: 1,
        title: "Risk Capital + Invention One-Pager",
        purpose:
          "Write down why the market won't fix this itself, what has to be invented, and why you (insiders) can do it. One page. No jargon.",
        keyInputs: [
          "Domain constraint",
          "Structural market failure",
          "Insider access",
          "Why-now",
        ],
        outputs: [
          "Constraints for everything",
          "Moat spine for Assets #12, #21, #24",
        ],
        coreQuestion:
          "If a smart team with $10M tried to solve this from scratch, why would they fail?",
        connections:
          "Product: Tells you what to build and what's out of scope. GTM: The same 'why us' story sells. Investability: This is the thesis investors need in one page.",
        checklist: [
          { id: "1-1", text: "Identified the structural market failure" },
          {
            id: "1-2",
            text: "Articulated why insiders have an unfair advantage",
          },
          { id: "1-3", text: "Defined the domain constraint" },
          { id: "1-4", text: "Explained the why-now timing" },
          {
            id: "1-5",
            text: "Drafted the Risk Capital + Invention One-Pager",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 2,
        title: "Category Ambition Gate",
        purpose:
          "Decide: if we win, what category do we own? If it's 'a nice small business,' stop. VC needs venture-scale outcomes.",
        coreQuestion:
          "If we execute perfectly for 5 years, will we own a global category worth $1B+?",
        details:
          "A $20M ARR business is fine — but not a venture. Be honest. If the answer is no, pivot or don't raise VC.",
        connections:
          "Product: Keeps the roadmap pointed at a category, not a one-off tool. GTM: You sell into a category buyers understand. Investability: Funds need to see a path to category ownership.",
        checklist: [
          { id: "2-1", text: "Defined the global category you aim to own" },
          { id: "2-2", text: "Passed the $1B+ world-beating test" },
          {
            id: "2-3",
            text: "Confirmed this is NOT just a small tool or feature",
          },
          { id: "2-4", text: "Documented category ambition rationale" },
        ],
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "01",
    number: "01",
    title: "Problem Deep Dive",
    subtitle: "Quantifying pain that funds solutions",
    description:
      "You've said why the market won't fix it. Now put numbers to the pain: how often, how much it costs, who pays, and why now. No numbers, no product-market fit.",
    connections:
      "Product: Quantified pain becomes PRD metrics and success criteria. GTM: You sell outcomes (cost saved, time saved) not features. Investability: Investors want to see you understand the economics of the problem.",
    gateDecision:
      "Proceed to Stage 02 once you can quantify the pain and map where AI creates value.",
    assets: [
      {
        number: 3,
        title: "Problem Deep Dive + Quantification",
        purpose:
          "Write down: how often the pain happens, what it costs each time, who has budget, and why they'd act now. Real numbers beat vague 'big problem' claims.",
        table: {
          header: ["Dimension", "Question"],
          rows: [
            ["Frequency", "How often does this pain occur?"],
            ["Severity", "What's the cost when it happens?"],
            ["Budget", "Who pays and is money allocated?"],
            ["Urgency", "Why solve it now vs. next year?"],
          ],
        },
        feedsInto:
          "Eval targets (#10) → ROI/pricing (#19/#21) → Pilot KPIs (#18) → PRD metrics (#15)",
        connections:
          "Product: These numbers become PRD targets and eval success. GTM: You pitch ROI, not tech. Investability: Shows you've done the homework on the problem.",
        checklist: [
          { id: "3-1", text: "Quantified frequency of the pain point" },
          {
            id: "3-2",
            text: "Measured severity and cost of each occurrence",
          },
          {
            id: "3-3",
            text: "Identified budget owner and allocation status",
          },
          { id: "3-4", text: "Articulated urgency and why-now" },
          { id: "3-5", text: "Documented economic impact with data" },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 4,
        title: "Workflow Map + Data Touchpoints",
        purpose:
          "Draw the workflow: where do people decide, where is data created, and where can AI help without breaking the process? Not 'add a chatbot' — where does AI actually add value?",
        table: {
          header: ["Step", "Focus"],
          rows: [
            [
              "1. Decision Points",
              "Where does a human make a choice that AI could assist or automate?",
            ],
            [
              "2. Data Creation",
              "Where is new data generated? Who owns it? What format?",
            ],
            [
              "3. AI Intervention",
              "Where does AI add value without breaking the workflow?",
            ],
          ],
        },
        details: "Tools: Miro, Lucidchart, Whimsical, Loom for walkthroughs",
        connections:
          "Product: Tells you exactly what to build and where to plug in AI. GTM: You can demo the 'before/after' in the workflow. Investability: Proves you've mapped the real workflow, not a guess.",
        checklist: [
          { id: "4-1", text: "Mapped the end-to-end workflow" },
          {
            id: "4-2",
            text: "Identified all decision points where AI could intervene",
          },
          {
            id: "4-3",
            text: "Documented data creation points and ownership",
          },
          {
            id: "4-4",
            text: "Defined where AI adds value without breaking workflow",
          },
          { id: "4-5", text: "Created visual workflow diagram" },
        ],
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "02",
    number: "02",
    title: "Customer & Validation",
    subtitle: "ICP, assumptions, and kill switches",
    description:
      "Who exactly are you building for? What do you believe that might be wrong? And what would prove you're wrong? Answer those before you build.",
    connections:
      "Product: ICP and validated assumptions shape the PRD and prioritisation. GTM: You target and message the right people. Investability: Shows you've stress-tested the idea, not just believed it.",
    gateDecision:
      "Proceed to Stage 03 only if your core assumptions survive discovery. If a kill switch triggers — pivot or stop.",
    assets: [
      {
        number: 5,
        title: "ICP Definition",
        purpose:
          "Who signs the check? Who uses the product every day? Company size, industry, geography, and current tools. Be specific. Then talk to at least three of them.",
        connections:
          "Product: Tells you who the product is for and what they need. GTM: Your entire pipeline and messaging start here. Investability: 'We've talked to 10 people who fit' beats 'we think enterprises need this'.",
        checklist: [
          {
            id: "5-1",
            text: "Defined the buyer persona (who signs the check)",
          },
          {
            id: "5-2",
            text: "Defined the user persona (who uses the product daily)",
          },
          {
            id: "5-3",
            text: "Identified company size, industry, and geography",
          },
          {
            id: "5-4",
            text: "Documented the buyer's current workflow and tools",
          },
          {
            id: "5-5",
            text: "Validated ICP with at least 3 real conversations",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 6,
        title: "Assumptions + Kill Switches",
        purpose:
          "List what you're assuming. For each big assumption, write: what evidence would make us stop? If you can't name it, you're not being honest with yourself.",
        details:
          "Kill switches stop zombie ventures. No 'we'll figure it out' — write down what would make you pivot or quit.",
        connections:
          "Product: Keeps the roadmap tied to testable beliefs. GTM: You don't sell into a segment that's already invalidated. Investability: Investors trust teams that know what could kill the idea.",
        checklist: [
          {
            id: "6-1",
            text: "Listed all critical assumptions (market, tech, customer, data)",
          },
          {
            id: "6-2",
            text: "Ranked assumptions by risk (highest uncertainty first)",
          },
          {
            id: "6-3",
            text: "Defined kill switch criteria for each critical assumption",
          },
          { id: "6-4", text: "Created a testing plan for top 3 assumptions" },
          { id: "6-5", text: "Set timeline for assumption validation" },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 7,
        title: "Discovery Interviews",
        purpose:
          "Go learn. Run at least 10 conversations with people who fit your ICP. Goal: validate or kill your assumptions. Not to sell — to listen.",
        connections:
          "Product: Real quotes and patterns feed the PRD and feature set. GTM: You find design partners and refine messaging. Investability: Discovery discipline is a signal of execution quality.",
        checklist: [
          {
            id: "7-1",
            text: "Prepared interview script aligned to key assumptions",
          },
          { id: "7-2", text: "Conducted minimum 10 discovery interviews" },
          { id: "7-3", text: "Documented findings and patterns" },
          { id: "7-4", text: "Updated ICP based on interview insights" },
          {
            id: "7-5",
            text: "Identified potential design partners from interviews",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "03",
    number: "03",
    title: "Data Rights & AI Feasibility",
    subtitle: "The moat isn't the model — it's the data contract",
    description:
      "Prove the AI can do the job, and get contracts that give you exclusive or privileged data. No contract, no moat. Most AI ventures fail here.",
    connections:
      "Product: Eval plan and feasibility define what you build and how you measure it. GTM: Security pack and data contracts unblock enterprise deals. Investability: Data advantage and moat ledger are the defensibility story.",
    gateDecision:
      "Proceed to Stage 04 only when you have signed data advantage contracts and proven AI feasibility.",
    assets: [
      {
        number: 8,
        title: "Design Partner Pipeline",
        purpose:
          "Find 5–10 potential design partners, rank by pain and willingness to pay, and get at least two committed. You're selling and validating at once.",
        connections:
          "Product: Design partners shape the product and pilot scope. GTM: This is your first pipeline. Investability: Committed design partners are early traction.",
        checklist: [
          { id: "8-1", text: "Identified 5-10 potential design partners" },
          {
            id: "8-2",
            text: "Qualified partners based on problem severity and willingness to pay",
          },
          { id: "8-3", text: "Initiated outreach to top 5 candidates" },
          {
            id: "8-4",
            text: "Secured at least 2 committed design partners",
          },
          {
            id: "8-5",
            text: "Documented partner expectations and success criteria",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 9,
        title: "AI Feasibility Brief",
        purpose:
          "For each place AI could help: can we do it with rules, ML, LLM/RAG, or agents? What stays human-in-the-loop? Be clear so you don't overpromise.",
        connections:
          "Product: Decides the tech stack and where to invest. GTM: You can promise only what's feasible. Investability: Shows you've thought through how the AI actually works.",
        checklist: [
          {
            id: "9-1",
            text: "Assessed technical feasibility for each AI intervention point",
          },
          {
            id: "9-2",
            text: "Determined approach: rules vs ML vs LLM/RAG vs agents",
          },
          {
            id: "9-3",
            text: "Identified what requires human-in-the-loop (HITL)",
          },
          {
            id: "9-4",
            text: "Documented technical risks and mitigation strategies",
          },
          {
            id: "9-5",
            text: "Estimated compute and infrastructure requirements",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 10,
        title: "Eval Plan + Ground Truth",
        purpose:
          "Define 'good': a gold set of examples, how you score, and what 'good enough' is. Without this you can't say the product works.",
        connections:
          "Product: This is how you know the product is ready to ship. GTM: Eval results become proof for sales. Investability: 'We hit 95% on our eval' beats 'the AI is good'.",
        checklist: [
          { id: "10-1", text: "Created gold standard evaluation dataset" },
          { id: "10-2", text: "Defined scoring methodology and metrics" },
          {
            id: "10-3",
            text: "Set acceptance thresholds for accuracy/quality",
          },
          { id: "10-4", text: "Documented known failure modes" },
          {
            id: "10-5",
            text: "Established evaluation cadence and process",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 11,
        title: "Security Pack",
        purpose:
          "Answer what enterprise buyers ask: inference vs training rights, retention, redaction, access, audit. Without answers, deals stall.",
        connections:
          "Product: Security requirements feed into architecture and compliance. GTM: Security pack is table stakes for enterprise. Investability: Shows you're enterprise-ready.",
        bullets: [
          "Inference vs training rights",
          "Retention policies",
          "Redaction rules",
          "Access controls",
          "Auditability",
        ],
        checklist: [
          {
            id: "11-1",
            text: "Defined inference vs training data rights",
          },
          { id: "11-2", text: "Created data retention policy" },
          {
            id: "11-3",
            text: "Established redaction rules for sensitive data",
          },
          {
            id: "11-4",
            text: "Documented access controls and permissions",
          },
          { id: "11-5", text: "Built auditability framework" },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 12,
        title: "Data Advantage Contract",
        purpose:
          "Get it in writing: exclusivity, training rights, feedback loops, retention. If it's not in a contract, you don't have a data moat.",
        connections:
          "Product: Contractual data rights enable better models and evals. GTM: You can sell 'our data advantage' with proof. Investability: Data advantage contracts are the moat story.",
        bullets: [
          "Exclusivity terms",
          "Training/fine-tune rights",
          "Feedback loop rights",
          "Retention scope",
          "Usage boundaries",
        ],
        checklist: [
          {
            id: "12-1",
            text: "Drafted data advantage contract template",
          },
          { id: "12-2", text: "Defined exclusivity terms" },
          { id: "12-3", text: "Secured training and fine-tuning rights" },
          { id: "12-4", text: "Established feedback loop rights" },
          {
            id: "12-5",
            text: "Agreed retention scope and usage boundaries",
          },
          { id: "12-6", text: "Legal review completed" },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 13,
        title: "The Moat Ledger",
        purpose:
          "One doc that tracks your moat with evidence: data rights, eval lift, workflow lock-in, regulatory. Update it as you prove each layer.",
        connections:
          "Product: Keeps the team focused on what makes the product defensible. GTM: You can articulate why you'll win. Investability: The moat ledger is the defensibility slide.",
        table: {
          header: ["Moat Layer", "What to Track"],
          rows: [
            [
              "Data Rights",
              "Contractual exclusivity + training rights (#12)",
            ],
            [
              "Eval Lift",
              "Documented accuracy improvements from proprietary data",
            ],
            [
              "Workflow Lock-in",
              "Integration depth + switching cost measurement",
            ],
            [
              "Regulatory",
              "Compliance certifications + preferred vendor status",
            ],
          ],
        },
        checklist: [
          { id: "13-1", text: "Created Moat Ledger document" },
          { id: "13-2", text: "Documented data rights evidence" },
          { id: "13-3", text: "Tracked eval lift from proprietary data" },
          { id: "13-4", text: "Measured workflow integration depth" },
          {
            id: "13-5",
            text: "Recorded regulatory/compliance achievements",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "04",
    number: "04",
    title: "The PRD Culmination",
    subtitle: "Everything converges into what we build",
    description:
      "Everything so far feeds one document: what we're building, how we'll know it works, and what we're not building. One source of truth before you write code.",
    connections:
      "Product: The PRD is the build contract. GTM: Pilot scope and success criteria come from here. Investability: Shows you can scope and ship.",
    gateDecision:
      "The PRD is your contract with reality. Only proceed to Build once all stakeholders have signed off.",
    assets: [
      {
        number: 15,
        title: "PRD v1 + Not-to-Build",
        purpose:
          "Write down: what the product must do (workflow + AI), how you'll measure success, and what you're explicitly not building in v1. The not-to-build list stops scope creep.",
        details:
          "Equally important: what features we explicitly won't build in v1. This prevents scope creep and keeps focus on the wedge.",
        connections:
          "Product: This is what engineering builds. GTM: Pilot SOW and demos align to the PRD. Investability: A clear PRD signals execution discipline.",
        table: {
          header: ["Requirement Type", "Details"],
          rows: [
            [
              "Workflow Requirements",
              "What the user sees and does, integration points, UI/UX constraints, edge cases",
            ],
            [
              "Intelligence Requirements",
              "Quality thresholds, latency targets, cost per inference, safety/HITL gates",
            ],
            [
              "Not-to-Build List",
              "Features explicitly excluded from v1 to prevent scope creep",
            ],
          ],
        },
        checklist: [
          { id: "15-1", text: "Drafted workflow requirements section" },
          { id: "15-2", text: "Defined all integration points" },
          { id: "15-3", text: "Set UI/UX constraints and edge cases" },
          { id: "15-4", text: "Established quality thresholds for AI" },
          { id: "15-5", text: "Defined latency targets" },
          { id: "15-6", text: "Calculated cost per inference budget" },
          { id: "15-7", text: "Set safety and HITL gates" },
          {
            id: "15-8",
            text: "Created explicit Not-to-Build list for v1",
          },
          {
            id: "15-9",
            text: "PRD reviewed by technical and business stakeholders",
          },
          { id: "15-10", text: "PRD approved and signed off" },
        ],
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "05",
    number: "05",
    title: "Build & Sell",
    subtitle: "Architecture, LOI, pilot, prototype",
    description:
      "Build and sell at the same time. Architecture, prototype, and pilot run in parallel. You need a signed LOI, a live pilot, and a prototype that hits eval before you scale.",
    connections:
      "Product: Architecture and prototype are the product. GTM: LOI and pilot are the first revenue and proof. Investability: Signed LOI + pilot + eval results are the traction story.",
    gateDecision:
      "Proceed to Scale only with a signed LOI, live pilot, and prototype that meets eval thresholds.",
    assets: [
      {
        number: 16,
        title: "Enterprise Architecture Canvas",
        purpose: "Sketch how the system works: model gateway, RAG, eval, telemetry, policy. So the product is buildable and supportable.",
        bullets: [
          "Model gateway",
          "RAG store",
          "Eval harness",
          "Telemetry",
          "Policy layer",
        ],
        checklist: [
          { id: "16-1", text: "Designed model gateway architecture" },
          { id: "16-2", text: "Set up RAG store and retrieval pipeline" },
          {
            id: "16-3",
            text: "Built eval harness for continuous testing",
          },
          { id: "16-4", text: "Implemented telemetry and monitoring" },
          { id: "16-5", text: "Created policy layer for governance" },
          {
            id: "16-6",
            text: "Architecture reviewed by engineering leads",
          },
        ],
        connections:
          "Product: This is the system you're building. GTM: Enterprise buyers expect a clear architecture. Investability: Shows technical depth.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 17,
        title: "Design Partner Offer + LOI",
        purpose:
          "Get a signed LOI: paid pilot, AI usage and data terms, and how it becomes a product. No handshake — get it on paper.",
        checklist: [
          { id: "17-1", text: "Drafted design partner offer document" },
          { id: "17-2", text: "Included AI usage and data terms" },
          { id: "17-3", text: "Added productization clauses" },
          { id: "17-4", text: "Negotiated with design partners" },
          { id: "17-5", text: "Secured at least 1 signed LOI" },
          { id: "17-6", text: "Legal review of LOI completed" },
        ],
        connections:
          "Product: LOI defines pilot scope and success. GTM: This is your first customer. Investability: Signed LOI is proof of demand.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 18,
        title: "Pilot SOW + KPI Dashboard",
        purpose:
          "Pilot scope, KPIs, and a dashboard to track them. If every pilot is custom, you can't scale. Standardise what you can.",
        table: {
          header: ["KPI Type", "What to Measure"],
          rows: [
            [
              "Outcome KPIs",
              "Business metrics the customer cares about",
            ],
            ["Model KPIs", "Accuracy, latency, cost per inference"],
            [
              "Ops KPIs",
              "Uptime, support response, deployment health",
            ],
            [
              "Config vs Custom",
              "What's standard vs what's bespoke",
            ],
            [
              "Standard Deploy Spec",
              "Prevents one-off integration nightmares",
            ],
          ],
        },
        checklist: [
          { id: "18-1", text: "Drafted Pilot SOW with clear scope" },
          {
            id: "18-2",
            text: "Defined outcome KPIs aligned to customer goals",
          },
          {
            id: "18-3",
            text: "Set model KPIs (accuracy, latency, cost)",
          },
          {
            id: "18-4",
            text: "Established ops KPIs (uptime, support, deployment)",
          },
          { id: "18-5", text: "Created config vs custom matrix" },
          {
            id: "18-6",
            text: "Built KPI dashboard for real-time tracking",
          },
          { id: "18-7", text: "Standard deploy spec documented" },
          { id: "18-8", text: "Pilot SOW signed by design partner" },
        ],
        connections:
          "Product: Pilot KPIs become product success metrics. GTM: You sell the same pilot package again. Investability: Repeatable pilot = scalable GTM.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 19,
        title: "Prototype Sprint + Demo",
        purpose:
          "Ship a prototype that shows the workflow, hits eval thresholds, and demonstrates safety and cost. Then demo it to design partners.",
        checklist: [
          { id: "19-1", text: "Completed prototype sprint" },
          {
            id: "19-2",
            text: "Prototype demonstrates core workflow value",
          },
          {
            id: "19-3",
            text: "Eval results documented and meet thresholds",
          },
          { id: "19-4", text: "Safety controls implemented and tested" },
          { id: "19-5", text: "Latency and cost benchmarks met" },
          { id: "19-6", text: "Demo prepared for stakeholders" },
          { id: "19-7", text: "Demo delivered to design partners" },
        ],
        connections:
          "Product: The prototype is v1. GTM: Demo is the core sales asset. Investability: Working demo + eval results = proof.",
        tags: [],
        isCustomModule: false,
      },
    ],
  },
  {
    id: "06",
    number: "06",
    title: "Scale & Spinout",
    subtitle: "Sales pack, pricing, roadmap, and exit",
    description:
      "You have a working product and a pilot. Now: repeatable sales pack, pricing, roadmap, and the legal and financial setup to run as a standalone company.",
    connections:
      "Product: Roadmap and operating model define how the product evolves. GTM: Sales pack and pricing are how you scale revenue. Investability: Investor pack, capital plan, and exit map are the fundraise and exit story.",
    gateDecision:
      "Congratulations — you've completed all 27 assets of the Co-Build Framework. Your venture is ready for spinout.",
    assets: [
      {
        number: 20,
        title: "Sales Pack (Trust Pack)",
        purpose: "One repeatable kit: narrative, deck, demo, eval report, security answers, rollout plan. So anyone can sell, not just you.",
        connections:
          "Product: Demo and eval report are product proof. GTM: This is how you scale beyond design partners. Investability: Repeatable sales process is scale evidence.",
        bullets: [
          "Narrative + deck",
          "Demo + eval report",
          "Security answers",
          "Failure modes",
          "Rollout plan",
        ],
        checklist: [
          { id: "20-1", text: "Created sales narrative and deck" },
          { id: "20-2", text: "Prepared demo and eval report" },
          {
            id: "20-3",
            text: "Documented security answers for enterprise buyers",
          },
          {
            id: "20-4",
            text: "Listed known failure modes and mitigations",
          },
          { id: "20-5", text: "Created standard rollout plan" },
          {
            id: "20-6",
            text: "Sales pack tested with 3 non-design-partner prospects",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 21,
        title: "Pricing + Unit Economics",
        purpose: "Price to outcomes, not seats. Model compute and human-in-loop cost, margin at scale, and sensitivity. So you don't leave money on the table or go broke.",
        connections:
          "Product: Unit economics shape what you build and how. GTM: You can price and defend it. Investability: Unit economics are the business model slide.",
        bullets: [
          "Price to outcomes, not seats",
          "Compute + HITL cost/task",
          "Margin at scale",
          "Sensitivity analysis",
        ],
        checklist: [
          { id: "21-1", text: "Developed outcome-based pricing model" },
          {
            id: "21-2",
            text: "Calculated compute + HITL cost per task",
          },
          {
            id: "21-3",
            text: "Modeled margin at scale (10x, 100x current)",
          },
          {
            id: "21-4",
            text: "Ran sensitivity analysis on key variables",
          },
          {
            id: "21-5",
            text: "Validated pricing with design partner feedback",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 22,
        title: "Roadmap (6/12/18 months) + Gates",
        purpose: "Plan 6, 12, 18 months with clear milestones and gates. Eval lift, data flywheel, deployment, margin, compliance. Align to fundraising if you're raising.",
        connections:
          "Product: Roadmap is what you build and when. GTM: You can commit to customers. Investability: Roadmap shows you know how to use capital.",
        bullets: [
          "Eval lift",
          "Data flywheel milestones",
          "Standard deployment adoption",
          "Margin targets",
          "Compliance readiness",
        ],
        checklist: [
          { id: "22-1", text: "Created 6-month roadmap with milestones" },
          {
            id: "22-2",
            text: "Created 12-month roadmap with milestones",
          },
          {
            id: "22-3",
            text: "Created 18-month roadmap with milestones",
          },
          { id: "22-4", text: "Defined gates at each milestone" },
          {
            id: "22-5",
            text: "Aligned roadmap with fundraising timeline",
          },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 23,
        title: "Operating Model Blueprint",
        purpose: "How the venture operates day-to-day at scale.",
        bullets: [
          "Model release process",
          "Eval cadence",
          "Incident response",
          "Red-teaming",
          "Feedback/label ops",
          "Customer support",
        ],
        checklist: [
          { id: "23-1", text: "Defined model release process" },
          { id: "23-2", text: "Set eval cadence schedule" },
          { id: "23-3", text: "Created incident response playbook" },
          { id: "23-4", text: "Established red-teaming protocol" },
          {
            id: "23-5",
            text: "Built feedback and labeling ops pipeline",
          },
          { id: "23-6", text: "Designed customer support model" },
        ],
        connections:
          "Product: Operating model keeps the product reliable. GTM: Support and ops scale with customers. Investability: Shows you can operate at scale.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 24,
        title: "Investor Pack + Data Room",
        purpose: "One place with everything for due diligence: eval reports, unit economics, security pack, data terms, LOIs, moat ledger. Organised and up to date.",
        bullets: [
          "Eval reports",
          "Unit economics",
          "Security pack",
          "Data terms",
          "LOIs",
          "Moat ledger",
        ],
        checklist: [
          { id: "24-1", text: "Compiled all eval reports" },
          { id: "24-2", text: "Finalized unit economics model" },
          { id: "24-3", text: "Security pack up to date" },
          { id: "24-4", text: "All data terms documented" },
          { id: "24-5", text: "LOIs collected and organized" },
          { id: "24-6", text: "Moat ledger complete with evidence" },
          { id: "24-7", text: "Data room set up and organized" },
        ],
        connections:
          "Product: Eval and moat evidence live here. GTM: LOIs and traction are in the pack. Investability: This is the data room — speed of DD matters.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 25,
        title: "Capital Plan + Runway",
        purpose: "Plan spend: compute, labelling, security, integration, hiring. Tie each chunk to milestones. So you know how long the runway is and what it's for.",
        details:
          "Covers: Compute, labeling ops, security, integration costs; hiring tied to gates.",
        connections:
          "Product: Budget shapes what you can build. GTM: Runway to next milestone. Investability: Capital plan is the use-of-funds story.",
        checklist: [
          { id: "25-1", text: "Projected compute costs for 18 months" },
          { id: "25-2", text: "Budgeted labeling and ops costs" },
          {
            id: "25-3",
            text: "Security and compliance budget allocated",
          },
          { id: "25-4", text: "Integration cost estimates completed" },
          { id: "25-5", text: "Hiring plan tied to milestone gates" },
          { id: "25-6", text: "Total runway calculated and validated" },
        ],
        tags: [],
        isCustomModule: false,
      },
      {
        number: 26,
        title: "Spinout Legal Pack",
        purpose: "Legal basics for the new company: DPAs, AI usage terms, training rights, IP, security policies. So you can sign customers and raise cleanly.",
        bullets: [
          "DPAs",
          "AI usage terms",
          "Training rights",
          "IP",
          "Security policies",
        ],
        checklist: [
          {
            id: "26-1",
            text: "Drafted DPAs (Data Processing Agreements)",
          },
          { id: "26-2", text: "Defined AI usage terms" },
          { id: "26-3", text: "Secured training rights documentation" },
          {
            id: "26-4",
            text: "IP assignment and ownership documented",
          },
          { id: "26-5", text: "Security policies formalized" },
          { id: "26-6", text: "Legal counsel review completed" },
        ],
        connections:
          "Product: Terms define how the product is used. GTM: You can sign enterprise contracts. Investability: Clean legal = fewer DD surprises.",
        tags: [],
        isCustomModule: false,
      },
      {
        number: 27,
        title: "Exit Map",
        purpose: "Who might acquire you and why? Data rights, eval edge, workflow lock-in. Document the logic and the proof so it's not hand-wavy.",
        bullets: ["Data rights", "Eval superiority", "Workflow control"],
        checklist: [
          { id: "27-1", text: "Identified top 5 potential acquirers" },
          { id: "27-2", text: "Documented acquirer logic for each" },
          { id: "27-3", text: "Proved data rights defensibility" },
          {
            id: "27-4",
            text: "Demonstrated eval superiority vs alternatives",
          },
          {
            id: "27-5",
            text: "Mapped workflow control and switching costs",
          },
          { id: "27-6", text: "Exit map reviewed by board/advisors" },
        ],
        connections:
          "Product: Defensibility comes from data, eval, workflow. GTM: Strategic buyers care about the same. Investability: Exit map is the outcome story for investors.",
        tags: [],
        isCustomModule: false,
      },
    ],
  },
];

// ─── Content Library Flat Exports ──────────────────────────────

/** All 27 core assets flattened from stages, auto-tagged with stage info */
export const allAssets: Asset[] = stages.flatMap((s) =>
  s.assets.map((a) => ({
    ...a,
    tags: [`stage-${s.number}`, "core", ...a.tags],
    isCustomModule: false,
  }))
);

/** Custom modules — same Asset shape, numbered 100+ to avoid collision */
export const customModules: Asset[] = [
  {
    number: 101,
    title: "Website Build",
    purpose:
      "One clear page: what you do, why it matters, and one action (contact, waitlist, demo). So visitors get it in seconds.",
    coreQuestion:
      "Does your website instantly tell a visitor what you do, why it matters, and what to do next?",
    connections:
      "Product: The site is often the first version of the product story. GTM: It's where pipeline starts. Investability: A credible site signals you're real.",
    checklist: [
      { id: "101-1", text: "Defined core message and value proposition" },
      { id: "101-2", text: "Designed simple, scannable layout" },
      { id: "101-3", text: "Added clear primary CTA (contact, waitlist, demo)" },
      { id: "101-4", text: "Launched and shared with early contacts" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
  {
    number: 102,
    title: "Pitch Deck Build",
    purpose:
      "Ten slides or fewer: problem, solution, why now, market, product, traction, team, ask. So an investor or partner gets it in one read.",
    coreQuestion:
      "Can an investor or partner understand your problem, solution, traction, and ask in under 10 slides?",
    connections:
      "Product: Deck forces clarity on what you're building. GTM: Same story works for partners and early customers. Investability: The deck is the first thing investors see.",
    checklist: [
      { id: "102-1", text: "Problem, solution, and why now" },
      { id: "102-2", text: "Market size and opportunity" },
      { id: "102-3", text: "Product and traction" },
      { id: "102-4", text: "Team and ask" },
      { id: "102-5", text: "Rehearsed and timed" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
  {
    number: 103,
    title: "V1 Commercials",
    purpose:
      "30- and 60-second versions: hook, problem, solution, proof, ask. So you can repeat the same story in every conversation.",
    coreQuestion:
      "Can you explain your venture in 30 seconds in a way that creates curiosity or commitment?",
    connections:
      "Product: Commercials force you to name the one thing that matters. GTM: You use these in every sales and marketing touch. Investability: A crisp pitch in the room wins meetings.",
    checklist: [
      { id: "103-1", text: "30-second and 60-second scripts" },
      { id: "103-2", text: "Hook, problem, solution, proof, CTA" },
      { id: "103-3", text: "Tested with real conversations" },
      { id: "103-4", text: "Recorded and iterated" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
  {
    number: 104,
    title: "Sales and Closing",
    purpose:
      "One process: qualify, discover, demo, handle objections, close, onboard. So you can repeat it instead of winging it.",
    coreQuestion:
      "Do you have a repeatable process to move a prospect from first touch to signed customer?",
    connections:
      "Product: Discovery tells you what to build next. GTM: This is how you get design partners and early revenue. Investability: Repeatable sales = scalable business.",
    checklist: [
      { id: "104-1", text: "Defined ICP and qualification criteria" },
      { id: "104-2", text: "Discovery and demo flow" },
      { id: "104-3", text: "Objection handling and pricing" },
      { id: "104-4", text: "Close and onboarding" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
  {
    number: 105,
    title: "How to Talk to Investors",
    purpose:
      "Know your story, your numbers, and your ask. Practice so you can explain opportunity, progress, and use of capital in their language.",
    coreQuestion:
      "Can you clearly explain your opportunity, progress, and use of capital in investor language?",
    connections:
      "Product: Investors want to see a clear product and roadmap. GTM: Traction and pipeline are proof. Investability: This is the conversation that closes the round.",
    checklist: [
      { id: "105-1", text: "Investment story and use of funds" },
      { id: "105-2", text: "Key metrics and milestones" },
      { id: "105-3", text: "Term sheet basics and red lines" },
      { id: "105-4", text: "Follow-up and closing process" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
  {
    number: 106,
    title: "Content Build",
    purpose:
      "Set up the stack, then iterate copy and structure from what customers need to hear. One primary action (demo or sign up), and measure funnel: visits → clicks → completions.",
    coreQuestion:
      "Does your site get the right visitors to one clear action (demo or sign up) by teaching them what they need to understand first?",
    connections:
      "Product: The site is the first product experience. GTM: Content and funnel drive pipeline. Investability: Measured funnel shows you understand growth.",
    checklist: [
      { id: "106-1", text: "Setup: Claude space, git, design, Vercel deploy, domain" },
      { id: "106-2", text: "Iterate copy and structure from what customers need to understand" },
      { id: "106-3", text: "One primary CTA; funnel measured (visits → CTA clicks → completions)" },
    ],
    tags: ["customer-path", "skills"],
    isCustomModule: true,
  },
];

/** Combined flat catalog for the content library */
export const library: Asset[] = [...allAssets, ...customModules];

/** All unique tags across the library (for filter UI) */
export const allTags: string[] = [
  ...new Set(library.flatMap((a) => a.tags)),
].sort();

export const keyTakeaways = [
  "Sequence matters. Each asset builds on the last. Skip steps = fail later.",
  'AI-native means: every asset asks "what\'s the AI moat?"',
  "World-beating test: if you win, do you own a global category?",
  "Data advantage must be contractual, not assumed.",
  "Productized pilots scale. Custom pilots don't.",
];

export const failureModes = [
  "Skipping #1-2: Building before proving the market won't solve itself",
  "No #12: Assuming data moat without contractual rights",
  "Vague #10: No eval plan = no way to prove AI works",
  "Custom #18: Every pilot is bespoke = can't scale",
  "Missing #6: No kill switches = zombie ventures",
];
