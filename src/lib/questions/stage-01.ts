import type { AssetWorkflow } from "../questions";

// ─── Stage 1: Problem Validation ───────────────────────────────
// Core gate: Is this a real problem worth solving?
// Fellows must quantify pain, map workflows, and identify data touchpoints.

export const stage01Workflows: AssetWorkflow[] = [
  // ───────────────────────────────────────────────────────────────
  // Asset #3: Problem Deep Dive + Quantification
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 3,
    steps: [
      {
        id: "3-s1",
        title: "Problem Statement",
        description:
          "Articulate the problem with precision. A well-defined problem is half the solution.",
        questions: [
          {
            id: "3-q1",
            type: "textarea",
            label: "Describe the core problem in 2-3 sentences.",
            description:
              "Be specific and concrete. Avoid jargon. Write it so someone outside your industry would understand the pain.",
            placeholder:
              "e.g. Hospital pharmacies waste 15-20 hours per week manually comparing drug prices across distributors. There is no centralized system that aggregates pricing in real time, so purchasing decisions are made with incomplete data, resulting in 8-15% overspend on pharmaceutical procurement.",
            required: true,
            maxLength: 1000,
          },
          {
            id: "3-q2",
            type: "textarea",
            label: "Who experiences this problem most acutely?",
            description:
              "Identify the person or role who feels this pain daily. Describe their context, constraints, and frustrations.",
            placeholder:
              "e.g. Chief Pharmacy Officers at mid-size hospitals (200-500 beds) who manage $50-150M in annual drug spend with teams of 3-5 buyers. They lack visibility into what peer institutions pay, making them price-takers in distributor negotiations...",
            required: true,
            maxLength: 1500,
          },
        ],
      },
      {
        id: "3-s2",
        title: "Quantification",
        description:
          "Score the problem across four critical dimensions. High scores across all four indicate a problem worth building for.",
        questions: [
          {
            id: "3-q3",
            type: "table",
            label: "Rate the problem on each dimension (1-10) with supporting evidence.",
            description:
              "For each dimension, assign an honest score and provide the evidence that supports it. A total score below 28 is a red flag.",
            required: true,
            columns: [
              {
                key: "dimension",
                label: "Dimension",
                type: "text",
              },
              {
                key: "score",
                label: "Score (1-10)",
                type: "number",
              },
              {
                key: "evidence",
                label: "Evidence",
                type: "text",
              },
            ],
            maxRows: 4,
          },
        ],
      },
      {
        id: "3-s3",
        title: "Economic Impact",
        description:
          "Translate the problem into dollars. If you cannot quantify the cost, buyers cannot justify the purchase.",
        questions: [
          {
            id: "3-q4",
            type: "text",
            label:
              "What is the estimated annual cost of this problem per organization?",
            description:
              "Include direct costs (wasted spend, labor) and indirect costs (opportunity cost, risk exposure). Show your calculation.",
            placeholder:
              "e.g. $2.4M/year per hospital (15hrs/week x $85/hr labor + 10% overspend on $20M avg drug budget)",
            required: true,
          },
          {
            id: "3-q5",
            type: "textarea",
            label: "How are they solving it today, and why is that insufficient?",
            description:
              "Describe the current workaround, tool, or process. Explain why it fails -- is it too slow, too expensive, too manual, or simply wrong?",
            placeholder:
              "e.g. Most hospitals use a combination of Excel spreadsheets and phone calls to distributors. A senior buyer manually checks 3-4 distributor portals per purchase. This process takes 45 minutes per order, has a 12% error rate, and provides no historical benchmarking...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "3-s4",
        title: "Deliverable",
        description:
          "Package your problem quantification into a shareable document.",
        questions: [
          {
            id: "3-q6",
            type: "file",
            label: "Upload your Problem Quantification document.",
            description:
              "Include your problem statement, quantification scores, economic impact analysis, and current-state assessment.",
            required: true,
            accept: ".pdf,.docx",
            maxFiles: 1,
          },
          {
            id: "3-q7",
            type: "textarea",
            label: "Any additional notes or context (optional)",
            description:
              "Include anything that did not fit above: edge cases, nuances, or open questions you want to explore further.",
            placeholder:
              "e.g. One nuance: academic medical centers have a different procurement structure (GPO-dependent) that may require a separate go-to-market motion...",
            required: false,
            maxLength: 1500,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // Asset #4: Workflow Map + Data Touchpoints
  // ───────────────────────────────────────────────────────────────
  {
    assetNumber: 4,
    steps: [
      {
        id: "4-s1",
        title: "Current Workflow",
        description:
          "Map the end-to-end workflow where the problem lives. You cannot fix what you have not mapped.",
        questions: [
          {
            id: "4-q1",
            type: "textarea",
            label:
              "Describe the end-to-end workflow where this problem occurs.",
            description:
              "Walk through each step from trigger to resolution. Include the people, systems, and decisions involved at each stage.",
            placeholder:
              "e.g. 1) Pharmacist identifies low stock for a drug. 2) Buyer logs into distributor portal. 3) Buyer compares prices across 2-3 distributors manually. 4) Buyer places order via fax or portal. 5) Order is received and reconciled against PO. 6) Invoice is processed by AP...",
            required: true,
            maxLength: 3000,
          },
          {
            id: "4-q2",
            type: "number",
            label: "How many steps are in the current process?",
            description:
              "Count the distinct steps from your workflow description above. More steps often mean more friction and more opportunity.",
            placeholder: "e.g. 8",
            required: true,
            min: 1,
            max: 100,
          },
        ],
      },
      {
        id: "4-s2",
        title: "Pain Points",
        description:
          "Identify where friction concentrates in the workflow. The biggest pain points are your entry wedge.",
        questions: [
          {
            id: "4-q3",
            type: "textarea",
            label:
              "Where in the workflow does the biggest friction occur?",
            description:
              "Pinpoint the exact steps where time is wasted, errors happen, or decisions are made with bad data. Rank them by severity.",
            placeholder:
              "e.g. Step 3 (price comparison) is the biggest bottleneck: 45 min per order, 12% error rate. Step 5 (reconciliation) is second: 30% of invoices have discrepancies requiring manual resolution...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "4-q4",
            type: "textarea",
            label: "What data is generated at each step?",
            description:
              "List the data created, consumed, or transformed at each workflow step. This reveals where AI can add the most value.",
            placeholder:
              "e.g. Step 1: inventory levels, reorder thresholds, usage history. Step 3: distributor pricing (PDF/portal), historical purchase prices, contract terms. Step 5: PO data, invoice line items, receiving records...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "4-s3",
        title: "Data Touchpoints",
        description:
          "Identify the data systems involved and the gaps where valuable data is lost.",
        questions: [
          {
            id: "4-q5",
            type: "textarea",
            label:
              "List the key data systems and sources involved in this workflow.",
            description:
              "Include ERP, CRM, databases, spreadsheets, email, portals, and any other system that holds relevant data. Note integration status.",
            placeholder:
              "e.g. 1) Epic EHR (medication orders, patient data). 2) McKesson distributor portal (pricing, availability). 3) SAP ERP (PO, AP, inventory). 4) Excel spreadsheets (manual price tracking). 5) Email (contract negotiations, approvals)...",
            required: true,
            maxLength: 2000,
          },
          {
            id: "4-q6",
            type: "textarea",
            label:
              "What data is currently NOT being captured that should be?",
            description:
              "Identify the blind spots. What decisions are being made without data? What signals are lost between systems?",
            placeholder:
              "e.g. Cross-hospital pricing benchmarks are never captured -- each hospital negotiates in isolation. Time-to-decision per order is not tracked. Distributor switching costs and contract compliance rates are maintained in spreadsheets that are never analyzed...",
            required: true,
            maxLength: 2000,
          },
        ],
      },
      {
        id: "4-s4",
        title: "Deliverable",
        description:
          "Upload your workflow map and data touchpoints documentation.",
        questions: [
          {
            id: "4-q7",
            type: "file",
            label: "Upload your Workflow Map diagram.",
            description:
              "A visual diagram (flowchart, swim lane, or process map) showing the end-to-end workflow with pain points highlighted.",
            required: true,
            accept: ".pdf,.png,.docx",
            maxFiles: 1,
          },
          {
            id: "4-q8",
            type: "file",
            label: "Upload your Data Touchpoints document (optional).",
            description:
              "A supplementary document detailing data systems, integration points, and data gaps.",
            required: false,
            accept: ".pdf,.docx,.png",
            maxFiles: 1,
          },
        ],
      },
    ],
  },
];
