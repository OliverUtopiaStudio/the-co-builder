import type { AssetWorkflow } from "../questions";

// ─── Stage 5: Enterprise Architecture & Pilot Execution ────────
// Core gate: Can you build it, sell it, and prove it works?
// Fellows must define architecture, secure design partners, run pilots, and demo.

export const stage05Workflows: AssetWorkflow[] = [
  // ───────────────────────────────────────────────────────────────
  // Asset #16: Enterprise Architecture Canvas
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 16,
    steps: [
      {
        id: "16-s1",
        title: "Architecture Overview",
        description:
          "Define the high-level technical architecture that will power your enterprise deployment.",
        questions: [
          {
            id: "16-q1",
            type: "textarea",
            label: "Describe your system architecture at a high level.",
            description:
              "Cover the major components, data flows, and how they connect. Think microservices vs. monolith, event-driven vs. request-response, and where the core logic lives.",
            placeholder:
              "e.g. Our platform uses a microservices architecture deployed on Kubernetes. The core data pipeline ingests real-time feeds via Kafka, processes them through our ML inference layer, and serves results through a GraphQL API to the web app and partner integrations...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "16-q2",
            type: "select",
            label: "What cloud platform will you deploy on?",
            description:
              "Select your primary cloud infrastructure provider. This choice affects compliance, cost, and enterprise buyer compatibility.",
            required: true,
            options: [
              { value: "aws", label: "AWS" },
              { value: "gcp", label: "GCP" },
              { value: "azure", label: "Azure" },
              { value: "multi_cloud", label: "Multi-cloud" },
              { value: "other", label: "Other" },
            ],
          },
        ],
      },
      {
        id: "16-s2",
        title: "Integration Points",
        description:
          "Map out how your system connects to the outside world -- existing enterprise systems, third-party services, and partner APIs.",
        questions: [
          {
            id: "16-q3",
            type: "textarea",
            label: "What systems will you integrate with?",
            description:
              "List the external systems, databases, and services your platform must connect to. Include both day-one integrations and planned future connections.",
            placeholder:
              "e.g. Day one: Salesforce CRM (bidirectional sync), SAP ERP (read-only), Active Directory (SSO/auth). Phase 2: Workday HR, Snowflake data warehouse, custom client data lakes...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "16-q4",
            type: "textarea",
            label: "What APIs will you expose?",
            description:
              "Describe the APIs your platform will offer to customers, partners, or internal systems. Include the purpose and expected consumers of each.",
            placeholder:
              "e.g. REST API for customer-facing data queries, webhook endpoints for real-time event notifications, bulk export API for analytics teams, and an admin API for enterprise IT teams to manage configurations...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "16-s3",
        title: "Scalability",
        description:
          "Explain how your architecture handles growth -- from 1 customer to 1,000.",
        questions: [
          {
            id: "16-q5",
            type: "textarea",
            label: "How will the system scale?",
            description:
              "Describe your scaling strategy: horizontal vs. vertical, auto-scaling policies, database sharding, caching layers, CDN usage, and any architectural decisions that support growth.",
            placeholder:
              "e.g. Stateless API servers auto-scale horizontally behind a load balancer. We use Redis for session caching, PostgreSQL with read replicas for the primary datastore, and S3 for document storage. The ML inference layer scales independently based on queue depth...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "16-q6",
            type: "textarea",
            label: "What are the key performance requirements?",
            description:
              "Define the non-negotiable performance targets your architecture must hit: latency, throughput, uptime, and data freshness.",
            placeholder:
              "e.g. API response time < 200ms p95, 99.9% uptime SLA, data freshness within 5 minutes of source update, support for 10,000 concurrent users per tenant...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "16-s4",
        title: "Deliverable",
        description:
          "Upload your Architecture Canvas and document any known technical risks.",
        questions: [
          {
            id: "16-q7",
            type: "file",
            label: "Upload your Enterprise Architecture Canvas.",
            description:
              "A visual or written document that captures your system architecture, data flows, integration points, and infrastructure decisions.",
            required: true,
            accept: ".pdf,.png,.docx",
            maxFiles: 1,
          },
          {
            id: "16-q8",
            type: "textarea",
            label: "Document your technical risk assessment.",
            description:
              "What are the biggest technical risks? Single points of failure, unproven technology bets, vendor lock-in, or scaling bottlenecks you have not yet solved.",
            placeholder:
              "e.g. Risk 1: ML model accuracy degrades with noisy enterprise data -- mitigated by human-in-the-loop fallback. Risk 2: Kafka throughput may bottleneck at 50K events/sec -- plan to shard topics...",
            required: false,
            maxLength: 2000,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #17: Design Partner Offer + LOI
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 17,
    steps: [
      {
        id: "17-s1",
        title: "Offer Structure",
        description:
          "Define what design partners receive and how the deal differs from general availability pricing.",
        questions: [
          {
            id: "17-q1",
            type: "textarea",
            label: "What will design partners get?",
            description:
              "Describe the full value proposition for design partners: early access, pricing advantages, influence on the roadmap, dedicated support, or co-marketing opportunities.",
            placeholder:
              "e.g. Design partners get 6 months free access, a dedicated success manager, direct input into the product roadmap via monthly feedback sessions, and a case study co-authored for their marketing...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "17-q2",
            type: "textarea",
            label:
              "What pricing or terms will design partners receive vs. GA customers?",
            description:
              "Spell out the economic incentive: discount levels, locked-in pricing, extended payment terms, or equity-like benefits.",
            placeholder:
              "e.g. Design partners pay 50% of GA pricing for the first 2 years, locked in at signing. GA pricing will be $50K/year; design partners pay $25K/year. They also get first access to new modules at no extra cost...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "17-s2",
        title: "LOI Terms",
        description:
          "Define the commitments you are asking design partners to make in a Letter of Intent.",
        questions: [
          {
            id: "17-q3",
            type: "textarea",
            label: "What commitments are you asking design partners to make?",
            description:
              "Be specific about what the LOI asks for: financial commitment, time commitment, data access, exclusivity, or public endorsement.",
            placeholder:
              "e.g. Design partners commit to: (1) deploying the product in a live environment within 30 days, (2) providing a named point of contact, (3) participating in bi-weekly feedback calls, (4) agreeing to a case study upon pilot success...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "17-q4",
            type: "select",
            label: "What is the duration of the design partner program?",
            description:
              "How long will design partners be in the program before transitioning to standard terms?",
            required: true,
            options: [
              { value: "3_months", label: "3 months" },
              { value: "6_months", label: "6 months" },
              { value: "12_months", label: "12 months" },
              { value: "open_ended", label: "Open-ended" },
            ],
          },
        ],
      },
      {
        id: "17-s3",
        title: "Partner Commitments",
        description:
          "Clarify what you need from design partners and set targets for LOI acquisition.",
        questions: [
          {
            id: "17-q5",
            type: "textarea",
            label: "What do you need from design partners?",
            description:
              "Beyond the LOI, what operational commitments do you need? Think time investment, data access, feedback sessions, internal champion, or executive sponsorship.",
            placeholder:
              "e.g. We need: 2 hours/week from a product champion, read access to their CRM data via API, monthly 1-hour feedback sessions with their ops team, and executive sponsor sign-off for the case study...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "17-q6",
            type: "number",
            label: "How many LOIs are you targeting?",
            description:
              "Set a concrete target. Most ventures aim for 3-10 design partner LOIs before moving to pilot.",
            required: true,
            min: 1,
            max: 100,
          },
        ],
      },
      {
        id: "17-s4",
        title: "Deliverable",
        description:
          "Upload your Design Partner Offer document, LOI template, and track LOI progress.",
        questions: [
          {
            id: "17-q7",
            type: "file",
            label: "Upload your Design Partner Offer document.",
            description:
              "The document you share with prospective design partners outlining the program, benefits, and terms.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "17-q8",
            type: "file",
            label: "Upload your LOI template.",
            description:
              "The Letter of Intent template that design partners will sign. Should include commitments, timeline, and terms.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "17-q9",
            type: "number",
            label: "How many LOIs have you secured so far?",
            description:
              "Track your progress toward the target. Signed LOIs only -- verbal commitments do not count.",
            required: true,
            min: 0,
            max: 100,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #18: Pilot SOW + KPI Dashboard
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 18,
    steps: [
      {
        id: "18-s1",
        title: "Pilot Scope",
        description:
          "Define exactly what the pilot includes and how long it will run.",
        questions: [
          {
            id: "18-q1",
            type: "textarea",
            label: "What will the pilot include?",
            description:
              "Describe the scope: features deployed, users involved, data integrated, and success criteria. Be specific enough that both sides know when the pilot is 'done'.",
            placeholder:
              "e.g. The pilot deploys our core analytics module to the client's procurement team (15 users). We integrate with their SAP instance and deliver weekly spend optimization reports. The pilot covers 3 product categories representing $10M in annual spend...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "18-q2",
            type: "select",
            label: "What is the planned pilot duration?",
            description:
              "Choose a timeline that gives enough time to prove value but creates urgency to deliver results.",
            required: true,
            options: [
              { value: "2_weeks", label: "2 weeks" },
              { value: "1_month", label: "1 month" },
              { value: "2_months", label: "2 months" },
              { value: "3_months", label: "3 months" },
              { value: "6_months", label: "6 months" },
            ],
          },
        ],
      },
      {
        id: "18-s2",
        title: "Success KPIs",
        description:
          "Define measurable KPIs that determine whether the pilot succeeded or failed.",
        questions: [
          {
            id: "18-q3",
            type: "textarea",
            label: "Define 3-5 KPIs for pilot success.",
            description:
              "These should be specific, measurable, and agreed upon with the pilot customer. Include both leading indicators (adoption) and lagging indicators (ROI).",
            placeholder:
              "e.g. 1) 80%+ weekly active usage among pilot users, 2) 3+ procurement decisions influenced by platform recommendations, 3) $500K+ in identified savings within 60 days, 4) NPS > 40 from pilot users, 5) Executive sponsor agrees to expand scope...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "18-q4",
            type: "textarea",
            label: "What is the minimum bar for each KPI?",
            description:
              "Set the 'pass/fail' threshold for each KPI. Below this bar, the pilot has not proven enough value to convert.",
            placeholder:
              "e.g. 1) Usage: minimum 60% WAU (target 80%), 2) Decisions influenced: minimum 1 (target 3+), 3) Savings identified: minimum $200K (target $500K), 4) NPS: minimum 20 (target 40+), 5) Expansion: verbal commitment from sponsor...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "18-s3",
        title: "Dashboard Design",
        description:
          "Plan how you will track and communicate pilot results in real time.",
        questions: [
          {
            id: "18-q5",
            type: "textarea",
            label: "What metrics will you track in real time?",
            description:
              "List the specific metrics that will appear on your KPI dashboard. Include both product metrics (usage, performance) and business metrics (value delivered).",
            placeholder:
              "e.g. Daily active users, feature adoption rates, API response times, savings identified to date, recommendations accepted vs. rejected, time-to-value per user, support ticket volume...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "18-q6",
            type: "select",
            label: "How will you share pilot results with the customer?",
            description:
              "Choose the reporting cadence and format that keeps the customer engaged and informed.",
            required: true,
            options: [
              { value: "live_dashboard", label: "Live dashboard" },
              { value: "weekly_report", label: "Weekly report" },
              { value: "monthly_review", label: "Monthly review" },
              { value: "all_of_the_above", label: "All of the above" },
            ],
          },
        ],
      },
      {
        id: "18-s4",
        title: "Deliverable",
        description:
          "Upload your Pilot SOW and KPI Dashboard template.",
        questions: [
          {
            id: "18-q7",
            type: "file",
            label: "Upload your Pilot SOW.",
            description:
              "The Statement of Work that defines pilot scope, timeline, responsibilities, KPIs, and success criteria.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "18-q8",
            type: "file",
            label: "Upload your KPI Dashboard template or screenshot.",
            description:
              "A screenshot, mockup, or template of the dashboard you will use to track and report pilot KPIs.",
            required: false,
            accept: ".pdf,.png,.xlsx,.docx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #19: Prototype Sprint + Demo
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 19,
    steps: [
      {
        id: "19-s1",
        title: "Sprint Plan",
        description:
          "Define what you will build in a focused prototype sprint and how long it will take.",
        questions: [
          {
            id: "19-q1",
            type: "textarea",
            label: "What will you build in the prototype sprint?",
            description:
              "Describe the scope of the prototype: which features, which user flows, and what fidelity level. Focus on the minimum needed to demo the core value proposition.",
            placeholder:
              "e.g. We will build a working prototype of the spend analysis dashboard showing real procurement data, the AI-powered recommendation engine for top 10 drug categories, and a one-click savings report generator. Backend will use mock data for non-integrated sources...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "19-q2",
            type: "select",
            label: "How long is the prototype sprint?",
            description:
              "Choose a duration that balances speed with enough time to build something compelling.",
            required: true,
            options: [
              { value: "1_week", label: "1 week" },
              { value: "2_weeks", label: "2 weeks" },
              { value: "3_weeks", label: "3 weeks" },
              { value: "4_weeks", label: "4 weeks" },
            ],
          },
        ],
      },
      {
        id: "19-s2",
        title: "Demo Script",
        description:
          "Craft the narrative your demo will follow. Great demos tell a story, not just show features.",
        questions: [
          {
            id: "19-q3",
            type: "textarea",
            label: "What story will your demo tell?",
            description:
              "Outline the narrative arc: start with the problem the audience feels, show the journey through your product, and end with the outcome that makes them want it.",
            placeholder:
              "e.g. Open with: 'You just received 47 drug price increase notifications this morning. Here is what happens today...' Show the manual process pain. Then: 'Now let me show you what tomorrow looks like.' Walk through the AI-powered workflow that cuts that 4-hour process to 10 minutes...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "19-q4",
            type: "textarea",
            label: "What is the 'wow moment' in the demo?",
            description:
              "Every great demo has one moment where the audience leans forward. Identify it and make sure you build toward it.",
            placeholder:
              "e.g. The wow moment is when the system surfaces a $2.3M savings opportunity that the client's team missed entirely -- in real time, using their own data. The room goes silent, then the CFO asks 'How fast can we deploy this?'",
            required: true,
            maxLength: 1500,
          },
        ],
      },
      {
        id: "19-s3",
        title: "Feedback Capture",
        description:
          "Plan how you will systematically capture and act on feedback from every demo.",
        questions: [
          {
            id: "19-q5",
            type: "textarea",
            label: "How will you capture feedback from demos?",
            description:
              "Describe your feedback collection process: surveys, recorded sessions, structured debrief notes, or follow-up interviews.",
            placeholder:
              "e.g. Every demo is recorded (with permission). A team member takes structured notes using our feedback template. We send a 5-question survey within 24 hours. We schedule a 30-min debrief with each attendee within one week...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "19-q6",
            type: "textarea",
            label: "What are the top 3 things you want to learn from demos?",
            description:
              "Focus your feedback on the highest-value questions. What unknowns, if answered, would most change your product or go-to-market strategy?",
            placeholder:
              "e.g. 1) Does the AI recommendation accuracy meet their threshold for trust? 2) Would they pay for this as a standalone tool or only as part of a suite? 3) Who in their organization would own this tool day-to-day?",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "19-s4",
        title: "Deliverable",
        description:
          "Share your demo recording, prototype link, and feedback summary.",
        questions: [
          {
            id: "19-q7",
            type: "file",
            label: "Upload your demo recording or prototype link.",
            description:
              "A video recording of the demo, a link to the live prototype, or a clickable prototype file.",
            required: true,
            accept: ".mp4,.mov,.pdf,.png",
            maxFiles: 1,
          },
          {
            id: "19-q8",
            type: "file",
            label: "Upload your feedback summary.",
            description:
              "A consolidated document summarizing feedback from all demos: themes, surprises, and action items.",
            required: false,
            accept: ".pdf,.docx,.xlsx",
            maxFiles: 1,
          },
          {
            id: "19-q9",
            type: "url",
            label: "Demo URL",
            description:
              "If your prototype is hosted online, share the URL here.",
            placeholder: "https://demo.yourproduct.com",
            required: false,
          },
        ],
      },
    ],
  },
];
