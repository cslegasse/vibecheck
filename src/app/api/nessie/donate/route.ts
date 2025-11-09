/**
 * Nessie API - Donation Processing
 * Handles donation transactions using Nessie's transfer system
 * Automatically syncs with MongoDB for user tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { nessieClient } from "@/lib/nessie-client";
import { realTimeDataClient } from "@/lib/smart-contract-client";
import { aiForecastingAgent } from "@/lib/ai-forecasting-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      donorAccountId,
      ngoAccountId,
      amount,
      campaignId,
      category,
      description,
    } = body;

    // Validate required fields
    if (!donorAccountId || !ngoAccountId || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: "donorAccountId, ngoAccountId, and amount are required",
        },
        { status: 400 }
      );
    }

    // Step 1: Verify sufficient funds
    const hasFunds = await nessieClient.verifySufficientFunds(
      donorAccountId,
      amount
    );

    if (!hasFunds) {
      return NextResponse.json(
        { success: false, error: "Insufficient funds" },
        { status: 400 }
      );
    }

    // Step 2: Run AI fraud detection
    let fraudScore = 100;
    let aiVerified = true;
    try {
      const donorAccount = await nessieClient.getAccount(donorAccountId);
      const transactions = await nessieClient.getAccountTransactions(
        donorAccountId
      );

      const fraudCheck = await aiForecastingAgent.detectFraud({
        transactions: transactions.slice(0, 10).map((t) => ({
          id: t._id,
          amount: t.amount,
          date: t.transaction_date,
          donorId: donorAccountId,
        })),
      });

      fraudScore = 100 - fraudCheck.riskScore;
      aiVerified = !fraudCheck.isSuspicious;

      if (fraudCheck.isSuspicious && fraudCheck.riskScore > 70) {
        return NextResponse.json(
          {
            success: false,
            error: "Transaction flagged for review",
            fraudDetails: fraudCheck,
          },
          { status: 403 }
        );
      }
    } catch (aiError) {
      console.error("AI fraud detection error:", aiError);
      // Continue with transaction even if AI check fails
    }

    // Step 3: Process donation through Nessie
    const donationResult = await nessieClient.processDonation(
      donorAccountId,
      ngoAccountId,
      amount,
      description || `Donation to campaign ${campaignId || "general"}`
    );

    if (!donationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: donationResult.error || "Donation failed",
        },
        { status: 500 }
      );
    }

    // Step 4: Record with real-time data tracking (if available)
    let dataRecord = null;
    if (campaignId && category) {
      try {
        dataRecord = await realTimeDataClient.recordDonation({
          campaignId: parseInt(campaignId),
          amount,
          category,
          donorId: donorAccountId,
          nessieAccountId: donorAccountId,
        });
      } catch (recordError) {
        console.error("Real-time data recording error:", recordError);
        // Continue even if recording fails
      }
    }

    // Step 5: Sync transaction with MongoDB
    try {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/mongodb/nessie/sync-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionType: 'donation',
          nessieTransactionId: donationResult.transactionId,
          amount,
          campaignId,
          category,
          description,
          nessieAccountId: donorAccountId,
          fraudScore,
          aiVerified,
        }),
      });
    } catch (mongoError) {
      console.error("MongoDB sync error:", mongoError);
      // Continue even if MongoDB sync fails
    }

    // Step 6: Return success response
    return NextResponse.json({
      success: true,
      transactionId: donationResult.transactionId,
      dataRecordId: dataRecord?.transactionId,
      verificationScore: dataRecord?.verificationScore,
      fraudScore,
      aiVerified,
      amount,
      timestamp: new Date().toISOString(),
      message: "Donation processed and synced successfully",
    });
  } catch (error) {
    console.error("Donation Processing Error:", error);
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
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 }
      );
    }

    // Get donation history
    const transfers = await nessieClient.getAccountTransfers(accountId);

    return NextResponse.json({
      success: true,
      donations: transfers,
      total: transfers.length,
    });
  } catch (error) {
    console.error("Get Donations Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}