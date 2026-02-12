/**
 * Lightweight Slack API client using native fetch().
 *
 * We intentionally avoid @slack/bolt or @slack/web-api — the Co-Builder
 * only needs 3-4 Slack API calls, so a thin wrapper keeps the bundle small.
 */

const SLACK_API = "https://slack.com/api";

function getToken(): string {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is not set");
  return token;
}

async function slackFetch(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error(`Slack API error (${method}):`, data.error, data);
  }
  return data;
}

/**
 * Post a message to a Slack channel or thread.
 */
export async function postMessage(
  channel: string,
  text: string,
  threadTs?: string
) {
  return slackFetch("chat.postMessage", {
    channel,
    text,
    thread_ts: threadTs,
    unfurl_links: false,
  });
}

/**
 * Get info about a Slack user (display name, real name, avatar).
 */
export async function getUserInfo(userId: string) {
  const data = await slackFetch("users.info", { user: userId });
  if (!data.ok) return null;
  return {
    id: data.user.id,
    name: data.user.real_name || data.user.name,
    displayName: data.user.profile?.display_name || data.user.real_name || data.user.name,
    avatar: data.user.profile?.image_48,
  };
}

/**
 * List channels the bot is a member of (for admin UI channel picker).
 */
export async function listChannels() {
  const data = await slackFetch("conversations.list", {
    types: "public_channel,private_channel",
    exclude_archived: true,
    limit: 200,
  });
  if (!data.ok) return [];
  return (data.channels || []).map(
    (ch: { id: string; name: string; is_private: boolean }) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
    })
  );
}

/**
 * Get info about a Slack channel (name, is_private, etc.).
 */
export async function getChannelInfo(channelId: string) {
  const data = await slackFetch("conversations.info", { channel: channelId });
  if (!data.ok) return null;
  return {
    id: data.channel.id,
    name: data.channel.name,
    isPrivate: data.channel.is_private,
    isArchived: data.channel.is_archived,
  };
}

/**
 * Open a Slack modal (view) in response to a shortcut.
 * Used to show the user a confirmation/editing modal after the AI classifies.
 */
export async function openModal(
  triggerId: string,
  view: Record<string, unknown>
) {
  return slackFetch("views.open", {
    trigger_id: triggerId,
    view,
  });
}
