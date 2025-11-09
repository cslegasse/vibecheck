/**
 * AI Fraud Detection API
 * Analyzes transactions for suspicious patterns
 */

import { NextRequest, NextResponse } from "next/server";
import { aiForecastingAgent } from "@/lib/ai-forecasting-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, donorHistory } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { success: false, error: "transactions array is required" },
        { status: 400 }
      );
    }

    const fraudAnalysis = await aiForecastingAgent.detectFraud({
      transactions,
      donorHistory,
    });

    return NextResponse.json({
      success: true,
      analysis: fraudAnalysis,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fraud Detection Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Fraud check failed",
      },
      { status: 500 }
    );
  }
}
