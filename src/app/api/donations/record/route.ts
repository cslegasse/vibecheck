/**
 * Donation Recording API
 * Records donations with AI fraud detection and Nessie API integration
 */

import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, amount, category, donorId, nessieAccountId } = body;

    if (!campaignId || !amount || !category || !donorId) {
      return NextResponse.json(
        {
          success: false,
          error: "campaignId, amount, category, and donorId are required",
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

    // Record donation with AI verification
    const result = await realTimeDataClient.recordDonation({
      campaignId: parseInt(campaignId),
      amount,
      category,
      donorId,
      nessieAccountId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      verificationScore: result.verificationScore,
      message: "Donation recorded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Record Donation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
