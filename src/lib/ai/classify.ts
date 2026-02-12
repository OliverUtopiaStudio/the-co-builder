import Anthropic from "@anthropic-ai/sdk";
import { stages } from "@/lib/data";

export interface ClassificationResult {
  assetNumber: number;
  checklistItemId: string | null;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  confidence: number;
  reasoning: string;
}

/**
 * Build a compact reference of the 27-asset Co-Build framework
 * that Claude can use to classify Slack messages.
 */
function buildAssetReference(): string {
  const lines: string[] = [];
  for (const stage of stages) {
    lines.push(`\n## Stage ${stage.number}: ${stage.title}`);
    lines.push(`${stage.subtitle}`);
    for (const asset of stage.assets) {
      lines.push(`\n### Asset #${asset.number}: ${asset.title}`);
      lines.push(`Purpose: ${asset.purpose}`);
      if (asset.checklist.length > 0) {
        lines.push("Checklist:");
        for (const item of asset.checklist) {
          lines.push(`  - [${item.id}] ${item.text}`);
        }
      }
    }
  }
  return lines.join("\n");
}

// Cache the reference so we don't rebuild it on every classification
let _assetReference: string | null = null;
function getAssetReference(): string {
  if (!_assetReference) {
    _assetReference = buildAssetReference();
  }
  return _assetReference;
}

/**
 * Use Claude to classify a Slack message against the 27-asset framework.
 *
 * Returns which asset (1-27) the message relates to, an optional checklist
 * item it maps to, a short task title, priority, and confidence score.
 */
export async function classifyMessage(
  messageText: string,
  userName: string,
  channelName: string
): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  const prompt = `You are a Co-Build framework classification assistant. Given a Slack message from a startup team, determine which of the 27 Co-Build assets it most relates to, and extract an actionable task.

## The Co-Build Framework
${getAssetReference()}

## Slack Message Context
Channel: #${channelName}
Author: ${userName}
Message: "${messageText}"

## Your Task
Analyze this message and determine:
1. Which asset (1-27) this message most relates to
2. If there's a specific checklist item it maps to (use the ID like "1-1", "7-2", etc.), or null if no direct match
3. A short, actionable task title (max 100 chars) extracted from the message
4. Priority: "low" (informational), "medium" (should do), "high" (important action), "urgent" (blocking/time-sensitive)
5. Confidence score (0-100) for your classification
6. Brief reasoning (1-2 sentences)

Respond with ONLY a JSON object in this exact format:
{
  "assetNumber": <number 1-27>,
  "checklistItemId": <string like "1-1" or null>,
  "title": "<actionable task title>",
  "priority": "<low|medium|high|urgent>",
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  // Extract text from response
  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Parse JSON from response (handle potential markdown code blocks)
    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(jsonStr) as ClassificationResult;

    // Validate and clamp values
    result.assetNumber = Math.max(1, Math.min(27, result.assetNumber));
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    if (!["low", "medium", "high", "urgent"].includes(result.priority)) {
      result.priority = "medium";
    }

    return result;
  } catch (err) {
    console.error("Failed to parse AI classification:", err, text);
    // Fallback: return a low-confidence generic result
    return {
      assetNumber: 1,
      checklistItemId: null,
      title: messageText.slice(0, 100),
      priority: "medium",
      confidence: 10,
      reasoning: "Failed to parse AI response — manual classification needed.",
    };
  }
}
