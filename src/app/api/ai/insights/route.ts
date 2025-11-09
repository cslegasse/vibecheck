import { NextRequest, NextResponse } from "next/server";

export interface AIInsights {
  fraudScore?: number;
  compliance?: number;
  alerts?: number;
  recommendations?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { context, data } = await request.json();

    // Simulate AI analysis
    let insights = {
      fraudScore: 95,
      compliance: 98,
      alerts: 0,
      recommendations: [],
    };

    if (context === "donation" && data) {
      // Calculate fraud score based on donation patterns
      const amount = data.amount || 0;
      insights.fraudScore = amount > 10000 ? 85 : 95;
      insights.alerts = amount > 10000 ? 1 : 0;
    }

    if (context === "campaign" && data) {
      // Calculate compliance based on spending vs allocations
      const categories = data.categories || [];
      let totalCompliance = 0;
      categories.forEach((cat: any) => {
        const spent = parseFloat(cat.spentAmount || "0");
        const allocated = parseFloat(cat.allocatedAmount || "1");
        const categoryCompliance = Math.min((1 - spent / allocated) * 100, 100);
        totalCompliance += categoryCompliance;
      });
      insights.compliance = Math.round(totalCompliance / Math.max(categories.length, 1));
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
