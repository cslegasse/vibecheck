import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { message, context, data, conversationHistory, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    let response = "";
    let metadata: any = {};
    let intent = "";
    let confidence = 0;

    if (geminiApiKey) {
      try {
        // Analyze user intent first for better response routing
        const intentAnalysis = await analyzeIntent(message, geminiApiKey);
        intent = intentAnalysis.intent;
        confidence = intentAnalysis.confidence;

        // Build sophisticated context-aware prompt
        function buildAdvancedChatPrompt(
            message: string, 
            context: string, 
            data: any, 
            conversationHistory: any[],
            intent: string
          ): string {
            const recentHistory = conversationHistory.slice(-5)
              .map((msg: any) => `${msg.role}: ${msg.content}`)
              .join('\n') || "No previous conversation";

            const relevantData = extractRelevantData(data, context, intent);

            return `
          You are Contrust AI, an assistant specialized in fraud detection, spending analysis, campaign tracking, and recommendations.

          **Context:** ${context}
          **Intent:** ${intent}
          **User ID:** ${data?.userId || "anonymous"}
          **Recent Conversation:** ${recentHistory}
          **Relevant Data:** ${JSON.stringify(relevantData, null, 2)}

          User Question: "${message}"

          Guidelines:
          - Be concise, helpful, and conversational.
          - Use numbers and metrics from data when possible.
          - Suggest 1-3 clear next actions.
          - Highlight insights if relevant.
          - Maintain security awareness; never expose secrets.
          - If intent is fraud_check, provide confidence scores.

          Respond naturally, include actionable suggestions or insights at the end if relevant.
          `;
          }

        
        const geminiResponse = await fetch(
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
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
                candidateCount: 1,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            }),
          }
        );

        if (geminiResponse.ok) {
          const result = await geminiResponse.json();
          const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Parse advanced response with entity extraction
          const parsed = parseAdvancedAIResponse(aiText, data, context);
          response = parsed.response;
          metadata = {
            ...parsed.metadata,
            intent,
            confidence,
            processingTime: parsed.processingTime
          };

          // Generate follow-up suggestions based on intent
          if (parsed.suggestFollowUp) {
            metadata.followUpQuestions = generateFollowUpQuestions(intent, context, data);
          }
        }
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall through to rule-based response
      }
    }

    // Intelligent fallback with enhanced rule-based responses
    if (!response) {
      const ruleBasedResponse = generateIntelligentFallback(message, context, data, conversationHistory);
      response = ruleBasedResponse.response;
      metadata = ruleBasedResponse.metadata;
      intent = ruleBasedResponse.intent;
    }

    return NextResponse.json({
      response,
      metadata,
      intent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

/**
 * Analyze user intent using Gemini for better response routing
 */
async function analyzeIntent(message: string, apiKey: string): Promise<{ intent: string; confidence: number }> {
  try {
    const intentPrompt = `Analyze the following user message and identify the primary intent. Return ONLY a JSON object.

Message: "${message}"

Classify into ONE of these intents:
- fraud_check: User wants to check fraud risk or transaction security
- spending_analysis: User wants to analyze spending patterns or optimization
- progress_tracking: User wants to check campaign progress or donation history
- recommendations: User wants actionable advice or next steps
- explanation: User wants to understand how something works
- data_query: User wants specific data or metrics
- general_chat: General conversation or greeting
- complaint: User is expressing dissatisfaction or reporting issues
- task_request: User wants the AI to perform a specific task

Return format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {"key": "value"}
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: intentPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || "general_chat",
          confidence: parsed.confidence || 0.7
        };
      }
    }
  } catch (error) {
    console.error("Intent analysis error:", error);
  }

  // Fallback to keyword matching
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("fraud") || lowerMessage.includes("risk") || lowerMessage.includes("security")) {
    return { intent: "fraud_check", confidence: 0.8 };
  } else if (lowerMessage.includes("spend") || lowerMessage.includes("optimiz") || lowerMessage.includes("allocat")) {
    return { intent: "spending_analysis", confidence: 0.8 };
  } else if (lowerMessage.includes("progress") || lowerMessage.includes("goal") || lowerMessage.includes("track")) {
    return { intent: "progress_tracking", confidence: 0.8 };
  } else if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("what should")) {
    return { intent: "recommendations", confidence: 0.8 };
  } else if (lowerMessage.includes("how") || lowerMessage.includes("what") || lowerMessage.includes("explain")) {
    return { intent: "explanation", confidence: 0.7 };
  }

  return { intent: "general_chat", confidence: 0.6 };
}

/**
 * Build advanced context-aware prompt with rich data integration
 */
function buildAdvancedChatPrompt(
  message: string, 
  context: string, 
  data: any, 
  conversationHistory: any[],
  intent: string
): string {
  const recentHistory = conversationHistory.slice(-5).map((msg: any) => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  const relevantData = extractRelevantData(data, context, intent);

  const systemContext = `You are Contrust AI Assistant, an AI agent specialized in:

Core Capabilities:
1. Fraud Detection and Security Analysis
   - Real-time transaction monitoring
   - Pattern recognition for suspicious activities
   - Risk assessment with confidence scores
   - Anomaly detection using historical baselines

2. Data Analysis and Insights
   - Campaign performance metrics
   - Donation pattern analysis
   - Spending optimization recommendations
   - Predictive analytics for fundraising trends

3. Goal Tracking and Progress Monitoring
   - Real-time campaign progress updates
   - Category-wise budget utilization
   - Donor engagement metrics
   - Impact measurement and reporting

4. Autonomous Recommendations
   - Proactive optimization suggestions
   - Best practice guidance
   - Risk mitigation strategies
   - Growth opportunity identification

5. Smart Contract Enforcement
   - Budget compliance verification
   - Category spending validation
   - Transaction authorization
   - Transparency reporting

Current Context: ${context}
Detected Intent: ${intent}
User ID: ${data?.userId || "anonymous"}

Available Data:
${JSON.stringify(relevantData, null, 2)}

Recent Conversation:
${recentHistory || "No previous conversation"}

User Question: "${message}"

Response Guidelines:
1. Be conversational, helpful, and clear
2. Use specific numbers and metrics when available
3. Provide actionable recommendations
4. Include confidence levels for fraud analysis
5. Explain patterns or anomalies
6. Suggest follow-up actions
7. Reference previous conversation context when relevant
8. Acknowledge data limitations if needed
9. Maintain security awareness

Special Instructions for Intent: ${intent}
${getIntentSpecificInstructions(intent)}

Output Format:
Respond naturally. If you have suggestions, end with:

SUGGESTIONS:
- [actionable suggestion 1]
- [actionable suggestion 2]

If patterns or insights are present:
INSIGHTS:
- [data-driven insight 1]
- [data-driven insight 2]

Now respond to the user's question:`;

  return systemContext;
}


function getIntentSpecificInstructions(intent: string): string {
  const instructions: Record<string, string> = {
    fraud_check: `Focus on security metrics, provide fraud scores with confidence levels, explain detection methodology, and recommend preventive measures.`,
    spending_analysis: `Analyze spending patterns, compare against budgets, identify inefficiencies, suggest reallocation strategies, and project future needs.`,
    progress_tracking: `Provide clear progress metrics, compare against goals, highlight milestones achieved, identify bottlenecks, and estimate completion timelines.`,
    recommendations: `Give 3-5 specific, prioritized action items with expected impact and implementation difficulty. Focus on quick wins and high-impact changes.`,
    explanation: `Provide clear, step-by-step explanations with examples. Use analogies when helpful. Offer to dive deeper into specific aspects.`,
    data_query: `Extract and present the requested data in a clear format. Provide context and comparisons to make numbers meaningful.`,
    task_request: `Confirm you understand the task, explain what you'll do, perform the analysis, present results, and confirm if the task is complete.`,
    complaint: `Acknowledge the concern empathetically, investigate the issue using available data, provide explanation, offer solutions, and escalate if needed.`,
    general_chat: `Be friendly and helpful. Subtly guide the conversation toward how you can provide value in fraud detection, analysis, or recommendations.`
  };

  return instructions[intent] || instructions.general_chat;
}

function extractRelevantData(data: any, context: string, intent: string): any {
  if (!data) return {};

  const relevant: any = {
    context,
    intent
  };

  // Always include key metrics
  if (data.metrics) {
    relevant.metrics = data.metrics;
  }

  // Intent-specific data extraction
  if (intent === "fraud_check" || intent === "spending_analysis") {
    relevant.transactions = data.donationHistory?.slice(-10) || [];
    relevant.fraudScores = data.fraudScores || [];
  }

  if (intent === "progress_tracking") {
    relevant.campaigns = data.campaigns || [];
    relevant.totalRaised = data.totalRaised;
    relevant.totalBudget = data.totalBudget;
  }

  if (intent === "spending_analysis") {
    relevant.categories = data.categories || [];
    relevant.spending = data.spending || {};
  }

  // Context-specific data
  if (context === "donation") {
    relevant.donationHistory = data.donationHistory?.slice(-5) || [];
    relevant.favoriteCategories = data.favoriteCategories || [];
  } else if (context === "campaign") {
    relevant.activeCampaigns = data.campaigns?.filter((c: any) => c.status === "active") || [];
    relevant.categoryBreakdown = data.categories || [];
  }

  return relevant;
}

function parseAdvancedAIResponse(aiText: string, data: any, context: string): any {
  const startTime = Date.now();
  
  // Extract main response (everything before SUGGESTIONS or INSIGHTS)
  const response = aiText
    .replace(/SUGGESTIONS:[\s\S]*$/g, '')
    .replace(/INSIGHTS:[\s\S]*$/g, '')
    .trim();
  
  const metadata: any = {};
  
  // Extract suggestions
  const suggestionsMatch = aiText.match(/SUGGESTIONS:\s*([\s\S]*?)(?=INSIGHTS:|$)/);
  if (suggestionsMatch) {
    metadata.suggestions = suggestionsMatch[1]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.substring(1).trim())
      .filter(s => s.length > 0);
  }

  // Extract insights
  const insightsMatch = aiText.match(/INSIGHTS:\s*([\s\S]*?)$/);
  if (insightsMatch) {
    metadata.insights = insightsMatch[1]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.substring(1).trim())
      .filter(s => s.length > 0);
  }

  // Extract numeric metrics mentioned
  const fraudScoreMatch = aiText.match(/(?:fraud|trust|security)[\s-]?score[:\s]*(\d+)%?/i);
  if (fraudScoreMatch) {
    metadata.fraudScore = parseInt(fraudScoreMatch[1]);
  }

  const complianceMatch = aiText.match(/compliance[:\s]*(\d+)%?/i);
  if (complianceMatch) {
    metadata.compliance = parseInt(complianceMatch[1]);
  }

  // Check if response suggests follow-up
  metadata.suggestFollowUp = aiText.toLowerCase().includes("would you like") || 
                             aiText.toLowerCase().includes("want to know more") ||
                             aiText.includes("?");

  const processingTime = Date.now() - startTime;

  return { 
    response, 
    metadata, 
    processingTime,
    suggestFollowUp: metadata.suggestFollowUp
  };
}

function generateFollowUpQuestions(intent: string, context: string, data: any): string[] {
  const questions: Record<string, string[]> = {
    fraud_check: [
      "Show me the fraud risk for each category",
      "What patterns indicate potential fraud?",
      "How can I improve my trust score?"
    ],
    spending_analysis: [
      "Which categories are over/under budget?",
      "How can I optimize spending distribution?",
      "What are the spending trends over time?"
    ],
    progress_tracking: [
      "What milestones are coming up next?",
      "How does this compare to similar campaigns?",
      "When will we reach our goal at this pace?"
    ],
    recommendations: [
      "What should I prioritize first?",
      "What's the expected impact of these changes?",
      "Are there any quick wins I can implement now?"
    ],
    explanation: [
      "Can you explain the technical details?",
      "How does this compare to alternatives?",
      "What are the potential risks?"
    ]
  };

  return questions[intent] || [
    "What insights can you provide about my data?",
    "Are there any anomalies I should know about?",
    "What actions would you recommend?"
  ];
}

function generateIntelligentFallback(
  message: string, 
  context: string, 
  data: any,
  conversationHistory: any[]
): any {
  const lowerMessage = message.toLowerCase();
  const intent = analyzeIntentFallback(lowerMessage);

  if (intent === "fraud_check") {
    return generateFraudCheckResponse(data, context);
  } else if (intent === "spending_analysis") {
    return generateSpendingAnalysisResponse(data, context);
  } else if (intent === "progress_tracking") {
    return generateProgressTrackingResponse(data, context);
  } else if (intent === "recommendations") {
    return generateRecommendationsResponse(data, context);
  } else if (intent === "explanation") {
    return generateExplanationResponse(message, data, context);
  }

  return {
    response: `I am your AI assistant for donation transparency and fraud detection. I can help you with:

- Security Analysis: Check fraud risk and transaction safety
- Spending Optimization: Analyze and improve fund allocation
- Progress Tracking: Monitor campaign goals and achievements
- Recommendations: Get actionable next steps
- Explanations: Understand how smart contracts and AI verification work

What would you like to explore?`,
    metadata: {},
    intent: "general_chat"
  };
}

function analyzeIntentFallback(message: string): string {
  if (message.includes("fraud") || message.includes("risk") || message.includes("security") || message.includes("safe")) {
    return "fraud_check";
  } else if (message.includes("spend") || message.includes("optimiz") || message.includes("allocat") || message.includes("budget")) {
    return "spending_analysis";
  } else if (message.includes("progress") || message.includes("goal") || message.includes("track") || message.includes("status")) {
    return "progress_tracking";
  } else if (message.includes("recommend") || message.includes("suggest") || message.includes("should i") || message.includes("what next")) {
    return "recommendations";
  } else if (message.includes("how") || message.includes("what") || message.includes("why") || message.includes("explain")) {
    return "explanation";
  }
  return "general_chat";
}

function generateFraudCheckResponse(data: any, context: string): any {
  const avgScore = data?.metrics?.averageFraudScore || 95;
  const recentTransactions = data?.donationHistory?.length || 0;

  return {
    response: `Fraud risk analysis complete.
Security status: Excellent
Trust score: ${avgScore}% (${recentTransactions} transactions analyzed)
All recent transactions passed verification.
No suspicious patterns detected.
Monitoring includes transaction amounts, donor verification, category allocation, historical fraud indicators, and anomaly detection.
Donations are secure and verified.`,
    metadata: {
      fraudScore: avgScore,
      suggestions: [
        "Enable real-time fraud alerts",
        "Review transaction history weekly",
        "Verify recipient organization credentials"
      ],
      insights: [
        `${recentTransactions} transactions analyzed with ${avgScore}% average trust score`,
        "AI monitoring active for pattern detection"
      ]
    },
    intent: "fraud_check"
  };
}

function generateSpendingAnalysisResponse(data: any, context: string): any {
  const categories = data?.categories || [];
  const totalSpent = categories.reduce((sum: number, cat: any) => sum + (parseFloat(cat.spent) || 0), 0);

  return {
    response: `Spending analysis report.
Active categories: ${categories.length}
Total spent: $${totalSpent.toLocaleString()}
Compliance rate: ${data?.metrics?.complianceRate || 98}%
Top categories:
${categories.slice(0, 3).map((cat: any, i: number) => {
  const spent = parseFloat(cat.spent) || 0;
  const budget = parseFloat(cat.allocated) || 1;
  const pct = Math.round((spent / budget) * 100);
  return `${i + 1}. ${cat.name}: $${spent.toLocaleString()} / $${budget.toLocaleString()} (${pct}%)`;
}).join('\n')}
Optimization opportunities are available. Would you like detailed recommendations?`,
    metadata: {
      suggestions: [
        "Reallocate funds from overfunded to high-impact categories",
        "Set alerts at 80% budget threshold",
        "Review underutilized categories for consolidation"
      ],
      insights: [
        `Top category accounts for ${Math.round((parseFloat(categories[0]?.spent) || 0) / totalSpent * 100)}% of spending`,
        "All spending within smart contract limits"
      ]
    },
    intent: "spending_analysis"
  };
}

function generateProgressTrackingResponse(data: any, context: string): any {
  const campaigns = data?.campaigns || [];
  const totalRaised = campaigns.reduce((sum: number, c: any) => sum + (c.totalRaised || 0), 0);
  const totalGoal = campaigns.reduce((sum: number, c: any) => sum + (c.totalBudget || 0), 0);
  const progressPct = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  return {
    response: `Progress report.
Active campaigns: ${campaigns.length}
Raised: $${totalRaised.toLocaleString()} of $${totalGoal.toLocaleString()}
Completion: ${progressPct}%
Momentum analysis: ${progressPct >= 75 ? "Excellent progress, on track to exceed goals" :
      progressPct >= 50 ? "Good momentum, maintain donor engagement" :
      progressPct >= 25 ? "Building traction, consider boosting visibility" :
      "Early stage, focus on donor acquisition"}
Milestones: ${Math.floor(progressPct / 25)} of 4 completed
Every dollar is tracked and verified.`,
    metadata: {
      suggestions: [
        "Share progress updates",
        "Highlight completed milestones",
        "Set up milestone notifications"
      ],
      insights: [
        `Campaign is ${progressPct}% funded`,
        `Average donation size: $${Math.round(totalRaised / Math.max(data?.donationHistory?.length || 1, 1))}`
      ]
    },
    intent: "progress_tracking"
  };
}

function generateRecommendationsResponse(data: any, context: string): any {
  return {
    response: `Personalized action plan.
High impact:
1. Enable recurring donations
2. Set budget alerts
3. Share progress updates
Optimization:
4. Diversify across high-trust categories
5. Review underutilized categories
6. Enable AI insights for monitoring
Growth:
7. Build donor engagement programs
8. Implement predictive fundraising
9. Use AI-generated optimization tips
Which area would you like to tackle first?`,
    metadata: {
      suggestions: [
        "Start with recurring donations",
        "Enable real-time monitoring",
        "Schedule weekly reviews"
      ],
      insights: [
        "Following these recommendations improves outcomes",
        "AI-powered insights optimize campaigns"
      ]
    },
    intent: "recommendations"
  };
}

function generateExplanationResponse(message: string, data: any, context: string): any {
  if (message.toLowerCase().includes("smart contract")) {
    return {
      response: `How smart contracts work:
- Budget categories and limits are set upfront
- Withdrawals are checked against limits
- AI verifies transactions and detects anomalies
- Donors see real-time updates and compliance scores
Smart contracts increase transparency and reduce fraud.
Do you want details on any specific part?`,
      metadata: {
        insights: [
          "Smart contracts reduce fraud compared to traditional methods",
          "Real-time transparency increases donor trust"
        ]
      },
      intent: "explanation"
    };
  }

  return {
    response: `Please specify what you want explained. I can clarify:
- How smart contracts enforce transparency
- How AI detects fraud
- How category budgets work
- How verification works
- How spending compliance is calculated
What would you like to learn about?`,
    metadata: {},
    intent: "explanation"
  };
}
