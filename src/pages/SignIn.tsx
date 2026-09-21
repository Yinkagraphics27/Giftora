import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { RoleSelector, PublicRole } from "@/components/auth/RoleSelector";
import { getUserRole, getRoleLandingPath } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, user, isLoading: authLoading } = useAuth();

  const [role, setRole] = useState<PublicRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect based on their real role
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      const userRole = await getUserRole(user.id);
      const target = getRoleLandingPath(userRole);
      navigate(target, { replace: true });
    })();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) throw error;

      // Auth succeeded — now get the role from DB
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) throw new Error("Sign-in succeeded but no user found");

      const userRole = await getUserRole(authUser.id);
      const target = getRoleLandingPath(userRole);

      if (role !== userRole && userRole !== "admin") {
        toast.info(
          `Signed in as ${userRole === "vendor" ? "Vendor" : "Buyer"}`
        );
      } else {
        toast.success("Welcome back!");
      }

      navigate(target, { replace: true });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message ?? "Could not sign in";
      if (msg.toLowerCase().includes("invalid")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabCopy =
    role === "vendor"
      ? {
          heading: "Vendor Sign In",
          subheading: "Manage your gift business and orders.",
          signupText: "Want to sell on Giftora?",
          signupLink: "/signup",
          signupLabel: "Apply as a vendor",
        }
      : {
          heading: "Welcome back",
          subheading: "Sign in to track your orders and reviews.",
          signupText: "New to Giftora?",
          signupLink: "/signup",
          signupLabel: "Create an account",
        };

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 ring-2 ring-gold-500/40">
              <Gift className="h-6 w-6 text-gold-500" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy-800">
              {tabCopy.heading}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tabCopy.subheading}
            </p>
          </div>

          <Card className="border-canvas-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              <RoleSelector value={role} onChange={setRole} />

              <Separator className="bg-canvas-200" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/reset-password"
                      className="text-xs font-medium text-gold-600 hover:text-gold-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-800"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <Separator className="bg-canvas-200" />

              <p className="text-center text-sm text-muted-foreground">
                {tabCopy.signupText}{" "}
                <Link
                  to={tabCopy.signupLink}
                  className="font-semibold text-gold-600 hover:text-gold-700 hover:underline"
                >
                  {tabCopy.signupLabel}
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to Giftora's Terms & Privacy Policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;