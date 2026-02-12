import { NextRequest, NextResponse } from "next/server";
import { verifySlackSignature } from "@/lib/slack/verify";
import { postMessage, getUserInfo } from "@/lib/slack/client";
import { classifyMessage } from "@/lib/ai/classify";
import { db } from "@/db";
import { slackChannelVentures, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Slack interaction webhook handler.
 *
 * Slack sends POST requests here when a user triggers our message shortcut.
 * The payload is form-encoded as `payload=<url-encoded JSON>`.
 *
 * Flow:
 * 1. Verify Slack signature (HMAC-SHA256)
 * 2. Parse the form-encoded payload
 * 3. Handle based on type (message_action for shortcuts)
 * 4. Immediately return 200 (Slack's 3-second timeout)
 * 5. Background: classify with AI → save to DB → reply in Slack thread
 */
export async function POST(request: NextRequest) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    console.error("SLACK_SIGNING_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify Slack signature
  const signature = request.headers.get("x-slack-signature");
  const timestamp = request.headers.get("x-slack-request-timestamp");

  if (!verifySlackSignature(signingSecret, signature, timestamp, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse the form-encoded payload
  const params = new URLSearchParams(rawBody);
  const payloadStr = params.get("payload");
  if (!payloadStr) {
    return NextResponse.json({ error: "No payload" }, { status: 400 });
  }

  let payload: SlackInteractionPayload;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Handle different interaction types
  if (payload.type === "message_action" && payload.callback_id === "push_to_cobuilder") {
    // Fire and forget — process in background after returning 200
    processMessageShortcut(payload).catch((err) => {
      console.error("Background processing failed:", err);
    });

    // Immediate acknowledgment (Slack requires < 3 seconds)
    return new NextResponse(null, { status: 200 });
  }

  // Handle URL verification (Slack sends this during app setup)
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: (payload as unknown as { challenge: string }).challenge });
  }

  return NextResponse.json({ error: "Unhandled interaction type" }, { status: 400 });
}

/**
 * Background handler for the "Push to Co-Builder" message shortcut.
 */
async function processMessageShortcut(payload: SlackInteractionPayload) {
  const message = payload.message;
  const channelId = payload.channel?.id;
  const userId = payload.user?.id;

  if (!message?.text || !channelId) {
    console.error("Missing message text or channel ID");
    return;
  }

  // Look up the channel → venture mapping
  const [mapping] = await db
    .select()
    .from(slackChannelVentures)
    .where(eq(slackChannelVentures.slackChannelId, channelId))
    .limit(1);

  if (!mapping) {
    // No venture linked to this channel — notify user
    await postMessage(
      channelId,
      `⚠️ This channel isn't linked to a Co-Builder venture yet. Ask an admin to link it at ${process.env.NEXT_PUBLIC_APP_URL || "https://the-co-builder.vercel.app"}/admin/slack`,
      message.ts
    );
    return;
  }

  // Get user info for display
  const userInfo = userId ? await getUserInfo(userId) : null;
  const userName = userInfo?.displayName || userInfo?.name || "Unknown";
  const channelName = mapping.slackChannelName || channelId;

  // Classify the message with AI
  let classification;
  try {
    classification = await classifyMessage(message.text, userName, channelName);
  } catch (err) {
    console.error("AI classification failed:", err);
    await postMessage(
      channelId,
      "❌ Failed to classify this message. Please try again later.",
      message.ts
    );
    return;
  }

  // Save task to database
  try {
    await db.insert(tasks).values({
      ventureId: mapping.ventureId,
      assetNumber: classification.assetNumber,
      checklistItemId: classification.checklistItemId,
      title: classification.title,
      priority: classification.priority,
      status: "open",
      slackChannelId: channelId,
      slackMessageTs: message.ts,
      slackUserId: userId || null,
      slackUserName: userName,
      aiConfidence: classification.confidence,
      aiReasoning: classification.reasoning,
    });
  } catch (err) {
    console.error("Failed to save task:", err);
    await postMessage(
      channelId,
      "❌ Failed to save task. Please try again later.",
      message.ts
    );
    return;
  }

  // Post confirmation in the Slack thread
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://the-co-builder.vercel.app";
  const confidenceEmoji =
    classification.confidence >= 80 ? "🎯" :
    classification.confidence >= 50 ? "🔶" : "⚠️";

  await postMessage(
    channelId,
    [
      `✅ *Task pushed to Co-Builder*`,
      ``,
      `📋 *${classification.title}*`,
      `📦 Asset #${classification.assetNumber} · Priority: ${classification.priority}`,
      `${confidenceEmoji} AI Confidence: ${classification.confidence}%`,
      classification.checklistItemId ? `📝 Checklist: ${classification.checklistItemId}` : "",
      ``,
      `💡 _${classification.reasoning}_`,
      ``,
      `<${appUrl}/venture/${mapping.ventureId}|View in Co-Builder →>`,
    ]
      .filter(Boolean)
      .join("\n"),
    message.ts
  );
}

// ─── Types ─────────────────────────────────────────────────────

interface SlackInteractionPayload {
  type: string;
  callback_id?: string;
  trigger_id?: string;
  user?: {
    id: string;
    name: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  message?: {
    text: string;
    ts: string;
    user?: string;
  };
  response_url?: string;
}
