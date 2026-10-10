import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  Loader2,
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Star,
  Wallet,
} from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface OrderItem {
  id: string;
  product_id: string;
  vendor_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-gold-100 text-gold-600 border-gold-300",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const MyOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingItem, setReviewingItem] = useState<{
    orderId: string;
    productId: string;
    vendorId: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, status, payment_status, total, created_at, order_items(id, product_id, vendor_id, product_name, product_image, quantity, unit_price, line_total)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setOrders([]);
      } else {
        setOrders((data ?? []) as unknown as Order[]);
      }
      setIsLoading(false);
    })();
  }, [user, authLoading, refreshKey]);

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-50">
        <Header />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-canvas-100">
              <ShoppingBag className="h-9 w-9 text-navy-400" />
            </div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-navy-800">
              Sign in to view orders
            </h1>
            <p className="mt-2 text-muted-foreground">
              You need an account to view your order history.
            </p>
            <Button variant="gold" className="mt-6" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-4xl">
          <h1 className="font-heading text-3xl font-bold text-navy-800 md:text-4xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your past and current orders.
          </p>

          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <Card className="border-canvas-200 bg-white">
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas-100">
                    <Package className="h-9 w-9 text-navy-400" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold text-navy-800">
                      No orders yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      When you place an order, it'll show up here.
                    </p>
                  </div>
                  <Button variant="gold" className="mt-4" asChild>
                    <Link to="/browse">
                      Browse Gifts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => {
                const statusCfg =
                  STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                const isPaid = order.payment_status === "paid";

                return (
                  <Card
                    key={order.id}
                    className="border-canvas-200 bg-white transition hover:border-gold-300 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-navy-800">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className={`gap-1 rounded-full border ${statusCfg.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusCfg.label}
                            </Badge>
                            {isPaid ? (
                              <Badge
                                variant="outline"
                                className="gap-1 rounded-full border-emerald-200 bg-emerald-100 text-emerald-700"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 rounded-full border-canvas-300 bg-canvas-100 text-navy-600"
                              >
                                <Wallet className="h-3 w-3" />
                                Payment on Delivery
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Placed {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-lg font-bold text-navy-800">
                            {formatPrice(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.order_items?.length ?? 0} item
                            {(order.order_items?.length ?? 0) === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4 bg-canvas-200" />

                      <div className="flex flex-wrap items-center gap-2">
                        {(order.order_items ?? []).slice(0, 4).map((i) => (
                          <div
                            key={i.id}
                            className="h-12 w-12 overflow-hidden rounded-md border border-canvas-200 bg-canvas-100"
                            title={i.product_name}
                          >
                            {i.product_image ? (
                              <img
                                src={i.product_image}
                                alt={i.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                🎁
                              </div>
                            )}
                          </div>
                        ))}
                        {(order.order_items?.length ?? 0) > 4 && (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-canvas-200 bg-canvas-100 text-xs font-medium text-muted-foreground">
                            +{(order.order_items?.length ?? 0) - 4}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-gold-600 hover:bg-gold-100"
                          asChild
                        >
                          <Link to={`/order/${order.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* Review buttons */}
                      {order.status === "delivered" &&
                        (order.order_items?.length ?? 0) > 0 && (
                          <div className="mt-4 border-t border-canvas-200 pt-4">
                            <p className="mb-2 text-xs font-medium text-navy-500">
                              Share your experience:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(order.order_items ?? []).map((i) => (
                                <Button
                                  key={i.id}
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 border-gold-500/40 text-gold-600 hover:bg-gold-100 hover:border-gold-500"
                                  onClick={() =>
                                    setReviewingItem({
                                      orderId: order.id,
                                      productId: i.product_id,
                                      vendorId: i.vendor_id,
                                    })
                                  }
                                >
                                  <Star className="h-3.5 w-3.5" />
                                  Review
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Review modal */}
        {reviewingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4 backdrop-blur-sm"
            onClick={() => setReviewingItem(null)}
          >
            <div
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ReviewForm
                productId={reviewingItem.productId}
                vendorId={reviewingItem.vendorId}
                orderId={reviewingItem.orderId}
                onSubmitted={() => {
                  setReviewingItem(null);
                  setRefreshKey((k) => k + 1);
                }}
                onCancel={() => setReviewingItem(null)}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;