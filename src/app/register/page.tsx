"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Shield, Loader2, ArrowLeft, UserCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"donor" | "ngo">("donor");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register with better-auth
      const { error } = await authClient.signUp.email({
        email,
        name: userType === "ngo" && organizationName ? organizationName : name,
        password,
      });

      if (error?.code) {
        const errorMessages: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered. Please login instead.",
        };
        toast.error(errorMessages[error.code] || "Registration failed");
        setIsLoading(false);
        return;
      }

      toast.success("✅ Account created successfully!");

      // Step 2: Login to get token
      const { error: loginError } = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (loginError) {
        toast.info("Account created! Please login.");
        router.push("/login");
        return;
      }

      // Step 3: Sync with MongoDB
      const token = localStorage.getItem("bearer_token");
      
      if (userType === "donor") {
        // Sync as donor
        await fetch("/api/mongodb/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ userType: "donor" }),
        });
        toast.success("🎉 Donor profile synced to MongoDB!");
      } else {
        // Sync as NGO
        await fetch("/api/mongodb/ngo/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationName: organizationName || name,
            description: "",
            website: "",
          }),
        });
        toast.success("🎉 NGO profile synced to MongoDB!");
      }

      // Redirect based on user type
      setTimeout(() => {
        router.push(userType === "donor" ? "/donor" : "/ngo");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
              <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 shadow-2xl border-2 border-emerald-100 dark:border-emerald-800">
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Shield className="h-12 w-12 text-emerald-600" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Join Contrust
              </h1>
              <p className="text-muted-foreground">
                Create your account with MongoDB tracking
              </p>
            </div>

            {/* User Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setUserType("donor")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === "donor"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <UserCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-semibold">Donor</p>
                  <p className="text-xs text-muted-foreground">Make donations</p>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setUserType("ngo")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === "ngo"
                      ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                  <p className="font-semibold">Organization</p>
                  <p className="text-xs text-muted-foreground">Run campaigns</p>
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {userType === "ngo" && (
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium mb-2">
                    Organization Name
                  </label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your Organization"
                    required
                    className="border-2 focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {userType === "ngo" ? "Contact Name" : "Full Name"}
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={userType === "ngo" ? "Contact Person" : "John Doe"}
                  required
                  className="border-2 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="border-2 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                  className="border-2 focus:border-emerald-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  At least 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                  className="border-2 focus:border-emerald-500"
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating account & syncing to MongoDB...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-center text-emerald-800 dark:text-emerald-200">
                🛡️ Your unique tracking ID will be generated and stored in MongoDB Atlas
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}