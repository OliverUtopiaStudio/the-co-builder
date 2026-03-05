import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "co_build_site_auth";

export async function POST(request: NextRequest) {
  let password: string | undefined;

  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    // Ignore JSON parse errors and treat as missing password
  }

  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json(
      { error: "Server misconfiguration: SITE_PASSWORD is not set." },
      { status: 500 }
    );
  }

  if (!password || password !== sitePassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

