/**
 * Campaign Management API
 * Manages campaigns with real-time data tracking and AI verification
 */

import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, goalAmount, categories, ngoId } = body;

    if (!title || !goalAmount || !categories || !Array.isArray(categories) || !ngoId) {
      return NextResponse.json(
        {
          success: false,
          error: "title, goalAmount, ngoId, and categories array are required",
        },
        { status: 400 }
      );
    }

    const result = await realTimeDataClient.createCampaign({
      title,
      ngoId,
      goalAmount,
      categories,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Campaign Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required" },
        { status: 400 }
      );
    }

    const campaign = await realTimeDataClient.getCampaign(
      parseInt(campaignId)
    );

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Get Campaign Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}