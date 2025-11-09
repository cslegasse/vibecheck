"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Sparkles, ArrowLeft, Brain, Loader2, Heart, TrendingUp, Shield, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Category {
  name: string;
  amount: number;
  raised: number;
  spent: number;
}

interface Campaign {
  _id: string;
  title: string;
  totalBudget: number;
  totalRaised: number;
  categories: Category[];
}

export default function DonorPage() {
  const [campaigns] = useState<Campaign[]>([
    {
      _id: "1",
      title: "Emergency Relief for Florida Flood Victims",
      totalBudget: 500000,
      totalRaised: 320000,
      categories: [
        { name: "Clean Water Supply", amount: 150000, raised: 95000, spent: 45000 },
        { name: "Emergency Shelter", amount: 200000, raised: 125000, spent: 60000 },
        { name: "Medical Supplies", amount: 150000, raised: 100000, spent: 30000 },
      ],
    },
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  const handleGetAIExplanation = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsLoadingExplanation(true);
    setAiExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign._id,
          traceData: campaign,
        }),
      });

      const data = await response.json();
      setAiExplanation(data.explanation);
      toast.success("AI analysis complete!");
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      toast.error("Failed to generate explanation. Please try again.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleDonateClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationForm(true);
    setSelectedCategory(campaign.categories[0]?.name || "");
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !donationAmount || !selectedCategory) return;

    setIsDonating(true);
    try {
      const response = await fetch("/api/donations/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign._id,
          amount: parseFloat(donationAmount),
          category: selectedCategory,
          donorId: "DONOR-" + Date.now(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("🎉 Donation successful!", {
          description: `Transaction ID: ${data.transactionId}`,
        });
        setDonationAmount("");
        setShowDonationForm(false);
        
        // Fetch transaction history
        fetchTransactionHistory(selectedCampaign._id);
      } else {
        toast.error("Donation failed", {
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Failed to process donation");
    } finally {
      setIsDonating(false);
    }
  };

  const fetchTransactionHistory = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/transactions/history?campaignId=${campaignId}`);
      const data = await response.json();
      if (data.success) {
        setTransactionHistory([...data.donations, ...data.withdrawals]);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
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
              <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support a Campaign
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track your impact with AI-powered transparency
          </p>
        </motion.div>

        <div className="space-y-8">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 md:p-8 shadow-xl border-2 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        AI Verified
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Secure
                      </Badge>
                      <Badge className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        <TrendingUp className="h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleGetAIExplanation(campaign)}
                        disabled={isLoadingExplanation}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {isLoadingExplanation ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            AI Explain
                          </>
                        )}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => handleDonateClick(campaign)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Heart className="h-4 w-4" />
                        Donate Now
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Total Progress</span>
                    <span className="text-muted-foreground">
                      ${campaign.totalRaised.toLocaleString()} / ${campaign.totalBudget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(campaign.totalRaised / campaign.totalBudget) * 100} className="h-3" />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      {Math.round((campaign.totalRaised / campaign.totalBudget) * 100)}% funded
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      ${(campaign.totalBudget - campaign.totalRaised).toLocaleString()} remaining
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedCampaign?._id === campaign._id && aiExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Brain className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-lg mb-2">AI Transparency Analysis</h3>
                            <p className="text-muted-foreground">{aiExplanation}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showDonationForm && selectedCampaign?._id === campaign._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
                        <form onSubmit={handleDonationSubmit} className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-lg">Make a Donation</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category">Select Category</Label>
                            <select
                              id="category"
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full px-3 py-2 rounded-md border bg-background"
                              required
                            >
                              {campaign.categories.map((cat) => (
                                <option key={cat.name} value={cat.name}>
                                  {cat.name} (${cat.raised.toLocaleString()} / ${cat.amount.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="amount">Donation Amount ($)</Label>
                            <Input
                              id="amount"
                              type="number"
                              min="1"
                              step="0.01"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              placeholder="Enter amount"
                              required
                            />
                          </div>

                          <div className="flex gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                              <Button
                                type="submit"
                                disabled={isDonating}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                              >
                                {isDonating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm Donation
                                  </>
                                )}
                              </Button>
                            </motion.div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowDonationForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Funding Categories</h3>
                  {campaign.categories.map((category, catIndex) => (
                    <motion.div
                      key={catIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: catIndex * 0.05 }}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors duration-200"
                    >
                      <h4 className="font-semibold text-lg mb-3">{category.name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <p className="text-muted-foreground text-xs mb-1">Budget</p>
                          <p className="font-bold text-blue-600">${category.amount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <p className="text-muted-foreground text-xs mb-1">Raised</p>
                          <p className="font-bold text-green-600">${category.raised.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <p className="text-muted-foreground text-xs mb-1">Spent</p>
                          <p className="font-bold text-purple-600">${category.spent.toLocaleString()}</p>
                        </div>
                      </div>
                      <Progress 
                        value={(category.raised / category.amount) * 100} 
                        className="h-2" 
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          {Math.round((category.raised / category.amount) * 100)}% of goal
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {category.spent < category.raised ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              On Track
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="h-3 w-3" />
                              Review
                            </span>
                          )}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}