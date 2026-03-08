/**
 * Animated Lesson content — v1 video replacements for the content library.
 *
 * Each lesson maps to an asset number and contains scenes that auto-play
 * as an animated walkthrough. Optimised for short, impactful messaging
 * with real-world examples and clear task-completion steps.
 * Lessons follow first-principles and Feynman-style "explain like 5" clarity.
 */

/** Calendly URL for booking output review with Ollie (shown on every lesson) */
export const BOOK_REVIEW_CALENDLY_URL =
  "https://calendly.com/oliver-utopia-studio/fellow-co-build-session-45-mins-clone";

export interface LessonScene {
  /** Scene type controls layout and animation style */
  type: "title" | "insight" | "example" | "steps" | "callout" | "action";
  /** Small label above the heading (e.g. "CORE QUESTION") */
  label?: string;
  /** Main heading text */
  heading: string;
  /** Body text — keep to 1-2 sentences max */
  body?: string;
  /** Bullet items for 'steps' type scenes */
  items?: string[];
  /** Real-world company/product example for 'example' type */
  example?: {
    company: string;
    quote: string;
    takeaway: string;
  };
  /** Duration in seconds this scene is visible (default: 5) */
  duration?: number;
}

export interface AnimatedLessonData {
  assetNumber: number;
  title: string;
  /** Total estimated read time */
  totalDuration: string;
  scenes: LessonScene[];
}

/** Registry of all animated lessons, keyed by asset number */
export const lessons: Record<number, AnimatedLessonData> = {
  1: {
    assetNumber: 1,
    title: "Risk Capital + Invention One-Pager",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Risk Capital +\nInvention One-Pager",
        body: "Why the market won't solve this — and why you can.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Why can't a smart team with $10M solve this — and why won't the market fix it on its own?",
        body: "If well-funded outsiders could build it, or existing players could get there through normal improvements, it's not an invention. It's a feature.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Structural failure in action",
        example: {
          company: "Veeva Systems",
          quote:
            "Life sciences companies needed CRM that understood FDA compliance. Salesforce couldn't — the regulatory domain knowledge was the moat.",
          takeaway:
            "Veeva's founder was an insider. He saw the structural failure that generalists couldn't solve. That's your edge.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your one-pager",
        items: [
          "Name the failure — what's broken in the market or system that won't fix itself through normal improvement?",
          "Define your edge — what insider access, inspiration, or invention do you bring that outsiders simply don't have?",
          "Articulate the domain constraint — why is this problem hidden or hard to access for generalists?",
          "State the why-now — why is the market timing right to build this, and what gives you a path to market?",
        ],
        duration: 9,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Hidden problems are your advantage",
        body: "The best inventions start with problems most people can't even see. If the problem is hidden or hard to access, your invention naturally builds a path toward owning an entire category — not just a product.",
        duration: 7,
      },
      {
        type: "action",
        heading: "Open Asset #1 and start writing",
        body: "Your one-pager feeds into everything: moat logic, pitch deck, investor narrative. Get this right and the rest follows.",
        duration: 5,
      },
    ],
  },
  2: {
    assetNumber: 2,
    title: "Category Ambition Gate",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Category\nAmbition Gate",
        body: "Venture capital doesn't fund great businesses. It funds founders who see a new market no one else can.",
        duration: 5,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "If you execute perfectly for 5 years — do you own a global category worth $1B+, or a nice $20M ARR tool?",
        body: "Venture capital funds category creation, not feature improvement. If the ceiling is small, the capital structure is wrong.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Category creation in action",
        example: {
          company: "Figma",
          quote:
            "Design tools existed everywhere — Sketch, Adobe, InVision. Figma didn't build a better design tool. They defined collaborative design as an entirely new category.",
          takeaway:
            "They didn't compete on features. They reframed the market so the old question was irrelevant. That's category creation.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Test your category ambition",
        items: [
          "Name the category you'll own — not the product you'll build, but the space you'll define.",
          "Run the $1B test — if you win completely, is this a $1B+ global market? If not, rethink the frame.",
          "Check it's not a feature — could an incumbent add this in a quarter? If yes, you're building on someone else's platform.",
          "Write the category rationale — why does this category need to exist as a standalone market?",
        ],
        duration: 9,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Category is a lens, not a label",
        body: "You're not picking a market from a list. You're defining a way of seeing the world that makes your invention the obvious answer. Get the category right and customers, investors, and talent all pull in the same direction.",
        duration: 7,
      },
      {
        type: "action",
        heading: "Open Asset #2 and define your category",
        body: "Your category ambition shapes everything downstream: how you size the market, pitch investors, and decide what to build first.",
        duration: 5,
      },
    ],
  },
  3: {
    assetNumber: 3,
    title: "Problem Deep Dive + Quantification",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Problem Deep Dive +\nQuantification",
        body: "Break every assumption down to first principles — then build back up with numbers.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Can you take an investor into the problem so deeply that you're showing them numbers they've never seen before?",
        body: "Bottoms-up measurement is your superpower. It lets you design the pain, price the cure, and educate investors with evidence so specific they can't look away. Gut feel won't fund a company — first-principles economics will.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading:
          "Quantifying what the factory floor could feel but never prove",
        example: {
          company: "Augury",
          quote:
            "Manufacturers knew machines broke down — but not which machine, when, or what it truly cost. Augury attached sensors to individual machines and built bottoms-up models: per-motor, per-bearing, per-hour cost of failure. Unplanned downtime costs $260,000 per hour — and nobody had measured it at the machine level before.",
          takeaway:
            "Augury didn't invent maintenance. They measured what everyone felt but no one could prove — and turned a hidden number into a $1B+ category.",
        },
        duration: 9,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Break the problem into first principles",
        items: [
          "What is the frequency of the pain? — How often does this problem actually occur? Per day, per transaction, per patient?",
          "What is the cost price of the pain? — What does each single occurrence cost in time, money, or lost output?",
          "Who is the budget owner and how much are they spending? — Find the person already paying to manage or work around this problem.",
          "Size the problem, then size the solution — Build from the unit economics up: total addressable pain × your ability to capture it = the case for what to build and what to charge.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Bottoms-up modelling is your source of truth",
        body: "First-principles modelling doesn't just set your price — it tells you what to build. It gives you the numbers to speak your customer's language, the evidence to educate investors on a problem they've never heard of, and the conviction that you're solving a category-defining problem, not a feature request.",
        duration: 7,
      },
      {
        type: "action",
        heading: "Open Asset #3 and build your model with Ollie",
        body: "Your bottoms-up model feeds everything downstream — evaluation criteria, pricing, pilot KPIs. Book time with Ollie to build your first-principles model together.",
        duration: 5,
      },
    ],
  },
  4: {
    assetNumber: 4,
    title: "Workflow Map + Data Touchpoints",
    totalDuration: "3 min",
    scenes: [
      {
        type: "title",
        heading: "Workflow Map +\nData Touchpoints",
        body: "Deeply understand your customer's world before you build into it.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading:
          "You've defined the problem and modelled the economics. But do you actually know how your customer moves through their world today?",
        body: "Before you can add leverage — whether through AI, automation, or your core invention — you need to see the full picture. Every decision, every handoff, every workaround they've built. This is service design, and it's how you turn a thesis into a product.",
        duration: 8,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Mapping decisions before building tools",
        example: {
          company: "Palantir",
          quote:
            "Palantir didn't start with a product. They embedded with customers and mapped every decision flow, data handoff, and bottleneck in their operations. Only then did they build tools that slotted into existing workflows — products so embedded in the customer's world that they became infrastructure.",
          takeaway:
            "The deepest leverage comes from understanding workflows so well that your solution feels inevitable — not bolted on.",
        },
        duration: 9,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Learn to see your customer's world through service design",
        items: [
          "Pick a real customer journey — Choose a specific workflow: the moment your customer encounters the problem you're solving, through to their current workaround or outcome. Start with one real person, one real scenario.",
          "Understand what a journey actually means — A journey isn't a feature list. It's the full sequence of actions, decisions, emotions, and data exchanges a real person goes through to get something done. Think of it as their lived experience, not your product spec.",
          "Map the as-is journey — Walk through what happens today. Every step, handoff, decision point, moment of friction. Where is data created? Who owns it? Where do people pause, judge, or give up? Make it visual in Miro, Lucidchart, or Figma.",
          "Do this with customers, not for them — Set up structured sessions to step through these journeys with real people. Your assumptions will be wrong. Their workarounds will surprise you. This is where the real insight lives.",
          "Ask: is it one journey or many? — You might discover the problem spans multiple workflows, or that different customer segments follow entirely different paths. Map them all. The scope of your product depends on this answer.",
          "Design the to-be journey — Now layer in your solution. Where does your invention, AI, or automation create a step-change? These are your leverage points — the moments where you compress time, remove friction, or make a decision that was previously impossible.",
          "Treat this as service design, not a one-off exercise — Service design means your workflow map is a living document that evolves as you learn. The best products are built from deeply understood workflows, not feature wishlists. Return to this map weekly with your team.",
          "Create your output — Build a clear visual workflow (or set of workflows) in Miro, Lucidchart, or Figma that can be stepped through with your studio team, stress-tested with customers, and iterated on. This becomes the foundation for what you actually build.",
        ],
        duration: 14,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading:
          "The best solutions make invisible decision points visible — then add leverage at exactly the right moments",
        body: "When you map journeys deeply, you see what no pitch deck shows: where data is created, who holds power, and where small interventions create outsized impact. That's how your invention, your category ambition, and your bottoms-up economics compound into something buildable. And now that you can see the full workflow, you know exactly who your ideal customer is.",
        duration: 8,
      },
      {
        type: "action",
        heading: "Open Asset #4 and start mapping",
        body: "Map the journeys, decisions, and leverage points in your customer's world. This is where analysis becomes product.",
        duration: 5,
      },
    ],
  },
  // ─── Assets 5–27: first-principles step-through (no video) ───
  5: {
    assetNumber: 5,
    title: "ICP Definition",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "ICP Definition",
        body: "Who exactly are you building for? Not 'everyone' — one person you can describe like a character in a story.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can you point to a real person and say: 'This is who I'm building for'?",
        body: "If you can't name the buyer (who pays), the user (who uses it daily), and what their day looks like, you're guessing. First principle: you're solving one person's problem before you scale to many.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Why 'everyone' fails",
        example: {
          company: "Segment",
          quote:
            "They didn't sell to 'companies that use data'. They sold to the growth lead at a Series B startup who was drowning in spreadsheets and couldn't get one view of the customer.",
          takeaway:
            "One sharp profile beats ten vague ones. Name the job title, the company size, the one thing that keeps them up at night.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Define your ideal customer in plain language",
        items: [
          "Who signs the check? (Buyer) — Job title, what they're measured on, what they're allowed to buy.",
          "Who uses it every day? (User) — Same: title, workflow, current tools, biggest frustration.",
          "Company size, industry, geography — So you know where to find them and how they buy.",
          "One real workflow — What does their morning look like? Where does your solution slot in?",
          "Talk to at least 3 people who match — Until you've spoken to them, your ICP is a hypothesis.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "ICP is a hypothesis until you've talked to them",
        body: "Write it down. Then go find people who fit. If you can't find them or they don't care, your ICP is wrong. That's first principles: define, test, update.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #5 and write your ICP",
        body: "One page: buyer, user, company, workflow. Then book 3 conversations. Your checklist is your proof.",
        duration: 5,
      },
    ],
  },
  6: {
    assetNumber: 6,
    title: "Assumptions + Kill Switches",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Assumptions +\nKill Switches",
        body: "What do you believe must be true for this to work? And what would make you stop?",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "What evidence would make you walk away?",
        body: "If you can't answer that, you'll keep going long after you should stop. First principle: name your assumptions, rank them by risk, and decide in advance what 'wrong' looks like.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Kill switches in action",
        example: {
          company: "Countless ventures",
          quote:
            "The best founders don't fall in love with the idea — they fall in love with finding the truth. They write down: 'If we can't get X by date Y, we pivot or stop.'",
          takeaway:
            "A kill switch isn't failure. It's a contract with yourself to not waste years on something the market already rejected.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "List assumptions, then define what kills the venture",
        items: [
          "List every critical assumption — Market, tech, customer, data. What must be true?",
          "Rank by risk — Which are you least sure about? Those get tested first.",
          "For each: what would prove we're wrong? — That's your kill switch. Be specific.",
          "Set a testing plan — How will you get evidence? By when?",
          "Set a timeline — If we haven't validated the top 3 by X date, we reassess.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "No kill switches = zombie ventures",
        body: "Ventures that limp on for years without product-market fit usually had assumptions they never tested. Write the kill criteria before you're emotionally invested.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #6 and define your kill switches",
        body: "Assumptions list, risk order, kill criteria, test plan. Then run the tests. Update as you learn.",
        duration: 5,
      },
    ],
  },
  7: {
    assetNumber: 7,
    title: "Discovery Interviews",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Discovery\nInterviews",
        body: "Not sales. Not pitching. Listening to real people tell you what's actually broken.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Are you learning from customers or convincing yourself?",
        body: "Discovery means you go in with questions, not answers. First principle: you're testing whether the problem is real, urgent, and something they'd pay to fix. Your job is to listen.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Discovery that changed the product",
        example: {
          company: "Intercom",
          quote:
            "They thought they were building a widget. After dozens of discovery calls they realised customers wanted a full conversational platform. They pivoted before building the wrong thing.",
          takeaway:
            "Interviews aren't a checkbox. They're your main source of truth. The best insights come from what people do, not what they say they want.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Run discovery interviews like a scientist",
        items: [
          "Prepare a script aligned to your assumptions — What do you need to learn? Ask open questions, not leading ones.",
          "Do at least 10 interviews — One or two is a coincidence. Ten starts to show patterns.",
          "Document what you heard — Raw notes, quotes, surprises. Don't summarise away the good stuff.",
          "Update your ICP from what you learned — Did you find the right people? Did the problem look the same?",
          "Flag potential design partners — Who was eager, knowledgeable, and willing to go deep? Those are your first pilots.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Discovery is learning, not selling",
        body: "If you're talking more than they are, you're doing it wrong. The goal is to leave with something you didn't know when you walked in.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #7 and run your discovery",
        body: "Script, 10+ calls, documented findings, updated ICP. Use the checklist. Then book a review with Ollie to pressure-test your insights.",
        duration: 5,
      },
    ],
  },
  8: {
    assetNumber: 8,
    title: "Design Partner Pipeline",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Design Partner\nPipeline",
        body: "Not random leads. A short list of people who have the problem badly and will work with you to solve it.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Who are the 5–10 accounts that would pay to pilot this with you?",
        body: "Design partners aren't just early customers. They're co-builders: they have the problem, the budget, and the willingness to iterate. First principle: quality over quantity.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Design partners that made the product",
        example: {
          company: "Notion",
          quote:
            "Early on they had a tiny list of design partners — teams that lived in the product daily and gave brutal feedback. Those relationships shaped the product and the narrative.",
          takeaway:
            "Two committed design partners beat twenty lukewarm leads. Choose people who feel the pain and will tell you the truth.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your design partner pipeline",
        items: [
          "List 5–10 potential partners — From your ICP and discovery. Who had the problem most acutely?",
          "Qualify: problem severity + willingness to pay — Are they already spending time or money on this? Would they pay for a pilot?",
          "Reach out to the top 5 — Personal, specific. Reference what you learned in discovery.",
          "Aim for at least 2 committed — Committed = signed up to a pilot or clear next step, not 'maybe later'.",
          "Document expectations and success criteria — What does a win look like for them? Get it in writing.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Selling and validating are the same thing",
        body: "You're not 'doing discovery' then 'doing sales'. You're finding people who want to buy and learn with you. Design partners are your first customers and your best teachers.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #8 and build your pipeline",
        body: "List, qualify, outreach, 2+ committed, expectations documented. This unlocks everything in Stage 03.",
        duration: 5,
      },
    ],
  },
  9: {
    assetNumber: 9,
    title: "AI Feasibility Brief",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "AI Feasibility\nBrief",
        body: "Can you actually build this with AI? Rules, ML, RAG, or agents — and where do humans stay in the loop?",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "What's the simplest way to get the outcome, and where does AI actually help?",
        body: "First principle: don't use AI because it's cool. Use it where it clearly beats rules or humans. Map each intervention point: rules vs ML vs LLM/RAG vs agents — and what must stay human.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Picking the right tool",
        example: {
          company: "Many AI ventures",
          quote:
            "The best teams start with 'what's the smallest unit of value?' and only add ML/LLM where it's clearly better. A lot of 'AI' products are 80% rules and 20% model — and that's fine.",
          takeaway:
            "Feasibility isn't 'can we use GPT?' It's: for this step, what's the right level of automation, and what are the failure modes?",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Spell out feasibility for each AI intervention",
        items: [
          "For each workflow step: rules vs ML vs LLM/RAG vs agents — Match the tool to the task. Don't over-engineer.",
          "Identify what stays human-in-the-loop — Where must a person check, correct, or decide? Document it.",
          "Document technical risks and mitigations — What could go wrong? Latency, accuracy, cost, safety.",
          "Estimate compute and infra — Ballpark: what does it cost per inference or per user?",
          "Write it down in a brief — So your team and partners share one view of what's feasible now vs later.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Feasibility is a product decision",
        body: "The right answer is often 'rules here, human there, model only where it clearly wins.' That keeps you buildable and defensible.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #9 and write your feasibility brief",
        body: "Approach per step, HITL boundaries, risks, compute estimate. Then you're ready for eval and security.",
        duration: 5,
      },
    ],
  },
  10: {
    assetNumber: 10,
    title: "Eval Plan + Ground Truth",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Eval Plan +\nGround Truth",
        body: "How do you know your AI is good? Define 'good' with data, not vibes.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "If an investor asked 'how do you know it works?', could you show them a number?",
        body: "First principle: you need a gold set of examples where you know the right answer, a way to score your system, and a bar for 'good enough'. Without that, you're guessing.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Eval that shipped product",
        example: {
          company: "Companies that ship AI products",
          quote:
            "The teams that ship reliably have a small, curated set of 'ground truth' cases. Every release is measured against it. If the score drops, they don't ship until they know why.",
          takeaway:
            "Eval isn't a one-off. It's your quality gate. Build it early, keep it updated, and never ship without running it.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your eval plan from first principles",
        items: [
          "Create a gold set — Real examples where you know the correct output. Start small (50–100). Grow over time.",
          "Define how you score — Accuracy, precision, recall, or task-specific metrics. One number that means 'good'.",
          "Set acceptance thresholds — What score must you hit before you ship or demo? Write it down.",
          "Document failure modes — Where does the system break? Known edge cases, biases, limits.",
          "Establish cadence — Run eval on every change. Weekly at least. Eval is part of the build.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "No eval = no proof",
        body: "Investors and customers will ask 'how do you know it works?' If you don't have a number and a process, you're not ready to scale.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #10 and build your eval plan",
        body: "Gold set, scoring, thresholds, failure modes, cadence. This is the foundation for trust in your AI.",
        duration: 5,
      },
    ],
  },
  11: {
    assetNumber: 11,
    title: "Security Pack",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Security Pack",
        body: "The doc that unblocks enterprise deals. Without it, procurement says no.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can you answer: 'Where does our data go? Who can see it? How long do you keep it?'",
        body: "First principle: enterprise buyers need clear, written answers about data and security. If you don't have them, the deal stalls. This isn't optional for B2B.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Security as a sales enabler",
        example: {
          company: "Every enterprise SaaS",
          quote:
            "Deals don't die on product. They die on security review. The teams that close fast have a one-pager: inference vs training, retention, redaction, access, audit. Ready before the first serious conversation.",
          takeaway:
            "Your security pack isn't for you — it's for the buyer's legal and infosec. Make it easy for them to say yes.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build the security pack that unblocks deals",
        items: [
          "Inference vs training — When do you use their data to run the model? When do you use it to train? Be explicit. Most buyers want inference only unless agreed.",
          "Retention — How long do you keep their data? Where? Deletion on request?",
          "Redaction — How do you handle PII, secrets? What's in, what's out?",
          "Access controls — Who at your company can see what? How is it logged?",
          "Auditability — Can they audit you? What evidence can you provide?",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Security pack is a sales doc",
        body: "Treat it like a product. Clear, scannable, honest. Update it as you learn what buyers ask. It's the key that unlocks enterprise.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #11 and build your security pack",
        body: "One place: inference vs training, retention, redaction, access, audit. Keep it current. Use it in every serious conversation.",
        duration: 5,
      },
    ],
  },
  12: {
    assetNumber: 12,
    title: "Data Advantage Contract",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Data Advantage\nContract",
        body: "Your moat on paper. Without it, you're assuming you have a data advantage — and you might not.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Do you have the right to use their data to make your product better — in writing?",
        body: "First principle: a 'data moat' only exists if you have contractual rights. Exclusivity, training/fine-tune rights, feedback loops, retention. If it's not in the contract, it's not real.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "When data rights made the company",
        example: {
          company: "Veeva, Palantir, vertical SaaS",
          quote:
            "The winners didn't just have good product — they had contracts that said they could use customer data to improve the system in defined ways. That's what compounds over time.",
          takeaway:
            "Negotiate data rights early. Once the contract is signed without them, it's much harder to add later.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Make your data moat contractual",
        items: [
          "Draft a data advantage template — Exclusivity, training/fine-tune rights, feedback loop rights, retention scope, usage boundaries.",
          "Define exclusivity — Can you use their data only for them, or to improve the product for everyone? Get it clear.",
          "Secure training and fine-tuning rights — In what circumstances can you use their data to train or improve models?",
          "Establish feedback loop rights — Can you use outcomes to improve the system? How?",
          "Agree retention and usage boundaries — What stays, what goes, what they can veto. Then get legal review.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "No contract = no moat",
        body: "If you're building an AI product that gets better with data, the contract is the moat. Without it, you have a feature, not a defensible business.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #12 and lock in your data terms",
        body: "Template, exclusivity, training rights, feedback, retention. Legal review. This is the spine of your defensibility.",
        duration: 5,
      },
    ],
  },
  13: {
    assetNumber: 13,
    title: "The Moat Ledger",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "The Moat Ledger",
        body: "Proof that your moat is real. Not a slide — evidence.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can you point to evidence for each layer of your moat?",
        body: "First principle: moats aren't theoretical. They're documented. Data rights (contracts), eval lift (numbers), workflow lock-in (integration depth), regulatory (certs). Track them.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Moat as a living document",
        example: {
          company: "Best-in-class vertical SaaS",
          quote:
            "They don't just say 'we have a data moat.' They have a ledger: contract X gives us rights to Y; our eval improved Z% with proprietary data; switching cost for customer A is $B.",
          takeaway:
            "Investors and acquirers want evidence. The moat ledger is where you store it. Update it every quarter.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your moat ledger with evidence",
        items: [
          "Data rights — Which contracts, what rights, what's exclusive? Link to Asset #12.",
          "Eval lift — How much does your system improve with proprietary data? Show the number.",
          "Workflow lock-in — How deeply are you in their workflow? What's the cost to switch?",
          "Regulatory — Certifications, preferred vendor status, compliance. What do you have?",
          "Keep it updated — Add evidence as you get it. This becomes your defensibility story.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "The moat ledger is your proof",
        body: "When someone says 'why can't someone else do this?', your ledger is the answer. No ledger = no proof.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #13 and start your moat ledger",
        body: "One doc: data rights, eval lift, workflow, regulatory. Add evidence as you earn it. Review with Ollie to stress-test the story.",
        duration: 5,
      },
    ],
  },
  15: {
    assetNumber: 15,
    title: "PRD v1 + Not-to-Build",
    totalDuration: "3 min",
    scenes: [
      {
        type: "title",
        heading: "PRD v1 +\nNot-to-Build",
        body: "What we're building — and what we're explicitly not building. Both matter.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can your team build the right v1 without a 100-page spec?",
        body: "First principle: a PRD is a contract with reality. Workflow requirements (what the user sees and does), intelligence requirements (quality, latency, cost, safety), and a Not-to-Build list so scope doesn't creep.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Not-to-Build saved the product",
        example: {
          company: "Many v1 products",
          quote:
            "The best v1s had a short 'we are not building' list: no mobile, no API for v1, no integration with X. That focus is what got them to ship.",
          takeaway:
            "Saying no is as important as saying yes. Write down what's out of scope so everyone can say no to feature creep.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Write the PRD that ships",
        items: [
          "Workflow requirements — What the user sees and does, integration points, UI/UX constraints, edge cases.",
          "Intelligence requirements — Quality thresholds, latency, cost per inference, safety and human-in-the-loop gates.",
          "Not-to-Build list — What we explicitly won't do in v1. No excuses.",
          "Get stakeholder sign-off — Technical and business. No build until the PRD is approved.",
          "Treat it as living — Update when you learn. But change by agreement, not drift.",
        ],
        duration: 11,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "PRD is the contract before you build",
        body: "Everything before this stage feeds into the PRD. Everything after flows from it. Get it right. Then build.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #15 and write your PRD",
        body: "Workflow, intelligence, Not-to-Build, sign-off. This is the fulcrum. Book a review with Ollie before you lock it.",
        duration: 5,
      },
    ],
  },
  16: {
    assetNumber: 16,
    title: "Enterprise Architecture Canvas",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Enterprise\nArchitecture Canvas",
        body: "How the system is built so it's enterprise-ready: gateway, RAG, eval, telemetry, policy.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can you explain how your AI gets to the user safely and measurably?",
        body: "First principle: enterprise means model gateway (what runs where), RAG/store (where knowledge lives), eval harness (how you test), telemetry (what you observe), policy (governance and safety). Map it.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Architecture that scaled",
        example: {
          company: "AI-native enterprises",
          quote:
            "The teams that scaled had a clear picture: one place for models, one for retrieval, one for eval, one for monitoring. When something broke, they knew where to look.",
          takeaway:
            "Your canvas doesn't need to be perfect. It needs to be shared. Everyone builds and operates from the same map.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Draw your architecture from first principles",
        items: [
          "Model gateway — How do requests hit the right model? Versioning? Fallbacks?",
          "RAG store and retrieval — Where does knowledge live? How is it indexed and retrieved?",
          "Eval harness — How do you run eval on every change? Automate it.",
          "Telemetry and monitoring — What do you log? Alerts? Dashboards?",
          "Policy layer — Governance, safety, access control. Where do rules live?",
          "Get it reviewed — Engineering leads should sign off. Then build to the canvas.",
        ],
        duration: 11,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Architecture is a shared map",
        body: "When everyone sees the same picture, you can move fast without breaking things. Update the canvas as the system evolves.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #16 and document your architecture",
        body: "Gateway, RAG, eval, telemetry, policy. Review with the team. This is your build blueprint.",
        duration: 5,
      },
    ],
  },
  17: {
    assetNumber: 17,
    title: "Design Partner Offer + LOI",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Design Partner\nOffer + LOI",
        body: "Get it in writing: paid pilot, AI usage, data terms, productization. Then get a signature.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Do you have at least one signed LOI for a paid pilot with the right terms?",
        body: "First principle: an LOI isn't a handshake. It's a short document: we'll do X, you'll pay Y, we get data rights Z, and we can productize. Without it, you're still in 'maybe' land.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "LOI that unlocked the round",
        example: {
          company: "Many B2B startups",
          quote:
            "Investors don't just want 'we have interest.' They want 'we have a signed LOI with company X for $Y and these terms.' That's proof of demand and of your ability to close.",
          takeaway:
            "Draft the offer. Include AI usage, data, and productization. Negotiate. Get it signed. Then you have something real.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Get from handshake to signed LOI",
        items: [
          "Draft the design partner offer — Scope, price, timeline, what they get, what you get (data, feedback).",
          "Include AI and data terms — Usage, training rights, retention. Same themes as Asset #11 and #12.",
          "Add productization clauses — You can use learnings to build a product. No perpetual custom work.",
          "Negotiate with real partners — Use your pipeline from Asset #8. Get at least one to yes.",
          "Legal review — Have someone check the LOI. Then sign. One signed LOI beats ten verbal yeses.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Signed LOI = proof",
        body: "Until it's signed, it's a conversation. After it's signed, it's a commitment. That's the bar for 'we have design partners.'",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #17 and secure your LOI",
        body: "Offer doc, terms, productization, negotiation, legal, signature. This unlocks the pilot and the story for investors.",
        duration: 5,
      },
    ],
  },
  18: {
    assetNumber: 18,
    title: "Pilot SOW + KPI Dashboard",
    totalDuration: "3 min",
    scenes: [
      {
        type: "title",
        heading: "Pilot SOW +\nKPI Dashboard",
        body: "The pilot is where ventures die or scale. Get the scope and metrics right on paper first.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Do you have a signed SOW with clear KPIs and a way to track them?",
        body: "First principle: outcome KPIs (what the customer cares about), model KPIs (accuracy, latency, cost), ops KPIs (uptime, support). And: what's config vs custom? If everything is custom, you can't scale.",
        duration: 8,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "SOW that scaled",
        example: {
          company: "Productized pilots",
          quote:
            "The ventures that scaled had a standard SOW: same structure, same KPI types, configurable but not bespoke. The ones that died had a different deal for every customer and no way to repeat.",
          takeaway:
            "Pilot SOW is your first product. Make it repeatable. Document what's standard so the next pilot is faster.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Write the pilot that can scale",
        items: [
          "Draft the SOW — Scope, deliverables, timeline, ownership. Clear and short.",
          "Outcome KPIs — What business result does the customer care about? Measure it.",
          "Model KPIs — Accuracy, latency, cost per inference. From your eval and targets.",
          "Ops KPIs — Uptime, support response, deployment health. So you know when something's wrong.",
          "Config vs custom matrix — What's the same for every pilot? What's bespoke? Shrink the bespoke over time.",
          "Standard deploy spec — How do you ship? One way. Document it.",
          "Build a KPI dashboard — Real-time view. So you and the customer see the same numbers.",
          "Get the SOW signed — No pilot without a signed SOW. It's the contract for the experiment.",
        ],
        duration: 12,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Productized pilots scale; custom pilots don't",
        body: "If every pilot is a one-off, you're a consultancy. The SOW and dashboard are where you make the pilot repeatable.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #18 and lock in your pilot",
        body: "SOW, outcome/model/ops KPIs, config vs custom, dashboard, signature. Then run the pilot and track every number.",
        duration: 5,
      },
    ],
  },
  19: {
    assetNumber: 19,
    title: "Prototype Sprint + Demo",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Prototype Sprint +\nDemo",
        body: "Ship something that shows the value. Then show it. Prove it works.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can you demo the workflow, the eval results, and the safety controls in one session?",
        body: "First principle: the prototype proves the workflow works, meets eval thresholds, and has safety and cost under control. The demo is where you show that to partners and investors.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Demo that closed the round",
        example: {
          company: "Technical founders",
          quote:
            "The best demos are live: 'Here's the problem. Here's our solution. Here's the eval. Here's what we're not ready for yet.' No fluff. Evidence.",
          takeaway:
            "Your demo is your evidence. Prepare it like a product. Record it. Have the numbers ready. Then deliver it to design partners and investors.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build and demo the prototype",
        items: [
          "Complete the prototype sprint — Against the PRD. Core workflow, not everything.",
          "Show workflow value — The user can do the thing. End to end.",
          "Document eval results — Do you meet thresholds? Show the numbers.",
          "Safety controls — Where is human-in-the-loop? What's guarded? Test it.",
          "Latency and cost — Within budget? Measure and document.",
          "Prepare the demo — Script, recording, backup. So it works when it matters.",
          "Deliver to design partners — Get feedback. Iterate. Then use the same demo for investors.",
        ],
        duration: 11,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Demo = proof",
        body: "The prototype is what you built. The demo is how you prove it. Both need to be solid before you scale.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #19 and ship the demo",
        body: "Prototype, eval, safety, cost, demo prep, delivery. This is the moment you go from 'we're building' to 'we've shown it works.'",
        duration: 5,
      },
    ],
  },
  20: {
    assetNumber: 20,
    title: "Sales Pack (Trust Pack)",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Sales Pack\n(Trust Pack)",
        body: "Everything a new prospect needs to say yes: narrative, demo, security, failure modes, rollout.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Can a new prospect get everything they need to buy without you inventing it on the spot?",
        body: "First principle: you've sold to design partners. Now you need a pack: one narrative, one demo, one set of security answers, known failure modes, rollout plan. Repeatable.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Sales pack that scaled",
        example: {
          company: "B2B scale-ups",
          quote:
            "The sales pack is the productisation of your first 5 deals. Everything that worked — narrative, objection handling, security one-pager — goes in. New reps and new prospects get the same quality.",
          takeaway:
            "Don't leave sales to memory. Package it. So you can scale beyond the founders and first design partners.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build the pack that wins new deals",
        items: [
          "Narrative and deck — One story. Problem, solution, proof, ask. Consistent every time.",
          "Demo and eval report — The demo you built in Asset #19. Plus the numbers that prove it works.",
          "Security answers — From Asset #11. Ready for procurement and infosec.",
          "Failure modes and mitigations — What can go wrong? What do you do? Honest and clear.",
          "Standard rollout plan — How do you deploy? What's the timeline? What does success look like?",
          "Test with 3 non-design-partner prospects — If they can get to 'yes' with the pack, you're ready to scale sales.",
        ],
        duration: 11,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Sales pack = repeatable motion",
        body: "First deal is founder-led. Tenth deal should use the pack. Build it once, use it everywhere.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #20 and build your sales pack",
        body: "Narrative, demo, security, failure modes, rollout. Test with 3 prospects. Then scale.",
        duration: 5,
      },
    ],
  },
  21: {
    assetNumber: 21,
    title: "Pricing + Unit Economics",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Pricing +\nUnit Economics",
        body: "Price to the outcome. Know your cost per task. Model margin at scale.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Do you know what it costs to deliver one unit of value, and what you can charge for it?",
        body: "First principle: unit economics = cost per task (compute + human-in-the-loop) and price per outcome. Margin at 10x and 100x tells you if this business works.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Pricing that stuck",
        example: {
          company: "Outcome-based pricing",
          quote:
            "The best AI products don't sell 'seats' or 'API calls' in a vacuum. They sell outcomes: 'We save you X hours' or 'We improve Y by Z%.' Price follows value. Then you back into cost.",
          takeaway:
            "Start with what the customer will pay for the outcome. Then make sure your cost to deliver leaves margin. Model it.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build pricing from first principles",
        items: [
          "Outcome-based pricing — What's the value? Price to that. Not seats, not raw usage, unless that maps to value.",
          "Cost per task — Compute + HITL. What does one unit cost you? That's your floor.",
          "Margin at scale — At 10x and 100x volume, what's the margin? Does it improve or erode?",
          "Sensitivity analysis — What if cost goes up 20%? What if price drops 10%? Know the edges.",
          "Validate with design partners — Would they pay this? What would they push back on?",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Unit economics are the business",
        body: "If margin doesn't work at scale, the business doesn't work. Build the model early. Update it as you learn.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #21 and build your pricing model",
        body: "Outcome price, cost per task, margin at scale, sensitivity. Validate with partners. This feeds the investor pack.",
        duration: 5,
      },
    ],
  },
  22: {
    assetNumber: 22,
    title: "Roadmap (6/12/18 months) + Gates",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Roadmap\n6/12/18 months + Gates",
        body: "Where you're going, and how you'll know you're on track. Gates, not wishes.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "What are the milestones that matter, and what has to be true to pass each gate?",
        body: "First principle: a roadmap isn't a list of features. It's milestones (eval lift, data flywheel, deployment adoption, margin, compliance) with gates: pass/fail criteria before you go to the next phase.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Gated roadmaps that shipped",
        example: {
          company: "Disciplined product teams",
          quote:
            "The best roadmaps have gates: 'We don't do 12-month plan until 6-month gate is passed.' That keeps you honest and keeps scope from exploding.",
          takeaway:
            "Gates are your quality control. No gate, no next phase. Align the roadmap to fundraising and to your moat story.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build a gated roadmap",
        items: [
          "6-month roadmap — Milestones: eval, data, deployment, margin, compliance. What's the gate for each?",
          "12-month roadmap — Same structure. What has to be true by then?",
          "18-month roadmap — Where are you for spinout or next round?",
          "Gates at each milestone — Pass/fail. No fuzzy 'we'll try.'",
          "Align to fundraising — When do you need to show what? Map the roadmap to the round.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Roadmap with gates = accountability",
        body: "Anyone can write a wish list. A gated roadmap is a contract: we do this, we prove this, then we get to do the next thing.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #22 and write your roadmap",
        body: "6/12/18 months, gates at each milestone, aligned to fundraising. Review with Ollie to stress-test the plan.",
        duration: 5,
      },
    ],
  },
  23: {
    assetNumber: 23,
    title: "Operating Model Blueprint",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Operating Model\nBlueprint",
        body: "How the venture runs day to day at scale: model releases, eval, incidents, red-teaming, feedback.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Who does what, how often, and how do we know when something's wrong?",
        body: "First principle: operating model = model release process, eval cadence, incident response, red-teaming, feedback/label ops, customer support. Document it so the team can run without you.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Operating model that scaled",
        example: {
          company: "AI product teams",
          quote:
            "The teams that scaled had a playbook: how often we release, how we run eval, who responds to incidents, how we red-team, how we handle feedback and labels. No heroics — process.",
          takeaway:
            "Blueprint it. So when you hire, they know the rhythm. When something breaks, everyone knows the drill.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Document how you operate",
        items: [
          "Model release process — How do new models get tested and shipped? Who approves?",
          "Eval cadence — How often do you run eval? What triggers a block?",
          "Incident response — Who's on call? What's the playbook? Escalation?",
          "Red-teaming — How do you stress-test safety and edge cases? How often?",
          "Feedback and label ops — How does feedback get into the system? Who labels? How fast?",
          "Customer support — How do customers get help? What's the SLA?",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Operating model = repeatable excellence",
        body: "Without a blueprint, every day is ad hoc. With one, the team can run, improve, and scale. Write it down.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #23 and build your operating blueprint",
        body: "Release, eval, incidents, red-team, feedback, support. Get the team aligned. Then run to it.",
        duration: 5,
      },
    ],
  },
  24: {
    assetNumber: 24,
    title: "Investor Pack + Data Room",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Investor Pack +\nData Room",
        body: "Everything an investor needs for due diligence. No scrambling — it's ready.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "If an investor asked for everything tomorrow, could you send a link?",
        body: "First principle: investor pack = narrative, metrics, proof. Data room = eval reports, unit economics, security, data terms, LOIs, moat ledger. Organised, current, and complete.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Data room that closed",
        example: {
          company: "Fundraising rounds",
          quote:
            "The rounds that closed fast had a data room that was ready before the first meeting. Investors could dig in immediately. The ones that dragged had to hunt for documents.",
          takeaway:
            "Build the data room as you build the company. By the time you fundraise, it should be a refresh, not a scramble.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build the pack and the room",
        items: [
          "Investor pack — Narrative, deck, key metrics, traction, ask. One place.",
          "Eval reports — Proof the AI works. From Asset #10 and #19.",
          "Unit economics — From Asset #21. Model and assumptions.",
          "Security pack — From Asset #11. Up to date.",
          "Data terms and LOIs — From Asset #12 and #17. Signed, organised.",
          "Moat ledger — From Asset #13. Evidence of defensibility.",
          "Data room — One link. Folders clear. Everything an investor might ask for.",
        ],
        duration: 11,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Data room = credibility",
        body: "When the room is ready, you look prepared. When it's not, you look early. Get it ready before you need it.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #24 and build your investor pack and data room",
        body: "Pack + room: eval, economics, security, data, LOIs, moat. One link. Keep it updated. Book a review with Ollie before you go to market.",
        duration: 5,
      },
    ],
  },
  25: {
    assetNumber: 25,
    title: "Capital Plan + Runway",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Capital Plan +\nRunway",
        body: "How much money you need, what it buys, and how long it lasts. Tied to milestones.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Do you know how much you need, what you'll spend it on, and when you'll need more?",
        body: "First principle: capital plan = compute, labelling/ops, security, integration, hiring — all tied to the roadmap. Runway = how many months until you need the next round or revenue. No surprises.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Runway that matched the plan",
        example: {
          company: "Funded startups",
          quote:
            "The best plans had runway tied to gates: 'We have 18 months to hit this milestone. If we don't, we have 6 months of extension or we need to raise earlier.' Clear and honest.",
          takeaway:
            "Model the burn. Tie hiring and spend to milestones. Know your extension options. Update every quarter.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your capital plan",
        items: [
          "Project compute costs — For 18 months. Scale with usage. From your unit economics.",
          "Budget labelling and ops — Feedback loops, data pipeline. What does it cost?",
          "Security and compliance — What do you need to spend to stay enterprise-ready?",
          "Integration costs — One-off and ongoing. Document.",
          "Hiring tied to gates — Who do you need when? Map to roadmap milestones.",
          "Total runway — At current burn, when do you run out? When do you need to raise or reach profitability?",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Runway is a strategy",
        body: "Runway isn't just 'how long we can survive.' It's 'how long we have to hit the next gate.' Plan to it.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #25 and build your capital plan",
        body: "Compute, ops, security, integration, hiring, runway. Validate with Ollie so the numbers are credible.",
        duration: 5,
      },
    ],
  },
  26: {
    assetNumber: 26,
    title: "Spinout Legal Pack",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Spinout Legal Pack",
        body: "Legal foundation for the standalone company: DPAs, AI terms, training rights, IP, security.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "Is the legal foundation ready for a standalone entity and enterprise customers?",
        body: "First principle: spinout = DPAs (data processing), AI usage terms, training rights, IP assignment, security policies. All in place so you can sign customers and raise without legal blocking.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Legal that unblocked",
        example: {
          company: "Spinouts and enterprise SaaS",
          quote:
            "The companies that closed enterprise deals had DPAs and AI terms ready. The ones that didn't lost deals in legal. Get the templates right once. Use them everywhere.",
          takeaway:
            "Legal pack isn't optional. It's the price of entry for enterprise and for clean cap table. Do it before you need it.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build the legal foundation",
        items: [
          "DPAs — Data processing agreements. Template ready. Customer-specific annexes.",
          "AI usage terms — What you do with their data. Inference, training, retention. Clear.",
          "Training rights — From Asset #12. Reflected in customer contracts.",
          "IP assignment — Who owns what. Founder, company, customer. Documented.",
          "Security policies — From Asset #11. Formalised for the standalone entity.",
          "Legal review — Counsel signs off. Then you're ready to operate and scale.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Legal pack = speed",
        body: "When legal is ready, you close faster. When it's not, every deal and every round gets delayed. Invest in the pack.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #26 and complete your legal pack",
        body: "DPAs, AI terms, training rights, IP, security. Legal review. Then you're ready for spinout and scale.",
        duration: 5,
      },
    ],
  },
  27: {
    assetNumber: 27,
    title: "Exit Map",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Exit Map",
        body: "Who might buy you, why, and what proof they need. Not fantasy — logic.",
        duration: 4,
      },
      {
        type: "callout",
        label: "THE REAL QUESTION",
        heading: "If you had to name 5 potential acquirers and why they'd care, could you?",
        body: "First principle: exit = acquirer logic (why would they buy?), proof of defensibility (data rights, eval superiority, workflow control). Map it. Get it reviewed. So when the time comes, you're not guessing.",
        duration: 7,
      },
      {
        type: "example",
        label: "REAL WORLD",
        heading: "Exit map that aligned the board",
        example: {
          company: "Acquired companies",
          quote:
            "The best exits were thought through early: who are the logical buyers, what do they need to see, and how do we build toward that. Not a slide — a real map with evidence.",
          takeaway:
            "Exit map isn't about selling tomorrow. It's about building the proof that makes you acquirable. Data rights, eval, workflow — your moat ledger is the source.",
        },
        duration: 8,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Map your exit from first principles",
        items: [
          "Top 5 potential acquirers — Who has the strategic reason to buy you? List them.",
          "Acquirer logic for each — Why would they buy? What do they get? What's the fit?",
          "Proof of data rights defensibility — From Asset #12 and #13. Can you show it?",
          "Proof of eval superiority — Your system is better because of X. Evidence.",
          "Workflow control and switching costs — How embedded are you? What's the cost to switch?",
          "Get it reviewed — Board or advisors. Stress-test the logic. Update as you grow.",
        ],
        duration: 10,
      },
      {
        type: "insight",
        label: "KEY INSIGHT",
        heading: "Exit map = building toward an outcome",
        body: "You're not selling today. You're building so that when the right buyer appears, you have the proof and the story. The exit map keeps you honest.",
        duration: 6,
      },
      {
        type: "action",
        heading: "Open Asset #27 and complete your exit map",
        body: "Acquirers, logic, data rights, eval, workflow. Review with board. You've completed the 27-asset framework. Book a final review with Ollie to pressure-test the full story.",
        duration: 6,
      },
    ],
  },
  // ─── Customer path / skills lessons (custom modules 101–105) ───
  101: {
    assetNumber: 101,
    title: "Website Build",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Website Build",
        body: "A clear, credible web presence that communicates your venture and converts visitors.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Does your website instantly tell a visitor what you do, why it matters, and what to do next?",
        body: "Early-stage sites should be simple: one clear message, one primary action. No clutter.",
        duration: 6,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your v1 site",
        items: [
          "Define your core message and value proposition in one sentence.",
          "Design a simple, scannable layout — hero, problem/solution, proof or social proof, CTA.",
          "Add one clear primary CTA: contact, waitlist, or demo.",
          "Launch and share with early contacts; iterate from real feedback.",
        ],
        duration: 10,
      },
      {
        type: "action",
        heading: "Open Module 101 in the Content Library",
        body: "Use the checklist to ship a site that works for your stage.",
        duration: 4,
      },
    ],
  },
  102: {
    assetNumber: 102,
    title: "Pitch Deck Build",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Pitch Deck Build",
        body: "A concise, compelling deck that tells your story and supports fundraising or partnerships.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Can an investor or partner understand your problem, solution, traction, and ask in under 10 slides?",
        body: "Every slide should earn its place. Cut anything that doesn't drive the narrative.",
        duration: 6,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your pitch deck",
        items: [
          "Problem, solution, and why now — the opening hook.",
          "Market size and opportunity — show you're playing in a real space.",
          "Product and traction — what you've built and what you've proven.",
          "Team and ask — who you are and what you need.",
          "Rehearse and time it — 10–12 minutes max for the full story.",
        ],
        duration: 10,
      },
      {
        type: "action",
        heading: "Open Module 102 in the Content Library",
        body: "Use the checklist to create and refine your deck.",
        duration: 4,
      },
    ],
  },
  103: {
    assetNumber: 103,
    title: "V1 Commercials",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "V1 Commercials",
        body: "Short, repeatable scripts that explain what you do and why it matters.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Can you explain your venture in 30 seconds in a way that creates curiosity or commitment?",
        body: "Commercials are for every conversation — sales, networking, and investor chats.",
        duration: 6,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Craft and test your commercials",
        items: [
          "Write 30-second and 60-second scripts: hook, problem, solution, proof, CTA.",
          "Structure: what you do, for whom, and why it matters — then one clear next step.",
          "Test with real conversations; note where people lean in or glaze over.",
          "Record yourself and iterate until it feels natural and consistent.",
        ],
        duration: 10,
      },
      {
        type: "action",
        heading: "Open Module 103 in the Content Library",
        body: "Use the checklist to lock in your v1 commercials.",
        duration: 4,
      },
    ],
  },
  104: {
    assetNumber: 104,
    title: "Sales and Closing",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "Sales and Closing",
        body: "Qualify leads, run discovery, handle objections, and close early customers.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Do you have a repeatable process to move a prospect from first touch to signed customer?",
        body: "Early sales are about learning and pattern-building, not just revenue.",
        duration: 6,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Build your sales motion",
        items: [
          "Define ICP and qualification criteria — who is in, who is out.",
          "Design discovery and demo flow — what you ask, what you show, in what order.",
          "Prepare objection handling and pricing — how you respond and what you charge.",
          "Close and onboarding — next steps, contract, and first value delivered.",
        ],
        duration: 10,
      },
      {
        type: "action",
        heading: "Open Module 104 in the Content Library",
        body: "Use the checklist to build a repeatable sales process.",
        duration: 4,
      },
    ],
  },
  105: {
    assetNumber: 105,
    title: "How to Talk to Investors",
    totalDuration: "2 min",
    scenes: [
      {
        type: "title",
        heading: "How to Talk to Investors",
        body: "Prepare for investor conversations: narrative, metrics, and closing.",
        duration: 4,
      },
      {
        type: "callout",
        label: "CORE QUESTION",
        heading:
          "Can you clearly explain your opportunity, progress, and use of capital in investor language?",
        body: "Investors back conviction and clarity. Your job is to make the case obvious.",
        duration: 6,
      },
      {
        type: "steps",
        label: "YOUR TASK",
        heading: "Get investor-ready",
        items: [
          "Investment story and use of funds — what you're raising and what it buys.",
          "Key metrics and milestones — what you track and what you'll prove.",
          "Term sheet basics and red lines — what you will and won't accept.",
          "Follow-up and closing process — how you move from meeting to signed round.",
        ],
        duration: 10,
      },
      {
        type: "action",
        heading: "Open Module 105 in the Content Library",
        body: "Use the checklist to prepare and close investor conversations.",
        duration: 4,
      },
    ],
  },
  106: {
    assetNumber: 106,
    title: "Content Build",
    totalDuration: "12–18 min (video)",
    scenes: [
      {
        type: "title",
        heading: "Content Build",
        body: "Setup path, customer-led iteration, and funnel fundamentals so your site drives Demos and sign ups.",
        duration: 4,
      },
      {
        type: "callout",
        label: "SETUP PATH",
        heading: "Claude → Git → Design → Vercel → Domain",
        body: "One repeatable path: brief and copy in a Claude space, code in Git, simple design (one story, one CTA), deploy on Vercel, then point a domain you own.",
        duration: 8,
      },
      {
        type: "callout",
        label: "ITERATION",
        heading: "What does the customer need to understand?",
        body: "Use interviews and demos to find gaps. Where they ask 'What do you mean?' or 'How does that work?' — add or tighten copy and structure so the site teaches that before the CTA.",
        duration: 8,
      },
      {
        type: "callout",
        label: "FUNNEL",
        heading: "One action: Demos or sign ups",
        body: "At this stage the site's job is to get visitors to one primary action. Measure: visits → CTA clicks → completions. Hero, proof, and CTA aligned; fix the biggest drop.",
        duration: 8,
      },
      {
        type: "action",
        heading: "Watch the full Content Build video",
        body: "See the full script in docs/content-build-video-script.md. Record as Loom and link via asset media. Use the checklist to ship and iterate.",
        duration: 4,
      },
    ],
  },
};

/** Get lesson data for a specific asset, or undefined if none exists */
export function getLessonForAsset(
  assetNumber: number
): AnimatedLessonData | undefined {
  return lessons[assetNumber];
}
