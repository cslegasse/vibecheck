/**
 * AI Impact Simulation API
 * Runs Monte Carlo simulations for campaign outcomes
 */

import { NextRequest, NextResponse } from "next/server";
import { aiForecastingAgent } from "@/lib/ai-forecasting-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignBudget,
      categories,
      uncertaintyFactors,
      historicalSuccessRate,
    } = body;

    if (!campaignBudget || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          error: "campaignBudget and categories array are required",
        },
        { status: 400 }
      );
    }

    const simulation = await aiForecastingAgent.simulateImpact({
      campaignBudget,
      categories,
      uncertaintyFactors: uncertaintyFactors || [
        "Economic conditions",
        "Market competition",
        "Social trends",
      ],
      historicalSuccessRate,
    });

    return NextResponse.json({
      success: true,
      simulation,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Impact Simulation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Simulation failed",
      },
      { status: 500 }
    );
  }
}
