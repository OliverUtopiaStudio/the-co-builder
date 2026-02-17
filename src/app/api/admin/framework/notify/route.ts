import { NextRequest, NextResponse } from "next/server";
import { notifyFellowsOfFrameworkUpdate } from "@/app/actions/framework";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetNumber, message } = body;

    if (!assetNumber || typeof assetNumber !== "number") {
      return NextResponse.json(
        { error: "assetNumber is required and must be a number" },
        { status: 400 }
      );
    }

    if (assetNumber < 1 || assetNumber > 27) {
      return NextResponse.json(
        { error: "Invalid asset number" },
        { status: 400 }
      );
    }

    const result = await notifyFellowsOfFrameworkUpdate(
      assetNumber,
      message
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to notify fellows" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notified: result.notified,
    });
  } catch (error) {
    console.error("Error notifying fellows:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
