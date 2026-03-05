import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assetMedia } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_COOKIE_NAME = "co_build_admin_auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  const { assetNumber } = await params;
  const num = parseInt(assetNumber, 10);
  if (isNaN(num)) {
    return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
  }

  const rows = await db
    .select({
      loomUrl: assetMedia.loomUrl,
      driveTemplateUrl: assetMedia.driveTemplateUrl,
    })
    .from(assetMedia)
    .where(eq(assetMedia.assetNumber, num))
    .limit(1);

  return NextResponse.json(rows[0] ?? { loomUrl: null, driveTemplateUrl: null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  const isAdmin = request.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { assetNumber } = await params;
  const num = parseInt(assetNumber, 10);
  if (isNaN(num)) {
    return NextResponse.json({ error: "Invalid asset number" }, { status: 400 });
  }

  let body: { loomUrl?: string; driveTemplateUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date();

  await db
    .insert(assetMedia)
    .values({
      assetNumber: num,
      loomUrl: body.loomUrl ?? null,
      driveTemplateUrl: body.driveTemplateUrl ?? null,
      updatedBy: "admin",
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: assetMedia.assetNumber,
      set: {
        loomUrl: body.loomUrl ?? null,
        driveTemplateUrl: body.driveTemplateUrl ?? null,
        updatedBy: "admin",
        updatedAt: now,
      },
    });

  return NextResponse.json({ ok: true });
}
