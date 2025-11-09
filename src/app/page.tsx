"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Shield, TrendingUp, Brain, Zap, CheckCircle, LogIn, UserPlus, LogOut } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [isLoadingUserType, setIsLoadingUserType] = useState(false);

  // Fetch user type from MongoDB
  useEffect(() => {
    const fetchUserType = async () => {
      if (!session?.user) {
        setUserType(null);
        return;
      }

      setIsLoadingUserType(true);
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/mongodb/user/sync", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedUserType = data.user?.userType || null;
          setUserType(fetchedUserType);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      } finally {
        setIsLoadingUserType(false);
      }
    };

    if (session?.user && !isPending) {
      fetchUserType();
    }
  }, [session, isPending]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      setUserType(null);
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  const handleDashboardClick = () => {
    // Route based on user type from MongoDB
    if (userType === "ngo") {
      router.push("/ngo");
    } else if (userType === "donor") {
      router.push("/donor");
    } else {
      // If user type not determined yet, show message
      toast.error("Please complete your profile setup first");
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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
            <motion.div 
              className="flex gap-4 items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {!isPending && session?.user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {session.user.email}
                  </span>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      onClick={handleDashboardClick}
                      disabled={isLoadingUserType}
                    >
                      {isLoadingUserType ? "Loading..." : "Dashboard"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Link href="/register">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register
                      </Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-16"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp}>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            >
              Smart Contracts for Trust
            </motion.h1>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200"
            variants={fadeInUp}
          >
            AI-Powered Donation Transparency
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
            variants={fadeInUp}
          >
            Create smart contracts between donors and organizations. Track every dollar in real-time with AI verification, fraud detection, and complete transparency using live data.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
            variants={fadeInUp}
          >
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/donor" className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Start Donating
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/ngo" className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Register Organization
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-8 text-center"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-4xl font-bold text-emerald-600 mb-1"
              >
                100%
              </motion.div>
              <p className="text-sm text-muted-foreground">Transparent</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="text-4xl font-bold text-teal-600 mb-1"
              >
                Real-Time
              </motion.div>
              <p className="text-sm text-muted-foreground">Tracking</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-4xl font-bold text-green-600 mb-1"
              >
                AI-Verified
              </motion.div>
              <p className="text-sm text-muted-foreground">Security</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 shadow-lg hover:shadow-2xl transition-all duration-300">
              <motion.div 
                className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="h-6 w-6 text-emerald-600" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Smart Contract Trust</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organizations specify fundraising goals and spending categories. Smart contracts enforce transparency and prevent fund misuse.
              </p>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border-2 border-transparent hover:border-teal-200 dark:hover:border-teal-800 shadow-lg hover:shadow-2xl transition-all duration-300">
              <motion.div 
                className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 flex items-center justify-center mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Brain className="h-6 w-6 text-teal-600" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gemini AI provides smart explanations, fraud detection, and real-time verification of every transaction with detailed analysis.
              </p>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 shadow-lg hover:shadow-2xl transition-all duration-300">
              <motion.div 
                className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Live Progress Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor donations, spending, and category allocations in real-time with fraud scores and compliance ratings for complete transparency.
              </p>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="p-8 max-w-3xl mx-auto bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500"
              >
                <Zap className="h-12 w-12 text-white" />
              </motion.div>
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-2">Build Trust with Smart Contracts</h3>
                <p className="text-muted-foreground mb-4">
                  Join organizations and donors using AI-powered smart contracts for transparent, verified, and fraud-free charitable giving.
                </p>
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Link href="/donor">Start Donating</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" asChild>
                      <Link href="/ngo">Create Campaign</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}