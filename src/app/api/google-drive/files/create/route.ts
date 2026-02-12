import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { ventures, fellows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { extractFolderId, createFile } from "@/lib/google-drive";

/**
 * POST /api/google-drive/files/create
 * Create a file in a venture's Google Drive folder
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ventureId, fileName, content, mimeType = "text/plain" } = body;

    if (!ventureId || !fileName || content === undefined) {
      return NextResponse.json(
        { error: "ventureId, fileName, and content are required" },
        { status: 400 }
      );
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
        { error: "Google Drive API not configured" },
        { status: 500 }
      );
    }

    // Create file
    const file = await createFile(folderId, fileName, content, mimeType, accessToken);

    return NextResponse.json({ file });
  } catch (error) {
    console.error("Error creating Google Drive file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create file" },
      { status: 500 }
    );
  }
}
