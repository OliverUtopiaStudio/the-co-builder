/**
 * Slack utility functions for parsing URLs and building links
 */

/**
 * Extract Slack channel ID from URL
 * Supports formats:
 * - https://thestudiofellows.slack.com/archives/C0ADHAF5Y6T
 * - C0ADHAF5Y6T (direct ID)
 */
export function extractSlackChannelId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;

  // If it's already just an ID (starts with C), return it
  if (urlOrId.startsWith("C") && urlOrId.length > 8) {
    return urlOrId;
  }

  // Extract from URL patterns
  const patterns = [
    /\/archives\/([A-Z0-9]+)/,
    /channel\/([A-Z0-9]+)/,
    /([C][A-Z0-9]{8,})/,
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Build Slack channel URL from channel ID
 */
export function buildSlackChannelUrl(channelId: string, workspace?: string): string {
  const workspaceDomain = workspace || process.env.SLACK_WORKSPACE_DOMAIN || "thestudiofellows";
  return `https://${workspaceDomain}.slack.com/archives/${channelId}`;
}
