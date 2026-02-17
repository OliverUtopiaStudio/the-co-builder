import { NextResponse } from "next/server";
import { db } from "@/db";
import { fellows, ventures } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Public API: returns a single Fellow's public profile with their ventures.
 * Only exposes public-safe fields (no email, auth data, or internal ratings).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fellowId: string }> }
) {
  try {
    const { fellowId } = await params;

    // Get fellow data
    const [fellow] = await db
      .select({
        id: fellows.id,
        fullName: fellows.fullName,
        avatarUrl: fellows.avatarUrl,
        bio: fellows.bio,
        linkedinUrl: fellows.linkedinUrl,
        domain: fellows.domain,
        background: fellows.background,
        lifecycleStage: fellows.lifecycleStage,
        googleDriveUrl: fellows.googleDriveUrl,
        websiteUrl: fellows.websiteUrl,
        resourceLinks: fellows.resourceLinks,
      })
      .from(fellows)
      .where(eq(fellows.id, fellowId))
      .limit(1);

    if (!fellow) {
      return NextResponse.json(
        { error: "Fellow not found" },
        { status: 404 }
      );
    }

    // Get ventures for this fellow
    const fellowVentures = await db
      .select({
        id: ventures.id,
        name: ventures.name,
        description: ventures.description,
        industry: ventures.industry,
        currentStage: ventures.currentStage,
        alignmentNotes: ventures.alignmentNotes,
        googleDriveUrl: ventures.googleDriveUrl,
        createdAt: ventures.createdAt,
      })
      .from(ventures)
      .where(eq(ventures.fellowId, fellowId));

    return NextResponse.json({
      ...fellow,
      ventures: fellowVentures,
    });
  } catch (error) {
    console.error("Error fetching fellow:", error);
    return NextResponse.json(
      { error: "Failed to load fellow" },
      { status: 500 }
    );
  }
}
