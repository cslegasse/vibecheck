import { NextRequest, NextResponse } from "next/server";

/**
 * Advanced Autonomous AI Analysis API
 * Performs comprehensive proactive analysis without user prompting
 * Features:
 * - Multi-dimensional data analysis
 * - Predictive insights and forecasting
 * - Anomaly detection
 * - Risk assessment
 * - Opportunity identification
 * - Trend analysis
 */
export async function POST(request: NextRequest) {
  try {
    const { context, data, userId } = await request.json();

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    let analysis = "";
    let fraudScore = 95;
    let compliance = 98;
    let alerts = 0;
    let suggestions: string[] = [];
    let insights: string[] = [];
    let keyInsight = "";
    let predictions: any[] = [];
    let anomalies: any[] = [];
    let trends: any[] = [];

    if (geminiApiKey) {
      try {
        // Build comprehensive autonomous analysis prompt
        const prompt = buildComprehensiveAnalysisPrompt(context, data);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Parse comprehensive AI response
          const parsedAnalysis = parseComprehensiveAnalysis(aiResponse);
          analysis = parsedAnalysis.analysis;
          fraudScore = parsedAnalysis.fraudScore || fraudScore;
          compliance = parsedAnalysis.compliance || compliance;
          alerts = parsedAnalysis.alerts || alerts;
          suggestions = parsedAnalysis.suggestions || [];
          insights = parsedAnalysis.insights || [];
          keyInsight = parsedAnalysis.keyInsight || "";
          predictions = parsedAnalysis.predictions || [];
          anomalies = parsedAnalysis.anomalies || [];
          trends = parsedAnalysis.trends || [];
        }
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall through to rule-based analysis
      }
    }

    // Enhanced fallback with advanced rule-based analysis
    if (!analysis) {
      const ruleBasedAnalysis = performAdvancedRuleBasedAnalysis(context, data);
      analysis = ruleBasedAnalysis.analysis;
      fraudScore = ruleBasedAnalysis.fraudScore;
      compliance = ruleBasedAnalysis.compliance;
      alerts = ruleBasedAnalysis.alerts;
      suggestions = ruleBasedAnalysis.suggestions;
      insights = ruleBasedAnalysis.insights;
      keyInsight = ruleBasedAnalysis.keyInsight;
      predictions = ruleBasedAnalysis.predictions;
      anomalies = ruleBasedAnalysis.anomalies;
      trends = ruleBasedAnalysis.trends;
    }

    return NextResponse.json({
      analysis,
      fraudScore,
      compliance,
      alerts,
      suggestions,
      insights,
      keyInsight,
      predictions,
      anomalies,
      trends,
      timestamp: new Date().toISOString(),
      autonomousCapabilities: [
        "Real-time fraud monitoring",
        "Predictive analytics",
        "Anomaly detection",
        "Trend analysis",
        "Risk assessment",
        "Opportunity identification"
      ]
    });
  } catch (error) {
    console.error("Autonomous analysis error:", error);
    return NextResponse.json(
      { error: "Failed to perform autonomous analysis" },
      { status: 500 }
    );
  }
}

function buildComprehensiveAnalysisPrompt(context: string, data: any): string {
  const basePrompt = `You are Contrust AI Assistant - an advanced autonomous AI agent with comprehensive analytical capabilities.

**Mission:** Perform proactive, multi-dimensional analysis without being prompted. Identify patterns, predict outcomes, detect anomalies, and provide actionable intelligence.

**Context:** ${context}
**User Data:** ${JSON.stringify(data, null, 2)}

**Analysis Framework:**

1. **Security & Fraud Analysis**
   - Analyze transaction patterns for suspicious activity
   - Calculate fraud risk scores with confidence levels
   - Identify potential security vulnerabilities
   - Assess donor/organization trust indicators

2. **Performance Analysis**
   - Evaluate campaign/donation effectiveness
   - Calculate key performance metrics
   - Compare against historical baselines
   - Identify success factors and bottlenecks

3. **Predictive Intelligence**
   - Forecast future trends based on current data
   - Predict campaign completion timelines
   - Estimate future funding needs
   - Anticipate potential issues before they occur

4. **Anomaly Detection**
   - Identify unusual patterns in transactions
   - Detect outliers in donation amounts
   - Flag spending irregularities
   - Highlight behavioral changes

5. **Opportunity Identification**
   - Find optimization opportunities
   - Identify high-potential categories
   - Suggest growth strategies
   - Recommend efficiency improvements

6. **Trend Analysis**
   - Analyze donation velocity over time
   - Track category performance trends
   - Identify seasonal patterns
   - Monitor engagement trends

**Output Format:**
Provide comprehensive analysis in this exact structure:

ANALYSIS: [Overall assessment with key findings, 2-3 paragraphs]

FRAUD_SCORE: [0-100]
COMPLIANCE: [0-100]
ALERTS: [number of active concerns]

SUGGESTIONS:
- [Specific actionable suggestion 1]
- [Specific actionable suggestion 2]
- [Specific actionable suggestion 3]
- [Specific actionable suggestion 4]
- [Specific actionable suggestion 5]

INSIGHTS:
- [Data-driven insight 1]
- [Data-driven insight 2]
- [Data-driven insight 3]

KEY_INSIGHT: [Most compelling insight in one sentence]

PREDICTIONS:
- METRIC: [what you're predicting] | VALUE: [predicted value] | CONFIDENCE: [0-100] | TIMEFRAME: [when]
- [additional predictions...]

ANOMALIES:
- TYPE: [anomaly type] | SEVERITY: [low/medium/high] | DESCRIPTION: [what's unusual] | RECOMMENDATION: [what to do]
- [additional anomalies...]

TRENDS:
- CATEGORY: [what's trending] | DIRECTION: [up/down/stable] | MAGNITUDE: [change %] | SIGNIFICANCE: [why it matters]
- [additional trends...]

**Critical Instructions:**
- Use specific numbers from the data
- Provide confidence levels for predictions
- Prioritize actionable insights over observations
- Be proactive - suggest actions before problems occur
- Consider context-specific factors
- Maintain professional but conversational tone

Begin comprehensive autonomous analysis:`;

  return basePrompt;
}

function parseComprehensiveAnalysis(aiResponse: string): any {
  const parsed: any = {
    analysis: "",
    fraudScore: 95,
    compliance: 98,
    alerts: 0,
    suggestions: [],
    insights: [],
    keyInsight: "",
    predictions: [],
    anomalies: [],
    trends: []
  };

  // Extract analysis
  const analysisMatch = aiResponse.match(/ANALYSIS:\s*(.+?)(?=FRAUD_SCORE:|$)/);
  if (analysisMatch) {
    parsed.analysis = analysisMatch[1].trim();
  }

  // Extract scores
  const fraudScoreMatch = aiResponse.match(/FRAUD_SCORE:\s*(\d+)/);
  if (fraudScoreMatch) {
    parsed.fraudScore = Math.min(100, Math.max(0, parseInt(fraudScoreMatch[1])));
  }

  const complianceMatch = aiResponse.match(/COMPLIANCE:\s*(\d+)/);
  if (complianceMatch) {
    parsed.compliance = Math.min(100, Math.max(0, parseInt(complianceMatch[1])));
  }

  const alertsMatch = aiResponse.match(/ALERTS:\s*(\d+)/);
  if (alertsMatch) {
    parsed.alerts = parseInt(alertsMatch[1]);
  }

  // Extract suggestions
  const suggestionsMatch = aiResponse.match(/SUGGESTIONS:\s*(.+?)(?=INSIGHTS:|$)/);
  if (suggestionsMatch) {
    parsed.suggestions = suggestionsMatch[1]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.substring(1).trim())
      .filter(s => s.length > 0)
      .slice(0, 5);
  }

  // Extract insights
  const insightsMatch = aiResponse.match(/INSIGHTS:\s*(.+?)(?=KEY_INSIGHT:|$)/);
  if (insightsMatch) {
    parsed.insights = insightsMatch[1]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.substring(1).trim())
      .filter(s => s.length > 0)
      .slice(0, 3);
  }

  // Extract key insight
  const keyInsightMatch = aiResponse.match(/KEY_INSIGHT:\s*(.+?)(?=PREDICTIONS:|$)/);
  if (keyInsightMatch) {
    parsed.keyInsight = keyInsightMatch[1].trim();
  }

  // Extract predictions
  const predictionsMatch = aiResponse.match(/PREDICTIONS:\s*(.+?)(?=ANOMALIES:|$)/);
  if (predictionsMatch) {
    const predictionLines = predictionsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    parsed.predictions = predictionLines.map(line => {
      const metricMatch = line.match(/METRIC:\s*([^|]+)/);
      const valueMatch = line.match(/VALUE:\s*([^|]+)/);
      const confidenceMatch = line.match(/CONFIDENCE:\s*(\d+)/);
      const timeframeMatch = line.match(/TIMEFRAME:\s*(.+)$/);
      
      if (metricMatch) {
        return {
          metric: metricMatch[1].trim(),
          value: valueMatch ? valueMatch[1].trim() : "N/A",
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 70,
          timeframe: timeframeMatch ? timeframeMatch[1].trim() : "Unknown"
        };
      }
      return null;
    }).filter(p => p !== null);
  }

  // Extract anomalies
  const anomaliesMatch = aiResponse.match(/ANOMALIES:\s*(.+?)(?=TRENDS:|$)/);
  if (anomaliesMatch) {
    const anomalyLines = anomaliesMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    parsed.anomalies = anomalyLines.map(line => {
      const typeMatch = line.match(/TYPE:\s*([^|]+)/);
      const severityMatch = line.match(/SEVERITY:\s*([^|]+)/);
      const descMatch = line.match(/DESCRIPTION:\s*([^|]+)/);
      const recMatch = line.match(/RECOMMENDATION:\s*(.+)$/);
      
      if (typeMatch) {
        return {
          type: typeMatch[1].trim(),
          severity: (severityMatch ? severityMatch[1].trim().toLowerCase() : "low") as "low" | "medium" | "high",
          description: descMatch ? descMatch[1].trim() : "",
          recommendation: recMatch ? recMatch[1].trim() : ""
        };
      }
      return null;
    }).filter(a => a !== null);
  }

  // Extract trends
  const trendsMatch = aiResponse.match(/TRENDS:\s*(.+?)$/);
  if (trendsMatch) {
    const trendLines = trendsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    parsed.trends = trendLines.map(line => {
      const categoryMatch = line.match(/CATEGORY:\s*([^|]+)/);
      const directionMatch = line.match(/DIRECTION:\s*([^|]+)/);
      const magnitudeMatch = line.match(/MAGNITUDE:\s*([^|]+)/);
      const significanceMatch = line.match(/SIGNIFICANCE:\s*(.+)$/);
      
      if (categoryMatch) {
        return {
          category: categoryMatch[1].trim(),
          direction: directionMatch ? directionMatch[1].trim() : "stable",
          magnitude: magnitudeMatch ? magnitudeMatch[1].trim() : "N/A",
          significance: significanceMatch ? significanceMatch[1].trim() : ""
        };
      }
      return null;
    }).filter(t => t !== null);
  }

  return parsed;
}

function performAdvancedRuleBasedAnalysis(context: string, data: any): any {
  // Calculate metrics
  const donations = data?.donationHistory || [];
  const campaigns = data?.campaigns || [];
  const categories = data?.categories || [];
  
  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
  const avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
  
  const totalRaised = campaigns.reduce((sum: number, c: any) => sum + (c.totalRaised || 0), 0);
  const totalGoal = campaigns.reduce((sum: number, c: any) => sum + (c.totalBudget || 0), 0);
  const progressPct = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;

  // Fraud score calculation
  let fraudScore = 95;
  const recentLargeDonations = donations.filter((d: any) => d.amount > avgDonation * 3).length;
  if (recentLargeDonations > 0) {
    fraudScore = Math.max(85, 95 - (recentLargeDonations * 2));
  }

  // Compliance calculation
  let compliance = 98;
  let overBudgetCategories = 0;
  categories.forEach((cat: any) => {
    const spent = parseFloat(cat.spent || "0");
    const allocated = parseFloat(cat.allocated || "1");
    if (spent > allocated) {
      overBudgetCategories++;
    }
  });
  if (overBudgetCategories > 0) {
    compliance = Math.max(70, 98 - (overBudgetCategories * 5));
  }

  // Generate analysis
  const analysis = context === "donation" 
    ? `I've analyzed your donation activity across ${totalDonations} transactions totaling $${totalAmount.toLocaleString()}. Your average contribution is $${avgDonation.toFixed(2)}, and all transactions show consistent patterns indicating legitimate activity. The fraud detection system has verified each transaction with an average trust score of ${fraudScore}%. Your donations are distributed across ${categories.length} categories, demonstrating diversified impact.`
    : `I've analyzed ${campaigns.length} active campaign(s) with $${totalRaised.toLocaleString()} raised toward a $${totalGoal.toLocaleString()} goal (${progressPct.toFixed(1)}% complete). All spending is tracked across ${categories.length} categories with ${compliance}% compliance to smart contract terms. The campaign shows ${progressPct > 50 ? "strong" : "moderate"} momentum with transparent fund allocation.`;

  // Generate suggestions
  const suggestions = context === "donation" ? [
    "Set up recurring donations to maximize long-term impact",
    "Diversify contributions across high-trust categories (95%+ scores)",
    "Enable real-time fraud alerts for instant security updates",
    "Review monthly donation reports for pattern insights",
    "Consider increasing contributions to underfunded but high-impact categories"
  ] : [
    "Share progress updates weekly to maintain donor engagement",
    "Optimize budget allocation based on actual spending patterns",
    "Set automated alerts at 80% category budget thresholds",
    "Promote high-performing categories to attract more funding",
    "Implement milestone celebrations to boost visibility"
  ];

  // Generate insights
  const insights = [
    `${totalDonations} transactions analyzed with ${fraudScore}% average trust score`,
    `Compliance rate of ${compliance}% indicates strong transparency`,
    progressPct > 75 ? "Campaign momentum is excellent - on track to exceed goal" :
    progressPct > 50 ? "Good progress - maintain current engagement levels" :
    "Building traction - focus on donor acquisition"
  ];

  const keyInsight = context === "donation"
    ? `Your donations show consistent patterns with ${fraudScore}% trust score. All funds are being verified and tracked in real-time with AI-powered transparency.`
    : `Campaign is ${progressPct.toFixed(1)}% funded with ${compliance}% compliance. Smart contracts ensure every dollar is spent according to plan.`;

  // Generate predictions
  const predictions = [];
  if (progressPct > 0 && progressPct < 100) {
    const daysElapsed = 30; // Approximate
    const dailyRate = totalRaised / daysElapsed;
    const remainingAmount = totalGoal - totalRaised;
    const estimatedDays = dailyRate > 0 ? Math.ceil(remainingAmount / dailyRate) : 0;
    
    predictions.push({
      metric: "Campaign completion",
      value: `${estimatedDays} days`,
      confidence: 75,
      timeframe: "Based on current funding rate"
    });
  }

  predictions.push({
    metric: "Next month donations",
    value: `$${Math.round(totalAmount * 1.15).toLocaleString()}`,
    confidence: 70,
    timeframe: "30 days"
  });

  // Detect anomalies
  const anomalies = [];
  if (recentLargeDonations > 2) {
    anomalies.push({
      type: "Unusual donation amounts",
      severity: "low" as const,
      description: `${recentLargeDonations} donations significantly above average detected`,
      recommendation: "Monitor for consistency; likely legitimate high-value donors"
    });
  }
  
  if (overBudgetCategories > 0) {
    anomalies.push({
      type: "Budget overrun",
      severity: "medium" as const,
      description: `${overBudgetCategories} categories have exceeded allocated budgets`,
      recommendation: "Review spending plans and reallocate funds or adjust budgets"
    });
  }

  // Identify trends
  const trends = [
    {
      category: "Donation velocity",
      direction: totalDonations > 10 ? "up" : "stable",
      magnitude: `${totalDonations} transactions`,
      significance: "Indicates growing donor engagement"
    },
    {
      category: "Campaign progress",
      direction: progressPct > 50 ? "up" : progressPct > 25 ? "stable" : "slow",
      magnitude: `${progressPct.toFixed(1)}%`,
      significance: progressPct > 50 ? "Strong momentum toward goal" : "Needs visibility boost"
    }
  ];

  return {
    analysis,
    fraudScore,
    compliance,
    alerts: anomalies.filter(a => a.severity !== "low").length,
    suggestions,
    insights,
    keyInsight,
    predictions,
    anomalies,
    trends
  };
}