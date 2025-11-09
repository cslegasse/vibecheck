"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Brain, X, Loader2, MessageSquare, TrendingUp, Shield, AlertTriangle, Sparkles, Lightbulb, Target, Zap, Activity, BarChart3, Bell, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "sonner";

interface AIAgentProps {
  context?: "donation" | "campaign" | "general";
  data?: any;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    fraudScore?: number;
    suggestions?: string[];
    insights?: string[];
    intent?: string;
    confidence?: number;
    followUpQuestions?: string[];
  };
}

interface AIInsights {
  fraudScore?: number;
  compliance?: number;
  alerts?: number;
  activeAlerts?: number;
  predictions?: any[];
  anomalies?: any[];
  trends?: any[];
  autonomousCapabilities?: string[];
}

export function AIAgent({ context = "general", data }: AIAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiInsights, setAiInsights] = useState<AIInsights>({});
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [thinkingState, setThinkingState] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInsightsSummary, setShowInsightsSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autonomousIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Autonomous AI behavior - proactively analyzes data on open
  useEffect(() => {
    if (isOpen && context !== "general" && data && messages.length === 0) {
      performAutonomousAnalysis();
    }
  }, [isOpen, context, data]);

  // Enhanced periodic autonomous insights with smart scheduling
  useEffect(() => {
    if (autonomousMode && isOpen && messages.length > 0) {
      // Start with 45 seconds, then increase to 60 seconds
      const interval = messages.length < 3 ? 45000 : 60000;
      
      autonomousIntervalRef.current = setInterval(() => {
        if (!isLoading && !isAnalyzing) {
          generateAutonomousInsight();
        }
      }, interval);
      
      return () => {
        if (autonomousIntervalRef.current) {
          clearInterval(autonomousIntervalRef.current);
        }
      };
    }
  }, [autonomousMode, isOpen, data, messages.length, isLoading, isAnalyzing]);

  // Real-time monitoring simulation
  useEffect(() => {
    if (isOpen && autonomousMode && data) {
      const monitoringInterval = setInterval(() => {
        // Simulate real-time monitoring updates
        performBackgroundMonitoring();
      }, 10000); // Every 10 seconds
      
      return () => clearInterval(monitoringInterval);
    }
  }, [isOpen, autonomousMode, data]);

  const performBackgroundMonitoring = async () => {
    // Silent background monitoring - updates insights without interrupting
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, data }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAiInsights(prev => ({
          ...prev,
          fraudScore: result.fraudScore,
          compliance: result.compliance,
          alerts: result.alerts
        }));
      }
    } catch (error) {
      // Silent failure - don't interrupt user experience
      console.debug("Background monitoring update", error);
    }
  };

  const performAutonomousAnalysis = async () => {
    setIsAnalyzing(true);
    setThinkingState("🧠 Performing comprehensive AI analysis...");
    
    try {
      const response = await fetch("/api/ai/autonomous-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, data }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Store comprehensive insights
        setAiInsights({
          fraudScore: result.fraudScore,
          compliance: result.compliance,
          alerts: result.alerts,
          activeAlerts: result.alerts,
          predictions: result.predictions || [],
          anomalies: result.anomalies || [],
          trends: result.trends || [],
          autonomousCapabilities: result.autonomousCapabilities || []
        });
        
        // Add system message with autonomous insights
        const systemMessage: Message = {
          role: "system",
          content: result.analysis || "I've completed my analysis and I'm ready to help!",
          timestamp: new Date(),
          metadata: {
            fraudScore: result.fraudScore,
            suggestions: result.suggestions || [],
            insights: result.insights || [],
          }
        };
        
        setMessages([systemMessage]);
        
        // Add personalized greeting with key insight
        setTimeout(() => {
          const greetingMessage: Message = {
            role: "assistant",
            content: `👋 **Hello! I'm your Contrust AI Assistant**\n\nI've just performed a comprehensive autonomous analysis of your ${context === "donation" ? "donation activity" : "campaign performance"}.\n\n✨ **${result.keyInsight || "I'm here to help you understand your data, detect fraud, and optimize your impact."}"**\n\n🎯 **My Autonomous Capabilities:**\n${(result.autonomousCapabilities || []).slice(0, 4).map((cap: string) => `• ${cap}`).join('\n')}\n\nI'll continue monitoring in the background and provide proactive insights. What would you like to explore?`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, greetingMessage]);
          
          // Show anomalies if any
          if (result.anomalies && result.anomalies.length > 0) {
            setTimeout(() => {
              const highSeverityAnomalies = result.anomalies.filter((a: any) => a.severity === "high" || a.severity === "medium");
              if (highSeverityAnomalies.length > 0) {
                const anomalyMessage: Message = {
                  role: "system",
                  content: `⚠️ **${highSeverityAnomalies.length} Anomaly Alert${highSeverityAnomalies.length > 1 ? 's' : ''}**\n\n${highSeverityAnomalies.map((a: any) => `**${a.type}** (${a.severity})\n${a.description}\n💡 *Recommendation: ${a.recommendation}*`).join('\n\n')}`,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, anomalyMessage]);
              }
            }, 1500);
          }
        }, 800);
      }
    } catch (error) {
      console.error("Autonomous analysis failed:", error);
      toast.error("Failed to perform analysis");
      
      // Graceful fallback
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Hello! I'm your AI assistant. I'm ready to help you with fraud detection, spending analysis, and recommendations. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsAnalyzing(false);
      setThinkingState(null);
    }
  };

  const generateAutonomousInsight = async () => {
    if (isLoading || isAnalyzing) return;
    
    setThinkingState("💡 Generating autonomous insight...");
    
    try {
      const response = await fetch("/api/ai/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          context, 
          data,
          conversationHistory: messages.slice(-5)
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.insight) {
          const insightMessage: Message = {
            role: "system",
            content: `💡 **Autonomous Insight**\n\n${result.insight}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, insightMessage]);
          
          // Subtle notification
          if (document.hidden) {
            toast.info("New AI insight available!");
          }
        }
      }
    } catch (error) {
      console.error("Autonomous insight generation failed:", error);
    } finally {
      setThinkingState(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setInput("");
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setThinkingState("🤔 AI is analyzing your question...");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context,
          data,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const result = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
        metadata: {
          ...result.metadata,
          intent: result.intent,
          followUpQuestions: result.metadata?.followUpQuestions
        },
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update insights if provided
      if (result.metadata?.fraudScore || result.metadata?.compliance) {
        setAiInsights(prev => ({
          ...prev,
          fraudScore: result.metadata.fraudScore || prev.fraudScore,
          compliance: result.metadata.compliance || prev.compliance
        }));
      }
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error("AI response error:", error);
      
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or try rephrasing your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setThinkingState(null);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    setInput(prompt);
    // Trigger send after a brief moment
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const quickActions = [
    { icon: Shield, label: "Check Fraud Risk", prompt: "Analyze the fraud risk of recent transactions in detail", color: "text-green-600" },
    { icon: TrendingUp, label: "Optimize Spending", prompt: "Analyze spending patterns and suggest optimization strategies", color: "text-emerald-600" },
    { icon: Target, label: "Goal Progress", prompt: "Show detailed progress toward goals and predict completion timeline", color: "text-blue-600" },
    { icon: Lightbulb, label: "Get Recommendations", prompt: "What are the top 5 actions I should take right now?", color: "text-purple-600" },
  ];

  return (
    <>
      {/* Floating AI Agent Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{
              rotate: autonomousMode ? [0, 10, -10, 10, 0] : 0,
              scale: autonomousMode ? [1, 1.1, 1, 1.1, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>
          
          {/* Pulse effect when autonomous */}
          {autonomousMode && (
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          {/* Notification badge */}
          {aiInsights?.activeAlerts && aiInsights.activeAlerts > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {aiInsights.activeAlerts}
            </motion.div>
          )}
          
          {/* Autonomous indicator */}
          {autonomousMode && !isOpen && (
            <motion.div
              className="absolute -bottom-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-2.5 w-2.5 text-yellow-900" />
            </motion.div>
          )}
        </motion.button>

        {/* Enhanced Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              className="absolute bottom-20 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 2 }}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3" />
                <span>AI Assistant {autonomousMode && <span className="text-yellow-400">• Autonomous</span>}</span>
              </div>
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 transform rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Agent Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-28 right-6 z-50 w-96 max-h-[600px]"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-1">
                      Contrust AI
                      {autonomousMode && <Activity className="h-3 w-3 animate-pulse" />}
                    </h3>
                    <p className="text-xs text-emerald-100">Powered by Gemini AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {aiInsights?.predictions && aiInsights.predictions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsightsSummary(!showInsightsSummary)}
                      className="text-white hover:bg-white/20 transition-colors"
                      title="View predictions and trends"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutonomousMode(!autonomousMode)}
                    className={`text-white hover:bg-white/20 transition-colors ${autonomousMode ? 'bg-white/20' : ''}`}
                    title={autonomousMode ? "Disable autonomous mode" : "Enable autonomous mode"}
                  >
                    <Sparkles className={`h-4 w-4 ${autonomousMode ? 'text-yellow-300' : ''}`} />
                  </Button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* AI Insights Summary */}
              {aiInsights && (aiInsights.fraudScore || aiInsights.compliance) && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-semibold">{aiInsights.fraudScore || "95"}%</span>
                      <span className="text-xs text-muted-foreground">Trust</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold">{aiInsights.compliance || "98"}%</span>
                      <span className="text-xs text-muted-foreground">Compliant</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <AlertTriangle className={`h-4 w-4 ${(aiInsights.alerts || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                      <span className="text-xs font-semibold">{aiInsights.alerts || "0"}</span>
                      <span className="text-xs text-muted-foreground">Alerts</span>
                    </div>
                  </div>
                  
                  {/* Predictions Summary */}
                  {showInsightsSummary && aiInsights.predictions && aiInsights.predictions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700"
                    >
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Predictions
                      </p>
                      <div className="space-y-1">
                        {aiInsights.predictions.slice(0, 2).map((pred: any, i: number) => (
                          <div key={i} className="text-xs bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <div className="font-medium">{pred.metric}</div>
                            <div className="text-emerald-600 font-semibold">{pred.value}</div>
                            <div className="text-muted-foreground text-[10px]">{pred.confidence}% confidence • {pred.timeframe}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && !isLoading && !isAnalyzing && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2 font-medium">Advanced AI Assistant</p>
                    <p className="text-xs mb-4">Autonomous fraud detection, predictive analytics & real-time insights</p>
                    
                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.prompt)}
                          className="p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left group"
                        >
                          <action.icon className={`h-4 w-4 ${action.color} mb-1 group-hover:scale-110 transition-transform`} />
                          <p className="text-xs font-medium">{action.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                          : message.role === "system"
                          ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-gray-900 dark:text-gray-100 border border-purple-200 dark:border-purple-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.role === "system" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600">Autonomous Insight</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Metadata display */}
                      {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold mb-1">💡 Suggestions:</p>
                          <ul className="text-xs space-y-1">
                            {message.metadata.suggestions.map((suggestion, i) => (
                              <li key={i}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Follow-up questions */}
                      {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold mb-1">❓ Follow-up questions:</p>
                          <div className="space-y-1">
                            {message.metadata.followUpQuestions.slice(0, 2).map((question, i) => (
                              <button
                                key={i}
                                onClick={() => handleQuickAction(question)}
                                className="text-xs text-left w-full p-1 rounded hover:bg-white/20 transition-colors"
                              >
                                → {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.metadata?.intent && (
                          <span className="text-[10px] opacity-60 italic">
                            {message.metadata.intent.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(thinkingState || isAnalyzing) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span className="text-sm text-muted-foreground">{thinkingState}</span>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about fraud, predictions, optimization..."
                    className="min-h-[60px] resize-none"
                    disabled={isLoading || isAnalyzing}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading || isAnalyzing}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {isLoading || isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Google Gemini AI {autonomousMode && <span className="text-emerald-600">• Monitoring</span>}
                  </p>
                  {aiInsights?.autonomousCapabilities && aiInsights.autonomousCapabilities.length > 0 && (
                    <button
                      onClick={() => toast.info(`Active: ${aiInsights.autonomousCapabilities.join(', ')}`)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Bell className="h-3 w-3" />
                      {aiInsights.autonomousCapabilities.length} active
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}