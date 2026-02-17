import { NextResponse } from "next/server";

/**
 * Health check for uptime monitors and load balancers.
 * GET /api/health returns 200 when the app is running.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
