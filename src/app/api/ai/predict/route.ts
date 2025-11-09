/**
 * AI Prediction API
 * Uses AI forecasting agent for donation predictions
 */

import { NextRequest, NextResponse } from "next/server";
import { aiForecastingAgent } from "@/lib/ai-forecasting-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { historicalDonations, campaignType, targetAudience, seasonality } =
      body;

    if (!historicalDonations || !campaignType) {
      return NextResponse.json(
        {
          success: false,
          error: "historicalDonations and campaignType are required",
        },
        { status: 400 }
      );
    }

    const prediction = await aiForecastingAgent.predictDonations({
      historicalDonations,
      campaignType,
      targetAudience: targetAudience || "General Public",
      seasonality: seasonality !== false,
    });

    return NextResponse.json({
      success: true,
      prediction,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Prediction failed",
      },
      { status: 500 }
    );
  }
}
