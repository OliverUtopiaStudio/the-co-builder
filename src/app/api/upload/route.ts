import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ventureId, assetNumber, fileName, fileType } = await request.json();

    if (!ventureId || !assetNumber || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate upload path
    const path = `${ventureId}/${assetNumber}/${Date.now()}-${fileName}`;

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
