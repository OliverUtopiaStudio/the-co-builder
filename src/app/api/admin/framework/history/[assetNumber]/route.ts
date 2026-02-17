import { NextRequest, NextResponse } from "next/server";
import { getFrameworkEditHistory } from "@/app/actions/framework";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  try {
    const { assetNumber: assetNumberStr } = await params;
    const assetNumber = parseInt(assetNumberStr, 10);
    
    if (isNaN(assetNumber) || assetNumber < 1 || assetNumber > 27) {
      return NextResponse.json(
        { error: "Invalid asset number" },
        { status: 400 }
      );
    }

    const history = await getFrameworkEditHistory(assetNumber);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching framework edit history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
