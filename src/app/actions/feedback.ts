"use server";

import { postMessage } from "@/lib/slack/client";

const FEEDBACK_CHANNEL = "C0AK87MUR18";

interface FeedbackPayload {
  name: string;
  likes: string;
  dislikes: string;
  featureIdeas: string;
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
    return { ok: true };
  } catch (err) {
    console.error("Feedback submission error:", err);
    return { ok: false, error: "Failed to send feedback" };
  }
}
