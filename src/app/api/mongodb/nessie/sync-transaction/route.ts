/**
 * Sync Nessie Transaction to MongoDB
 * Records Nessie API transactions in MongoDB for user/NGO tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import NGO, { INGO } from "@/models/NGO";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      transactionType,
      nessieTransactionId,
      amount,
      campaignId,
      category,
      description,
      nessieAccountId,
      nessieCustomerId,
      fraudScore,
      aiVerified,
    } = body;

    if (!transactionType || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToMongoDB();

    // ----------------- DONATION -----------------
    if (transactionType === "donation") {
      const user = await User.findOne({ authId: session.user.id }) as IUser | null;
      if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

      if (nessieCustomerId) user.nessieCustomerId = nessieCustomerId;
      if (nessieAccountId) user.nessieAccountId = nessieAccountId;

      user.donations.push({
        transactionId: nessieTransactionId || `TXN-${Date.now()}`,
        campaignId: campaignId || "unknown",
        amount: Number(amount),
        category: category || "general",
        timestamp: new Date(),
        nessieTransactionId: nessieTransactionId || undefined,
        fraudScore: fraudScore !== undefined && fraudScore !== null ? Number(fraudScore) : 100,
        aiVerified: aiVerified !== undefined ? Boolean(aiVerified) : true,
      });

      user.totalDonated = (user.totalDonated || 0) + Number(amount);
      user.donationCount = (user.donationCount || 0) + 1;

      // sum of fraudScores
      const totalScore = user.donations.reduce((acc: number, donation: any) => {
        return acc + (donation.fraudScore || 100);
      }, 0);
      user.averageFraudScore = totalScore / user.donations.length;

      user.lastSyncedAt = new Date();
      await user.save();

      // Update NGO campaign if applicable
      if (campaignId) {
        const ngo = await NGO.findOne({ "campaigns.campaignId": campaignId }) as INGO | null;
        if (ngo) {
          const campaign = ngo.campaigns.find((c: any) => c.campaignId === campaignId);
          if (campaign) {
            campaign.raisedAmount = (campaign.raisedAmount || 0) + Number(amount);

            if (category) {
              const cat = campaign.categories.find((c: any) => c.name === category);
              if (cat) {
                cat.remaining = cat.budget - cat.spent;
              }
            }

            ngo.totalRaised = (ngo.totalRaised || 0) + Number(amount);
            ngo.lastSyncedAt = new Date();
            await ngo.save();
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Donation synced successfully",
        donation: {
          transactionId: nessieTransactionId,
          amount: Number(amount),
          totalDonated: user.totalDonated,
          donationCount: user.donationCount,
          averageFraudScore: user.averageFraudScore,
        },
      });
    }

    // ----------------- WITHDRAWAL -----------------
    else if (transactionType === "withdrawal") {
      const ngo = await NGO.findOne({ authId: session.user.id }) as INGO | null;
      if (!ngo) return NextResponse.json({ success: false, error: "NGO not found" }, { status: 404 });
      if (!campaignId) return NextResponse.json({ success: false, error: "campaignId required" }, { status: 400 });

      const campaign = ngo.campaigns.find((c: any) => c.campaignId === campaignId);
      if (!campaign) return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });

      campaign.withdrawals.push({
        withdrawalId: nessieTransactionId || `WTH-${Date.now()}`,
        amount: Number(amount),
        category: category || "general",
        description: description || "",
        timestamp: new Date(),
        nessieTransactionId: nessieTransactionId || undefined,
        fraudScore: fraudScore !== undefined && fraudScore !== null ? Number(fraudScore) : 100,
        aiVerified: aiVerified !== undefined ? Boolean(aiVerified) : true,
      });

      if (category) {
        const cat = campaign.categories.find((c: any) => c.name === category);
        if (cat) {
          cat.spent = (cat.spent || 0) + Number(amount);
          cat.remaining = cat.budget - cat.spent;
        }
      }

      // sum of fraudScores for withdrawals
      const totalScore = campaign.withdrawals.reduce((acc: number, w: any) => {
        return acc + (w.fraudScore || 100);
      }, 0);
      campaign.averageFraudScore = campaign.withdrawals.length > 0 ? totalScore / campaign.withdrawals.length : 100;

      const compliantWithdrawals = campaign.withdrawals.filter((w: any) => {
        const cat = campaign.categories.find((c: any) => c.name === w.category);
        return cat && cat.spent <= cat.budget;
      }).length;
      campaign.complianceRate = campaign.withdrawals.length > 0 ? (compliantWithdrawals / campaign.withdrawals.length) * 100 : 100;

      ngo.totalWithdrawn = (ngo.totalWithdrawn || 0) + Number(amount);
      ngo.lastSyncedAt = new Date();
      await ngo.save();

      return NextResponse.json({
        success: true,
        message: "Withdrawal synced successfully",
        withdrawal: {
          withdrawalId: nessieTransactionId,
          amount: Number(amount),
          category,
          averageFraudScore: campaign.averageFraudScore,
          complianceRate: campaign.complianceRate,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid transaction type" }, { status: 400 });
  } catch (error) {
    console.error("Nessie sync error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}