import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient, DonationRecord, WithdrawalRecord } from "@/lib/smart-contract-client";

interface Donation {
  donor: string;
  amount: string;
  category: string;
  timestamp: number;
  transactionId: string;
  verifiedBy: string;
}

interface Withdrawal {
  recipient: string; // map from WithdrawalRecord category/user
  amount: string;
  category: string;
  reason: string;
  timestamp: number;
  transactionId: string;
  verifiedBy: string;
  aiVerificationScore: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const type = searchParams.get("type"); // "donations" | "withdrawals" | "all"

    if (!campaignId) {
      return NextResponse.json({ success: false, error: "campaignId is required" }, { status: 400 });
    }

    const id = parseInt(campaignId);

    // Fetch donations
    let donations: Donation[] = [];
    if (type === "donations" || type === "all" || !type) {
      const rawDonations: DonationRecord[] = await realTimeDataClient.getDonationHistory(id);
      donations = rawDonations.map(d => ({
        donor: d.donor,
        amount: d.amount,
        category: d.category,
        timestamp: d.timestamp,
        transactionId: d.transactionId,
        verifiedBy: d.verifiedBy,
      }));
    }

    // Fetch withdrawals
    let withdrawals: Withdrawal[] = [];
    if (type === "withdrawals" || type === "all" || !type) {
      const rawWithdrawals: WithdrawalRecord[] = await realTimeDataClient.getWithdrawalHistory(id);
      withdrawals = rawWithdrawals.map(w => ({
        recipient: w.category, // or map to NGO/user if you have a recipient field
        amount: w.amount,
        category: w.category,
        reason: w.reason,
        timestamp: w.timestamp,
        transactionId: w.transactionId,
        verifiedBy: w.verifiedBy,
        aiVerificationScore: w.aiVerificationScore,
      }));
    }

    return NextResponse.json({
      success: true,
      campaignId: id,
      donations,
      withdrawals,
      total: {
        donations: donations.length,
        withdrawals: withdrawals.length,
      },
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Transaction History Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
