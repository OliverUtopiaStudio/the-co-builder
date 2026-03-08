/**
 * Animated Lesson content — v1 video replacements for the content library.
 *
 * Each lesson maps to an asset number and contains scenes that auto-play
 * as an animated walkthrough. Optimised for short, impactful messaging
 * with real-world examples and clear task-completion steps.
 */

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
};

/** Get lesson data for a specific asset, or undefined if none exists */
export function getLessonForAsset(
  assetNumber: number
): AnimatedLessonData | undefined {
  return lessons[assetNumber];
}
