"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import { Shield, ArrowLeft, Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle2, Zap, DollarSign } from "lucide-react";
import { toast } from "sonner";

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
    toast.info("🤖 Gemini AI is analyzing your campaign...");
    
    try {
      // Gemini AI analyzes the user's prompt and generates campaign plan
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      const data = await response.json();
      setAiPlan(data);
      toast.success("✨ AI forecast generated successfully!");
    } catch (error) {
      console.error("Error getting forecast:", error);
      toast.error("Failed to get AI forecast. Please try again.");
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!aiPlan) return;

    setIsCreating(true);
    toast.info("🛡️ Creating smart contract and syncing to MongoDB...");
    
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Create smart contract with Gemini insights (syncs to MongoDB automatically)
      const response = await fetch("/api/blockchain/campaign", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: aiPlan.campaignTitle,
          description: prompt,
          target: aiPlan.totalBudget,
          categories: aiPlan.categories.map(cat => ({
            name: cat.name,
            budget: cat.amount
          })),
          geminiInsights: {
            successProbability: aiPlan.predictions.successProbability,
            estimatedDays: aiPlan.predictions.estimatedDays,
            riskFactors: aiPlan.predictions.riskFactors,
            recommendations: aiPlan.recommendations,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      const result = await response.json();
      
      if (result.mongoSynced) {
        toast.success("🎉 Smart contract created and synced to MongoDB!");
      } else {
        toast.success("✅ Smart contract created successfully!");
        toast.warning("⚠️ MongoDB sync failed, but campaign is active");
      }
      
      // Redirect after short delay
      setTimeout(() => {
        router.push("/ngo");
      }, 1500);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Shield className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Contrust
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
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Create Smart Contract
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-powered campaign planning with real-time transparency and fraud detection
          </p>
        </motion.div>

        {/* API Integration Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                  Gemini AI Integration
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Analyzes your campaign description, generates optimized budget categories, predicts success probability, and provides smart recommendations
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-600">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-1">
                  Nessie API Integration
                </h3>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  Processes all donations securely, logs customer transactions, verifies accounts, and tracks real-time financial data
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 md:p-8 shadow-xl border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <form onSubmit={handleGetForecast} className="space-y-6">
              <div>
                <label className="text-lg font-semibold mb-2 block flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Describe Your Campaign
                </label>
                <Textarea
                  placeholder="e.g., 'Emergency food and shelter for Texas flood victims. We need to provide clean water, temporary housing, and medical supplies for 5000 families affected by the recent floods.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none border-2 focus:border-emerald-500"
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
                  className="w-full text-lg flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {isLoadingForecast ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Gemini AI is analyzing your campaign...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
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
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent" />

                  <div>
                    <motion.h2 
                      className="text-2xl font-bold mb-4 flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Zap className="h-6 w-6 text-emerald-600" />
                      AI-Generated Smart Contract Plan
                    </motion.h2>

                    <div className="space-y-4">
                      <motion.div 
                        className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm text-muted-foreground mb-1">Campaign Title</p>
                        <h3 className="text-xl font-bold">{aiPlan.campaignTitle}</h3>
                      </motion.div>

                      <motion.div 
                        className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm text-muted-foreground mb-1">Total Fundraising Goal</p>
                        <p className="text-3xl font-bold text-emerald-600">
                          ${aiPlan.totalBudget.toLocaleString()}
                        </p>
                        <Badge className="mt-2 bg-emerald-600">Smart Contract Enforced</Badge>
                      </motion.div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <motion.div 
                          className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <p className="font-semibold">Success Probability</p>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-emerald-600">{aiPlan.predictions.successProbability}%</p>
                            <Badge variant="secondary">AI Predicted</Badge>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="p-4 rounded-lg border-2 border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-teal-600" />
                            <p className="font-semibold">Estimated Duration</p>
                          </div>
                          <p className="text-3xl font-bold text-teal-600">{aiPlan.predictions.estimatedDays} days</p>
                        </motion.div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-emerald-600" />
                          Spending Categories (Smart Contract Enforced)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          These categories are enforced by the smart contract. All withdrawals must match these allocations and are verified by AI.
                        </p>
                        <div className="space-y-3">
                          {aiPlan.categories.map((category, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="p-4 rounded-lg border-2 border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                                  <p className="font-semibold">{category.name}</p>
                                </div>
                                <p className="text-lg font-bold text-emerald-600">
                                  ${category.amount.toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {aiPlan.predictions.riskFactors.length > 0 && (
                        <motion.div 
                          className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold mb-2">AI-Identified Risk Factors</h4>
                              <ul className="space-y-1 text-sm">
                                {aiPlan.predictions.riskFactors.map((risk, index) => (
                                  <li key={index}>• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {aiPlan.recommendations.length > 0 && (
                        <motion.div 
                          className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="flex items-start gap-2">
                            <Brain className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold mb-2">Gemini AI Recommendations</h4>
                              <ul className="space-y-1 text-sm">
                                {aiPlan.recommendations.map((rec, index) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Button
                          size="lg"
                          onClick={handleCreateCampaign}
                          disabled={isCreating}
                          className="w-full text-lg flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-shadow"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Creating Smart Contract & Syncing to MongoDB...
                            </>
                          ) : (
                            <>
                              <Shield className="h-5 w-5" />
                              Create Smart Contract
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

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              How Contrust Works
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-semibold">Gemini AI Analysis</p>
                  <p className="text-muted-foreground">AI analyzes your campaign description and generates optimized spending categories with budget allocations</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-semibold">Smart Contract Creation</p>
                  <p className="text-muted-foreground">Your campaign becomes a smart contract that enforces category spending limits and prevents fund misuse</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-semibold">Nessie API Processing</p>
                  <p className="text-muted-foreground">All donations are processed through Nessie API with secure customer logging and real-time transaction tracking</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-semibold">AI Fraud Detection</p>
                  <p className="text-muted-foreground">Every withdrawal is verified by Gemini AI to ensure it matches the intended category and includes fraud scoring</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}