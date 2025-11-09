/**
 * Company/NGO Verification API
 * Provides real-time company data and transparency information
 */

import { NextRequest, NextResponse } from "next/server";
import { realTimeDataClient } from "@/lib/smart-contract-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ngoId = searchParams.get("ngoId");

    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: "ngoId is required" },
        { status: 400 }
      );
    }

    // Get company data with real-time verification
    const companyData = await realTimeDataClient.getCompanyData(ngoId);

    if (!companyData) {
      return NextResponse.json(
        { success: false, error: "Company data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: companyData,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Company Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
