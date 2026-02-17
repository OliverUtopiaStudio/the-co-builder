import { NextResponse } from "next/server";
import { REPORT_COOKIE_NAME } from "@/lib/report-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(REPORT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
