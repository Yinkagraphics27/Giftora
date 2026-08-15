import { useMemo } from "react";

export type ProductStatus = "active" | "inactive" | "draft" | "pending_review" | "declined" | "closed";

interface VendorProfile {
  subscription_status: string;
  is_trusted_vendor?: boolean;
  products_reviewed_count?: number;
  free_month_earned?: boolean;
  subscription_expires_at?: string | null;
  subscription_paused_at?: string | null;
  subscription_pause_days_used?: number;
}

interface Product {
  id: string;
  status?: string;
  is_active?: boolean;
}

interface ProductCounts {
  active: number;
  inactive: number;
  draft: number;
  pending_review: number;
  declined: number;
  closed: number;
  total: number;
}

const FREE_PRODUCT_LIMIT = 10;
const REWARD_PRODUCT_THRESHOLD = 100;
const MAX_PAUSE_DAYS = 30;

export function useSubscriptionLogic(vendorProfile: VendorProfile | null, products: Product[] = []) {
  const isSubscribed = vendorProfile?.subscription_status === "active";
  const isPaused = vendorProfile?.subscription_status === "paused";
  const isTrusted = vendorProfile?.is_trusted_vendor ?? false;
  const reviewedCount = vendorProfile?.products_reviewed_count ?? 0;
  const freeMonthEarned = vendorProfile?.free_month_earned ?? false;
  const pauseDaysUsed = vendorProfile?.subscription_pause_days_used ?? 0;

  // Calculate product counts by status
  const productCounts = useMemo<ProductCounts>(() => {
    const counts: ProductCounts = {
      active: 0,
      inactive: 0,
      draft: 0,
      pending_review: 0,
      declined: 0,
      closed: 0,
      total: products.length,
    };

    products.forEach((product) => {
      // Handle both old is_active and new status field
      const status = product.status || (product.is_active ? "active" : "draft");
      if (status in counts) {
        counts[status as keyof Omit<ProductCounts, "total">]++;
      }
    });

    return counts;
  }, [products]);

  // Determine what status a new product should have
  const getNewProductStatus = (): ProductStatus => {
    if (isSubscribed) {
      return "active"; // Subscribed vendors get instant publish
    }

    // Free tier logic
    if (productCounts.active < FREE_PRODUCT_LIMIT) {
      // First few products need review if vendor isn't trusted yet
      if (!isTrusted && reviewedCount < 3) {
        return "pending_review";
      }
      return "active";
    }

    // Over free limit without subscription
    return "draft";
  };

  // Check eligibility for free month reward
  const canClaimFreeMonth = useMemo(() => {
    return productCounts.total >= REWARD_PRODUCT_THRESHOLD && !freeMonthEarned;
  }, [productCounts.total, freeMonthEarned]);

  // Calculate progress toward free month
  const freeMonthProgress = useMemo(() => {
    if (freeMonthEarned) return 100;
    return Math.min((productCounts.total / REWARD_PRODUCT_THRESHOLD) * 100, 100);
  }, [productCounts.total, freeMonthEarned]);

  // Calculate free tier usage
  const freeTierUsage = useMemo(() => {
    const activeCount = productCounts.active;
    return {
      used: Math.min(activeCount, FREE_PRODUCT_LIMIT),
      limit: FREE_PRODUCT_LIMIT,
      remaining: Math.max(FREE_PRODUCT_LIMIT - activeCount, 0),
      isAtLimit: activeCount >= FREE_PRODUCT_LIMIT,
    };
  }, [productCounts.active]);

  // Calculate subscription expiry info
  const expiryInfo = useMemo(() => {
    if (!vendorProfile?.subscription_expires_at) {
      return { daysRemaining: null, isExpiringSoon: false, isExpired: false };
    }

    const expiresAt = new Date(vendorProfile.subscription_expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      isExpiringSoon: daysRemaining > 0 && daysRemaining <= 3,
      isExpired: daysRemaining <= 0,
      expiresAt,
    };
  }, [vendorProfile?.subscription_expires_at]);

  // Pause info
  const pauseInfo = useMemo(() => {
    return {
      isPaused,
      canPause: isSubscribed && pauseDaysUsed < MAX_PAUSE_DAYS,
      pauseDaysRemaining: MAX_PAUSE_DAYS - pauseDaysUsed,
      pausedAt: vendorProfile?.subscription_paused_at ? new Date(vendorProfile.subscription_paused_at) : null,
    };
  }, [isPaused, isSubscribed, pauseDaysUsed, vendorProfile?.subscription_paused_at]);

  // Should show draft message when adding products
  const shouldShowDraftMessage = useMemo(() => {
    return !isSubscribed && productCounts.active >= FREE_PRODUCT_LIMIT;
  }, [isSubscribed, productCounts.active]);

  // Can vendor publish more products
  const canPublishMore = useMemo(() => {
    if (isSubscribed) return true;
    return productCounts.active < FREE_PRODUCT_LIMIT;
  }, [isSubscribed, productCounts.active]);

  return {
    // Status checks
    isSubscribed,
    isPaused,
    isTrusted,

    // Product logic
    productCounts,
    getNewProductStatus,
    canPublishMore,
    shouldShowDraftMessage,

    // Free tier
    freeTierUsage,

    // Free month reward
    canClaimFreeMonth,
    freeMonthProgress,
    freeMonthEarned,
    productsUntilReward: Math.max(REWARD_PRODUCT_THRESHOLD - productCounts.total, 0),

    // Expiry
    expiryInfo,

    // Pause
    pauseInfo,

    // Constants
    FREE_PRODUCT_LIMIT,
    REWARD_PRODUCT_THRESHOLD,
    MAX_PAUSE_DAYS,
  };
}
