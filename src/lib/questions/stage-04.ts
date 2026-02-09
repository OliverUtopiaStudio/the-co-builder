import type { AssetWorkflow } from "../questions";

export const stage04Workflows: AssetWorkflow[] = [
  // ── Asset #15: PRD v1 + Not-to-Build List ─────────────────────
  {
    assetNumber: 15,
    steps: [
      {
        id: "15-s1",
        title: "Product Vision",
        description:
          "Nail the essence of what you are building in the fewest possible words.",
        questions: [
          {
            id: "15-q1",
            type: "text",
            label: "One-sentence product vision",
            description:
              "Write a single sentence that captures what this product is and why it matters.",
            placeholder:
              "e.g. The AI copilot that turns raw customer feedback into prioritized product roadmaps in minutes, not weeks.",
            required: true,
            maxLength: 200,
          },
          {
            id: "15-q2",
            type: "textarea",
            label: "Who is this for and what does it do?",
            description:
              "Describe the target user, the problem, and the core solution in a short paragraph.",
            placeholder:
              "e.g. Product managers at B2B SaaS companies (50-500 employees) who struggle to synthesize feedback from support tickets, sales calls, and surveys. The product ingests all feedback sources and uses NLP to cluster themes, score urgency, and generate draft roadmap items...",
            required: true,
          },
        ],
      },
      {
        id: "15-s2",
        title: "Core Features",
        description:
          "Define the minimum feature set that makes v1 useful. Ruthlessly cut everything else.",
        questions: [
          {
            id: "15-q3",
            type: "textarea",
            label: "List the must-have features for v1",
            description:
              "Only include features that are essential for the first usable version. If in doubt, leave it out.",
            placeholder:
              "e.g.\n1. Feedback ingestion from CSV, Intercom, and Zendesk\n2. AI-powered theme clustering\n3. Priority scoring based on frequency and revenue impact\n4. Export to Jira/Linear\n5. Simple dashboard with trend visualization",
            required: true,
          },
          {
            id: "15-q4",
            type: "textarea",
            label: "What workflow does v1 automate or improve?",
            description:
              "Describe the current manual workflow and how v1 changes it step by step.",
            placeholder:
              "e.g. Today: PM manually reads 200 tickets/week, tags them in a spreadsheet, debates priorities in a 2-hour meeting. With v1: feedback is auto-ingested and clustered, PM reviews AI-generated themes in 15 minutes, exports prioritized items directly to sprint planning...",
            required: true,
          },
        ],
      },
      {
        id: "15-s3",
        title: "Not-to-Build",
        description:
          "The best PRDs are defined as much by what you say no to as what you say yes to.",
        questions: [
          {
            id: "15-q5",
            type: "textarea",
            label: "List features you will NOT build",
            description:
              "Be explicit. Write down every feature you have considered and deliberately excluded from v1.",
            placeholder:
              "e.g.\n- Custom ML model training per customer\n- Real-time Slack integration\n- Multi-language support\n- Mobile app\n- Advanced analytics and BI dashboards\n- White-labeling",
            required: true,
          },
          {
            id: "15-q6",
            type: "textarea",
            label: "Why are these out of scope?",
            description:
              "For each excluded feature, briefly explain the reasoning. This prevents scope creep later.",
            placeholder:
              "e.g. Custom ML training: adds 3 months and requires data infra we don't have. Multi-language: only 8% of target market needs it now. Mobile: users do this work at their desks, mobile adds no value for v1...",
            required: true,
          },
          {
            id: "15-q7",
            type: "textarea",
            label: "What is the biggest feature request you will say no to?",
            description:
              "Name the most popular or tempting feature you are deliberately excluding and explain why.",
            placeholder:
              "e.g. Real-time Slack integration. Every prospect asks for it, but it doubles the engineering scope, introduces complex real-time infrastructure, and our design partners confirmed they process feedback in batches, not real-time...",
            required: true,
          },
        ],
      },
      {
        id: "15-s4",
        title: "Intelligence Layer",
        description:
          "Define where AI adds value in v1 and where humans remain in the loop.",
        questions: [
          {
            id: "15-q8",
            type: "textarea",
            label: "What AI/ML capabilities are in v1?",
            description:
              "List each AI-powered feature and the underlying model or technique it uses.",
            placeholder:
              "e.g.\n1. Theme clustering: sentence-transformer embeddings + HDBSCAN\n2. Priority scoring: fine-tuned classifier on labeled priority data\n3. Summary generation: GPT-4 with custom prompt chain\n4. Duplicate detection: semantic similarity with 0.85 threshold",
            required: true,
          },
          {
            id: "15-q9",
            type: "textarea",
            label: "What is the human-in-the-loop requirement?",
            description:
              "Where does a human need to review, approve, or override the AI? Define the handoff points.",
            placeholder:
              "e.g. AI generates theme clusters and priorities, but PM must review and approve before export to Jira. AI flags potential duplicates but human confirms the merge. All AI-generated summaries marked as 'draft' until PM edits...",
            required: true,
          },
        ],
      },
      {
        id: "15-s5",
        title: "Deliverable",
        description:
          "Upload your completed PRD v1 and your Not-to-Build list.",
        questions: [
          {
            id: "15-q10",
            type: "file",
            label: "Upload your PRD v1 document",
            description:
              "The full product requirements document for v1 including user stories, acceptance criteria, and technical requirements.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "15-q11",
            type: "file",
            label: "Upload your Not-to-Build list",
            description:
              "A standalone document listing excluded features and the rationale for each. Optional if included in the PRD.",
            required: false,
            maxFiles: 1,
          },
        ],
      },
    ],
  },
];
