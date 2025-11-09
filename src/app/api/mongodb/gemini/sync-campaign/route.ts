/**
 * Sync Gemini AI Campaign Insights to MongoDB
 * Stores AI-generated campaign data, predictions, and recommendations
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { INGO } from "@/models/NGO";   // interface
import NGO from "@/models/NGO";        // model
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      campaignName,
      description,
      targetAmount,
      categories, // Array of { name, budget }
      geminiInsights, // { successProbability, estimatedDays, riskFactors, recommendations }
    } = body;

    if (!campaignName || !targetAmount || !categories || !geminiInsights) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Get NGO from MongoDB
    const ngo = await NGO.findOne({ authId: session.user.id });
    
    if (!ngo) {
      return NextResponse.json(
        { success: false, error: "NGO not found. Please sync NGO first." },
        { status: 404 }
      );
    }

    // Generate unique campaign ID
    const campaignId = `CMP-${nanoid(12)}`;

    // Prepare campaign data
    const campaign = {
      campaignId,
      name: campaignName,
      description: description || '',
      targetAmount,
      raisedAmount: 0,
      status: 'active',
      
      // Gemini AI Insights
      geminiInsights: {
        successProbability: geminiInsights.successProbability || 0,
        estimatedDays: geminiInsights.estimatedDays || 0,
        riskFactors: geminiInsights.riskFactors || [],
        recommendations: geminiInsights.recommendations || [],
        generatedAt: new Date(),
      },
      
      // Categories with budgets
      categories: categories.map((cat: any) => ({
        name: cat.name,
        budget: cat.budget || cat.amount,
        spent: 0,
        remaining: cat.budget || cat.amount,
      })),
      
      withdrawals: [],
      
      // Initial metrics
      trustScore: 100,
      complianceRate: 100,
      averageFraudScore: 100,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add campaign to NGO
    ngo.campaigns.push(campaign);
    ngo.totalCampaigns = (ngo.totalCampaigns || 0) + 1;
    ngo.lastSyncedAt = new Date();
    
    await ngo.save();

    return NextResponse.json({
      success: true,
      message: "Campaign created and Gemini insights synced successfully",
      campaign: {
        campaignId,
        name: campaignName,
        targetAmount,
        geminiInsights: campaign.geminiInsights,
        categories: campaign.categories,
      },
    });
  } catch (error) {
    console.error("Gemini campaign sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get campaign with Gemini insights
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");

    await connectToMongoDB();

    const ngo = await NGO.findOne({ authId: session.user.id });
    
    if (!ngo) {
      return NextResponse.json(
        { success: false, error: "NGO not found" },
        { status: 404 }
      );
    }
    const g = (await NGO.findOne({ authId: session.user.id })) as INGO;

    if (!g) {
      return NextResponse.json(
        { success: false, error: "NGO not found. Please sync NGO first." },
        { status: 404 }
      );
    }



    // Return all campaigns
    return NextResponse.json({
      success: true,
      campaigns: ngo.campaigns,
      totalCampaigns: ngo.totalCampaigns,
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
