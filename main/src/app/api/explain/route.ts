import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { campaignId, traceData } = await request.json();

    if (!traceData) {
      return NextResponse.json(
        { error: "Trace data is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI assistant for RichImpact.ai, a blockchain-based charity transparency platform.

A donor wants to understand the impact and transparency of their donation to the following campaign:

Campaign: ${traceData.title}
Total Budget: $${traceData.totalBudget.toLocaleString()}
Total Raised: $${traceData.totalRaised.toLocaleString()}
Funding Progress: ${Math.round((traceData.totalRaised / traceData.totalBudget) * 100)}%

Categories:
${traceData.categories.map((cat: any) => 
  `- ${cat.name}: Raised $${cat.raised.toLocaleString()} / $${cat.amount.toLocaleString()}, Spent $${cat.spent.toLocaleString()}`
).join('\n')}

Your task:
1. Provide a clear, friendly explanation (2-4 sentences) about:
   - How the campaign is progressing
   - Where the money is being allocated
   - The transparency and accountability measures in place
   - Any notable achievements or milestones

2. Make it personal and reassuring to the donor
3. Highlight the blockchain transparency aspect
4. Be specific about the numbers and categories

Return ONLY the explanation text (no JSON, no formatting, just the plain text explanation).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text().trim();

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Error in AI explanation:", error);
    
    // Return a fallback explanation if AI fails
    const { traceData } = await request.json();
    const progress = Math.round((traceData.totalRaised / traceData.totalBudget) * 100);
    
    return NextResponse.json({
      explanation: `This campaign has reached ${progress}% of its funding goal, with $${traceData.totalRaised.toLocaleString()} raised so far. Every transaction is recorded on the blockchain for complete transparency. The funds are being allocated across ${traceData.categories.length} key categories, with regular updates on spending to ensure your donation makes a real impact. You can track exactly how your contribution is being used to make a difference.`
    });
  }
}
