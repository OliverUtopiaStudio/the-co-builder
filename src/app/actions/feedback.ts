"use server";

import { postMessage } from "@/lib/slack/client";

const FEEDBACK_CHANNEL = "C0AK87MUR18";

interface FeedbackPayload {
  name: string;
  likes: string;
  dislikes: string;
  featureIdeas: string;
}

function detectFeedbackType(
  likes: string,
  dislikes: string,
  featureIdeas: string
): "bug" | "feature_request" | "other" {
  if (featureIdeas.trim()) return "feature_request";
  if (dislikes.trim()) return "bug";
  return "other";
}

async function sendToValidator(payload: FeedbackPayload): Promise<void> {
  const url = process.env.SF_VALIDATOR_FEEDBACK_URL;
  const appKey = process.env.SF_VALIDATOR_APP_KEY;
  if (!url || !appKey) {
    console.warn("Validator env vars not set, skipping feedback forwarding");
    return;
  }

  const sections: string[] = [];
  if (payload.likes.trim())
    sections.push(`What they like: ${payload.likes.trim()}`);
  if (payload.dislikes.trim())
    sections.push(`What they dislike: ${payload.dislikes.trim()}`);
  if (payload.featureIdeas.trim())
    sections.push(`Feature ideas: ${payload.featureIdeas.trim()}`);

  const description = `Feedback from ${payload.name.trim()} (via /feedback)\n\n${sections.join("\n\n")}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Key": appKey,
      },
      body: JSON.stringify({
        description,
        feedback_type: detectFeedbackType(
          payload.likes,
          payload.dislikes,
          payload.featureIdeas
        ),
        priority: "medium",
        user_email: null,
      }),
    });

    if (!res.ok) {
      console.error("Validator feedback failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Validator feedback error:", err);
  }
}

export async function submitFeedback(payload: FeedbackPayload) {
  const { name, likes, dislikes, featureIdeas } = payload;

  if (!name.trim()) {
    return { ok: false, error: "Name is required" };
  }

  const hasContent = likes.trim() || dislikes.trim() || featureIdeas.trim();
  if (!hasContent) {
    return { ok: false, error: "Please fill in at least one feedback field" };
  }

  const blocks: string[] = [];
  blocks.push(`:speech_balloon: *New feedback from ${name.trim()}*`);
  blocks.push("");

  if (likes.trim()) {
    blocks.push(`:thumbsup: *What they like*`);
    blocks.push(likes.trim());
    blocks.push("");
  }

  if (dislikes.trim()) {
    blocks.push(`:thumbsdown: *What they dislike*`);
    blocks.push(dislikes.trim());
    blocks.push("");
  }

  if (featureIdeas.trim()) {
    blocks.push(`:bulb: *New feature ideas*`);
    blocks.push(featureIdeas.trim());
  }

  try {
    const result = await postMessage(FEEDBACK_CHANNEL, blocks.join("\n"));
    if (!result.ok) {
      console.error("Slack postMessage failed:", result.error);
      return { ok: false, error: "Failed to send feedback" };
    }
    // Fire-and-forget: also send to Software Factory Validator
    sendToValidator(payload).catch(() => {});

    return { ok: true };
  } catch (err) {
    console.error("Feedback submission error:", err);
    return { ok: false, error: "Failed to send feedback" };
  }
}
