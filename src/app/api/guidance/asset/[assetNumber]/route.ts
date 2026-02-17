import { NextRequest, NextResponse } from "next/server";
import { getGuidanceForAsset } from "@/app/actions/guidance";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { fellows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  try {
    const { assetNumber: assetNumberParam } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [fellow] = await db
      .select({ id: fellows.id })
      .from(fellows)
      .where(eq(fellows.authUserId, user.id))
      .limit(1);

    if (!fellow) {
      return NextResponse.json({ error: "Fellow not found" }, { status: 404 });
    }

    const assetNumber = parseInt(assetNumberParam, 10);
    if (isNaN(assetNumber) || assetNumber < 1 || assetNumber > 27) {
      return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
    }

    const guidance = await getGuidanceForAsset(fellow.id, assetNumber);
    if (!guidance) {
      return NextResponse.json({ error: "Guidance not found" }, { status: 404 });
    }

    return NextResponse.json(guidance);
  } catch (error) {
    console.error("Error fetching asset guidance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch guidance" },
      { status: 500 }
    );
  }
}
