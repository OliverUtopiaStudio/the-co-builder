import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fellows } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const SITE_COOKIE = "co_build_site_auth";
const FELLOW_ID_COOKIE = "co_build_fellow_id";

export async function POST(request: NextRequest) {
  let body: { password?: string; fellowId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json(
      { error: "Server misconfiguration: SITE_PASSWORD is not set." },
      { status: 500 }
    );
  }

  const password = body.password;
  if (!password || password !== sitePassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const fellowId = body.fellowId;

  if (!fellowId) {
    const list = await db
      .select({ id: fellows.id, fullName: fellows.fullName })
      .from(fellows)
      .orderBy(asc(fellows.fullName));
    const response = NextResponse.json({
      ok: true,
      fellows: list.map((f) => ({ id: f.id, fullName: f.fullName })),
    });
    response.cookies.set(SITE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  const [fellow] = await db
    .select({ id: fellows.id })
    .from(fellows)
    .where(eq(fellows.id, fellowId))
    .limit(1);

  if (!fellow) {
    return NextResponse.json({ error: "Fellow not found." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SITE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(FELLOW_ID_COOKIE, fellowId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
