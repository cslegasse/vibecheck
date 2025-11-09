export interface AIInsights {
  fraudScore?: number;
  compliance?: number;
  alerts?: number;
  activeAlerts?: number;
  recommendations?: string[];
  insights?: string[];
  keyInsight?: string;
  patterns?: string[];
  predictions?: {
    metric: string;
    value: number;
    confidence: number;
    timeframe: string;
  }[];
  anomalies?: {
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
    recommendation: string;
  }[];
}

export interface ConversationContext {
  userId?: string;
  sessionId?: string;
  conversationHistory: Message[];
  userPreferences?: {
    detailLevel: "brief" | "detailed" | "technical";
    focusAreas: string[];
    notificationPreferences: string[];
  };
  dataContext?: {
    donations?: any[];
    campaigns?: any[];
    transactions?: any[];
    historicalPatterns?: any;
  };
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    fraudScore?: number;
    suggestions?: string[];
    insights?: string[];
    intent?: string;
    entities?: Record<string, any>;
    confidence?: number;
  };
}

export interface AutonomousTask {
  id: string;
  type: "analysis" | "monitoring" | "alert" | "recommendation" | "prediction";
  status: "pending" | "running" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  scheduledFor?: Date;
  completedAt?: Date;
  result?: any;
}

export interface AICapability {
  name: string;
  description: string;
  enabled: boolean;
  autonomousLevel: "manual" | "semi-autonomous" | "fully-autonomous";
}