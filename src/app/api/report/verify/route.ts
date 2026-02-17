import { NextRequest, NextResponse } from "next/server";
import {
  generateReportToken,
  REPORT_COOKIE_NAME,
  REPORT_COOKIE_MAX_AGE,
} from "@/lib/report-auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const password = process.env.REPORT_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "Report access is not configured" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Constant-time comparison
  const submitted = Buffer.from(body.password);
  const expected = Buffer.from(password);
  if (
    submitted.length !== expected.length ||
    !crypto.timingSafeEqual(submitted, expected)
  ) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = generateReportToken(password);
  const response = NextResponse.json({ success: true });

  response.cookies.set(REPORT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/report",
    maxAge: REPORT_COOKIE_MAX_AGE,
  });

  return response;
}
