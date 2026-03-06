/**
 * Becoming Limitless — Fellow guide for psyche and abilities.
 * Add new topics by appending to limitlessTopics; each card links to a detail page with text + video links.
 */

export interface LimitlessVideoLink {
  label: string;
  url: string;
}

export interface LimitlessTopic {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  /** Full content for the detail page (plain text or simple HTML/markdown as needed) */
  body: string;
  videoLinks: LimitlessVideoLink[];
}

export const limitlessTopics: LimitlessTopic[] = [
  {
    id: "curiosity-inspiration",
    slug: "curiosity-inspiration",
    title: "Curiosity & Inspiration",
    shortDescription: "Cultivate curiosity and find lasting sources of inspiration.",
    body: `Curiosity and inspiration are the fuel for building something meaningful. This section helps you:

• Stay curious about problems and people — ask "why" and "what if" without judgment.
• Find inspiration in constraints, not just in success stories.
• Build habits that keep you open to new ideas (reading, conversations, observation).
• Connect your work to something you genuinely care about so motivation sustains.

Use the resources below to deepen your practice.`,
    videoLinks: [],
  },
  {
    id: "invention",
    slug: "invention",
    title: "Invention",
    shortDescription: "From idea to invention — making something that didn't exist before.",
    body: `Invention is the act of creating something new that matters. Here we focus on:

• Moving from "interesting idea" to "invented solution" — clarity of what you're actually building.
• Distinguishing invention from iteration: what is genuinely new vs. incremental?
• Protecting and communicating your invention (IP, narrative, moat).
• Learning from inventors: how they think, prototype, and persist.

Explore the links below for frameworks and examples.`,
    videoLinks: [],
  },
  {
    id: "bias-to-action",
    slug: "bias-to-action",
    title: "Bias to Action",
    shortDescription: "Ship fast, learn fast — overcome overthinking and perfectionism.",
    body: `A bias to action means preferring to do and learn over to plan and perfect. This topic covers:

• Why "done is better than perfect" — and when it's safe to ship rough.
• Breaking big goals into small, shippable steps.
• Dealing with fear of failure and fear of judgment.
• Building a personal system that rewards action (time-boxing, accountability, deadlines).

Videos and resources below will help you build this muscle.`,
    videoLinks: [],
  },
  {
    id: "pitching-storytelling",
    slug: "pitching-storytelling",
    title: "Pitching & Storytelling",
    shortDescription: "Tell your story so others see the opportunity and want to help.",
    body: `Pitching and storytelling turn your work into something others can believe in and support. Topics include:

• Structure of a great pitch: problem, solution, proof, ask.
• Storytelling for different audiences (investors, partners, customers, team).
• Making the complex simple — no jargon, clear stakes, emotional hook.
• Practice: feedback loops, recording yourself, iterating on the narrative.

Use the resources below to sharpen your pitch and story.`,
    videoLinks: [],
  },
  {
    id: "systems-design",
    slug: "systems-design",
    title: "Systems Design & Requirements",
    shortDescription: "Good requirements, simple highest-leverage solutions, and pruning what you don't need.",
    body: `Strong systems come from clear requirements and the discipline to keep solutions simple. This section covers:

• Writing good requirements — testable, unambiguous, and traceable to outcomes.
• Finding the highest-leverage solution: what one thing, if fixed, changes everything?
• Simplifying: always go back and delete elements that don't earn their place.
• Avoiding over-engineering: start with the smallest system that works, then evolve.

Videos and readings below will deepen your systems thinking.`,
    videoLinks: [],
  },
  {
    id: "resilience",
    slug: "resilience",
    title: "Resilience & Infinite Energy Cycles",
    shortDescription: "Create sustainable energy cycles so you can keep going without burning out.",
    body: `Resilience is not about pushing harder — it's about designing cycles that restore energy. Topics include:

• What drains you vs. what restores you — mapping your own energy.
• Building "infinite energy cycles": habits and environments that refill the tank.
• Recovery as part of the system (sleep, boundaries, saying no).
• Mental models for setbacks: learning, pivoting, and continuing without collapse.

Explore the resources below to build your personal resilience system.`,
    videoLinks: [],
  },
  {
    id: "organising-yourself",
    slug: "organising-yourself",
    title: "Organising Yourself",
    shortDescription: "Systems and habits to stay on top of priorities and execution.",
    body: `Organising yourself is the foundation for everything else. This topic covers:

• Prioritisation: what matters most, and how to say no to the rest.
• Time and task systems that work (calendars, lists, batching, reviews).
• Reducing cognitive load: fewer decisions, more automation and defaults.
• Aligning your organisation with your goals so structure supports progress.

Use the links below to refine how you organise your work and life.`,
    videoLinks: [],
  },
];

/** Get a topic by slug for detail pages */
export function getLimitlessTopicBySlug(slug: string): LimitlessTopic | undefined {
  return limitlessTopics.find((t) => t.slug === slug);
}
