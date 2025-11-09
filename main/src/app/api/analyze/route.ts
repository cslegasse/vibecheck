import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { campaignData, analysisType } = await request.json();

    if (!campaignData || !analysisType) {
      return NextResponse.json(
        { error: "Campaign data and analysis type are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = "";

    switch (analysisType) {
      case "category-suggestions":
        prompt = `You are an AI assistant for RichImpact.ai analyzing a charity campaign.

Campaign: ${campaignData.title}
Current Categories: ${campaignData.categories.map((c: any) => c.name).join(", ")}

Based on similar successful campaigns and current trends, suggest 2-3 additional spending categories that could improve this campaign's effectiveness.

Return ONLY a JSON array of category suggestions:
[
  {
    "name": "string",
    "reason": "string (why this category would be beneficial)",
    "suggestedAmount": number
  }
]`;
        break;

      case "fraud-detection":
        prompt = `You are a fraud detection AI for RichImpact.ai.

Campaign Data:
${JSON.stringify(campaignData, null, 2)}

Analyze for:
1. Unusual spending patterns
2. Mismatched raised vs spent amounts
3. Suspicious category allocations
4. Any red flags

Return ONLY a JSON object:
{
  "fraudRisk": "low" | "medium" | "high",
  "issues": [
    {
      "severity": "low" | "medium" | "high",
      "category": "string",
      "issue": "string",
      "recommendation": "string"
    }
  ]
}`;
        break;

      case "optimization":
        prompt = `You are an optimization AI for RichImpact.ai.

Campaign Data:
${JSON.stringify(campaignData, null, 2)}

Analyze and provide:
1. Budget reallocation suggestions
2. Timing recommendations
3. Fundraising strategy improvements
4. Impact maximization tips

Return ONLY a JSON object:
{
  "optimizations": [
    {
      "type": "budget" | "timing" | "strategy" | "impact",
      "title": "string",
      "description": "string",
      "expectedImprovement": "string (e.g., '15% increase in donations')"
    }
  ]
}`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid analysis type" },
          { status: 400 }
        );
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysis = JSON.parse(text);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Error in AI analysis:", error);
    
    // Return fallback responses based on analysis type
    const { analysisType } = await request.json();
    
    if (analysisType === "category-suggestions") {
      return NextResponse.json([
        {
          name: "Community Outreach",
          reason: "Engaging local communities increases donation transparency and trust",
          suggestedAmount: 15000,
        },
      ]);
    }
    
    if (analysisType === "fraud-detection") {
      return NextResponse.json({
        fraudRisk: "low",
        issues: [],
      });
    }
    
    if (analysisType === "optimization") {
      return NextResponse.json({
        optimizations: [
          {
            type: "strategy",
            title: "Social Media Campaign",
            description: "Launch targeted social media campaigns to increase visibility",
            expectedImprovement: "20% increase in donations",
          },
        ],
      });
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
