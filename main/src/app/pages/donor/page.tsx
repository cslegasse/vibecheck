"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Plus, ArrowLeft, Brain, TrendingUp, BarChart3 } from "lucide-react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AINotificationSystem, { useAINotifications } from "@/components/AINotificationSystem";

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
    // Simulate AI agent generating notifications
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
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
              </Button>
              <Button asChild>
                <Link href="/donor">Donate</Link>
              </Button>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NGO Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your campaigns with AI-powered insights
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/ngo/new">
                <Plus className="h-5 w-5" />
                Create New Campaign
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first campaign with AI-powered forecasting
            </p>
            <Button asChild>
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
                <Card className="p-6 md:p-8 shadow-xl border-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI Optimized
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Active
                        </Badge>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={showAnalytics ? "secondary" : "default"}
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
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
                      <h3 className="font-semibold text-lg">Categories</h3>
                      {campaign.categories.map((category, catIndex) => (
                        <motion.div
                          key={catIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: catIndex * 0.05 }}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
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
                              <p className="font-medium text-blue-600">${category.spent.toLocaleString()}</p>
                            </div>
                          </div>
                          <Progress 
                            value={(category.raised / category.amount) * 100} 
                            className="h-2 mt-3" 
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Notification System */}
      <AINotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        onAction={(id) => {
          console.log("Action taken for notification:", id);
          dismissNotification(id);
        }}
      />
    </div>
  );
}