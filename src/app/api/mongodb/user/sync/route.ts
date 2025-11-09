/**
 * MongoDB User Sync API
 * Syncs better-auth user data with MongoDB user profiles
 * Generates unique tracking IDs for cross-system tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
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
    const { userType } = body; // 'donor' or 'ngo'

    if (!userType || !['donor', 'ngo'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: "Invalid userType. Must be 'donor' or 'ngo'" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ authId: session.user.id });

    if (mongoUser) {
      // Update existing user
      mongoUser.email = session.user.email;
      mongoUser.name = session.user.name;
      mongoUser.lastSyncedAt = new Date();
      await mongoUser.save();

      return NextResponse.json({
        success: true,
        message: "User synced successfully",
        user: {
          id: mongoUser._id,
          authId: mongoUser.authId,
          uniqueTrackingId: mongoUser.uniqueTrackingId,
          email: mongoUser.email,
          name: mongoUser.name,
          userType: mongoUser.userType,
        },
      });
    }

    // Create new MongoDB user with unique tracking ID
    const uniqueTrackingId = `USR-${nanoid(16)}`;
    
    mongoUser = await User.create({
      authId: session.user.id,
      uniqueTrackingId,
      email: session.user.email,
      name: session.user.name,
      userType,
      donations: [],
      totalDonated: 0,
      donationCount: 0,
      averageFraudScore: 100,
      lastSyncedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User created and synced successfully",
      user: {
        id: mongoUser._id,
        authId: mongoUser.authId,
        uniqueTrackingId: mongoUser.uniqueTrackingId,
        email: mongoUser.email,
        name: mongoUser.name,
        userType: mongoUser.userType,
      },
    });
  } catch (error) {
    console.error("User sync error:", error);
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

    // Get user from MongoDB
    const mongoUser = await User.findOne({ authId: session.user.id });

    if (!mongoUser) {
      return NextResponse.json(
        { success: false, error: "User not found in MongoDB. Please sync first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: mongoUser,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
