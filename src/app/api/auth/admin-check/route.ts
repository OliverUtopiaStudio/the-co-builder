import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const isAdmin = request.cookies.get("co_build_admin_auth")?.value === "1";
  return NextResponse.json({ isAdmin });
}
