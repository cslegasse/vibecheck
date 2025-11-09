"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Shield, Plus, ArrowLeft, Brain, TrendingUp, BarChart3, Activity, Target, Award, Building2, Home } from "lucide-react";
import AnalyticsDashboard from "@/components//ui/AnalyticsDashboard";
import AINotificationSystem, { useAINotifications } from "@/components/ui/AINotificationSystem";
import { AIAgent } from "@/components/ai-agents";

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

export default function NGOPage() {
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

  const [showAnalytics, setShowAnalytics] = useState(false);
  const { notifications, addNotification, dismissNotification } = useAINotifications();

  useEffect(() => {
    setTimeout(() => {
      addNotification({
        type: "insight",
        title: "Donation Trend Detected",
        message: "Your campaign is trending 15% above average for similar causes. Great momentum!",
        priority: "low",
      });
    }, 2000);

    setTimeout(() => {
      addNotification({
        type: "recommendation",
        title: "Optimize Category Allocation",
        message: "Consider reallocating 10% from Medical Supplies to Emergency Shelter based on demand patterns.",
        priority: "medium",
        actionable: true,
      });
    }, 5000);

    setTimeout(() => {
      addNotification({
        type: "success",
        title: "Milestone Reached",
        message: "You've reached 64% of your funding goal! Keep up the excellent work.",
        priority: "low",
      });
    }, 8000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
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
            <div className="flex gap-4 items-center">
              <Badge variant="outline" className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20">
                <Building2 className="h-3 w-3" />
                <span className="text-xs font-semibold">Organization Dashboard</span>
              </Badge>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Organization Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage smart contracts with AI-powered insights
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Link href="/ngo/new">
                <Plus className="h-5 w-5" />
                Create Smart Contract
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first smart contract campaign with AI-powered verification
            </p>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Link href="/ngo/new">Create Campaign</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 md:p-8 shadow-xl border-2 border-emerald-100 dark:border-emerald-900">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600">
                          <Brain className="h-3 w-3" />
                          AI Verified
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 border-green-600 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          Active
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 border-emerald-600 text-emerald-600">
                          <Target className="h-3 w-3" />
                          Smart Contract
                        </Badge>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={showAnalytics ? "secondary" : "default"}
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={showAnalytics ? "" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {showAnalytics ? "Hide Analytics" : "View AI Analytics"}
                      </Button>
                    </motion.div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Total Progress</span>
                      <span className="text-muted-foreground">
                        ${campaign.totalRaised.toLocaleString()} / ${campaign.totalBudget.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(campaign.totalRaised / campaign.totalBudget) * 100} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round((campaign.totalRaised / campaign.totalBudget) * 100)}% funded
                    </p>
                  </div>

                  {showAnalytics ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <AnalyticsDashboard campaign={campaign} />
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-emerald-600" />
                        Smart Contract Categories
                      </h3>
                      {campaign.categories.map((category, catIndex) => {
                        const progress = (category.raised / category.amount) * 100;
                        const spentPercent = (category.spent / category.raised) * 100;
                        
                        return (
                          <motion.div
                            key={catIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: catIndex * 0.05 }}
                            className="p-4 rounded-lg border-2 border-emerald-100 dark:border-emerald-900 bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-lg">{category.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {progress.toFixed(1)}% funded
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">Budget</p>
                                <p className="font-medium">${category.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Raised</p>
                                <p className="font-medium text-green-600">${category.raised.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Spent</p>
                                <p className="font-medium text-teal-600">${category.spent.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Fundraising Progress</span>
                                  <span className="font-semibold text-emerald-600">{progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Budget Utilization</span>
                                  <span className="font-semibold text-teal-600">{spentPercent.toFixed(1)}%</span>
                                </div>
                                <Progress value={spentPercent} className="h-2" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AINotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        onAction={(id) => {
          console.log("Action taken for notification:", id);
          dismissNotification(id);
        }}
      />
      
      <AIAgent context="campaign" data={{ campaigns }} />
    </div>
  );
}