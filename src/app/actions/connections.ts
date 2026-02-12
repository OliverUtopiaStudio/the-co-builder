"use server";

import { db } from "@/db";
import { ventures, slackChannelVentures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { extractFolderId, getFolderInfo } from "@/lib/google-drive";
import { getChannelInfo } from "@/lib/slack/client";

export interface ConnectionStatus {
  type: "google_drive" | "slack";
  connected: boolean;
  url: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  error: string | null;
  name?: string;
}

export interface VentureConnections {
  ventureId: string;
  ventureName: string;
  googleDrive: ConnectionStatus;
  slack: ConnectionStatus;
}

/**
 * Verify Google Drive folder connection
 */
export async function verifyGoogleDriveConnection(
  folderUrl: string | null
): Promise<{ verified: boolean; error: string | null; name?: string }> {
  if (!folderUrl) {
    return { verified: false, error: "No Google Drive URL provided" };
  }

  const folderId = extractFolderId(folderUrl);
  if (!folderId) {
    return { verified: false, error: "Invalid Google Drive URL format" };
  }

  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  if (!accessToken) {
    return { verified: false, error: "Google Drive API not configured" };
  }

  try {
    const folderInfo = await getFolderInfo(folderId, accessToken);
    return {
      verified: true,
      error: null,
      name: folderInfo.name,
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Failed to verify folder access",
    };
  }
}

/**
 * Verify Slack channel connection
 */
export async function verifySlackConnection(
  channelId: string | null
): Promise<{ verified: boolean; error: string | null; name?: string }> {
  if (!channelId) {
    return { verified: false, error: "No Slack channel ID provided" };
  }

  try {
    const channelInfo = await getChannelInfo(channelId);
    if (!channelInfo) {
      return { verified: false, error: "Channel not found or not accessible" };
    }
    return {
      verified: true,
      error: null,
      name: channelInfo.name,
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Failed to verify channel access",
    };
  }
}

import { extractSlackChannelId, buildSlackChannelUrl } from "@/lib/slack/utils";

/**
 * Get connection status for a venture
 */
export async function getVentureConnections(ventureId: string): Promise<VentureConnections | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get venture
  const [venture] = await db
    .select()
    .from(ventures)
    .where(eq(ventures.id, ventureId))
    .limit(1);

  if (!venture) {
    return null;
  }

  // Get Slack channel mapping
  const [slackMapping] = await db
    .select()
    .from(slackChannelVentures)
    .where(eq(slackChannelVentures.ventureId, ventureId))
    .limit(1);

  // Verify Google Drive connection
  const driveVerification = await verifyGoogleDriveConnection(venture.googleDriveUrl || null);

  // Verify Slack connection
  const slackVerification = await verifySlackConnection(
    slackMapping?.slackChannelId || null
  );

  return {
    ventureId: venture.id,
    ventureName: venture.name,
    googleDrive: {
      type: "google_drive",
      connected: !!venture.googleDriveUrl,
      url: venture.googleDriveUrl || null,
      verified: driveVerification.verified,
      verifiedAt: driveVerification.verified ? new Date() : null,
      error: driveVerification.error,
      name: driveVerification.name,
    },
    slack: {
      type: "slack",
      connected: !!slackMapping,
      url: slackMapping
        ? buildSlackChannelUrl(slackMapping.slackChannelId)
        : null,
      verified: slackVerification.verified,
      verifiedAt: slackVerification.verified ? new Date() : null,
      error: slackVerification.error,
      name: slackMapping?.slackChannelName || slackVerification.name,
    },
  };
}

/**
 * Get all venture connections for admin view
 */
export async function getAllVentureConnections(): Promise<VentureConnections[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is admin
  const { data: fellow } = await supabase
    .from("fellows")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!fellow || (fellow.role !== "admin" && fellow.role !== "studio")) {
    throw new Error("Unauthorized - Admin access required");
  }

  // Get all ventures
  const allVentures = await db.select().from(ventures);

  // Get all Slack mappings
  const allSlackMappings = await db.select().from(slackChannelVentures);

  const slackMap = new Map(
    allSlackMappings.map((m) => [m.ventureId, m])
  );

  // Verify connections for each venture
  const connections: VentureConnections[] = [];

  for (const venture of allVentures) {
    const slackMapping = slackMap.get(venture.id);

    const driveVerification = await verifyGoogleDriveConnection(venture.googleDriveUrl || null);
    const slackVerification = await verifySlackConnection(
      slackMapping?.slackChannelId || null
    );

    connections.push({
      ventureId: venture.id,
      ventureName: venture.name,
      googleDrive: {
        type: "google_drive",
        connected: !!venture.googleDriveUrl,
        url: venture.googleDriveUrl || null,
        verified: driveVerification.verified,
        verifiedAt: driveVerification.verified ? new Date() : null,
        error: driveVerification.error,
        name: driveVerification.name,
      },
      slack: {
        type: "slack",
        connected: !!slackMapping,
        url: slackMapping
          ? buildSlackChannelUrl(slackMapping.slackChannelId)
          : null,
        verified: slackVerification.verified,
        verifiedAt: slackVerification.verified ? new Date() : null,
        error: slackVerification.error,
        name: slackMapping?.slackChannelName || slackVerification.name,
      },
    });
  }

  return connections;
}
