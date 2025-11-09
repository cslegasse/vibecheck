/**
 * Nessie API - Account Management
 * Handles donor and NGO account operations
 */

import { NextRequest, NextResponse } from "next/server";
import { nessieClient } from "@/lib/nessie-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const accountId = searchParams.get("accountId");

    // Get specific account
    if (accountId) {
      const account = await nessieClient.getAccount(accountId);
      return NextResponse.json({ success: true, account });
    }

    // Get all accounts for a customer
    if (customerId) {
      const accounts = await nessieClient.getCustomerAccounts(customerId);
      return NextResponse.json({ success: true, accounts });
    }

    return NextResponse.json(
      { success: false, error: "Missing customerId or accountId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Nessie API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, type, nickname, rewards, balance } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required" },
        { status: 400 }
      );
    }

    const result = await nessieClient.createAccount(customerId, {
      type: type || "Savings",
      nickname: nickname || "Donation Account",
      rewards: rewards || 0,
      balance: balance || 0,
    });

    return NextResponse.json({
      success: true,
      account: result.objectCreated,
    });
  } catch (error) {
    console.error("Create Account Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, nickname, rewards } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 }
      );
    }

    const result = await nessieClient.updateAccount(accountId, {
      nickname,
      rewards,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Update Account Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 }
      );
    }

    const result = await nessieClient.deleteAccount(accountId);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
