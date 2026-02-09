import type { AssetWorkflow } from "../questions";

// ─── Stage 0: Risk Capital & Category Ambition ─────────────────
// Core gate: Does this venture deserve to exist?
// Fellows must prove market failure logic and category-level ambition.

export const stage00Workflows: AssetWorkflow[] = [
  // ───────────────────────────────────────────────────────────────
  // Asset #1: Risk Capital + Invention One-Pager
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 1,
    steps: [
      {
        id: "1-s1",
        title: "Market Failure",
        description:
          "Identify the structural market failure. If a smart team with $10M tried to solve this from scratch, why would they fail?",
        questions: [
          {
            id: "1-q1",
            type: "textarea",
            label: "What structural market failure exists here?",
            description:
              "Describe the systemic reason this problem persists. Think regulation, information asymmetry, misaligned incentives, or coordination failures.",
            placeholder:
              "e.g. Hospital procurement is fragmented across 6,000 independent systems with no shared data layer, so no single buyer has enough leverage to force interoperability...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "1-q2",
            type: "textarea",
            label: "Why can't money alone solve this problem?",
            description:
              "Explain why throwing capital at this without insider knowledge, relationships, or proprietary access would fail.",
            placeholder:
              "e.g. The data required to train the model sits inside regulated institutions that don't share externally. No amount of funding bypasses the trust barrier...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "1-s2",
        title: "Insider Advantage",
        description:
          "Articulate the unfair advantage that makes your team uniquely positioned to win.",
        questions: [
          {
            id: "1-q3",
            type: "textarea",
            label:
              "What insider access or domain expertise gives you an unfair advantage?",
            description:
              "Be specific: name the relationships, data access, regulatory knowledge, or lived experience that outsiders cannot replicate.",
            placeholder:
              "e.g. Our team includes 3 former chief pharmacy officers who collectively managed $2B in drug spend and maintain active relationships with 40+ health system CDOs...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "1-q4",
            type: "textarea",
            label:
              "What domain constraint makes it nearly impossible for outsiders to replicate your position?",
            description:
              "Identify the moat: licensing requirements, data access barriers, network effects, or trust relationships that take years to build.",
            placeholder:
              "e.g. Accessing clinical workflow data requires BAA agreements with each health system, a process that takes 12-18 months per institution and requires existing clinical credibility...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "1-s3",
        title: "Timing & Urgency",
        description:
          "Explain why this venture must be built NOW, not two years ago or two years from now.",
        questions: [
          {
            id: "1-q5",
            type: "textarea",
            label: "Why is right now the critical window for this venture?",
            description:
              "Describe the confluence of forces (technology, regulation, market behavior, cost curves) that make this moment uniquely favorable.",
            placeholder:
              "e.g. Three forces are converging: CMS just mandated interoperability (effective 2025), GPT-4-class models can now parse unstructured clinical notes, and hospital margins have compressed to 1.5%, forcing technology adoption...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "1-q6",
            type: "select",
            label: "What is the primary driver creating this window of opportunity?",
            description: "Select the single most important external force.",
            required: true,
            options: [
              { value: "regulatory_change", label: "Regulatory change" },
              {
                value: "technology_breakthrough",
                label: "Technology breakthrough",
              },
              { value: "market_shift", label: "Market shift" },
              {
                value: "cost_structure_change",
                label: "Cost structure change",
              },
              { value: "behavioral_change", label: "Behavioral change" },
              { value: "other", label: "Other" },
            ],
          },
        ],
      },
      {
        id: "1-s4",
        title: "Deliverable",
        description:
          "Synthesize your thinking into a tight invention thesis and upload your one-pager.",
        questions: [
          {
            id: "1-q7",
            type: "textarea",
            label: "Write your invention thesis in 2-3 sentences.",
            description:
              "This should capture: the market failure, the invention required, and why your team wins. Make every word count.",
            placeholder:
              "e.g. Hospital drug procurement wastes $12B annually because purchasing decisions are made without cross-system benchmarking data. We are building the first AI-powered procurement intelligence layer that aggregates anonymized spend data across health systems. Our team's clinical relationships give us exclusive data access that no outside team can replicate.",
            required: true,
            maxLength: 500,
          },
          {
            id: "1-q8",
            type: "file",
            label: "Upload your Risk Capital + Invention One-Pager",
            description:
              "A single-page document that captures your market failure analysis, insider advantage, and invention thesis.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #2: Category Ambition Gate
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 2,
    steps: [
      {
        id: "2-s1",
        title: "Category Definition",
        description:
          "Define the global category you intend to own. If you execute perfectly for 5 years, will you own a category worth $1B+?",
        questions: [
          {
            id: "2-q1",
            type: "textarea",
            label: "What global category will you own?",
            description:
              "Name and describe the category. Think like an analyst writing a Gartner Magic Quadrant title. Be specific enough to own it, broad enough to matter.",
            placeholder:
              "e.g. AI-Powered Pharmaceutical Procurement Intelligence for Health Systems -- the category of software that uses cross-system benchmarking to optimize hospital drug spend...",
            required: true,
            maxLength: 1500,
          },
          {
            id: "2-q2",
            type: "select",
            label:
              "Is this a new category, or are you disrupting an existing one?",
            description:
              "New categories require market education. Disrupting existing ones requires differentiation. Subcategories require precise positioning.",
            required: true,
            options: [
              {
                value: "new_category",
                label: "Creating a new category",
              },
              {
                value: "disrupting_existing",
                label: "Disrupting an existing category",
              },
              {
                value: "creating_subcategory",
                label: "Creating a subcategory within an existing market",
              },
            ],
          },
        ],
      },
      {
        id: "2-s2",
        title: "Scale Test",
        description:
          "Prove that this category can support a $1B+ outcome. Show your math.",
        questions: [
          {
            id: "2-q3",
            type: "text",
            label: "What is the total addressable market size?",
            description:
              "Provide a bottom-up estimate. Show the number of potential customers multiplied by annual contract value.",
            placeholder: "e.g. 6,200 US hospitals x $500K ACV = $3.1B TAM",
            required: true,
          },
          {
            id: "2-q4",
            type: "textarea",
            label:
              "Make the case: why could this become a $1B+ business?",
            description:
              "Go beyond TAM. Explain the expansion dynamics -- land-and-expand, network effects, data moats, or platform economics -- that drive toward category dominance.",
            placeholder:
              "e.g. Each hospital that joins increases benchmarking accuracy for all others (network effect). Once integrated into procurement workflows, switching costs are high. Adjacent modules (inventory, formulary optimization) expand ACV 3-5x...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "2-s3",
        title: "Anti-Pilotware Check",
        description:
          "Prove this is a platform, not a feature. Pilotware gets stuck in small deployments and never scales.",
        questions: [
          {
            id: "2-q5",
            type: "select",
            label: "Is this a platform or a point solution?",
            description:
              "Be honest. Platforms serve multiple use cases and expand over time. Point solutions solve one narrow problem.",
            required: true,
            options: [
              {
                value: "platform",
                label: "Platform -- serves multiple use cases and expands over time",
              },
              {
                value: "point_solution",
                label: "Point solution -- solves one specific, well-defined problem",
              },
            ],
          },
          {
            id: "2-q6",
            type: "textarea",
            label:
              "Why is this NOT just a small tool, feature, or nice-to-have?",
            description:
              "Address the pilotware risk directly. Explain what prevents this from becoming a perpetual pilot that never converts to enterprise-wide deployment.",
            placeholder:
              "e.g. This is not a dashboard -- it is the decision layer that sits between EHR data and $500K+ purchasing decisions. Hospitals cannot make procurement decisions without it once adopted, because it replaces the manual RFP process entirely...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "2-s4",
        title: "Deliverable",
        description:
          "Capture your category ambition in a single, compelling paragraph.",
        questions: [
          {
            id: "2-q7",
            type: "textarea",
            label:
              "Document your category ambition in one paragraph.",
            description:
              "This paragraph should answer: What category? Why $1B+? Why you? Why now? Write it as if pitching to a category-defining investor.",
            placeholder:
              "e.g. We are creating the AI-Powered Procurement Intelligence category for US health systems. The $3.1B market is ripe for disruption because hospital drug spend decisions are made without cross-system data. Our clinical network gives us exclusive access to the data required. The 2025 CMS interoperability mandate is forcing adoption. We will be the system of record for hospital procurement within 5 years.",
            required: true,
            maxLength: 2000,
          },
          {
            id: "2-q8",
            type: "file",
            label: "Upload your Category Ambition document (optional)",
            description:
              "If you have a more detailed write-up, slide deck, or supporting analysis, upload it here.",
            required: false,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
        ],
      },
    ],
  },
];
