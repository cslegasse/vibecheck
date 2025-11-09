/**
 * AI Campaign Optimization API
 * Provides recommendations for campaign structure and budget
 */

import { NextRequest, NextResponse } from "next/server";
import { aiForecastingAgent } from "@/lib/ai-forecasting-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignGoal,
      categories,
      targetAudience,
      duration,
      competitorData,
    } = body;

    if (!campaignGoal || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          error: "campaignGoal and categories array are required",
        },
        { status: 400 }
      );
    }

    const optimization = await aiForecastingAgent.optimizeCampaign({
      campaignGoal,
      categories,
      targetAudience: targetAudience || "General Public",
      duration: duration || "30 days",
      competitorData,
    });

    return NextResponse.json({
      success: true,
      optimization,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaign Optimization Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Optimization failed",
      },
      { status: 500 }
    );
  }
}
