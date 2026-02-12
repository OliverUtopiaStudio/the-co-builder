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

    const body = await request.json();
    const fullName =
      typeof body?.fullName === "string"
        ? body.fullName.slice(0, 200).trim()
        : undefined;
    const email =
      typeof body?.email === "string"
        ? body.email.slice(0, 254).trim()
        : undefined;

    // Check if fellow already exists
    const existing = await db
      .select()
      .from(fellows)
      .where(eq(fellows.authUserId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const safeFullName =
      (fullName && fullName.length > 0 ? fullName : user.user_metadata?.full_name) || "Fellow";
    const safeEmail = (email && email.length > 0 ? email : user.email) || "";

    const [fellow] = await db
      .insert(fellows)
      .values({
        authUserId: user.id,
        email: safeEmail,
        fullName: safeFullName.slice(0, 200),
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
