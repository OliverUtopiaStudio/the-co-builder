import type { AssetWorkflow } from "../questions";

export const stage03Workflows: AssetWorkflow[] = [
  // ── Asset #8: Design Partner Pipeline ─────────────────────────
  {
    assetNumber: 8,
    steps: [
      {
        id: "8-s1",
        title: "Pipeline Strategy",
        description:
          "Define how you will find and attract design partners who will co-build alongside you.",
        questions: [
          {
            id: "8-q1",
            type: "textarea",
            label: "How will you identify potential design partners?",
            description:
              "Describe the channels, networks, and methods you will use to find early design partners.",
            placeholder:
              "e.g. LinkedIn outreach to heads of ops at Series A fintechs, warm intros from our investor network, posts in relevant Slack communities...",
            required: true,
          },
          {
            id: "8-q2",
            type: "textarea",
            label: "What value will you offer them in return?",
            description:
              "Design partners invest time in your unproven product. Spell out what they get back.",
            placeholder:
              "e.g. Free lifetime access to the product, direct influence on the roadmap, co-marketing case study, early access to new features...",
            required: true,
          },
        ],
      },
      {
        id: "8-s2",
        title: "Partner Criteria",
        description:
          "Get specific about who qualifies as a great design partner so you spend outreach time wisely.",
        questions: [
          {
            id: "8-q3",
            type: "textarea",
            label: "What makes an ideal design partner?",
            description:
              "Define the firmographic and behavioral criteria that signal a strong fit.",
            placeholder:
              "e.g. 50-200 employee B2B SaaS company, has the pain we solve today, willing to give weekly feedback, has budget authority for pilot...",
            required: true,
          },
          {
            id: "8-q4",
            type: "number",
            label: "Minimum number of design partners needed",
            description:
              "How many active design partners do you need to validate effectively? Most teams target 3-5.",
            placeholder: "3",
            required: true,
            min: 1,
          },
        ],
      },
      {
        id: "8-s3",
        title: "Outreach",
        description:
          "Craft your outreach message and build your target list. Make the first move.",
        questions: [
          {
            id: "8-q5",
            type: "textarea",
            label: "Draft your outreach message to potential design partners",
            description:
              "Write the actual message you will send. Keep it concise, personal, and focused on their pain.",
            placeholder:
              "Hi [Name], I noticed [company] is scaling [function] and likely running into [pain point]. We are building a tool that [value prop]. Would you be open to a 20-min call to see if it could help? In return, you would get...",
            required: true,
            maxLength: 1000,
          },
          {
            id: "8-q6",
            type: "textarea",
            label: "List your target companies and contacts",
            description:
              "Name the specific companies and people you plan to reach out to first.",
            placeholder:
              "Company A - Jane Smith (VP Ops)\nCompany B - John Doe (Head of Engineering)\nCompany C - Sarah Lee (CTO)...",
            required: true,
          },
        ],
      },
      {
        id: "8-s4",
        title: "Deliverable",
        description:
          "Upload your Design Partner Pipeline tracker and confirm your current status.",
        questions: [
          {
            id: "8-q7",
            type: "file",
            label: "Upload your Design Partner Pipeline tracker",
            description:
              "A spreadsheet or document tracking each prospect, status, and next action.",
            required: true,
            accept: ".pdf,.xlsx,.csv",
            maxFiles: 1,
          },
          {
            id: "8-q8",
            type: "select",
            label: "Current pipeline status",
            description: "Where are you right now in the outreach process?",
            required: true,
            options: [
              { value: "building_list", label: "Building list" },
              { value: "outreach_started", label: "Outreach started" },
              { value: "conversations_active", label: "Conversations active" },
              { value: "partners_committed", label: "Partners committed" },
            ],
          },
        ],
      },
    ],
  },

  // ── Asset #9: AI Feasibility Brief ────────────────────────────
  {
    assetNumber: 9,
    steps: [
      {
        id: "9-s1",
        title: "AI Approach",
        description:
          "Choose the AI/ML approach that best fits your problem and describe the core capability.",
        questions: [
          {
            id: "9-q1",
            type: "select",
            label: "What type of AI/ML approach will you use?",
            description:
              "Select the primary technique. You can combine multiple later, but pick the lead approach.",
            required: true,
            options: [
              { value: "nlp", label: "NLP" },
              { value: "computer_vision", label: "Computer Vision" },
              { value: "predictive_analytics", label: "Predictive Analytics" },
              {
                value: "recommendation_systems",
                label: "Recommendation Systems",
              },
              { value: "generative_ai", label: "Generative AI" },
              { value: "multi_modal", label: "Multi-modal" },
              { value: "other", label: "Other" },
            ],
          },
          {
            id: "9-q2",
            type: "textarea",
            label: "Describe the core AI capability needed",
            description:
              "In plain language, what must the AI actually do? Focus on the input-output transformation.",
            placeholder:
              "e.g. The model takes in raw customer support transcripts and outputs a structured summary with sentiment, key issues, and suggested resolution steps...",
            required: true,
          },
        ],
      },
      {
        id: "9-s2",
        title: "Data Assessment",
        description:
          "AI is only as good as its data. Honestly assess what you have to work with.",
        questions: [
          {
            id: "9-q3",
            type: "textarea",
            label: "What training data is available?",
            description:
              "Describe the datasets you have access to or plan to acquire.",
            placeholder:
              "e.g. 50k labeled customer support tickets from partner companies, public SEC filings dataset, internal product usage logs from beta...",
            required: true,
          },
          {
            id: "9-q4",
            type: "select",
            label: "What is the data quality like?",
            description:
              "Be honest. Poor data quality is the #1 reason AI projects fail.",
            required: true,
            options: [
              { value: "high", label: "High - clean and labeled" },
              { value: "medium", label: "Medium - needs cleaning" },
              { value: "low", label: "Low - sparse or unlabeled" },
              { value: "unknown", label: "Unknown - haven't assessed" },
            ],
          },
          {
            id: "9-q5",
            type: "text",
            label: "Volume of training data available",
            description:
              "Approximate the size of your dataset in a meaningful unit.",
            placeholder: "e.g. 50,000 labeled examples, 2TB of images, 10,000 documents",
            required: true,
          },
        ],
      },
      {
        id: "9-s3",
        title: "Feasibility Risks",
        description:
          "Surface the hard questions now so you can de-risk before committing resources.",
        questions: [
          {
            id: "9-q6",
            type: "textarea",
            label: "What are the biggest technical risks?",
            description:
              "List the risks that could make this AI approach fail or underperform.",
            placeholder:
              "e.g. Insufficient labeled data for fine-tuning, high latency for real-time inference, model hallucination in high-stakes contexts, domain-specific language not well-represented in foundation models...",
            required: true,
          },
          {
            id: "9-q7",
            type: "textarea",
            label:
              "What accuracy/performance level is needed for the product to be useful?",
            description:
              "Define the minimum bar. A model that is 70% accurate might be useless or might be transformative depending on the use case.",
            placeholder:
              "e.g. 95%+ precision on classification (false positives are costly), sub-200ms inference latency, 90% user satisfaction on generated summaries...",
            required: true,
          },
        ],
      },
      {
        id: "9-s4",
        title: "Deliverable",
        description:
          "Upload your completed AI Feasibility Brief and rate your overall confidence.",
        questions: [
          {
            id: "9-q8",
            type: "file",
            label: "Upload your AI Feasibility Brief",
            description:
              "A document summarizing your AI approach, data assessment, and risk analysis.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "9-q9",
            type: "rating",
            label: "Confidence level",
            description:
              "How confident are you that AI can solve this problem with available data? 1 = pure speculation, 10 = proven and validated.",
            required: true,
            min: 1,
            max: 10,
          },
        ],
      },
    ],
  },

  // ── Asset #10: Eval Plan + Ground Truth ────────────────────────
  {
    assetNumber: 10,
    steps: [
      {
        id: "10-s1",
        title: "Evaluation Metrics",
        description:
          "Define the scoreboard. Without clear metrics, you cannot tell if your AI is working.",
        questions: [
          {
            id: "10-q1",
            type: "textarea",
            label: "What metrics will measure success?",
            description:
              "List the quantitative metrics you will track to evaluate model performance.",
            placeholder:
              "e.g. Precision, recall, F1-score for classification; BLEU/ROUGE for generation; mean absolute error for predictions; user acceptance rate...",
            required: true,
          },
          {
            id: "10-q2",
            type: "textarea",
            label: "What is the minimum acceptable performance?",
            description:
              "Set concrete thresholds. Below these numbers, the product should not ship.",
            placeholder:
              "e.g. F1-score >= 0.85, latency < 500ms p95, user satisfaction >= 4/5 on generated outputs...",
            required: true,
          },
        ],
      },
      {
        id: "10-s2",
        title: "Ground Truth",
        description:
          "Ground truth is the foundation of every eval. Get this wrong and every metric is meaningless.",
        questions: [
          {
            id: "10-q3",
            type: "textarea",
            label: "How will you establish ground truth labels?",
            description:
              "Describe the labeling methodology, guidelines, and quality control process.",
            placeholder:
              "e.g. Domain experts label 1,000 examples using a rubric, inter-annotator agreement measured via Cohen's kappa, edge cases escalated to senior reviewer...",
            required: true,
          },
          {
            id: "10-q4",
            type: "textarea",
            label: "Who will create and validate the ground truth?",
            description:
              "Name the people or teams responsible. External annotators? Internal domain experts? Customers?",
            placeholder:
              "e.g. Two internal compliance analysts label independently, a third resolves disagreements; we will also use customer feedback as a secondary validation signal...",
            required: true,
          },
        ],
      },
      {
        id: "10-s3",
        title: "Testing Strategy",
        description:
          "Plan for failure. The best AI teams spend more time on testing than on training.",
        questions: [
          {
            id: "10-q5",
            type: "textarea",
            label: "How will you test for edge cases and failures?",
            description:
              "Describe your approach to adversarial testing, stress testing, and edge case coverage.",
            placeholder:
              "e.g. Curated adversarial test set of 200 hard examples, automated regression suite, red-team exercises with domain experts, slice-based analysis across demographics...",
            required: true,
          },
          {
            id: "10-q6",
            type: "textarea",
            label: "How will you handle AI errors in production?",
            description:
              "Define the fallback behavior when the model gets it wrong in front of a real user.",
            placeholder:
              "e.g. Low-confidence predictions routed to human review, graceful degradation to rule-based system, user feedback loop to flag errors, automatic rollback if error rate exceeds 5%...",
            required: true,
          },
        ],
      },
      {
        id: "10-s4",
        title: "Deliverable",
        description:
          "Upload your Eval Plan and, if available, a sample ground truth dataset.",
        questions: [
          {
            id: "10-q7",
            type: "file",
            label: "Upload your Eval Plan document",
            description:
              "A document covering metrics, ground truth methodology, and testing strategy.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "10-q8",
            type: "file",
            label: "Upload sample ground truth dataset",
            description:
              "A small labeled dataset demonstrating your ground truth format and quality. Optional but recommended.",
            required: false,
            maxFiles: 1,
          },
        ],
      },
    ],
  },

  // ── Asset #11: Security Pack ───────────────────────────────────
  {
    assetNumber: 11,
    steps: [
      {
        id: "11-s1",
        title: "Security Posture",
        description:
          "Understand the sensitivity of what you handle and the rules you must play by.",
        questions: [
          {
            id: "11-q1",
            type: "select",
            label: "What data sensitivity level will you handle?",
            description:
              "Select the highest sensitivity level of data your product will process or store.",
            required: true,
            options: [
              { value: "public", label: "Public" },
              { value: "internal", label: "Internal" },
              { value: "confidential", label: "Confidential" },
              { value: "restricted", label: "Restricted / Regulated" },
            ],
          },
          {
            id: "11-q2",
            type: "multiselect",
            label: "What compliance frameworks apply?",
            description:
              "Select all frameworks that your target customers require or that apply to your data type.",
            required: true,
            options: [
              { value: "soc2", label: "SOC 2" },
              { value: "hipaa", label: "HIPAA" },
              { value: "gdpr", label: "GDPR" },
              { value: "iso27001", label: "ISO 27001" },
              { value: "fedramp", label: "FedRAMP" },
              { value: "pcidss", label: "PCI DSS" },
              { value: "none", label: "None yet" },
            ],
          },
        ],
      },
      {
        id: "11-s2",
        title: "Architecture Security",
        description:
          "Map out where data lives and how it is protected at rest and in transit.",
        questions: [
          {
            id: "11-q3",
            type: "select",
            label: "Where will data be stored?",
            description:
              "Select the deployment architecture for customer data.",
            required: true,
            options: [
              { value: "cloud_single_tenant", label: "Cloud single-tenant" },
              { value: "cloud_multi_tenant", label: "Cloud multi-tenant" },
              { value: "on_premise", label: "On-premise" },
              { value: "hybrid", label: "Hybrid" },
            ],
          },
          {
            id: "11-q4",
            type: "textarea",
            label: "Describe your encryption approach",
            description:
              "Cover encryption at rest, in transit, and any key management practices.",
            placeholder:
              "e.g. AES-256 encryption at rest, TLS 1.3 in transit, customer-managed keys via AWS KMS, secrets stored in HashiCorp Vault...",
            required: true,
          },
        ],
      },
      {
        id: "11-s3",
        title: "Security Questionnaire",
        description:
          "Enterprise buyers will send you security questionnaires. Get ahead of them.",
        questions: [
          {
            id: "11-q5",
            type: "select",
            label: "Have you completed a security questionnaire?",
            description:
              "Has your team filled out a customer or prospect security questionnaire?",
            required: true,
            options: [
              { value: "yes", label: "Yes" },
              { value: "in_progress", label: "In progress" },
              { value: "not_started", label: "Not started" },
            ],
          },
          {
            id: "11-q6",
            type: "textarea",
            label: "Key security concerns from prospects",
            description:
              "What security questions or concerns have prospects raised during sales conversations?",
            placeholder:
              "e.g. Data residency requirements (EU-only), SSO/SAML integration, audit logging, penetration testing cadence, subprocessor list...",
            required: true,
          },
        ],
      },
      {
        id: "11-s4",
        title: "Deliverable",
        description:
          "Upload your Security Pack and any compliance certifications you already have.",
        questions: [
          {
            id: "11-q7",
            type: "file",
            label: "Upload your Security Pack",
            description:
              "A consolidated document covering your security posture, architecture, and compliance status.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "11-q8",
            type: "file",
            label: "Upload any compliance certifications",
            description:
              "SOC 2 reports, ISO certificates, or other compliance evidence. Optional.",
            required: false,
            maxFiles: 3,
          },
        ],
      },
    ],
  },

  // ── Asset #12: Data Advantage Contract ─────────────────────────
  {
    assetNumber: 12,
    steps: [
      {
        id: "12-s1",
        title: "Data Rights Strategy",
        description:
          "Define what data rights you need and why they matter for your product trajectory.",
        questions: [
          {
            id: "12-q1",
            type: "textarea",
            label: "What data rights do you need from customers?",
            description:
              "Be specific about what you need permission to do with customer data.",
            placeholder:
              "e.g. Right to use anonymized usage data for model training, aggregate analytics across customers, retain de-identified data after contract ends...",
            required: true,
          },
          {
            id: "12-q2",
            type: "textarea",
            label: "How will data usage improve your product over time?",
            description:
              "Explain the flywheel: more data leads to what specific product improvements?",
            placeholder:
              "e.g. Each new customer's data improves classification accuracy by ~2%, more usage data enables better recommendations, aggregate patterns reveal industry benchmarks...",
            required: true,
          },
        ],
      },
      {
        id: "12-s2",
        title: "Contract Terms",
        description:
          "Draft the key contractual clauses that protect both you and your customers.",
        questions: [
          {
            id: "12-q3",
            type: "textarea",
            label: "What are the key data rights clauses?",
            description:
              "Outline the specific contractual terms you will include around data usage.",
            placeholder:
              "e.g. License to use anonymized data for model improvement, data deletion upon request, no sharing of raw data with third parties, aggregate insights may be shared...",
            required: true,
          },
          {
            id: "12-q4",
            type: "textarea",
            label: "How will you handle data anonymization?",
            description:
              "Describe your technical approach to stripping PII and ensuring customer data cannot be re-identified.",
            placeholder:
              "e.g. K-anonymity with k=10, differential privacy for aggregate queries, PII scrubbing pipeline before model training, quarterly re-identification risk audits...",
            required: true,
          },
        ],
      },
      {
        id: "12-s3",
        title: "Competitive Moat",
        description:
          "Data advantages only matter if they compound into something a competitor cannot easily replicate.",
        questions: [
          {
            id: "12-q5",
            type: "textarea",
            label: "How does data access create a defensible advantage?",
            description:
              "Explain why your data position gets stronger over time and harder to replicate.",
            placeholder:
              "e.g. Network effects: each customer's data improves the model for all customers, first-mover on proprietary industry dataset, exclusive data partnerships with 3 major providers...",
            required: true,
          },
          {
            id: "12-q6",
            type: "textarea",
            label: "What happens if a competitor gets similar data?",
            description:
              "Stress-test your moat. If a well-funded competitor obtained similar data, what advantage would you retain?",
            placeholder:
              "e.g. Our 18-month head start on labeling gives us a quality advantage, our proprietary ontology is trained on data they cannot access, switching costs lock in our data pipeline...",
            required: true,
          },
        ],
      },
      {
        id: "12-s4",
        title: "Deliverable",
        description:
          "Upload your Data Advantage Contract template and indicate its review status.",
        questions: [
          {
            id: "12-q7",
            type: "file",
            label: "Upload your Data Advantage Contract template",
            description:
              "The contract template or key terms document covering data rights.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "12-q8",
            type: "select",
            label: "Legal review status",
            description: "How far along is the legal review of this contract?",
            required: true,
            options: [
              { value: "not_started", label: "Not started" },
              { value: "draft_complete", label: "Draft complete" },
              { value: "legal_reviewed", label: "Legal reviewed" },
              { value: "finalized", label: "Finalized" },
            ],
          },
        ],
      },
    ],
  },

  // ── Asset #13: Moat Ledger ─────────────────────────────────────
  {
    assetNumber: 13,
    steps: [
      {
        id: "13-s1",
        title: "Moat Sources",
        description:
          "Inventory every source of competitive advantage you have or are building toward.",
        questions: [
          {
            id: "13-q1",
            type: "textarea",
            label: "List all sources of competitive advantage",
            description:
              "Include technology, data, network effects, brand, partnerships, regulatory, and any other moat sources.",
            placeholder:
              "e.g. Proprietary NLP model trained on 5 years of industry data, exclusive partnership with top 3 data providers, SOC 2 Type II certification (competitors lack this), 200+ customer feedback loops feeding model improvement...",
            required: true,
          },
          {
            id: "13-q2",
            type: "table",
            label: "Rate each moat source",
            description:
              "Score each competitive advantage on strength (how powerful today) and durability (how long it lasts).",
            required: true,
            columns: [
              { key: "source", label: "Source", type: "text" },
              {
                key: "strength",
                label: "Strength 1-10",
                type: "number",
              },
              {
                key: "durability",
                label: "Durability 1-10",
                type: "number",
              },
              { key: "notes", label: "Notes", type: "text" },
            ],
            maxRows: 10,
          },
        ],
      },
      {
        id: "13-s2",
        title: "Data Moats",
        description:
          "Data moats are the most durable advantage in AI. Map yours explicitly.",
        questions: [
          {
            id: "13-q3",
            type: "textarea",
            label: "What proprietary data will you accumulate?",
            description:
              "Describe the unique datasets you will build through product usage that competitors cannot easily obtain.",
            placeholder:
              "e.g. User interaction patterns across 10k workflows, industry-specific labeled training data from design partners, proprietary benchmark dataset for our vertical...",
            required: true,
          },
          {
            id: "13-q4",
            type: "textarea",
            label: "How does your data advantage compound over time?",
            description:
              "Explain the flywheel: how does more data make the product better and attract more data?",
            placeholder:
              "e.g. More users generate more labeled examples, which improve model accuracy, which drives higher adoption, which generates more data. Each 10x increase in data improves accuracy by ~15%...",
            required: true,
          },
        ],
      },
      {
        id: "13-s3",
        title: "Defensibility Assessment",
        description:
          "Pressure-test your moat by thinking like a well-funded competitor.",
        questions: [
          {
            id: "13-q5",
            type: "textarea",
            label: "What would it cost a competitor to replicate your position?",
            description:
              "Estimate the time, money, and resources needed for a new entrant to match your advantages.",
            placeholder:
              "e.g. 18 months and $2M to rebuild our labeled dataset, 12 months to achieve SOC 2 certification, impossible to replicate our exclusive data partnership with [company]...",
            required: true,
          },
          {
            id: "13-q6",
            type: "textarea",
            label: "What is your biggest vulnerability?",
            description:
              "Every moat has a weak point. Name yours so you can defend it.",
            placeholder:
              "e.g. A large incumbent with existing customer relationships could bundle a competing feature, open-source models could close the accuracy gap, key data partner could be acquired...",
            required: true,
          },
        ],
      },
      {
        id: "13-s4",
        title: "Deliverable",
        description:
          "Upload your Moat Ledger and rate your overall defensibility.",
        questions: [
          {
            id: "13-q7",
            type: "file",
            label: "Upload your Moat Ledger",
            description:
              "A document or spreadsheet cataloging all moat sources, ratings, and action plans.",
            required: true,
            maxFiles: 1,
          },
          {
            id: "13-q8",
            type: "rating",
            label: "Overall defensibility confidence",
            description:
              "How defensible is your position today? 1 = easily replicable, 10 = near-impossible to compete with.",
            required: true,
            min: 1,
            max: 10,
          },
        ],
      },
    ],
  },
];
