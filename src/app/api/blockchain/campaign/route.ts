
import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, target, categories, geminiInsights } = body;

    if (!name || !target || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          error: "name, target, and categories array are required",
        },
        { status: 400 }
      );
    }

    const result = await realTimeDataClient.createCampaign({
      title: name,
      ngoId: "default",
      goalAmount: target,
      categories: categories.map(cat => ({
        name: cat.name,
        amount: cat.budget || cat.amount, // <-- must be `amount`
      })),
    });


    // Sync with MongoDB (includes Gemini insights)
    try {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      
      const mongoResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/mongodb/gemini/sync-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignName: name,
          description: description || '',
          targetAmount: target,
          categories: categories.map(cat => ({
            name: cat.name,
            budget: cat.budget || cat.amount
          })),
          geminiInsights: geminiInsights || {
            successProbability: 75,
            estimatedDays: 30,
            riskFactors: [],
            recommendations: []
          },
        }),
      });

      const mongoData = await mongoResponse.json();
      
      return NextResponse.json({
        ...result,
        mongoSynced: mongoData.success,
        mongoCampaignId: mongoData.campaign?.campaignId,
      });
    } catch (mongoError) {
      console.error("MongoDB sync error:", mongoError);
      // Return success even if MongoDB sync fails
      return NextResponse.json(result);
    }
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