import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DonationPrediction {
  predictedAmount: number;
  confidence: number;
  timeline: string;
  factors: string[];
  recommendations: string[];
}

export interface FraudDetection {
  isSuspicious: boolean;
  riskScore: number;
  reasons: string[];
  recommendations: string[];
}

export interface CampaignOptimization {
  suggestedBudget: number;
  categoryRecommendations: Array<{
    category: string;
    suggestedAmount: number;
    reasoning: string;
  }>;
  timing: {
    bestLaunchDate: string;
    optimalDuration: string;
  };
  marketingStrategy: string[];
}

export interface ImpactSimulation {
  scenarios: Array<{
    name: string;
    probability: number;
    outcome: string;
    expectedImpact: number;
  }>;
  monteCarlo: {
    bestCase: number;
    worstCase: number;
    mostLikely: number;
    confidenceInterval: string;
  };
}

class AIForecastingAgent {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Predict future donations based on historical data and trends
   */
  async predictDonations(data: {
    historicalDonations: Array<{ date: string; amount: number }>;
    campaignType: string;
    targetAudience: string;
    seasonality?: boolean;
  }): Promise<DonationPrediction> {
    const prompt = `
You are an AI superforecaster specializing in charitable donation predictions.

Analyze the following data and provide a detailed prediction:

Historical Donations:
${JSON.stringify(data.historicalDonations, null, 2)}

Campaign Type: ${data.campaignType}
Target Audience: ${data.targetAudience}
Consider Seasonality: ${data.seasonality ? "Yes" : "No"}

Provide a JSON response with:
1. predictedAmount: Predicted total donations in next 30 days (number)
2. confidence: Confidence level 0-100 (number)
3. timeline: Expected timeline description (string)
4. factors: Key factors influencing prediction (array of strings)
5. recommendations: Actionable recommendations (array of strings)

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("AI Prediction Error:", error);
      return {
        predictedAmount: 0,
        confidence: 0,
        timeline: "Unable to generate prediction",
        factors: ["Error in prediction model"],
        recommendations: ["Please try again with more data"],
      };
    }
  }

  /**
   * Detect fraudulent donations or suspicious patterns
   */
  async detectFraud(data: {
    transactions: Array<{
      id: string;
      amount: number;
      date: string;
      donorId: string;
      location?: string;
    }>;
    donorHistory?: Array<{ date: string; amount: number }>;
  }): Promise<FraudDetection> {
    const prompt = `
You are a fraud detection AI specializing in financial transactions.

Analyze these transactions for suspicious patterns:

Recent Transactions:
${JSON.stringify(data.transactions, null, 2)}

${data.donorHistory ? `Donor History:\n${JSON.stringify(data.donorHistory, null, 2)}` : ""}

Look for:
- Unusual transaction amounts
- Rapid succession of donations
- Geographic anomalies
- Pattern deviations from donor history
- Round number amounts (often fraudulent)
- Timing anomalies

Provide a JSON response with:
1. isSuspicious: Boolean indicating if fraud is detected
2. riskScore: Risk score 0-100 (number)
3. reasons: Specific reasons for suspicion (array of strings)
4. recommendations: Actions to take (array of strings)

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Fraud Detection Error:", error);
      return {
        isSuspicious: false,
        riskScore: 0,
        reasons: ["Error in fraud detection"],
        recommendations: ["Manual review recommended"],
      };
    }
  }

  /**
   * Optimize campaign structure and budget allocation
   */
  async optimizeCampaign(data: {
    campaignGoal: number;
    categories: Array<{ name: string; plannedAmount: number }>;
    targetAudience: string;
    duration: string;
    competitorData?: Array<{ name: string; raised: number }>;
  }): Promise<CampaignOptimization> {
    const prompt = `
You are a campaign optimization AI for charitable organizations.

Analyze this campaign and provide optimization recommendations:

Campaign Goal: $${data.campaignGoal}
Planned Categories:
${JSON.stringify(data.categories, null, 2)}
Target Audience: ${data.targetAudience}
Duration: ${data.duration}
${data.competitorData ? `Competitor Data:\n${JSON.stringify(data.competitorData, null, 2)}` : ""}

Provide a JSON response with:
1. suggestedBudget: Optimized total budget (number)
2. categoryRecommendations: Array of {category, suggestedAmount, reasoning}
3. timing: {bestLaunchDate, optimalDuration}
4. marketingStrategy: Array of marketing recommendations

Consider:
- Realistic fundraising potential
- Category prioritization based on impact
- Optimal timing for maximum donations
- Marketing strategies for target audience

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Campaign Optimization Error:", error);
      return {
        suggestedBudget: data.campaignGoal,
        categoryRecommendations: data.categories.map(cat => ({
          category: cat.name,
          suggestedAmount: cat.plannedAmount,
          reasoning: "Using provided amounts",
        })),
        timing: {
          bestLaunchDate: "Immediate",
          optimalDuration: data.duration,
        },
        marketingStrategy: ["Standard social media campaign", "Email outreach"],
      };
    }
  }

  /**
   * Run Monte Carlo simulation for impact prediction
   */
  async simulateImpact(data: {
    campaignBudget: number;
    categories: Array<{ name: string; amount: number; impactMetric: string }>;
    uncertaintyFactors: string[];
    historicalSuccessRate?: number;
  }): Promise<ImpactSimulation> {
    const prompt = `
You are an AI simulation expert specializing in impact forecasting.

Run a Monte Carlo-style simulation for this charitable campaign:

Campaign Budget: $${data.campaignBudget}
Categories & Impact Metrics:
${JSON.stringify(data.categories, null, 2)}
Uncertainty Factors:
${data.uncertaintyFactors.join(", ")}
Historical Success Rate: ${data.historicalSuccessRate || "Unknown"}%

Provide a JSON response with:
1. scenarios: Array of 4-5 possible scenarios with:
   - name: Scenario name
   - probability: Likelihood 0-100
   - outcome: Description
   - expectedImpact: Impact score 0-100

2. monteCarlo: Statistical analysis with:
   - bestCase: Best possible outcome value
   - worstCase: Worst possible outcome value
   - mostLikely: Most probable outcome value
   - confidenceInterval: Confidence range description

Consider various risk factors, market conditions, and historical patterns.

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Impact Simulation Error:", error);
      return {
        scenarios: [
          {
            name: "Expected Outcome",
            probability: 60,
            outcome: "Campaign meets 70-80% of goal",
            expectedImpact: 75,
          },
        ],
        monteCarlo: {
          bestCase: data.campaignBudget * 1.2,
          worstCase: data.campaignBudget * 0.5,
          mostLikely: data.campaignBudget * 0.75,
          confidenceInterval: "50-90% of goal with 95% confidence",
        },
      };
    }
  }

  /**
   * Analyze spending patterns and predict future expenses
   */
  async predictSpending(data: {
    categoryBudget: number;
    historicalSpending: Array<{ date: string; amount: number; category: string }>;
    upcomingEvents?: string[];
  }): Promise<{
    predictedSpending: number;
    burnRate: number;
    daysRemaining: number;
    alerts: string[];
    recommendations: string[];
  }> {
    const prompt = `
Analyze spending patterns and predict future expenses:

Category Budget: $${data.categoryBudget}
Historical Spending:
${JSON.stringify(data.historicalSpending, null, 2)}
${data.upcomingEvents ? `Upcoming Events:\n${data.upcomingEvents.join(", ")}` : ""}

Provide JSON with:
1. predictedSpending: Predicted total spending (number)
2. burnRate: Daily spending rate (number)
3. daysRemaining: Days until budget depleted (number)
4. alerts: Warning messages if spending is too fast (array)
5. recommendations: Suggestions to optimize spending (array)

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Spending Prediction Error:", error);
      return {
        predictedSpending: data.categoryBudget,
        burnRate: 0,
        daysRemaining: 0,
        alerts: ["Unable to calculate predictions"],
        recommendations: ["Monitor spending manually"],
      };
    }
  }

  /**
   * Generate real-time insights from public data
   */
  async analyzePublicData(data: {
    dataType: "economic" | "social" | "geopolitical" | "weather";
    region: string;
    campaignType: string;
  }): Promise<{
    insights: string[];
    impact: "positive" | "negative" | "neutral";
    recommendations: string[];
  }> {
    const prompt = `
Analyze how current public data affects charitable giving:

Data Type: ${data.dataType}
Region: ${data.region}
Campaign Type: ${data.campaignType}

Consider recent trends in:
- Economic indicators (if economic)
- Social movements (if social)
- Geopolitical events (if geopolitical)
- Weather patterns (if weather)

Provide JSON with:
1. insights: Key insights affecting donations (array)
2. impact: Overall impact (positive/negative/neutral)
3. recommendations: Strategic recommendations (array)

Respond ONLY with valid JSON, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Public Data Analysis Error:", error);
      return {
        insights: ["Unable to analyze current data"],
        impact: "neutral",
        recommendations: ["Continue with standard strategy"],
      };
    }
  }
}

// Export singleton instance
export const aiForecastingAgent = new AIForecastingAgent();

// Export class for custom instances
export default AIForecastingAgent;
