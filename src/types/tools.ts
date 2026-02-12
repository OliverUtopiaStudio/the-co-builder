/** A single step in a test project walkthrough */
export interface TestStep {
  title: string;
  instruction: string;
}

/** A test project associated with a tool */
export interface TestProjectData {
  title: string;
  steps: TestStep[];
}

/** A training video embedded from Loom */
export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  loomId: string;
  duration?: string;
  category: string;
}

/** A tool card displayed on the Co-Build Tools page */
export interface ToolDefinition {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  url: string;
  /** Accent color — used for strip, badges, progress bar */
  color: string;
  /** 1-2 character initial shown in the color strip */
  initial: string;
  testProject: TestProjectData;
}
