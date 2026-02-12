import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { ventures, fellows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { extractFolderId, listFolderFiles, getFolderInfo } from "@/lib/google-drive";

/**
 * GET /api/google-drive/files?ventureId=xxx
 * List files in a venture's Google Drive folder
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ventureId = searchParams.get("ventureId");

    if (!ventureId) {
      return NextResponse.json({ error: "ventureId is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Venture not found" }, { status: 404 });
    }

    const googleDriveUrl = venture.venture.googleDriveUrl;
    if (!googleDriveUrl) {
      return NextResponse.json({ error: "Google Drive folder not configured" }, { status: 400 });
    }

    const folderId = extractFolderId(googleDriveUrl);
    if (!folderId) {
      return NextResponse.json({ error: "Invalid Google Drive URL" }, { status: 400 });
    }

    // Get access token from environment
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Drive API not configured. Please set GOOGLE_ACCESS_TOKEN environment variable." },
        { status: 500 }
      );
    }

    // List files in folder
    const files = await listFolderFiles(folderId, accessToken);
    const folderInfo = await getFolderInfo(folderId, accessToken);

    return NextResponse.json({
      folder: folderInfo,
      files,
    });
  } catch (error) {
    console.error("Error listing Google Drive files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list files" },
      { status: 500 }
    );
  }
}
