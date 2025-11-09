/**
 * AI Verification API
 * Verifies spending compliance and category allocations with AI
 */

import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const category = searchParams.get("category");

    if (!campaignId || !category) {
      return NextResponse.json(
        { success: false, error: "campaignId and category are required" },
        { status: 400 }
      );
    }

    const compliance = await realTimeDataClient.verifyCategoryCompliance(
      parseInt(campaignId),
      category
    );

    return NextResponse.json({
      success: true,
      compliance,
      verifiedAt: new Date().toISOString(),
      verifiedBy: "AI-System",
    });
  } catch (error) {
    console.error("AI Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}