import { NextResponse } from "next/server";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("co_build_site_auth", "", COOKIE_OPTS);
  response.cookies.set("co_build_fellow_id", "", COOKIE_OPTS);
  response.cookies.set("co_build_admin_auth", "", COOKIE_OPTS);
  return response;
}
