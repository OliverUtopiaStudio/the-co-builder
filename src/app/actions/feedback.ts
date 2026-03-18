"use server";

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

export async function submitFeedback(payload: FeedbackPayload) {
  const { name, likes, dislikes, featureIdeas } = payload;

  if (!name.trim()) {
    return { ok: false, error: "Name is required" };
  }

  const hasContent = likes.trim() || dislikes.trim() || featureIdeas.trim();
  if (!hasContent) {
    return { ok: false, error: "Please fill in at least one feedback field" };
  }

  const url = process.env.SF_VALIDATOR_FEEDBACK_URL;
  const appKey = process.env.SF_VALIDATOR_APP_KEY;
  if (!url || !appKey) {
    console.error("Validator env vars not set");
    return { ok: false, error: "Feedback service unavailable" };
  }

  const sections: string[] = [];
  if (likes.trim())
    sections.push(`What they like: ${likes.trim()}`);
  if (dislikes.trim())
    sections.push(`What they dislike: ${dislikes.trim()}`);
  if (featureIdeas.trim())
    sections.push(`Feature ideas: ${featureIdeas.trim()}`);

  const description = `Feedback from ${name.trim()} (via /feedback)\n\n${sections.join("\n\n")}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Key": appKey,
      },
      body: JSON.stringify({
        description,
        feedback_type: detectFeedbackType(likes, dislikes, featureIdeas),
        priority: "medium",
        user_email: null,
      }),
    });

    if (!res.ok) {
      console.error("Validator feedback failed:", res.status, await res.text());
      return { ok: false, error: "Failed to send feedback" };
    }

    return { ok: true };
  } catch (err) {
    console.error("Feedback submission error:", err);
    return { ok: false, error: "Failed to send feedback" };
  }
}
