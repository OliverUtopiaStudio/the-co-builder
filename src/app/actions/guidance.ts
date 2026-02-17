"use server";

import { db } from "@/db";
import { fellows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  getAssetGuidance,
  getExperienceExample,
  getAssetResources,
  getAdaptiveDescription,
  type ResourceRecommendation,
} from "@/lib/guidance";
import { stages, type Asset } from "@/lib/data";
import type { ExperienceProfile } from "@/lib/onboarding";

export interface AssetGuidanceResponse {
  overview: string;
  stepByStep: string[];
  examples: string[];
  resources: ResourceRecommendation[];
  adaptiveDescriptions: Record<string, string>;
}

export interface OnboardingStepGuidanceResponse {
  overview: string;
  stepByStep: string[];
  examples: string[];
  resources: ResourceRecommendation[];
}

/**
 * Get experience profile for a fellow
 */
async function getFellowExperienceProfile(fellowId: string): Promise<ExperienceProfile | null> {
  const [fellow] = await db
    .select({ experienceProfile: fellows.experienceProfile })
    .from(fellows)
    .where(eq(fellows.id, fellowId))
    .limit(1);

  return (fellow?.experienceProfile as ExperienceProfile) || null;
}

/**
 * Get guidance for a specific asset, adapted to fellow's experience profile
 */
export async function getGuidanceForAsset(
  fellowId: string,
  assetNumber: number
): Promise<AssetGuidanceResponse | null> {
  const experienceProfile = await getFellowExperienceProfile(fellowId);
  if (!experienceProfile) {
    return null;
  }

  // Get asset info
  let asset: Asset | null = null;
  for (const stage of stages) {
    for (const a of stage.assets) {
      if (a.number === assetNumber) {
        asset = a;
        break;
      }
    }
    if (asset) break;
  }

  if (!asset) {
    return null;
  }

  // Build overview from asset purpose and guidance
  const guidanceText = getAssetGuidance(experienceProfile, assetNumber);
  const overview = guidanceText || asset.purpose || "";

  // Build step-by-step from checklist
  const stepByStep = asset.checklist.map((item) => item.text);

  // Get examples for this asset
  const examples: string[] = [];
  // Note: Examples are question-specific, so we'll include general guidance examples
  if (guidanceText) {
    examples.push(guidanceText);
  }

  // Get resources
  const resources = getAssetResources(experienceProfile, assetNumber);

  // Get adaptive descriptions for questions in this asset
  const adaptiveDescriptions: Record<string, string> = {};
  // This would be populated from question-specific adaptive descriptions
  // For now, we'll return empty and populate per-question when needed

  return {
    overview,
    stepByStep,
    examples,
    resources,
    adaptiveDescriptions,
  };
}

/**
 * Get guidance for an onboarding step, adapted to fellow's experience profile
 */
export async function getGuidanceForStep(
  fellowId: string,
  step: string
): Promise<OnboardingStepGuidanceResponse | null> {
  const experienceProfile = await getFellowExperienceProfile(fellowId);
  if (!experienceProfile) {
    return null;
  }

  // Map onboarding steps to guidance content
  const stepGuidance: Record<string, Record<ExperienceProfile, { overview: string; stepByStep: string[] }>> = {
    toolstack: {
      first_time_builder: {
        overview: "Set up the tools you'll use to build your venture. Don't worry if you're new to these — we'll guide you through each one.",
        stepByStep: [
          "Install Claude Desktop for AI assistance",
          "Set up Git and GitHub for version control",
          "Learn markdown basics for documentation",
          "Configure your development environment",
        ],
      },
      experienced_founder: {
        overview: "Configure your toolstack. You likely know these tools — this is just ensuring they're set up for this programme.",
        stepByStep: [
          "Install Claude Desktop",
          "Verify Git/GitHub access",
          "Review markdown workflow",
          "Confirm development environment",
        ],
      },
      corporate_innovator: {
        overview: "Set up startup tools. These may differ from corporate tools — focus on speed and simplicity over enterprise features.",
        stepByStep: [
          "Install Claude Desktop (replaces corporate AI tools)",
          "Set up Git/GitHub (simpler than corporate version control)",
          "Learn markdown (faster than Word docs)",
          "Configure lightweight dev environment",
        ],
      },
    },
    computeBudget: {
      first_time_builder: {
        overview: "You have $4,000 in compute budget. This covers AI tools, hosting, APIs, and design tools. We'll help you allocate it wisely.",
        stepByStep: [
          "Review recommended allocation: Claude Max ~$1,200, hosting ~$600, APIs ~$800, design ~$400, flexible ~$1,000",
          "Understand this is guidance, not enforced",
          "Plan your tool usage accordingly",
        ],
      },
      experienced_founder: {
        overview: "You have $4,000 compute budget. Allocate based on your needs — you know how to manage tool costs.",
        stepByStep: [
          "Review recommended allocation",
          "Adjust based on your venture's needs",
          "Plan tool usage",
        ],
      },
      corporate_innovator: {
        overview: "You have $4,000 compute budget. This is different from corporate IT budgets — you'll manage it yourself and need to be cost-conscious.",
        stepByStep: [
          "Review recommended allocation",
          "Understand startup tool costs vs. corporate",
          "Plan for cost efficiency",
        ],
      },
    },
    frameworkIntro: {
      first_time_builder: {
        overview: "The Co-Build framework has 7 stages and 27 assets. Each asset guides you through building a specific part of your venture. Take your time to understand the structure.",
        stepByStep: [
          "Review the 7 stages overview",
          "Understand how assets build on each other",
          "See how progress is tracked",
          "Ask questions if anything is unclear",
        ],
      },
      experienced_founder: {
        overview: "The Co-Build framework: 7 stages, 27 assets. You'll move through these systematically. Familiarize yourself with the structure.",
        stepByStep: [
          "Review stages and assets",
          "Understand the progression",
          "Note any programme-specific requirements",
        ],
      },
      corporate_innovator: {
        overview: "The Co-Build framework: 7 stages, 27 assets. This replaces corporate project management — think of it as your venture-building roadmap.",
        stepByStep: [
          "Review the framework structure",
          "Understand how it differs from corporate processes",
          "See how it guides your venture journey",
        ],
      },
    },
  };

  const guidance = stepGuidance[step]?.[experienceProfile];
  if (!guidance) {
    return null;
  }

  // Get resources for this step
  const resources: ResourceRecommendation[] = [];
  // Add step-specific resources here if needed

  return {
    overview: guidance.overview,
    stepByStep: guidance.stepByStep,
    examples: [],
    resources,
  };
}

/**
 * Get adaptive description for a specific question
 */
export async function getAdaptiveQuestionDescription(
  fellowId: string,
  assetNumber: number,
  questionId: string
): Promise<string | null> {
  const experienceProfile = await getFellowExperienceProfile(fellowId);
  if (!experienceProfile) {
    return null;
  }

  return getAdaptiveDescription(assetNumber, questionId, experienceProfile);
}

/**
 * Get experience example for a specific question
 */
export async function getExperienceQuestionExample(
  fellowId: string,
  assetNumber: number,
  questionId: string
): Promise<string | null> {
  const experienceProfile = await getFellowExperienceProfile(fellowId);
  if (!experienceProfile) {
    return null;
  }

  return getExperienceExample(assetNumber, questionId, experienceProfile);
}
