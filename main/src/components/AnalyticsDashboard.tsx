"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Activity,
  DollarSign,
  Target,
} from "lucide-react";
import {
  analyzeSpendingPatterns,
  detectFraudAlerts,
  generateSpendingRecommendations,
  calculateSuccessProbability,
  type SpendingPattern,
  type FraudAlert,
} from "@/lib/ai-utils";

interface Category {
  name: string;
  amount: number;
  raised: number;
  spent: number;
}

interface AnalyticsDashboardProps {
  campaign: {
    _id: string;
    title: string;
    totalBudget: number;
    totalRaised: number;
    categories: Category[];
    createdAt?: Date;
  };
}

export default function AnalyticsDashboard({ campaign }: AnalyticsDashboardProps) {
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [successProbability, setSuccessProbability] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      const patterns = analyzeSpendingPatterns(campaign.categories);
      const alerts = detectFraudAlerts(campaign.categories);
      const recs = generateSpendingRecommendations(campaign.categories);
      const probability = calculateSuccessProbability({
        totalBudget: campaign.totalBudget,
        totalRaised: campaign.totalRaised,
        daysElapsed: 15,
        targetDays: 60,
      });

      setSpendingPatterns(patterns);
      setFraudAlerts(alerts);
      setRecommendations(recs);
      setSuccessProbability(probability);
      setIsAnalyzing(false);
    }, 1500);
  }, [campaign]);

  const fundingProgress = (campaign.totalRaised / campaign.totalBudget) * 100;
  const totalSpent = campaign.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const utilizationRate = campaign.totalRaised > 0 ? (totalSpent / campaign.totalRaised) * 100 : 0;

  if (isAnalyzing) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-blue-600" />
          </motion.div>
          <p className="text-lg font-medium">AI is analyzing campaign data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold">${campaign.totalRaised.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funding Progress</p>
                <p className="text-2xl font-bold">{Math.round(fundingProgress)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold">{Math.round(utilizationRate)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successProbability}%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Success Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold">AI Campaign Prediction</h3>
                <Badge variant="secondary" className="text-xs">
                  Powered by Gemini
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Predicted Success Probability</span>
                    <span className="font-bold">{successProbability}%</span>
                  </div>
                  <Progress value={successProbability} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {successProbability >= 80
                    ? "🎉 Excellent! This campaign is trending very positively and likely to reach its goal."
                    : successProbability >= 60
                    ? "👍 Good progress! Campaign is on track with moderate adjustments needed."
                    : "⚠️ Attention needed. Consider implementing recommended strategies to improve outcomes."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Fraud Alerts */}
      <AnimatePresence>
        {fraudAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
                    AI Fraud Detection Alerts
                  </h3>
                  <div className="space-y-2">
                    {fraudAlerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg bg-white dark:bg-gray-800 border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : alert.severity === "medium"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="font-medium text-sm">{alert.category}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            {alert.confidence}% confidence
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spending Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Spending Efficiency Analysis</h3>
          </div>
          <div className="space-y-4">
            {spendingPatterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pattern.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ${pattern.spent.toLocaleString()} / ${pattern.budget.toLocaleString()}
                    </span>
                    {pattern.efficiency > 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : pattern.efficiency > 50 ? (
                      <Activity className="h-4 w-4 text-orange-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <Progress value={pattern.efficiency} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(pattern.efficiency)}% of budget utilized
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">AI-Powered Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
