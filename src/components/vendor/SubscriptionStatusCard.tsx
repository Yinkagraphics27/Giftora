import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, CheckCircle2, AlertCircle, Loader2, Pause, Play, XCircle, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionLogic } from "@/hooks/useSubscriptionLogic";
import { toast } from "sonner";

export function SubscriptionStatusCard() {
  const { vendorProfile, refreshVendorProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const {
    isSubscribed,
    isPaused,
    expiryInfo,
    pauseInfo,
    freeMonthProgress,
    freeMonthEarned,
    productsUntilReward,
    canClaimFreeMonth,
    REWARD_PRODUCT_THRESHOLD,
  } = useSubscriptionLogic(vendorProfile, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setLoadingAction("subscribe");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to subscribe");
        return;
      }

      const { data, error } = await supabase.functions.invoke("initialize-subscription", {
        body: {
          callback_url: `${window.location.origin}/vendor/dashboard?subscription=success`,
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Error initializing subscription:", error);
      toast.error(error.message || "Failed to start subscription. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleManageSubscription = async (action: "pause" | "resume" | "cancel") => {
    setIsLoading(true);
    setLoadingAction(action);
    try {
      const { error } = await supabase.functions.invoke("manage-subscription", {
        body: { action },
      });

      if (error) throw error;

      await refreshVendorProfile();
      
      const messages = {
        pause: "Subscription paused successfully",
        resume: "Subscription resumed successfully",
        cancel: "Subscription cancelled",
      };
      toast.success(messages[action]);
    } catch (error: any) {
      console.error(`Error ${action}ing subscription:`, error);
      toast.error(error.message || `Failed to ${action} subscription`);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleClaimFreeMonth = async () => {
    setIsLoading(true);
    setLoadingAction("claim");
    try {
      const { error } = await supabase.functions.invoke("activate-free-month");

      if (error) throw error;

      await refreshVendorProfile();
      toast.success("🎉 Congratulations! Your free month is now active!");
    } catch (error: any) {
      console.error("Error claiming free month:", error);
      toast.error(error.message || "Failed to claim free month");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const getStatusBadge = () => {
    if (isPaused) {
      return (
        <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
          Paused
        </Badge>
      );
    }
    if (isSubscribed) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
        Inactive
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 ${
        isSubscribed
          ? "border-primary/30 bg-primary/5"
          : isPaused
          ? "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
          : "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 ${
              isSubscribed 
                ? "bg-primary/10 text-primary" 
                : isPaused
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/50"
            }`}
          >
            {isSubscribed ? (
              <Crown className="h-6 w-6" />
            ) : isPaused ? (
              <Pause className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Subscription Status
              </h3>
              {getStatusBadge()}
            </div>

            {/* Status-specific messages */}
            {isSubscribed && expiryInfo.daysRemaining !== null && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {expiryInfo.isExpiringSoon 
                    ? `Expires in ${expiryInfo.daysRemaining} days - Renew soon!`
                    : `${expiryInfo.daysRemaining} days remaining`
                  }
                </span>
              </div>
            )}

            {isPaused && (
              <p className="mt-1 text-sm text-muted-foreground">
                Your subscription is paused. {pauseInfo.pauseDaysRemaining} pause days remaining.
              </p>
            )}

            {!isSubscribed && !isPaused && (
              <p className="mt-1 text-sm text-muted-foreground">
                Subscribe for ₦10,000/month to publish unlimited products and receive buyer inquiries.
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {!isSubscribed && !isPaused && (
            <Button
              variant="gold"
              onClick={handleSubscribe}
              disabled={isLoading}
              className="shrink-0"
            >
              {loadingAction === "subscribe" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Subscribe - ₦10,000/mo
                </>
              )}
            </Button>
          )}

          {isSubscribed && !isPaused && pauseInfo.canPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManageSubscription("pause")}
              disabled={isLoading}
            >
              {loadingAction === "pause" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          )}

          {isPaused && (
            <Button
              variant="gold"
              onClick={() => handleManageSubscription("resume")}
              disabled={isLoading}
            >
              {loadingAction === "resume" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
          )}

          {(isSubscribed || isPaused) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleManageSubscription("cancel")}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              {loadingAction === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Free month progress for non-subscribers */}
      {!isSubscribed && !isPaused && !freeMonthEarned && (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Earn a FREE month!</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {productsUntilReward} products to go
            </span>
          </div>
          <Progress value={freeMonthProgress} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Post {REWARD_PRODUCT_THRESHOLD} products and get 1 month subscription FREE
          </p>
        </div>
      )}

      {/* Claim free month button */}
      {canClaimFreeMonth && !isSubscribed && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                🎉 Congratulations! You've reached {REWARD_PRODUCT_THRESHOLD} products!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Claim your FREE month of subscription now.
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleClaimFreeMonth}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loadingAction === "claim" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Claim Free Month"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Active subscription benefits */}
      {isSubscribed && (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Unlimited products • Full visibility • Receive inquiries</span>
        </div>
      )}

      {/* Inactive warning */}
      {!isSubscribed && !isPaused && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-100/50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            ⚠️ Limited visibility without subscription
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
            <li>• Only first 10 products are visible</li>
            <li>• Additional products saved as drafts</li>
            <li>• Limited search visibility</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
}
