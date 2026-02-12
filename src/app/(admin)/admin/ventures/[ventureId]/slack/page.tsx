"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSlackChannelForVenture, linkSlackChannelToVenture, unlinkSlackChannelFromVenture } from "@/app/actions/admin";
import { listChannels } from "@/lib/slack/client";

export default function VentureSlackPage() {
  const { ventureId } = useParams<{ ventureId: string }>();
  const router = useRouter();
  const [slackChannel, setSlackChannel] = useState<{
    id: string;
    channelId: string;
    channelName: string | null;
    url: string;
  } | null>(null);
  const [availableChannels, setAvailableChannels] = useState<
    { id: string; name: string; isPrivate: boolean }[]
  >([]);
  const [slackChannelUrl, setSlackChannelUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [channel, channels] = await Promise.all([
          getSlackChannelForVenture(ventureId as string).catch(() => null),
          listChannels().catch(() => []),
        ]);
        setSlackChannel(channel);
        setAvailableChannels(channels);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Slack channel");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ventureId]);

  async function handleLink() {
    if (!slackChannelUrl.trim()) {
      setError("Please enter a Slack channel URL");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await linkSlackChannelToVenture(ventureId as string, slackChannelUrl);
      const updated = await getSlackChannelForVenture(ventureId as string);
      setSlackChannel(updated);
      setSlackChannelUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link Slack channel");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Are you sure you want to unlink this Slack channel?")) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await unlinkSlackChannelFromVenture(ventureId as string);
      setSlackChannel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink Slack channel");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/ventures/${ventureId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← Back to Venture
      </Link>

      <div>
        <h1 className="text-2xl font-medium mb-2">Slack Channel Connection</h1>
        <p className="text-muted text-sm">
          Link a Slack channel to this venture for communication and task tracking.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700" style={{ borderRadius: 2 }}>
          {error}
        </div>
      )}

      {slackChannel ? (
        <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-medium mb-1">Connected Slack Channel</div>
              <div className="text-lg font-semibold">
                #{slackChannel.channelName || slackChannel.channelId}
              </div>
              <a
                href={slackChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline mt-1 inline-block"
              >
                Open in Slack →
              </a>
            </div>
            <button
              onClick={handleUnlink}
              disabled={saving}
              className="text-xs px-3 py-1 border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              Unlink
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
          <div className="mb-4">
            <label htmlFor="slackUrl" className="block text-sm font-medium mb-2">
              Slack Channel URL
            </label>
            <input
              id="slackUrl"
              type="text"
              value={slackChannelUrl}
              onChange={(e) => setSlackChannelUrl(e.target.value)}
              placeholder="https://thestudiofellows.slack.com/archives/C0ADHAF5Y6T"
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
            />
            <p className="text-xs text-muted mt-1">
              Paste the Slack channel URL or select from available channels below
            </p>
          </div>

          {availableChannels.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Available Channels</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {availableChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSlackChannelUrl(
                        `https://thestudiofellows.slack.com/archives/${channel.id}`
                      );
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-background text-sm border border-border"
                    style={{ borderRadius: 2 }}
                  >
                    #{channel.name}
                    {channel.isPrivate && (
                      <span className="text-xs text-muted ml-2">(private)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLink}
            disabled={saving || !slackChannelUrl.trim()}
            className="px-4 py-2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 2 }}
          >
            {saving ? "Linking..." : "Link Slack Channel"}
          </button>
        </div>
      )}
    </div>
  );
}
