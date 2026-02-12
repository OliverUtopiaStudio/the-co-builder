import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyVentureAccess, sanitizeFileName } from "@/lib/venture-access";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const ventureId = body?.ventureId;
    const assetNumber = body?.assetNumber;
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";

    if (!ventureId || assetNumber == null || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (assetNumber < 1 || assetNumber > 27) {
      return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
    }

    await verifyVentureAccess(ventureId);

    const safeFileName = sanitizeFileName(fileName);
    const path = `${ventureId}/${assetNumber}/${Date.now()}-${safeFileName}`;

    // Create a signed upload URL
    const { data, error } = await supabase.storage
      .from("venture-assets")
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      storagePath: path,
      token: data.token,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
