import type { AssetWorkflow } from "../questions";

// ─── Stage 2: Customer & Risk Validation ───────────────────────
// Core gate: Do you know exactly who pays, what kills this, and
// what real customers actually say?
// Fellows must define ICP, map assumptions, and conduct discovery interviews.

export const stage02Workflows: AssetWorkflow[] = [
  // ───────────────────────────────────────────────────────────────
  // Asset #5: ICP Definition (Ideal Customer Profile)
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 5,
    steps: [
      {
        id: "5-s1",
        title: "Company Profile",
        description:
          "Define the exact type of organization that will buy this. Precision here prevents wasted sales cycles later.",
        questions: [
          {
            id: "5-q1",
            type: "text",
            label: "What industry or vertical are you targeting?",
            description:
              "Be as specific as possible. 'Healthcare' is too broad. 'Acute care hospitals with in-house pharmacies' is right.",
            placeholder:
              "e.g. Acute care hospitals with in-house pharmacies in the US",
            required: true,
          },
          {
            id: "5-q2",
            type: "select",
            label: "What is the target company size range?",
            description:
              "Select the employee count range of your ideal customer. This affects sales motion, pricing, and implementation complexity.",
            required: true,
            options: [
              { value: "1-50", label: "1-50 employees" },
              { value: "51-200", label: "51-200 employees" },
              { value: "201-1000", label: "201-1,000 employees" },
              { value: "1001-5000", label: "1,001-5,000 employees" },
              { value: "5000+", label: "5,000+ employees" },
            ],
          },
          {
            id: "5-q3",
            type: "text",
            label: "What is your primary geography focus?",
            description:
              "Specify the region, country, or market where you will launch first. Be strategic -- choose where you have the strongest advantage.",
            placeholder: "e.g. United States, initially Northeast corridor (proximity to academic medical centers)",
            required: true,
          },
        ],
      },
      {
        id: "5-s2",
        title: "Buyer Persona",
        description:
          "Identify who signs the check, who uses the product, and what drives the purchase decision.",
        questions: [
          {
            id: "5-q4",
            type: "text",
            label: "Who is the economic buyer? (Title/Role)",
            description:
              "This is the person who controls the budget and signs the contract. Name the exact title.",
            placeholder: "e.g. Chief Pharmacy Officer or VP of Supply Chain",
            required: true,
          },
          {
            id: "5-q5",
            type: "text",
            label: "Who is the primary end user? (Title/Role)",
            description:
              "This is the person who will use the product daily. They may or may not be the same as the buyer.",
            placeholder: "e.g. Senior Pharmaceutical Buyer or Procurement Analyst",
            required: true,
          },
          {
            id: "5-q6",
            type: "select",
            label: "What does the economic buyer care about most?",
            description:
              "Select the primary motivation that will drive the purchase decision. This shapes your entire value proposition.",
            required: true,
            options: [
              {
                value: "cost_reduction",
                label: "Cost reduction -- saving money on existing spend",
              },
              {
                value: "revenue_growth",
                label: "Revenue growth -- generating new or incremental revenue",
              },
              {
                value: "compliance",
                label: "Compliance -- meeting regulatory or audit requirements",
              },
              {
                value: "efficiency",
                label: "Efficiency -- doing more with the same or fewer resources",
              },
              {
                value: "competitive_advantage",
                label: "Competitive advantage -- gaining an edge over peers",
              },
            ],
          },
        ],
      },
      {
        id: "5-s3",
        title: "Qualification Criteria",
        description:
          "Define what makes a prospect a great fit vs. a time-waster. Saying no to bad-fit customers is a superpower.",
        questions: [
          {
            id: "5-q7",
            type: "textarea",
            label: "What makes a company a GREAT fit for your solution?",
            description:
              "List the characteristics, behaviors, or conditions that signal a high-probability buyer. Think: pain severity, budget availability, technical readiness, and organizational willingness to change.",
            placeholder:
              "e.g. Great fit indicators: 1) Annual drug spend >$30M. 2) Currently using manual/spreadsheet-based procurement. 3) Has dedicated pharmacy buyer role. 4) Leadership has expressed cost-reduction mandate. 5) Not locked into long-term GPO-exclusive contract...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "5-q8",
            type: "textarea",
            label: "What are the disqualifiers? When should you walk away?",
            description:
              "List the red flags that indicate a prospect will waste your time, churn, or never convert. Be ruthless.",
            placeholder:
              "e.g. Disqualifiers: 1) Hospital with <$10M annual drug spend (ROI too small). 2) Fully committed to single-distributor GPO contract with 3+ years remaining. 3) No dedicated procurement role (nobody to champion internally). 4) IT team blocks all cloud deployments...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "5-s4",
        title: "Deliverable",
        description:
          "Synthesize your ICP into a document your entire team can use for targeting.",
        questions: [
          {
            id: "5-q9",
            type: "textarea",
            label: "Summarize your Ideal Customer Profile in one paragraph.",
            description:
              "Write this as a crisp brief that a sales rep could use to qualify a lead in 30 seconds. Include: industry, size, buyer, primary pain, and key qualifiers.",
            placeholder:
              "e.g. Our ideal customer is a US acute care hospital (200-500 beds) with annual drug spend of $30-150M, currently using manual procurement processes. The buyer is the Chief Pharmacy Officer or VP of Supply Chain, motivated primarily by cost reduction under a board-level savings mandate. The hospital must have a dedicated procurement team (3+ buyers) and no exclusive long-term GPO lock-in.",
            required: true,
            maxLength: 1500,
          },
          {
            id: "5-q10",
            type: "file",
            label: "Upload your ICP document (optional).",
            description:
              "A detailed ICP document, persona sheet, or targeting matrix if you have one.",
            required: false,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #6: Assumptions & Kill Switches
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 6,
    steps: [
      {
        id: "6-s1",
        title: "Core Assumptions",
        description:
          "Every venture is built on assumptions. The honest ones list them. The smart ones test the riskiest first.",
        questions: [
          {
            id: "6-q1",
            type: "textarea",
            label:
              "List your top 5 assumptions about the market, customer, and technology.",
            description:
              "Be brutally honest. Include assumptions about customer willingness to pay, technical feasibility, market size, adoption speed, and competitive response.",
            placeholder:
              "e.g. 1) Hospitals will share anonymized pricing data in exchange for benchmarking insights. 2) Procurement teams have authority to adopt new tools without C-suite approval for <$100K contracts. 3) Our NLP model can parse unstructured distributor pricing with >95% accuracy. 4) At least 200 hospitals will adopt within 24 months. 5) Distributors will not retaliate by restricting data access.",
            required: true,
            maxLength: 3000,
          },
          {
            id: "6-q2",
            type: "textarea",
            label:
              "Which single assumption, if proven wrong, kills the entire venture?",
            description:
              "Identify your existential assumption. This is the one you must validate before spending significant resources.",
            placeholder:
              "e.g. If hospitals refuse to share anonymized pricing data, the entire benchmarking value proposition collapses. Without cross-system data, we are just another single-hospital analytics tool with no network effect or defensibility.",
            required: true,
            maxLength: 1500,
          },
        ],
      },
      {
        id: "6-s2",
        title: "Kill Switches",
        description:
          "Define the conditions under which you should stop. Kill switches prevent sunk-cost fallacy from destroying your time and capital.",
        questions: [
          {
            id: "6-q3",
            type: "textarea",
            label:
              "Define 3 kill switches -- specific conditions that mean you should stop.",
            description:
              "Be concrete and measurable. Vague kill switches ('if it does not work') are useless. Quantify the thresholds.",
            placeholder:
              "e.g. Kill Switch 1: Fewer than 5 of 20 hospitals approached agree to share anonymized data within 90 days. Kill Switch 2: NLP pricing accuracy cannot exceed 85% after 3 months of model training. Kill Switch 3: Zero letters of intent after 30 qualified demos.",
            required: true,
            maxLength: 2000,
          },
          {
            id: "6-q4",
            type: "textarea",
            label:
              "What specific evidence would trigger each kill switch?",
            description:
              "For each kill switch above, describe the exact data, signal, or outcome that would confirm it has been triggered.",
            placeholder:
              "e.g. KS1 trigger: After outreach to 20 hospitals with warm intros, fewer than 5 sign data-sharing agreements. Evidence: tracked in CRM with outreach dates and responses. KS2 trigger: Model accuracy plateaus below 85% on a test set of 1,000 invoices after 3 training iterations. KS3 trigger: Zero signed LOIs after 30 demos to qualified CPOs, tracked in pipeline.",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "6-s3",
        title: "Validation Plan",
        description:
          "Design your experiment. Test the riskiest assumption first with the least resources.",
        questions: [
          {
            id: "6-q5",
            type: "textarea",
            label:
              "How will you test the riskiest assumption first?",
            description:
              "Describe a specific, time-bound experiment. Include: what you will do, who you will talk to, what data you will collect, and what a pass/fail result looks like.",
            placeholder:
              "e.g. We will approach 20 hospitals through our CPO network with a data-sharing proposal. The ask: share 12 months of anonymized drug purchase data (de-identified, pricing only) in exchange for a free benchmarking report. Pass: 5+ hospitals sign data-sharing agreements within 90 days. Fail: fewer than 5 agreements after 90 days of active outreach.",
            required: true,
            maxLength: 2000,
          },
          {
            id: "6-q6",
            type: "select",
            label:
              "What is your timeline for validating the riskiest assumption?",
            description:
              "Choose a realistic timeline. Shorter is better -- long validation cycles burn runway and delay learning.",
            required: true,
            options: [
              { value: "2_weeks", label: "2 weeks" },
              { value: "1_month", label: "1 month" },
              { value: "2_months", label: "2 months" },
              { value: "3_months", label: "3 months" },
            ],
          },
        ],
      },
      {
        id: "6-s4",
        title: "Deliverable",
        description:
          "Package your assumptions, kill switches, and validation plan into a living document.",
        questions: [
          {
            id: "6-q7",
            type: "file",
            label: "Upload your Assumptions & Kill Switches document.",
            description:
              "Include all assumptions (ranked by risk), kill switch definitions with triggers, and your validation plan with timeline.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "6-q8",
            type: "textarea",
            label: "Additional notes (optional)",
            description:
              "Any context, open questions, or concerns about your assumptions that you want to flag for discussion.",
            placeholder:
              "e.g. One open question: we are unsure whether hospital legal teams will require IRB approval for anonymized pricing data. This could add 2-3 months to KS1 timeline...",
            required: false,
            maxLength: 1500,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #7: Discovery Interviews
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 7,
    steps: [
      {
        id: "7-s1",
        title: "Interview Plan",
        description:
          "Design your discovery interview program. The quality of your questions determines the quality of your insights.",
        questions: [
          {
            id: "7-q1",
            type: "number",
            label: "How many discovery interviews will you conduct?",
            description:
              "A minimum of 5 is required to identify patterns. 10-15 is ideal for early-stage validation. More than 20 suggests you are delaying action.",
            placeholder: "e.g. 12",
            required: true,
            min: 5,
          },
          {
            id: "7-q2",
            type: "textarea",
            label: "Who will you interview, and why?",
            description:
              "List the roles, titles, and types of people you will talk to. Explain why each group matters. Include buyers, users, influencers, and detractors.",
            placeholder:
              "e.g. 1) 5 Chief Pharmacy Officers (economic buyers -- validate willingness to pay and budget authority). 2) 4 Senior Pharmaceutical Buyers (end users -- validate workflow pain and adoption readiness). 3) 2 Hospital CFOs (budget approvers -- validate ROI framing). 4) 1 GPO account manager (channel partner -- validate distribution dynamics).",
            required: true,
            maxLength: 2000,
          },
          {
            id: "7-q3",
            type: "textarea",
            label: "What are your top 3 discovery questions?",
            description:
              "Write open-ended questions that uncover pain, behavior, and willingness to change. Avoid leading questions or pitching your solution.",
            placeholder:
              "e.g. 1) Walk me through the last time you made a large drug purchase decision. What information did you wish you had? 2) If I could wave a magic wand and fix one thing about your procurement process, what would it be and why? 3) How do you currently benchmark whether you are getting good pricing, and how confident are you in that process?",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "7-s2",
        title: "Interview Findings",
        description:
          "Synthesize what you learned. The goal is patterns, not anecdotes.",
        questions: [
          {
            id: "7-q4",
            type: "textarea",
            label: "What patterns emerged across your interviews?",
            description:
              "Identify the recurring themes, complaints, behaviors, or desires that appeared in 3+ interviews. Patterns are signal; one-offs are noise.",
            placeholder:
              "e.g. Pattern 1 (10/12 interviews): All CPOs said they have zero visibility into what peer hospitals pay for the same drugs. Pattern 2 (8/12): Buyers spend >30% of their time on manual price comparison. Pattern 3 (7/12): Existing GPO contracts are seen as opaque and non-negotiable...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "7-q5",
            type: "textarea",
            label: "What surprised you? What did you NOT expect to hear?",
            description:
              "Surprises are often the most valuable findings. They reveal blind spots in your assumptions.",
            placeholder:
              "e.g. Surprise 1: Several CPOs said they would share data with competitors if it meant better benchmarks -- we assumed hospitals would resist data sharing. Surprise 2: The biggest pain is not price comparison but contract compliance monitoring -- buyers do not know if they are actually getting the rates they negotiated.",
            required: true,
            maxLength: 2000,
          },
          {
            id: "7-q6",
            type: "textarea",
            label: "Which of your original assumptions were validated, and which were invalidated?",
            description:
              "Map your interview findings back to the assumptions you listed in Asset #6. Be honest about what the data says.",
            placeholder:
              "e.g. VALIDATED: Hospitals will share anonymized data (8/12 said yes). VALIDATED: Manual procurement wastes >10 hrs/week. INVALIDATED: Buyers have authority for <$100K tools without C-suite -- turns out IT must approve all new software regardless of cost. UNCERTAIN: Distributor retaliation risk (mixed signals).",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "7-s3",
        title: "Pivots & Insights",
        description:
          "Determine whether your findings require a change in direction, and capture the key insight that will shape your product.",
        questions: [
          {
            id: "7-q7",
            type: "select",
            label: "Did any findings change your direction?",
            description:
              "Be honest about whether the interviews confirmed your thesis or challenged it.",
            required: true,
            options: [
              {
                value: "yes_significantly",
                label: "Yes, significantly -- we need to rethink core elements",
              },
              {
                value: "yes_slightly",
                label: "Yes, slightly -- we are refining our approach",
              },
              {
                value: "no",
                label: "No -- interviews confirmed our original thesis",
              },
              {
                value: "not_yet_conducted",
                label: "Not yet conducted -- interviews are still in progress",
              },
            ],
          },
          {
            id: "7-q8",
            type: "textarea",
            label:
              "What is the single most important insight from your discovery interviews?",
            description:
              "Distill everything into one actionable insight that should shape your product, positioning, or go-to-market strategy.",
            placeholder:
              "e.g. The #1 insight is that contract compliance monitoring is a bigger pain point than price comparison. Hospitals already negotiate decent rates but have no way to verify they are actually receiving them. This shifts our product wedge from 'find better prices' to 'enforce the prices you already negotiated.'",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "7-s4",
        title: "Deliverable",
        description:
          "Upload your interview documentation. Raw notes are gold -- preserve them.",
        questions: [
          {
            id: "7-q9",
            type: "file",
            label: "Upload your interview notes or summary document.",
            description:
              "A structured summary of all interviews conducted, including key quotes, patterns, and insights.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "7-q10",
            type: "file",
            label: "Upload any recordings or transcripts (optional).",
            description:
              "Raw interview recordings, transcripts, or detailed notes. These are invaluable for future reference.",
            required: false,
            accept: ".pdf,.docx,.mp3,.mp4,.m4a,.wav,.txt",
            maxFiles: 5,
          },
        ],
      },
    ],
  },
];
