import { motion } from "framer-motion";
import { Gift, TrendingUp, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionLogic } from "@/hooks/useSubscriptionLogic";
import { useAuth } from "@/contexts/AuthContext";

interface ProductLimitBannerProps {
  productCount?: number;
}

export function ProductLimitBanner({ productCount = 0 }: ProductLimitBannerProps) {
  const { vendorProfile } = useAuth();
  const {
    isSubscribed,
    freeTierUsage,
    freeMonthProgress,
    freeMonthEarned,
    productsUntilReward,
    productCounts,
    FREE_PRODUCT_LIMIT,
    REWARD_PRODUCT_THRESHOLD,
  } = useSubscriptionLogic(vendorProfile, []);

  // Use passed productCount or calculate from hook
  const totalProducts = productCount || productCounts.total;

  // Don't show if subscribed
  if (isSubscribed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-secondary/5 p-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Free Tier Usage */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Free Listings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress
              value={(freeTierUsage.used / FREE_PRODUCT_LIMIT) * 100}
              className="h-2 flex-1"
            />
            <span className="text-sm text-muted-foreground">
              {freeTierUsage.used}/{FREE_PRODUCT_LIMIT} used
            </span>
          </div>
          {freeTierUsage.isAtLimit && (
            <p className="mt-1 text-xs text-muted-foreground">
              Subscribe to publish more products
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-12 w-px bg-border sm:block" />

        {/* Progress to Free Month */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {freeMonthEarned ? (
              <Star className="h-4 w-4 text-amber-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-foreground">
              {freeMonthEarned ? "Free Month Earned!" : "Road to Free Month"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress
              value={freeMonthProgress}
              className="h-2 flex-1"
            />
            <span className="text-sm text-muted-foreground">
              {totalProducts}/{REWARD_PRODUCT_THRESHOLD}
            </span>
          </div>
          {!freeMonthEarned && productsUntilReward > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {productsUntilReward} more products for a FREE month
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
