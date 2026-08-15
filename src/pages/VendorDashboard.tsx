import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Package,
  Store,
  MessageSquare,
  LogOut,
  TrendingUp,
  Users,
  ChevronRight,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VendorChatDashboard from "@/components/chat/VendorChatDashboard";
import { SubscriptionStatusCard } from "@/components/vendor/SubscriptionStatusCard";
import { VendorStatusBanner } from "@/components/vendor/VendorStatusBanner";
import { VendorProfileSection } from "@/components/vendor/VendorProfileSection";
import { ProductManagementSection } from "@/components/vendor/ProductManagementSection";
import { VendorOnboardingForm } from "@/components/vendor/VendorOnboardingForm";
import { useAdminRole } from "@/hooks/useAdminRole";

interface VendorDeal {
  id: string;
  name: string;
  category: string;
  price_min: number;
  trade_price: number | null;
  minimum_order_quantity: number | null;
  vendor_notes: string | null;
  image_url: string | null;
  vendor: {
    business_name: string;
    city: string;
    country: string;
    logo_url: string | null;
  };
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, vendorProfile, isLoading, signOut, refreshVendorProfile } = useAuth();
  const { isAdmin } = useAdminRole();
  const [vendorDeals, setVendorDeals] = useState<VendorDeal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [productCount, setProductCount] = useState(0);

  // Redirect non-authenticated users to auth page
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/vendor/auth", { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Fetch vendor deals and product count when profile exists
  useEffect(() => {
    const fetchVendorDeals = async () => {
      if (!vendorProfile) return;

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          price_min,
          trade_price,
          minimum_order_quantity,
          vendor_notes,
          image_url,
          vendor_profiles!inner (
            business_name,
            city,
            country,
            logo_url
          )
        `)
        .eq("is_vendor_deal", true)
        .eq("is_active", true)
        .neq("vendor_id", vendorProfile.id)
        .limit(10);

      if (!error && data) {
        const formattedDeals = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price_min: item.price_min,
          trade_price: item.trade_price,
          minimum_order_quantity: item.minimum_order_quantity,
          vendor_notes: item.vendor_notes,
          image_url: item.image_url,
          vendor: {
            business_name: item.vendor_profiles.business_name,
            city: item.vendor_profiles.city,
            country: item.vendor_profiles.country,
            logo_url: item.vendor_profiles.logo_url,
          },
        }));
        setVendorDeals(formattedDeals);
      }
      setIsLoadingDeals(false);
    };

    const fetchProductCount = async () => {
      if (!vendorProfile) return;

      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorProfile.id);

      setProductCount(count || 0);
    };

    if (vendorProfile) {
      fetchVendorDeals();
      fetchProductCount();
    }
  }, [vendorProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleOnboardingSuccess = async () => {
    // Refresh profile after onboarding completes
    await refreshVendorProfile();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // User is authenticated but has no vendor profile - show onboarding form inline
  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold">
                <Gift className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">Giftora</span>
            </Link>

            {isAdmin && (
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
                <Link to="/internal-admin-review">
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container py-12">
          <VendorOnboardingForm onSuccess={handleOnboardingSuccess} />
        </main>
      </div>
    );
  }

  // Status-based gating
  const isApproved = vendorProfile.status === "approved";
  const isPending = vendorProfile.status === "pending";
  const isSuspended = vendorProfile.status === "suspended";
  const isSubscriptionActive = vendorProfile.subscription_status === "active";

  // Full functionality requires: approved status + active subscription
  const canManageProducts = isApproved && isSubscriptionActive;
  const canReceiveLeads = isApproved && isSubscriptionActive;

  const categoryLabels: Record<string, string> = {
    "gift-boxes": "Gift Boxes",
    hampers: "Hampers",
    baskets: "Baskets",
    trunks: "Trunks",
    souvenirs: "Souvenirs",
    accessories: "Accessories",
    corporate: "Corporate Gifts",
    jewelry: "Jewelry",
    handbags: "Handbags",
    "drinks-wine": "Drinks & Wine",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLockMessage = () => {
    if (isPending) {
      return "Your application is pending review. You'll be able to manage products once approved.";
    }
    if (isSuspended) {
      return "Your account is suspended. Please contact support.";
    }
    if (!isSubscriptionActive) {
      return "Activate your subscription to publish products and receive leads.";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">Giftora</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage src={vendorProfile.logo_url || undefined} />
                <AvatarFallback className="bg-muted text-xs">
                  {getInitials(vendorProfile.business_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {vendorProfile.business_name}
              </span>
            </div>
            {vendorProfile.is_launch_partner && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Launch Partner
              </Badge>
            )}
            {isAdmin && (
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
                <Link to="/internal-admin-review">
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Welcome, {vendorProfile.business_name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your products and explore vendor deals
          </p>
        </motion.div>

        {/* Status Banner */}
        <div className="mb-6">
          <VendorStatusBanner status={vendorProfile.status} />
        </div>

        {/* Subscription Status - Only show if approved */}
        {isApproved && (
          <div className="mb-8">
            <SubscriptionStatusCard />
          </div>
        )}

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Products", value: productCount.toString(), icon: Package, color: "text-blue-500" },
            { label: "Views", value: "0", icon: TrendingUp, color: "text-green-500" },
            { label: "Inquiries", value: "0", icon: MessageSquare, color: "text-orange-500" },
            { label: "Vendor Deals", value: vendorDeals.length.toString(), icon: Store, color: "text-purple-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-heading text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Profile Section */}
        <div className="mb-8">
          <VendorProfileSection isLocked={isSuspended} />
        </div>

        {/* Product Management Section */}
        <div className="mb-8">
          <ProductManagementSection
            isLocked={!canManageProducts}
            lockMessage={getLockMessage()}
          />
        </div>

        {/* Customer Chats Section */}
        {canReceiveLeads ? (
          <section className="mb-10">
            <VendorChatDashboard />
          </section>
        ) : (
          <section className="mb-10 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Customer Chat Locked
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {getLockMessage() || "Activate your subscription to receive and respond to customer inquiries through live chat."}
              </p>
            </div>
          </section>
        )}

        {/* Vendor Deals Section */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
                <Store className="h-5 w-5 text-primary" />
                Vendor Deals
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Source products and packaging from other Giftora vendors at trade
                rates
              </p>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {isLoadingDeals ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : vendorDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                No Vendor Deals Yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Other vendors haven't listed any products for bulk purchase yet.
                Check back soon or be the first to list yours!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vendorDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] bg-muted">
                    {deal.image_url ? (
                      <img
                        src={deal.image_url}
                        alt={deal.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        Vendor Deal
                      </Badge>
                      {deal.minimum_order_quantity && (
                        <Badge variant="outline" className="text-xs">
                          MOQ: {deal.minimum_order_quantity}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {deal.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {categoryLabels[deal.category] || deal.category}
                    </p>
                    {deal.trade_price && (
                      <p className="mt-2 font-heading text-lg font-bold text-primary">
                        ₦{deal.trade_price.toLocaleString()}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          trade price
                        </span>
                      </p>
                    )}
                    {/* Vendor info with logo */}
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={deal.vendor.logo_url || undefined} />
                        <AvatarFallback className="bg-muted text-[10px]">
                          {getInitials(deal.vendor.business_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {deal.vendor.business_name} • {deal.vendor.city}
                      </span>
                    </div>
                    {deal.vendor_notes && (
                      <p className="mt-2 text-xs italic text-muted-foreground line-clamp-2">
                        "{deal.vendor_notes}"
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <MessageSquare className="mr-2 h-3 w-3" />
                      Contact Seller
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
