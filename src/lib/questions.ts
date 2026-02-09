// ─── Question System Types ─────────────────────────────────────

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "number"
  | "url"
  | "file"
  | "table"
  | "checklist"
  | "rating"
  | "date";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: QuestionOption[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  columns?: TableColumn[];
  maxRows?: number;
  accept?: string;
  maxFiles?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface AssetWorkflow {
  assetNumber: number;
  steps: WorkflowStep[];
}

// ─── Import all stage question definitions ─────────────────────
import { stage00Workflows } from "./questions/stage-00";
import { stage01Workflows } from "./questions/stage-01";
import { stage02Workflows } from "./questions/stage-02";
import { stage03Workflows } from "./questions/stage-03";
import { stage04Workflows } from "./questions/stage-04";
import { stage05Workflows } from "./questions/stage-05";
import { stage06Workflows } from "./questions/stage-06";

export const allWorkflows: AssetWorkflow[] = [
  ...stage00Workflows,
  ...stage01Workflows,
  ...stage02Workflows,
  ...stage03Workflows,
  ...stage04Workflows,
  ...stage05Workflows,
  ...stage06Workflows,
];

export function getWorkflowForAsset(assetNumber: number): AssetWorkflow | undefined {
  return allWorkflows.find((w) => w.assetNumber === assetNumber);
}

export function getTotalRequiredQuestions(workflow: AssetWorkflow): number {
  return workflow.steps.reduce(
    (total, step) => total + step.questions.filter((q) => q.required).length,
    0
  );
}

export function getStepRequiredQuestions(step: WorkflowStep): number {
  return step.questions.filter((q) => q.required).length;
}
