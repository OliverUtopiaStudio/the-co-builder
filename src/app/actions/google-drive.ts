"use server";

import { db } from "@/db";
import { ventures, fellows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { extractFolderId, createFile, updateFile } from "@/lib/google-drive";

/**
 * Save asset response to Google Drive
 */
export async function saveAssetToDrive(
  ventureId: string,
  assetNumber: number,
  assetTitle: string,
  responses: Record<string, unknown>
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify access to venture
    const [venture] = await db
      .select({
        venture: ventures,
        fellow: fellows,
      })
      .from(ventures)
      .innerJoin(fellows, eq(ventures.fellowId, fellows.id))
      .where(
        and(
          eq(ventures.id, ventureId),
          eq(fellows.authUserId, user.id)
        )
      )
      .limit(1);

    if (!venture) {
      return { success: false, error: "Venture not found" };
    }

    const googleDriveUrl = venture.venture.googleDriveUrl;
    if (!googleDriveUrl) {
      return { success: false, error: "Google Drive folder not configured" };
    }

    const folderId = extractFolderId(googleDriveUrl);
    if (!folderId) {
      return { success: false, error: "Invalid Google Drive URL" };
    }

    // Get access token from environment
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (!accessToken) {
      return { success: false, error: "Google Drive API not configured" };
    }

    // Format responses as markdown
    const markdownContent = formatResponsesAsMarkdown(assetNumber, assetTitle, responses);

    // Create or update file
    const fileName = `Asset ${assetNumber.toString().padStart(2, "0")} - ${assetTitle}.md`;
    
    try {
      // Try to create new file
      const file = await createFile(
        folderId,
        fileName,
        markdownContent,
        "text/markdown",
        accessToken
      );
      
      return { success: true, fileUrl: file.webViewLink };
    } catch (error) {
      // If file exists, we might want to update it instead
      // For now, return error
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save to Google Drive",
      };
    }
  } catch (error) {
    console.error("Error saving to Google Drive:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save to Google Drive",
    };
  }
}

/**
 * Format responses as markdown document
 */
function formatResponsesAsMarkdown(
  assetNumber: number,
  assetTitle: string,
  responses: Record<string, unknown>
): string {
  const lines = [
    `# Asset ${assetNumber}: ${assetTitle}`,
    "",
    `**Generated:** ${new Date().toLocaleString()}`,
    "",
    "---",
    "",
  ];

  for (const [questionId, value] of Object.entries(responses)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const questionTitle = formatQuestionId(questionId);
    lines.push(`## ${questionTitle}`, "");

    if (typeof value === "string") {
      lines.push(value);
    } else if (Array.isArray(value)) {
      lines.push(...value.map((item) => `- ${item}`));
    } else if (typeof value === "object") {
      lines.push("```json");
      lines.push(JSON.stringify(value, null, 2));
      lines.push("```");
    } else {
      lines.push(String(value));
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format question ID as readable title
 */
function formatQuestionId(questionId: string): string {
  // Convert snake_case or camelCase to Title Case
  return questionId
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
