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
  checklist: ChecklistItem[];
}

export interface Stage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
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
      "The Invention Gate is where every Co-Build journey begins. Before you write a single line of code or speak to a single customer, you must answer the most fundamental question: why does this venture need to exist?",
    gateDecision:
      "Only proceed to Stage 01 if both assets are complete and pass the world-beating test.",
    assets: [
      {
        number: 1,
        title: "Risk Capital + Invention One-Pager",
        purpose:
          "True risk-capital logic: why the market won't solve this, what must be invented, and why insiders can win globally.",
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
      },
      {
        number: 2,
        title: "Category Ambition Gate",
        purpose:
          'Forces category clarity: "if we win, what global category do we own?" Filters out small tools and pilotware early.',
        coreQuestion:
          "If we execute perfectly for 5 years, will we own a global category worth $1B+?",
        details:
          'If the answer is "maybe we\'ll be a nice $20M ARR business" — stop here. Venture capital requires venture-scale outcomes.',
        checklist: [
          { id: "2-1", text: "Defined the global category you aim to own" },
          { id: "2-2", text: "Passed the $1B+ world-beating test" },
          {
            id: "2-3",
            text: "Confirmed this is NOT just a small tool or feature",
          },
          { id: "2-4", text: "Documented category ambition rationale" },
        ],
      },
    ],
  },
  {
    id: "01",
    number: "01",
    title: "Problem Deep Dive",
    subtitle: "Quantifying pain that funds solutions",
    description:
      "Now that you've passed the Invention Gate, it's time to deeply understand the problem you're solving. This stage forces economic truth.",
    gateDecision:
      "Proceed to Stage 02 once you can quantify the pain and map where AI creates value.",
    assets: [
      {
        number: 3,
        title: "Problem Deep Dive + Quantification",
        purpose:
          "Economic truth: pain, cost, frequency, who pays, and how it's measured. This defines target outcomes.",
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
      },
      {
        number: 4,
        title: "Workflow Map + Data Touchpoints",
        purpose:
          "Maps decisions and actions + where data is created/owned + where AI intervenes. This is NOT about chatbots.",
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
      },
    ],
  },
  {
    id: "02",
    number: "02",
    title: "Customer & Validation",
    subtitle: "ICP, assumptions, and kill switches",
    description:
      "Now you know the problem. This stage forces you to define exactly who you're solving it for, what you're assuming, and what evidence would kill this venture.",
    gateDecision:
      "Proceed to Stage 03 only if your core assumptions survive discovery. If a kill switch triggers — pivot or stop.",
    assets: [
      {
        number: 5,
        title: "ICP Definition",
        purpose:
          "Define your Ideal Customer Profile with precision. Who is the buyer, who is the user, and what does their world look like?",
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
      },
      {
        number: 6,
        title: "Assumptions + Kill Switches",
        purpose:
          "Every venture is built on assumptions. This asset forces you to name them explicitly and define what evidence would kill the venture.",
        details:
          "Kill switches prevent zombie ventures. If you can't name the evidence that would make you stop, you'll never stop — even when you should.",
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
      },
      {
        number: 7,
        title: "Discovery Interviews",
        purpose:
          "Structured customer discovery to validate or invalidate your assumptions. Not sales calls — learning calls.",
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
      },
    ],
  },
  {
    id: "03",
    number: "03",
    title: "Data Rights & AI Feasibility",
    subtitle: "The moat isn't the model — it's the data contract",
    description:
      "This is where most AI ventures fail silently. You must prove the AI can work AND secure the data rights that make your moat real.",
    gateDecision:
      "Proceed to Stage 04 only when you have signed data advantage contracts and proven AI feasibility.",
    assets: [
      {
        number: 8,
        title: "Design Partner Pipeline",
        purpose:
          "Ensures selling while validating; selects accounts most likely to fund pilots.",
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
      },
      {
        number: 9,
        title: "AI Feasibility Brief",
        purpose:
          "Decides: rules/ML/LLM-RAG/agents; what's automatable now vs. human-in-loop.",
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
      },
      {
        number: 10,
        title: "Eval Plan + Ground Truth",
        purpose:
          "Defines 'good': gold set, scoring, acceptance thresholds, failure modes.",
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
      },
      {
        number: 11,
        title: "Security Pack",
        purpose:
          "The data unblocker. Without this, enterprise deals stall.",
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
      },
      {
        number: 12,
        title: "Data Advantage Contract",
        purpose:
          'Makes "data moat" contractual, not assumed. Without this, you have no moat.',
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
      },
      {
        number: 13,
        title: "The Moat Ledger",
        purpose:
          "Tracks compounding loops with evidence. The moat isn't theoretical — it's documented.",
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
      },
    ],
  },
  {
    id: "04",
    number: "04",
    title: "The PRD Culmination",
    subtitle: "Everything converges into what we build",
    description:
      "This is the fulcrum of the entire framework. Everything before this stage feeds into the PRD. Everything after flows from it.",
    gateDecision:
      "The PRD is your contract with reality. Only proceed to Build once all stakeholders have signed off.",
    assets: [
      {
        number: 15,
        title: "PRD v1 + Not-to-Build",
        purpose:
          "Dual PRD: workflow requirements + intelligence requirements. Explicit exclusions.",
        details:
          "Equally important: what features we explicitly won't build in v1. This prevents scope creep and keeps focus on the wedge.",
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
      },
    ],
  },
  {
    id: "05",
    number: "05",
    title: "Build & Sell",
    subtitle: "Architecture, LOI, pilot, prototype",
    description:
      "Now you build — but you sell simultaneously. The build and sell tracks run in parallel, not in sequence.",
    gateDecision:
      "Proceed to Scale only with a signed LOI, live pilot, and prototype that meets eval thresholds.",
    assets: [
      {
        number: 16,
        title: "Enterprise Architecture Canvas",
        purpose: "Technical architecture for enterprise-grade AI product.",
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
      },
      {
        number: 17,
        title: "Design Partner Offer + LOI",
        purpose:
          "Secures paid pilot with AI + data + productization clauses.",
        checklist: [
          { id: "17-1", text: "Drafted design partner offer document" },
          { id: "17-2", text: "Included AI usage and data terms" },
          { id: "17-3", text: "Added productization clauses" },
          { id: "17-4", text: "Negotiated with design partners" },
          { id: "17-5", text: "Secured at least 1 signed LOI" },
          { id: "17-6", text: "Legal review of LOI completed" },
        ],
      },
      {
        number: 18,
        title: "Pilot SOW + KPI Dashboard",
        purpose:
          "The pilot SOW is where ventures die or scale.",
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
      },
      {
        number: 19,
        title: "Prototype Sprint + Demo",
        purpose:
          "Shows workflow value + eval proof + safety controls + latency/cost.",
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
      },
    ],
  },
  {
    id: "06",
    number: "06",
    title: "Scale & Spinout",
    subtitle: "Sales pack, pricing, roadmap, and exit",
    description:
      "You've built it, proved it works. Now scale it into a standalone company.",
    gateDecision:
      "Congratulations — you've completed all 27 assets of the Co-Build Framework. Your venture is ready for spinout.",
    assets: [
      {
        number: 20,
        title: "Sales Pack (Trust Pack)",
        purpose: "Repeatable selling kit for scaling beyond design partners.",
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
      },
      {
        number: 21,
        title: "Pricing + Unit Economics",
        purpose: "Compute-aware pricing model.",
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
      },
      {
        number: 22,
        title: "Roadmap (6/12/18 months) + Gates",
        purpose: "AI-native roadmap with clear gates.",
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
      },
      {
        number: 24,
        title: "Investor Pack + Data Room",
        purpose: "Everything investors need for due diligence.",
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
      },
      {
        number: 25,
        title: "Capital Plan + Runway",
        purpose: "Detailed financial plan tied to milestones.",
        details:
          "Covers: Compute, labeling ops, security, integration costs; hiring tied to gates.",
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
      },
      {
        number: 26,
        title: "Spinout Legal Pack",
        purpose: "Legal foundation for the standalone entity.",
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
      },
      {
        number: 27,
        title: "Exit Map",
        purpose: "Acquirer logic + proof of defensibility.",
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
      },
    ],
  },
];

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
