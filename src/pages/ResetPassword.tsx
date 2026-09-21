import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  Gift,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type Mode = "request" | "reset" | "success";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Detect recovery token in URL hash
  useEffect(() => {
    const checkRecoverySession = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      const isRecovery =
        hash.includes("type=recovery") ||
        hash.includes("access_token=") ||
        search.includes("type=recovery");

      if (isRecovery) {
        // Supabase client auto-processes the hash on page load.
        // Wait briefly, then check if session was established.
        setTimeout(async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            setMode("reset");
          } else {
            toast.error("Reset link is invalid or expired");
            setMode("request");
          }
          setIsCheckingSession(false);
        }, 500);
      } else {
        setIsCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      toast.success("Reset link sent! Check your email.");
      setMode("success");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated! Sign in with your new password.");
      await supabase.auth.signOut();
      navigate("/signin", { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </main>
        <Footer />
      </div>
    );
  }

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
              {mode === "request" && "Reset Your Password"}
              {mode === "reset" && "Set New Password"}
              {mode === "success" && "Check Your Email"}
            </h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {mode === "request" &&
                "Enter your email and we'll send you a reset link"}
              {mode === "reset" && "Choose a strong new password"}
              {mode === "success" &&
                "We've sent a password reset link to your inbox"}
            </p>
          </div>

          <Card className="border-canvas-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              {mode === "request" && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                        disabled={isSubmitting}
                      />
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              {mode === "reset" && (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting}
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

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-800"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Passwords do not match
                      </p>
                    )}

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || password !== confirmPassword}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              )}

              {mode === "success" && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">
                      Reset link sent to
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gold-600">
                      {email}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your inbox and spam folder. The link expires in 1
                    hour.
                  </p>
                </div>
              )}

              <Separator className="bg-canvas-200" />

              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-gold-600 hover:text-gold-700 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;