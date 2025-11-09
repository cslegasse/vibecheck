/**
 * MongoDB NGO Sync API
 * Syncs better-auth user data with MongoDB NGO profiles
 * Generates unique tracking IDs for NGO organizations
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import NGO from "@/models/NGO";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from better-auth
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organizationName, description, website } = body;

    if (!organizationName) {
      return NextResponse.json(
        { success: false, error: "Organization name is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Check if NGO already exists in MongoDB
    let mongoNGO = await NGO.findOne({ authId: session.user.id });

    if (mongoNGO) {
      // Update existing NGO
      mongoNGO.organizationName = organizationName;
      mongoNGO.email = session.user.email;
      mongoNGO.description = description || mongoNGO.description;
      mongoNGO.website = website || mongoNGO.website;
      mongoNGO.lastSyncedAt = new Date();
      await mongoNGO.save();

      return NextResponse.json({
        success: true,
        message: "NGO synced successfully",
        ngo: {
          id: mongoNGO._id,
          authId: mongoNGO.authId,
          uniqueTrackingId: mongoNGO.uniqueTrackingId,
          organizationName: mongoNGO.organizationName,
          email: mongoNGO.email,
          verified: mongoNGO.verified,
        },
      });
    }

    // Create new MongoDB NGO with unique tracking ID
    const uniqueTrackingId = `NGO-${nanoid(16)}`;
    
    mongoNGO = await NGO.create({
      authId: session.user.id,
      uniqueTrackingId,
      organizationName,
      email: session.user.email,
      description,
      website,
      verified: false,
      campaigns: [],
      totalCampaigns: 0,
      totalRaised: 0,
      totalWithdrawn: 0,
      overallTrustScore: 100,
      lastSyncedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "NGO created and synced successfully",
      ngo: {
        id: mongoNGO._id,
        authId: mongoNGO.authId,
        uniqueTrackingId: mongoNGO.uniqueTrackingId,
        organizationName: mongoNGO.organizationName,
        email: mongoNGO.email,
        verified: mongoNGO.verified,
      },
    });
  } catch (error) {
    console.error("NGO sync error:", error);
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
    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToMongoDB();

    // Get NGO from MongoDB
    const mongoNGO = await NGO.findOne({ authId: session.user.id });

    if (!mongoNGO) {
      return NextResponse.json(
        { success: false, error: "NGO not found in MongoDB. Please sync first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ngo: mongoNGO,
    });
  } catch (error) {
    console.error("Get NGO error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
