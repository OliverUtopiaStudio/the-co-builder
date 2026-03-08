"use server";

import { postMessage } from "@/lib/slack/client";

const FEEDBACK_CHANNEL = "C0AK87MUR18";

interface FeatureRequestPayload {
  name: string;
  title: string;
  description: string;
  priority: "nice-to-have" | "important" | "critical";
}

export async function submitFeatureRequest(payload: FeatureRequestPayload) {
  const { name, title, description, priority } = payload;

  if (!name.trim()) {
    return { ok: false, error: "Name is required" };
  }
  if (!title.trim()) {
    return { ok: false, error: "Feature title is required" };
  }
  if (!description.trim()) {
    return { ok: false, error: "Please describe the feature" };
  }

  const priorityEmoji =
    priority === "critical"
      ? ":rotating_light:"
      : priority === "important"
        ? ":star:"
        : ":sparkles:";

  const blocks: string[] = [];
  blocks.push(
    `${priorityEmoji} *Feature Request from ${name.trim()}*  \u2022  \`${priority}\``
  );
  blocks.push("");
  blocks.push(`*${title.trim()}*`);
  blocks.push(description.trim());

  try {
    const result = await postMessage(FEEDBACK_CHANNEL, blocks.join("\n"));
    if (!result.ok) {
      console.error("Slack postMessage failed:", result.error);
      return { ok: false, error: "Failed to send feature request" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Feature request submission error:", err);
    return { ok: false, error: "Failed to send feature request" };
  }
}
