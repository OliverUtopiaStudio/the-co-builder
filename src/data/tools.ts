import type { ToolDefinition, TrainingVideo } from "@/types/tools";

/**
 * Tool definitions for the Co-Build Tools page.
 * Each tool has a test project with step-by-step instructions.
 */
export const tools: ToolDefinition[] = [
  {
    name: "Claude",
    tagline: "AI reasoning partner",
    description:
      "Anthropic's frontier AI model. Use Claude for strategy documents, market analysis, financial modelling, and working through complex venture decisions. Claude excels at long-form reasoning and nuanced analysis.",
    features: [
      "Draft and refine your 27 Co-Build assets",
      "Analyse market data and competitive landscapes",
      "Stress-test business models and assumptions",
      "Generate investor-ready documents",
    ],
    url: "https://claude.ai",
    color: "#CC7832",
    initial: "C",
    testProject: {
      title: "Draft a 1-page venture brief",
      steps: [
        {
          title: "Open Claude",
          instruction:
            "Go to claude.ai and start a new conversation. Select the most capable model available.",
        },
        {
          title: "Set the context",
          instruction:
            'Paste this prompt: "You are helping me draft a 1-page venture brief. The venture is in [your industry]. The core problem we\'re solving is [describe the problem]. Ask me 5 clarifying questions before drafting."',
        },
        {
          title: "Answer the questions",
          instruction:
            "Claude will ask about your target customer, market size, competitive landscape, and proposed solution. Answer each one — even rough answers are fine at this stage.",
        },
        {
          title: "Generate the brief",
          instruction:
            'Ask Claude to "Now write a 1-page venture brief covering: Problem, Solution, Target Customer, Market Size, and Why Now." Review the output.',
        },
        {
          title: "Iterate and sharpen",
          instruction:
            'Pick the weakest section and say "The [section] is too vague. Make it more specific using [this data point or insight]." Repeat until every section is crisp.',
        },
        {
          title: "Export your brief",
          instruction:
            "Copy the final brief into your Co-Build Asset #1 (Problem Statement) or save it as a Google Doc for your venture folder.",
        },
      ],
    },
  },
  {
    name: "Cursor",
    tagline: "AI-native code editor",
    description:
      "The IDE built for building with AI. Cursor lets you write, edit, and debug code using natural language. Essential for fellows building technical prototypes and MVPs.",
    features: [
      "Build prototypes and MVPs rapidly",
      "Generate full-stack applications from specs",
      "Debug and refactor with AI assistance",
      "Pair-program with Claude directly in the editor",
    ],
    url: "https://cursor.com",
    color: "#6366F1",
    initial: "Cu",
    testProject: {
      title: "Build a landing page in 15 minutes",
      steps: [
        {
          title: "Install Cursor",
          instruction:
            "Download Cursor from cursor.com. Open it and sign in. It looks like VS Code — if you've used that, you're already home.",
        },
        {
          title: "Create a new project folder",
          instruction:
            'Open Cursor, go to File → Open Folder, create a new folder called "my-landing-page", and open it.',
        },
        {
          title: "Open Composer",
          instruction:
            "Press Cmd+I (Mac) or Ctrl+I (Windows) to open Cursor's AI Composer. This is where you talk to the AI to generate code.",
        },
        {
          title: "Describe your landing page",
          instruction:
            'Type: "Create an index.html file with a modern landing page for [your venture name]. Include a hero section with headline and subheadline, a 3-column feature grid, and a call-to-action button. Use clean CSS with a dark theme."',
        },
        {
          title: "Preview the result",
          instruction:
            'Right-click the generated index.html file and select "Open with Live Server" or simply open it in your browser (File → Open File). You should see a working landing page.',
        },
        {
          title: "Iterate with natural language",
          instruction:
            'Select any section in the code, press Cmd+K, and type changes like "make the headline bigger" or "change the CTA colour to terracotta". Watch the code update in real-time.',
        },
      ],
    },
  },
  {
    name: "Git & GitHub",
    tagline: "Version control & collaboration",
    description:
      "The industry standard for code management. Git tracks every change to your codebase, and GitHub hosts your repositories, manages pull requests, and enables team collaboration.",
    features: [
      "Track all code changes with full history",
      "Collaborate with co-founders and engineers",
      "Manage releases and deployment pipelines",
      "Review code through pull requests",
    ],
    url: "https://github.com",
    color: "#F0F0F0",
    initial: "Gi",
    testProject: {
      title: "Push your first repo to GitHub",
      steps: [
        {
          title: "Create a GitHub account",
          instruction:
            "Go to github.com and sign up. Choose the free plan — it's all you need.",
        },
        {
          title: "Install Git",
          instruction:
            'Open your terminal (Terminal on Mac, Command Prompt on Windows). Type "git --version". If it shows a version number, you\'re set. If not, download Git from git-scm.com.',
        },
        {
          title: "Initialise your project",
          instruction:
            'Navigate to your project folder in the terminal: "cd my-landing-page". Then run "git init" to start tracking changes.',
        },
        {
          title: "Make your first commit",
          instruction:
            'Run these three commands:\n"git add ." (stages all files)\n"git commit -m \'Initial commit: landing page\'" (saves a snapshot)\nYou now have version control.',
        },
        {
          title: "Create a GitHub repository",
          instruction:
            'Go to github.com/new. Name it "my-landing-page", keep it public or private, and click "Create repository". Don\'t add a README — you already have files.',
        },
        {
          title: "Push to GitHub",
          instruction:
            'Copy the commands GitHub shows under "push an existing repository" and paste them in your terminal. Refresh the GitHub page — your code is now live in the cloud.',
        },
      ],
    },
  },
];

/**
 * Default training videos. Add Loom videos here as they're created.
 * Videos can also be added at runtime via the AddVideoForm component.
 */
export const defaultTrainingVideos: TrainingVideo[] = [
  // {
  //   id: "1",
  //   title: "Getting Started with Claude",
  //   description: "How to use Claude to draft your first Co-Build asset",
  //   loomId: "your-loom-video-id-here",
  //   duration: "8 min",
  //   category: "Claude",
  // },
];
