import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { userPrompt } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: "User prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI assistant for RichImpact.ai, a blockchain-based charity transparency platform.
    
A user (NGO) wants to create a new fundraising campaign with the following description:
"${userPrompt}"

Your task is to analyze this campaign and provide:
1. A compelling campaign title (concise, impactful)
2. A realistic total budget estimate (in USD)
3. 3-5 specific spending categories with individual budget allocations
4. Success probability prediction (0-100%)
5. Estimated time to reach funding goal (in days)
6. 2-3 potential risk factors
7. 3-4 strategic recommendations

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "campaignTitle": "string",
  "totalBudget": number,
  "categories": [
    {
      "name": "string",
      "amount": number
    }
  ],
  "predictions": {
    "successProbability": number,
    "estimatedDays": number,
    "riskFactors": ["string"]
  },
  "recommendations": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Parse and validate
    const aiPlan = JSON.parse(text);

    return NextResponse.json(aiPlan);
  } catch (error: any) {
    console.error("Error in AI forecast:", error);
    
    // Return a fallback response if AI fails
    return NextResponse.json({
      campaignTitle: "Emergency Relief Campaign",
      totalBudget: 100000,
      categories: [
        { name: "Emergency Supplies", amount: 40000 },
        { name: "Logistics & Distribution", amount: 30000 },
        { name: "Medical Aid", amount: 30000 },
      ],
      predictions: {
        successProbability: 75,
        estimatedDays: 45,
        riskFactors: [
          "Weather conditions may affect distribution",
          "Supply chain delays possible"
        ],
      },
      recommendations: [
        "Launch social media campaign for wider reach",
        "Partner with local organizations for credibility",
        "Provide regular updates to donors"
      ],
    });
  }
}
