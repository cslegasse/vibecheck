import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, category, amount, reason, ngoId } = body;

    if (!campaignId || !category || !amount || !reason || !ngoId) {
      return NextResponse.json(
        {
          success: false,
          error: "campaignId, category, amount, reason, and ngoId are required",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Process withdrawal with AI verification
    const result = await realTimeDataClient.withdrawFunds({
      campaignId: parseInt(campaignId),
      category,
      amount,
      reason,
      ngoId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      aiVerificationScore: result.aiVerificationScore,
      message: "Withdrawal processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Process Withdrawal Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
