import type { AssetWorkflow } from "../questions";

// ─── Stage 6: Go-to-Market & Scale ─────────────────────────────
// Core gate: Can you sell, fund, and operationalize this venture?
// Fellows must build their sales engine, prove unit economics, and prepare for scale.

export const stage06Workflows: AssetWorkflow[] = [
  // ───────────────────────────────────────────────────────────────
  // Asset #20: Sales Pack (Trust Pack)
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 20,
    steps: [
      {
        id: "20-s1",
        title: "Trust Narrative",
        description:
          "Craft the narrative that makes enterprise buyers trust you enough to buy. Enterprise sales are won on trust, not features.",
        questions: [
          {
            id: "20-q1",
            type: "textarea",
            label: "What is your trust narrative for enterprise buyers?",
            description:
              "Describe the story you tell that makes a risk-averse buyer feel safe choosing you. Cover credibility, track record, security posture, and customer proof.",
            placeholder:
              "e.g. We are built by former chief pharmacy officers who managed $2B+ in drug spend. Our platform is SOC 2 Type II certified, HIPAA compliant, and deployed in 3 top-50 health systems. We are not asking you to trust a startup -- we are asking you to trust your peers who already use us...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "20-q2",
            type: "textarea",
            label: "What proof points do you have?",
            description:
              "List concrete evidence that backs up your trust narrative: metrics, customer logos, certifications, awards, pilot results, or endorsements.",
            placeholder:
              "e.g. 1) $4.2M in savings identified across 3 pilot customers, 2) SOC 2 Type II certified, 3) Published case study with Memorial Health, 4) Advisory board includes 2 former CIOs of Fortune 500 health systems, 5) 98% pilot-to-contract conversion rate...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "20-s2",
        title: "Materials Checklist",
        description:
          "Inventory the sales materials you have created. Enterprise buyers expect a complete package.",
        questions: [
          {
            id: "20-q3",
            type: "checklist",
            label: "Which sales materials have you created?",
            description:
              "Check all materials that are complete and ready to share with a prospective buyer today.",
            required: true,
            options: [
              { value: "pitch_deck", label: "Pitch deck" },
              { value: "case_study", label: "Case study" },
              { value: "roi_calculator", label: "ROI calculator" },
              {
                value: "competitive_comparison",
                label: "Competitive comparison",
              },
              {
                value: "customer_testimonials",
                label: "Customer testimonials",
              },
              {
                value: "security_documentation",
                label: "Security documentation",
              },
              {
                value: "implementation_guide",
                label: "Implementation guide",
              },
            ],
          },
        ],
      },
      {
        id: "20-s3",
        title: "Objection Handling",
        description:
          "Anticipate and prepare for the objections that kill enterprise deals.",
        questions: [
          {
            id: "20-q4",
            type: "textarea",
            label:
              "What are the top 3 sales objections you hear, and how do you respond?",
            description:
              "List each objection and your prepared response. The best responses reframe the objection as a reason to buy.",
            placeholder:
              "e.g. Objection 1: 'We already have a procurement tool.' Response: 'Your current tool manages POs -- ours finds the savings before the PO is created. They are complementary, not competitive. In fact, our best customers use both.'\n\nObjection 2: 'You are too small / too new.' Response: 'We are purpose-built for this problem by people who lived it. Our 3 pilot customers chose us over [Large Incumbent] because...'",
            required: true,
            maxLength: 3000,
          },
        ],
      },
      {
        id: "20-s4",
        title: "Deliverable",
        description:
          "Upload your complete Sales Pack and pitch deck.",
        questions: [
          {
            id: "20-q5",
            type: "file",
            label: "Upload your Sales / Trust Pack.",
            description:
              "A comprehensive package containing your trust narrative, proof points, objection handling, and key sales materials in one document or folder.",
            required: true,
            accept: ".pdf,.docx,.pptx",
            maxFiles: 1,
          },
          {
            id: "20-q6",
            type: "file",
            label: "Upload your pitch deck.",
            description:
              "The presentation you use in sales meetings with enterprise buyers.",
            required: false,
            accept: ".pdf,.pptx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #21: Pricing + Unit Economics
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 21,
    steps: [
      {
        id: "21-s1",
        title: "Pricing Model",
        description:
          "Define how you charge and how it compares to the alternatives your buyers evaluate.",
        questions: [
          {
            id: "21-q1",
            type: "select",
            label: "What pricing model will you use?",
            description:
              "Select the primary pricing model. The best model aligns your revenue with the value your customer receives.",
            required: true,
            options: [
              { value: "per_seat", label: "Per seat" },
              { value: "usage_based", label: "Usage-based" },
              { value: "flat_fee", label: "Flat fee" },
              { value: "tiered", label: "Tiered" },
              { value: "outcome_based", label: "Outcome-based" },
              { value: "hybrid", label: "Hybrid" },
            ],
          },
          {
            id: "21-q2",
            type: "text",
            label: "What is your target ACV (Annual Contract Value)?",
            description:
              "State the average annual revenue you expect per customer. Include currency.",
            placeholder: "e.g. $120K / year",
            required: true,
          },
          {
            id: "21-q3",
            type: "textarea",
            label: "How does your pricing compare to alternatives?",
            description:
              "Explain how your pricing stacks up against incumbents, substitutes, and the cost of doing nothing. Buyers always compare.",
            placeholder:
              "e.g. Incumbents charge $300K+ for legacy procurement suites that require 6-month implementations. We charge $120K with a 2-week deployment. The 'do nothing' cost is $1-3M in overspend annually, making our price a 10x ROI...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "21-s2",
        title: "Unit Economics",
        description:
          "Prove the fundamental math works. If your unit economics are broken, growth only accelerates losses.",
        questions: [
          {
            id: "21-q4",
            type: "text",
            label: "What is your estimated CAC (Customer Acquisition Cost)?",
            description:
              "Total sales and marketing cost to acquire one customer. Include salaries, tools, travel, and marketing spend.",
            placeholder: "e.g. $35K",
            required: true,
          },
          {
            id: "21-q5",
            type: "text",
            label: "What is your estimated LTV (Lifetime Value)?",
            description:
              "Total revenue from an average customer over their lifetime, accounting for churn and expansion.",
            placeholder: "e.g. $420K (3.5 years x $120K ACV)",
            required: true,
          },
          {
            id: "21-q6",
            type: "text",
            label: "What is your LTV:CAC ratio target?",
            description:
              "The ratio of lifetime value to customer acquisition cost. 3:1 or higher is generally considered healthy for SaaS.",
            placeholder: "e.g. 12:1",
            required: true,
          },
          {
            id: "21-q7",
            type: "text",
            label: "What is your gross margin target?",
            description:
              "Revenue minus cost of goods sold (hosting, support, delivery) as a percentage of revenue.",
            placeholder: "e.g. 75%",
            required: true,
          },
        ],
      },
      {
        id: "21-s3",
        title: "Pricing Validation",
        description:
          "Test whether customers will actually pay what you plan to charge.",
        questions: [
          {
            id: "21-q8",
            type: "select",
            label: "Have customers validated this pricing?",
            description:
              "Be honest about where you are. Untested pricing is the biggest risk to your revenue model.",
            required: true,
            options: [
              {
                value: "yes_will_pay",
                label: "Yes -- customers will pay this price",
              },
              {
                value: "yes_with_concerns",
                label: "Yes -- but with concerns or pushback",
              },
              { value: "not_yet_tested", label: "Not yet tested" },
              { value: "too_early", label: "Too early to validate" },
            ],
          },
          {
            id: "21-q9",
            type: "textarea",
            label: "What is the key pricing feedback you have received?",
            description:
              "Summarize what prospects and customers have said about your pricing: objections, comparisons, willingness to pay, and any surprises.",
            placeholder:
              "e.g. 2 of 3 pilot customers said pricing is 'very reasonable' compared to their current spend. One asked for a usage-based option instead of flat fee. All 3 said they need procurement approval for anything over $100K, suggesting our $120K ACV may hit a budget threshold...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "21-s4",
        title: "Deliverable",
        description:
          "Upload your pricing model and any customer-facing pricing materials.",
        questions: [
          {
            id: "21-q10",
            type: "file",
            label: "Upload your Pricing & Unit Economics model.",
            description:
              "A spreadsheet or document showing your pricing structure, unit economics calculations, and sensitivity analysis.",
            required: true,
            accept: ".pdf,.xlsx",
            maxFiles: 1,
          },
          {
            id: "21-q11",
            type: "file",
            label: "Upload your pricing page or proposal template.",
            description:
              "The customer-facing pricing page, proposal template, or quote document you use in sales conversations.",
            required: false,
            accept: ".pdf,.docx,.pptx,.xlsx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #22: Roadmap
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 22,
    steps: [
      {
        id: "22-s1",
        title: "Roadmap Phases",
        description:
          "Define the major phases of your product journey from pilot to GA to scale.",
        questions: [
          {
            id: "22-q1",
            type: "textarea",
            label: "What are your 3-4 major roadmap phases?",
            description:
              "Name each phase and describe what gets built, launched, or achieved in each. Phases should have clear entry and exit criteria.",
            placeholder:
              "e.g. Phase 1 (Pilot): Core analytics dashboard + SAP integration. Phase 2 (GA Launch): Self-service onboarding, 5 ERP integrations, mobile app. Phase 3 (Scale): AI recommendation engine, marketplace for group purchasing, API platform for third-party developers. Phase 4 (Expand): International markets, adjacent verticals...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "22-q2",
            type: "textarea",
            label: "What is the timeline for each phase?",
            description:
              "Assign realistic timelines to each phase. Be specific about start dates, milestones, and deadlines.",
            placeholder:
              "e.g. Phase 1: Jan-Mar 2025 (3 months). Phase 2: Apr-Sep 2025 (6 months). Phase 3: Oct 2025-Mar 2026 (6 months). Phase 4: Q2 2026 onward...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "22-s2",
        title: "Prioritization",
        description:
          "Explain how you decide what to build and what to defer.",
        questions: [
          {
            id: "22-q3",
            type: "textarea",
            label: "How do you prioritize features?",
            description:
              "Describe your prioritization framework: RICE scoring, customer-driven, revenue impact, strategic bets, or a combination.",
            placeholder:
              "e.g. We use a modified RICE framework weighted toward revenue impact and design partner feedback. Every feature is scored on: Reach (how many customers want it), Impact (revenue/retention effect), Confidence (data backing the request), and Effort (engineering weeks). Design partner requests get a 2x multiplier...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "22-q4",
            type: "textarea",
            label: "What is the single most important thing to build next?",
            description:
              "Force-rank to one item. If you could only ship one thing in the next 30 days, what would it be and why?",
            placeholder:
              "e.g. The SAP integration connector. 70% of our target customers run SAP, and without this integration we cannot onboard them. Every other feature is worthless if we cannot get data in...",
            required: true,
            maxLength: 1500,
          },
        ],
      },
      {
        id: "22-s3",
        title: "Dependencies",
        description:
          "Identify what could block or change your roadmap.",
        questions: [
          {
            id: "22-q5",
            type: "textarea",
            label: "What are the key dependencies or blockers?",
            description:
              "List the internal and external dependencies that could slow you down: hiring, partnerships, technology readiness, customer commitments, or regulatory approvals.",
            placeholder:
              "e.g. 1) Hiring a senior backend engineer (currently interviewing). 2) SAP partnership agreement (in legal review). 3) SOC 2 Type II audit completion (auditor engaged, target: March). 4) Design partner data access agreements (2 of 3 signed)...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "22-q6",
            type: "textarea",
            label: "What external factors could change the roadmap?",
            description:
              "Identify market shifts, competitive moves, regulatory changes, or customer behavior changes that would force you to reprioritize.",
            placeholder:
              "e.g. 1) If CMS delays the interoperability mandate, our urgency argument weakens. 2) If a major EHR vendor launches a competing feature, we need to differentiate faster. 3) If pilot results exceed expectations, we may accelerate GA launch...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "22-s4",
        title: "Deliverable",
        description:
          "Upload your product roadmap and assess your confidence level.",
        questions: [
          {
            id: "22-q7",
            type: "file",
            label: "Upload your product roadmap.",
            description:
              "A visual roadmap showing phases, features, timelines, and dependencies. Can be a Gantt chart, timeline, or structured document.",
            required: true,
            accept: ".pdf,.png,.xlsx",
            maxFiles: 1,
          },
          {
            id: "22-q8",
            type: "rating",
            label: "How confident are you in this roadmap?",
            description:
              "Rate your confidence that this roadmap is achievable as planned. 1 = highly uncertain, 10 = fully committed and resourced.",
            required: true,
            min: 1,
            max: 10,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #23: Operating Model Blueprint
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 23,
    steps: [
      {
        id: "23-s1",
        title: "Team Structure",
        description:
          "Define the team you need to build and operate this venture.",
        questions: [
          {
            id: "23-q1",
            type: "textarea",
            label: "What roles do you need?",
            description:
              "List every role required to operate the venture: engineering, product, sales, operations, support, and leadership. Include seniority level and whether the role is full-time, part-time, or contractor.",
            placeholder:
              "e.g. CTO (full-time, co-founder), 2x Senior Backend Engineers (full-time), 1x Frontend Engineer (full-time), 1x Product Manager (full-time), 1x Enterprise Sales Lead (full-time), 1x Customer Success Manager (full-time, after GA), 1x DevOps/SRE (contractor initially)...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "23-q2",
            type: "textarea",
            label:
              "What is the team size at launch vs. 12 months after launch?",
            description:
              "Show the hiring ramp: who do you need on day one vs. who you will add as the venture scales.",
            placeholder:
              "e.g. Launch (5 people): CTO, 2 engineers, 1 PM, 1 sales lead. Month 6 (8 people): add 1 engineer, 1 CSM, 1 marketing hire. Month 12 (12 people): add 2 engineers, 1 sales rep, 1 ops manager...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "23-s2",
        title: "Operations",
        description:
          "Define the key processes that keep the venture running day-to-day.",
        questions: [
          {
            id: "23-q3",
            type: "textarea",
            label: "What are the key operational processes?",
            description:
              "List the core processes: customer onboarding, support, billing, deployment, monitoring, incident response, and reporting. Describe each briefly.",
            placeholder:
              "e.g. 1) Customer onboarding: 2-week guided setup with dedicated CSM. 2) Support: Tier 1 via chat (< 1hr response), Tier 2 via engineering (< 4hr). 3) Deployment: CI/CD with weekly releases, customer-specific staging environments. 4) Billing: annual contracts, invoiced quarterly...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "23-q4",
            type: "textarea",
            label: "What will you automate vs. do manually?",
            description:
              "Be strategic about where you invest in automation early vs. where you keep humans in the loop. Over-automating too early wastes engineering time.",
            placeholder:
              "e.g. Automate: deployment pipelines, monitoring/alerting, usage tracking, invoice generation. Manual (for now): customer onboarding, data integration setup, QBR preparation, contract negotiation. Automate later: onboarding wizard, self-service integrations...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "23-s3",
        title: "Costs & Margins",
        description:
          "Estimate the cost structure and path to profitability.",
        questions: [
          {
            id: "23-q5",
            type: "text",
            label: "What is your estimated monthly burn rate?",
            description:
              "Total monthly spend including salaries, infrastructure, tools, office, legal, and other overhead.",
            placeholder: "e.g. $85K/month",
            required: true,
          },
          {
            id: "23-q6",
            type: "select",
            label: "What is your expected path to profitability timeline?",
            description:
              "When do you expect revenue to exceed costs on a monthly basis?",
            required: true,
            options: [
              { value: "6_months", label: "6 months" },
              { value: "12_months", label: "12 months" },
              { value: "18_months", label: "18 months" },
              { value: "24_months", label: "24 months" },
              { value: "36_months", label: "36 months" },
            ],
          },
        ],
      },
      {
        id: "23-s4",
        title: "Deliverable",
        description:
          "Upload your Operating Model Blueprint and any supporting context.",
        questions: [
          {
            id: "23-q7",
            type: "file",
            label: "Upload your Operating Model Blueprint.",
            description:
              "A document covering team structure, operational processes, cost model, and scaling plan.",
            required: true,
            accept: ".pdf,.docx,.pptx,.xlsx",
            maxFiles: 1,
          },
          {
            id: "23-q8",
            type: "textarea",
            label: "Any additional context on your operating model?",
            description:
              "Share anything not captured above: assumptions, risks, open questions, or dependencies on the parent organization.",
            placeholder:
              "e.g. We are leveraging the parent company's HR and legal functions for the first 12 months, which reduces overhead by ~$15K/month. We will need to stand up these functions independently before spinout...",
            required: false,
            maxLength: 2000,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #24: Investor Pack + Data Room
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 24,
    steps: [
      {
        id: "24-s1",
        title: "Fundraising Strategy",
        description:
          "Define how much you are raising, at what stage, and how you will deploy the capital.",
        questions: [
          {
            id: "24-q1",
            type: "text",
            label: "How much are you raising?",
            description:
              "State the target raise amount. Include currency and whether this is a range or fixed target.",
            placeholder: "e.g. $3-5M",
            required: true,
          },
          {
            id: "24-q2",
            type: "select",
            label: "What stage is this raise?",
            description:
              "Select the funding stage that matches your venture's maturity and traction.",
            required: true,
            options: [
              { value: "pre_seed", label: "Pre-seed" },
              { value: "seed", label: "Seed" },
              { value: "series_a", label: "Series A" },
            ],
          },
          {
            id: "24-q3",
            type: "textarea",
            label: "How will you use the funds?",
            description:
              "Break down the use of funds by category: engineering, sales, marketing, operations, and reserves. Show the allocation as percentages or dollar amounts.",
            placeholder:
              "e.g. 50% Engineering ($2M): hire 4 engineers, build core platform. 25% Sales ($1M): hire 2 AEs, build sales infrastructure. 15% Operations ($600K): infrastructure, tools, legal. 10% Reserve ($400K): contingency buffer...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "24-s2",
        title: "Investor Materials",
        description:
          "Take inventory of your fundraising materials. Investors expect a complete, professional package.",
        questions: [
          {
            id: "24-q4",
            type: "checklist",
            label: "Which investor materials are ready?",
            description:
              "Check all materials that are complete and investor-ready today.",
            required: true,
            options: [
              { value: "pitch_deck", label: "Pitch deck" },
              { value: "financial_model", label: "Financial model" },
              { value: "cap_table", label: "Cap table" },
              { value: "term_sheet", label: "Term sheet" },
              { value: "executive_summary", label: "Executive summary" },
              { value: "team_bios", label: "Team bios" },
              { value: "product_demo", label: "Product demo" },
              {
                value: "customer_references",
                label: "Customer references",
              },
            ],
          },
        ],
      },
      {
        id: "24-s3",
        title: "Data Room",
        description:
          "Organize your data room so investors can do due diligence efficiently.",
        questions: [
          {
            id: "24-q5",
            type: "textarea",
            label: "What is in your data room?",
            description:
              "List the documents and categories organized in your data room: financials, legal, product, team, customers, and market.",
            placeholder:
              "e.g. Financials: P&L, balance sheet, financial model, cap table. Legal: incorporation docs, IP assignments, key contracts. Product: architecture doc, roadmap, security audit. Team: bios, org chart, advisory agreements. Customers: LOIs, pilot results, pipeline...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "24-q6",
            type: "select",
            label: "Is your data room organized and accessible?",
            description:
              "Honestly assess the readiness of your data room. Investors notice when things are messy.",
            required: true,
            options: [
              {
                value: "yes_fully_organized",
                label: "Yes -- fully organized and ready for diligence",
              },
              {
                value: "partially_needs_work",
                label: "Partially -- needs work before sharing",
              },
              { value: "not_started", label: "Not started" },
            ],
          },
        ],
      },
      {
        id: "24-s4",
        title: "Deliverable",
        description:
          "Upload your Investor Pack, financial model, and data room link.",
        questions: [
          {
            id: "24-q7",
            type: "file",
            label: "Upload your Investor Pack.",
            description:
              "A comprehensive document or pitch deck tailored for investors, covering the opportunity, traction, team, and ask.",
            required: true,
            accept: ".pdf,.pptx,.docx",
            maxFiles: 1,
          },
          {
            id: "24-q8",
            type: "file",
            label: "Upload your financial model.",
            description:
              "A detailed financial model showing revenue projections, cost structure, unit economics, and funding scenarios.",
            required: false,
            accept: ".xlsx,.pdf",
            maxFiles: 1,
          },
          {
            id: "24-q9",
            type: "url",
            label: "Data room link",
            description:
              "Share the URL to your organized data room (e.g. Google Drive, Notion, DocSend, or dedicated data room platform).",
            placeholder: "https://docsend.com/view/your-data-room",
            required: false,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #25: Capital Plan + Runway
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 25,
    steps: [
      {
        id: "25-s1",
        title: "Capital Allocation",
        description:
          "Define how capital will be deployed across functions and track your runway.",
        questions: [
          {
            id: "25-q1",
            type: "textarea",
            label: "How will you allocate capital across functions?",
            description:
              "Break down your budget by function: engineering, sales, marketing, operations, infrastructure, legal, and reserves. Show monthly or quarterly allocations.",
            placeholder:
              "e.g. Monthly allocation: Engineering $45K (3 engineers + infra), Sales $25K (1 AE + tools + travel), Marketing $10K (content + events), Operations $8K (tools + support), Legal $5K (ongoing counsel), Reserve $7K...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "25-q2",
            type: "text",
            label: "What is your monthly burn rate?",
            description:
              "Total monthly cash outflow including all salaries, infrastructure, tools, and overhead.",
            placeholder: "e.g. $100K/month",
            required: true,
          },
          {
            id: "25-q3",
            type: "number",
            label: "What is your current runway in months?",
            description:
              "Cash in the bank divided by monthly burn rate. Be precise -- this is the most important number in your venture.",
            required: true,
            min: 0,
            max: 120,
          },
        ],
      },
      {
        id: "25-s2",
        title: "Milestones",
        description:
          "Define the milestones that must be hit before the next raise, and what triggers it.",
        questions: [
          {
            id: "25-q4",
            type: "textarea",
            label: "What are the key milestones before your next raise?",
            description:
              "List the specific, measurable milestones that will make your next fundraise successful: revenue targets, customer counts, product launches, or partnerships.",
            placeholder:
              "e.g. 1) $500K ARR from 5+ paying customers. 2) SOC 2 Type II certification. 3) Enterprise-grade platform with 3+ ERP integrations. 4) Net retention rate > 120%. 5) Hire VP of Sales...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "25-q5",
            type: "textarea",
            label: "What triggers the next fundraise?",
            description:
              "Describe the conditions that signal it is time to raise again: a specific milestone, runway threshold, or market opportunity.",
            placeholder:
              "e.g. We will start the next raise when we hit $500K ARR or when runway drops below 9 months, whichever comes first. Ideally, we raise from a position of strength with strong growth metrics rather than out of necessity...",
            required: true,
            maxLength: 1500,
          },
        ],
      },
      {
        id: "25-s3",
        title: "Scenario Planning",
        description:
          "Plan for the best, the likely, and the worst case. Hope is not a strategy.",
        questions: [
          {
            id: "25-q6",
            type: "textarea",
            label:
              "Describe your best case, base case, and worst case runway scenarios.",
            description:
              "For each scenario, state the assumptions, monthly burn, revenue trajectory, and resulting runway. This shows investors you think rigorously about risk.",
            placeholder:
              "e.g. Best case: Close 3 enterprise deals by Q2 ($360K ARR), burn stays at $100K/month, runway extends to 24 months. Base case: Close 1-2 deals by Q3 ($180K ARR), burn increases to $120K with new hires, runway is 16 months. Worst case: No new revenue for 6 months, burn at $100K, runway is 12 months -- triggers cost cuts at month 9...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "25-q7",
            type: "textarea",
            label:
              "What is your plan if fundraising takes longer than expected?",
            description:
              "Describe the levers you can pull if the next raise is delayed: cost cuts, bridge financing, revenue acceleration, or strategic partnerships.",
            placeholder:
              "e.g. If fundraising extends beyond 3 months: 1) Reduce burn by $20K/month (pause non-critical hires). 2) Accelerate 2 enterprise deals in pipeline to generate revenue. 3) Explore bridge note from existing investors. 4) As last resort, reduce team by 2 contractor roles...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "25-s4",
        title: "Deliverable",
        description:
          "Upload your Capital Plan and runway model.",
        questions: [
          {
            id: "25-q8",
            type: "file",
            label: "Upload your Capital Plan.",
            description:
              "A document or spreadsheet showing capital allocation, burn rate scenarios, milestone-based spending, and runway analysis.",
            required: true,
            accept: ".pdf,.xlsx",
            maxFiles: 1,
          },
          {
            id: "25-q9",
            type: "file",
            label: "Upload your runway model.",
            description:
              "A detailed spreadsheet showing monthly cash flows, revenue projections, and runway under multiple scenarios.",
            required: false,
            accept: ".xlsx,.pdf",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #26: Spinout Legal Pack
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 26,
    steps: [
      {
        id: "26-s1",
        title: "Entity Structure",
        description:
          "Define the legal entity structure for your independent venture.",
        questions: [
          {
            id: "26-q1",
            type: "select",
            label: "What legal entity type will you incorporate as?",
            description:
              "The entity type affects fundraising, tax treatment, and investor expectations. Delaware C-Corp is standard for VC-backed startups in the US.",
            required: true,
            options: [
              { value: "c_corp_delaware", label: "C-Corp (Delaware)" },
              { value: "llc", label: "LLC" },
              { value: "ltd_uk", label: "Ltd (UK)" },
              { value: "other", label: "Other" },
            ],
          },
          {
            id: "26-q2",
            type: "select",
            label: "What is your incorporation status?",
            description:
              "Where are you in the incorporation process?",
            required: true,
            options: [
              { value: "incorporated", label: "Incorporated" },
              { value: "in_progress", label: "In progress" },
              { value: "not_started", label: "Not started" },
            ],
          },
        ],
      },
      {
        id: "26-s2",
        title: "IP & Agreements",
        description:
          "Ensure intellectual property is properly assigned and all key agreements are in place.",
        questions: [
          {
            id: "26-q3",
            type: "textarea",
            label: "What is the status of IP assignment?",
            description:
              "Describe how IP will transfer from the parent organization to the new entity: patents, trademarks, code, data rights, and trade secrets.",
            placeholder:
              "e.g. All code is being developed in a separate repo owned by the new entity. IP assignment agreement drafted by [Law Firm], covering all code, algorithms, and data models. Parent company retains a non-exclusive license for internal use. Patent applications (2) will be assigned to new entity upon incorporation...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "26-q4",
            type: "checklist",
            label: "Which key agreements do you need?",
            description:
              "Check all agreements that are required for the spinout. Unchecked items represent gaps to address.",
            required: true,
            options: [
              {
                value: "founder_agreements",
                label: "Founder agreements",
              },
              { value: "ip_assignment", label: "IP assignment" },
              {
                value: "employment_contracts",
                label: "Employment contracts",
              },
              { value: "vendor_contracts", label: "Vendor contracts" },
              {
                value: "data_processing_agreements",
                label: "Data processing agreements",
              },
              { value: "nda_templates", label: "NDA templates" },
            ],
          },
        ],
      },
      {
        id: "26-s3",
        title: "Cap Table",
        description:
          "Define your ownership structure and any existing commitments.",
        questions: [
          {
            id: "26-q5",
            type: "textarea",
            label: "Describe your cap table structure.",
            description:
              "Outline the ownership breakdown: founder equity, parent company stake, employee option pool, and any reserved shares. Include vesting schedules.",
            placeholder:
              "e.g. Founders: 60% (4-year vest, 1-year cliff). Parent company: 20% (fully vested). Employee option pool: 15% (reserved for first 20 hires). Advisor pool: 5% (2-year vest). Total authorized shares: 10M...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "26-q6",
            type: "textarea",
            label: "Are there any existing investors or commitments?",
            description:
              "Describe any pre-existing funding, convertible notes, SAFEs, or investor commitments that affect the cap table.",
            placeholder:
              "e.g. Parent company invested $500K via SAFE at $5M cap. One angel investor committed $100K via SAFE at the same terms. No other commitments. Total pre-seed capital raised: $600K...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "26-s4",
        title: "Deliverable",
        description:
          "Upload your Spinout Legal Pack and cap table.",
        questions: [
          {
            id: "26-q7",
            type: "file",
            label: "Upload your Spinout Legal Pack.",
            description:
              "A comprehensive package of legal documents required for the spinout: incorporation docs, IP assignment, founder agreements, and key contracts.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 3,
          },
          {
            id: "26-q8",
            type: "file",
            label: "Upload your cap table.",
            description:
              "A spreadsheet or document showing the complete cap table with all shareholders, option holders, and convertible instruments.",
            required: false,
            accept: ".xlsx,.pdf",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #27: Exit Map
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 27,
    steps: [
      {
        id: "27-s1",
        title: "Exit Thesis",
        description:
          "Define the most likely paths to a successful exit and the timeline you are building toward.",
        questions: [
          {
            id: "27-q1",
            type: "multiselect",
            label: "What are the most likely exit paths?",
            description:
              "Select all exit paths that are realistic for your venture. Most ventures should have 2-3 viable paths.",
            required: true,
            options: [
              { value: "ipo", label: "IPO" },
              {
                value: "strategic_acquisition",
                label: "Strategic acquisition",
              },
              { value: "pe_buyout", label: "PE buyout" },
              { value: "merger", label: "Merger" },
              { value: "remain_private", label: "Remain private" },
            ],
          },
          {
            id: "27-q2",
            type: "select",
            label: "What is your target exit timeline?",
            description:
              "When do you expect to reach an exit event? This shapes fundraising, growth strategy, and team incentives.",
            required: true,
            options: [
              { value: "3_5_years", label: "3-5 years" },
              { value: "5_7_years", label: "5-7 years" },
              { value: "7_10_years", label: "7-10 years" },
              {
                value: "no_specific_timeline",
                label: "No specific timeline",
              },
            ],
          },
        ],
      },
      {
        id: "27-s2",
        title: "Strategic Acquirers",
        description:
          "Map the landscape of potential acquirers and what makes you attractive to them.",
        questions: [
          {
            id: "27-q3",
            type: "textarea",
            label: "List potential strategic acquirers.",
            description:
              "Name specific companies that could acquire you and explain why each would be interested: strategic fit, technology, customer base, or talent.",
            placeholder:
              "e.g. 1) Oracle Health (formerly Cerner): We fill their analytics gap in procurement. They have 25% hospital market share but no spend optimization tool. 2) Vizient: Largest GPO, our data layer would strengthen their negotiation leverage. 3) Workday: Expanding into healthcare, our vertical expertise accelerates their entry...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "27-q4",
            type: "textarea",
            label: "What makes your venture attractive to acquirers?",
            description:
              "Identify the specific assets an acquirer would value: technology, data, customer relationships, talent, or market position.",
            placeholder:
              "e.g. 1) Proprietary dataset: anonymized procurement data from 50+ health systems (no one else has this). 2) Enterprise relationships: signed contracts with 3 top-50 health systems. 3) Domain expertise: team of former CPOs that acquirers cannot easily recruit. 4) Proven ROI: documented $10M+ in savings delivered...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "27-s3",
        title: "Value Drivers",
        description:
          "Identify what will drive your valuation at exit.",
        questions: [
          {
            id: "27-q5",
            type: "textarea",
            label: "What will drive your valuation?",
            description:
              "List the key factors that will determine your exit valuation: revenue multiples, growth rate, market position, strategic value, or scarcity value.",
            placeholder:
              "e.g. 1) Revenue growth rate (targeting 3x YoY). 2) Net revenue retention > 130% (land-and-expand model). 3) Data moat: proprietary benchmarking dataset grows more valuable with each customer. 4) Category leadership: first mover in AI procurement intelligence. 5) Strategic scarcity: only independent platform not owned by a GPO or EHR...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "27-q6",
            type: "text",
            label: "What is your target exit valuation range?",
            description:
              "State the valuation range you are building toward at exit. This should be consistent with your category ambition and growth projections.",
            placeholder: "e.g. $500M - $1B",
            required: true,
          },
        ],
      },
      {
        id: "27-s4",
        title: "Deliverable",
        description:
          "Upload your Exit Map and share any final notes on your exit strategy.",
        questions: [
          {
            id: "27-q7",
            type: "file",
            label: "Upload your Exit Map document.",
            description:
              "A document outlining exit paths, strategic acquirer landscape, value drivers, and target timeline.",
            required: false,
            accept: ".pdf,.docx,.pptx",
            maxFiles: 1,
          },
          {
            id: "27-q8",
            type: "textarea",
            label: "Final notes on your exit strategy.",
            description:
              "Share any additional context: board discussions on exit, investor expectations, strategic relationships being cultivated, or concerns about the exit landscape.",
            placeholder:
              "e.g. Our lead investor has a 7-year fund timeline, aligning with our 5-7 year exit target. We are building relationships with corporate development teams at Oracle and Vizient through advisory board connections. Key risk: if the healthcare M&A market cools, we need to be self-sustaining...",
            required: false,
            maxLength: 2000,
          },
        ],
      },
    ],
  },
];
