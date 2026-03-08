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
};

/** Get lesson data for a specific asset, or undefined if none exists */
export function getLessonForAsset(
  assetNumber: number
): AnimatedLessonData | undefined {
  return lessons[assetNumber];
}
