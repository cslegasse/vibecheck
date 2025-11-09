"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AIPlan {
  campaignTitle: string;
  totalBudget: number;
  categories: { name: string; amount: number }[];
  predictions: {
    successProbability: number;
    estimatedDays: number;
    riskFactors: string[];
  };
  recommendations: string[];
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleGetForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoadingForecast(true);
    try {
      const response = await fetch("/api/ai/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      const data = await response.json();
      setAiPlan(data);
    } catch (error) {
      console.error("Error getting forecast:", error);
      alert("Failed to get AI forecast. Please try again.");
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!aiPlan) return;

    setIsCreating(true);
    try {
      // Simulate campaign creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Campaign created successfully! 🎉");
      router.push("/ngo");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RichImpact.ai
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/ngo"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Campaign
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let AI analyze your cause and create an optimized funding plan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 md:p-8 shadow-xl">
            <form onSubmit={handleGetForecast} className="space-y-6">
              <div>
                <label className="text-lg font-semibold mb-2 block flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Describe Your Campaign
                </label>
                <Textarea
                  placeholder="e.g., 'Emergency food and shelter for Texas flood victims. We need to provide clean water, temporary housing, and medical supplies for 5000 families affected by the recent floods.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Be as specific as possible. Include details about the cause, target beneficiaries, and expected impact.
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoadingForecast || !prompt.trim()}
                  className="w-full text-lg flex items-center gap-2"
                >
                  {isLoadingForecast ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      AI is analyzing your campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate AI Forecast
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <AnimatePresence>
              {aiPlan && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 space-y-6"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      AI-Generated Campaign Plan
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                        <p className="text-sm text-muted-foreground mb-1">Campaign Title</p>
                        <h3 className="text-xl font-bold">{aiPlan.campaignTitle}</h3>
                      </div>

                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                        <p className="text-3xl font-bold text-green-600">
                          ${aiPlan.totalBudget.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <p className="font-semibold">Success Probability</p>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold">{aiPlan.predictions.successProbability}%</p>
                            <Badge variant="secondary">AI Predicted</Badge>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <p className="font-semibold">Estimated Duration</p>
                          </div>
                          <p className="text-3xl font-bold">{aiPlan.predictions.estimatedDays} days</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Funding Categories</h3>
                        <div className="space-y-3">
                          {aiPlan.categories.map((category, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 rounded-lg border bg-card"
                            >
                              <div className="flex justify-between items-center">
                                <p className="font-semibold">{category.name}</p>
                                <p className="text-lg font-bold text-blue-600">
                                  ${category.amount.toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {aiPlan.predictions.riskFactors.length > 0 && (
                        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold mb-2">Risk Factors</h4>
                              <ul className="space-y-1 text-sm">
                                {aiPlan.predictions.riskFactors.map((risk, index) => (
                                  <li key={index}>• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {aiPlan.recommendations.length > 0 && (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2">
                            <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold mb-2">AI Recommendations</h4>
                              <ul className="space-y-1 text-sm">
                                {aiPlan.recommendations.map((rec, index) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="lg"
                          onClick={handleCreateCampaign}
                          disabled={isCreating}
                          className="w-full text-lg flex items-center gap-2"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Creating Campaign...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              Create Campaign
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
