import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { fellows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, email } = await request.json();

    // Check if fellow already exists
    const existing = await db
      .select()
      .from(fellows)
      .where(eq(fellows.authUserId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const [fellow] = await db
      .insert(fellows)
      .values({
        authUserId: user.id,
        email: email || user.email || "",
        fullName: fullName || user.user_metadata?.full_name || "Fellow",
      })
      .returning();

    return NextResponse.json(fellow);
  } catch (error) {
    console.error("Error creating fellow:", error);
    return NextResponse.json(
      { error: "Failed to create fellow profile" },
      { status: 500 }
    );
  }
}
