import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  vendor_id: string;
}

interface Order {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_country: string;
  delivery_notes: string | null;
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
    className: "bg-gold-100 text-gold-700 border-gold-300",
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

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

async function updateOrderStatus(
  orderId: string,
  patch: { status?: string; payment_status?: string },
  onSuccess: () => void
) {
  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success(
    patch.status
      ? `Order marked ${patch.status}`
      : patch.payment_status === "paid"
      ? "Order marked paid"
      : "Order updated"
  );
  onSuccess();
}

export default function VendorOrders() {
  const { user, vendorProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }
    if (!vendorProfile) {
      navigate("/", { replace: true });
      return;
    }
    fetchOrders();
  }, [authLoading, user, vendorProfile, navigate]);

  const fetchOrders = async () => {
    if (!vendorProfile) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id, status, payment_status, payment_method, total,
        buyer_name, buyer_email, buyer_phone,
        delivery_address, delivery_city, delivery_country, delivery_notes,
        created_at,
        order_items!inner(
          id, product_name, product_image,
          quantity, unit_price, line_total, vendor_id
        )
      `
      )
      .eq("order_items.vendor_id", vendorProfile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } else {
      const cleaned: Order[] = (data ?? []).map((o: any) => ({
        ...o,
        order_items: (o.order_items ?? []).filter(
          (i: any) => i.vendor_id === vendorProfile.id
        ),
      }));
      setOrders(cleaned);
    }
    setIsLoading(false);
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (authLoading || isLoading) {
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
      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy-800 md:text-3xl">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {vendorProfile?.business_name}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? "bg-gold-500 text-navy-900 shadow-sm"
                    : "border border-canvas-200 bg-white text-navy-600 hover:border-gold-300 hover:bg-gold-100/40"
                }`}
              >
                {f.label}
                {counts[f.value] > 0 && (
                  <span
                    className={`flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      statusFilter === f.value
                        ? "bg-navy-900/20 text-navy-900"
                        : "bg-canvas-200 text-navy-600"
                    }`}
                  >
                    {counts[f.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders */}
          {filteredOrders.length === 0 ? (
            <Card className="border-dashed border-canvas-300 bg-white">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas-100">
                  <Package className="h-7 w-7 text-navy-400" />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-navy-800">
                    {statusFilter === "all"
                      ? "No orders yet"
                      : `No ${statusFilter} orders`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {statusFilter === "all"
                      ? "When buyers order your products, they'll show up here."
                      : "Try a different filter."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expandedOrders.has(order.id)}
                  onToggle={() => toggleExpand(order.id)}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                  onRefresh={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  onToggle,
  formatPrice,
  formatDate,
  onRefresh,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  formatPrice: (n: number) => string;
  formatDate: (iso: string) => string;
  onRefresh: () => void;
}) {
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const isPaid = order.payment_status === "paid";

  const vendorTotal = order.order_items.reduce(
    (sum, i) => sum + i.line_total,
    0
  );

  const whatsappLink = order.buyer_phone
    ? `https://wa.me/${order.buyer_phone.replace(
        /[^\d]/g,
        ""
      )}?text=${encodeURIComponent(
        `Hi ${order.buyer_name}, regarding your order #${order.id
          .slice(0, 8)
          .toUpperCase()} on Giftora:`
      )}`
    : null;

  return (
    <Card className="border-canvas-200 bg-white transition hover:border-gold-300">
      <CardContent className="p-5">
        <div
          className="flex cursor-pointer flex-wrap items-start justify-between gap-3"
          onClick={onToggle}
        >
          <div className="min-w-0 flex-1">
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
                  Unpaid
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Placed {formatDate(order.created_at)}</span>
              {order.buyer_name && (
                <span className="font-medium text-navy-700">
                  Buyer: {order.buyer_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-heading text-lg font-bold text-gold-600">
                {formatPrice(vendorTotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.order_items.length} item
                {order.order_items.length === 1 ? "" : "s"}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-navy-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {expanded && (
          <div className="mt-5 space-y-5">
            <Separator className="bg-canvas-200" />

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-navy-800">
                <Package className="h-4 w-4 text-gold-500" />
                Items from your shop
              </h3>
              <div className="space-y-2">
                {order.order_items.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center gap-3 rounded-lg border border-canvas-200 bg-canvas-50 p-2.5"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-canvas-200 bg-white">
                      {i.product_image ? (
                        <img
                          src={i.product_image}
                          alt={i.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          🎁
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-navy-800">
                        {i.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i.quantity} × {formatPrice(i.unit_price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-navy-800">
                      {formatPrice(i.line_total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-canvas-200" />

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-navy-800">
                <MapPin className="h-4 w-4 text-gold-500" />
                Buyer & Delivery
              </h3>
              <div className="space-y-2 rounded-lg border border-canvas-200 bg-canvas-50 p-3.5 text-sm">
                {order.buyer_name && (
                  <p className="font-semibold text-navy-800">
                    {order.buyer_name}
                  </p>
                )}
                {order.buyer_phone && (
                  <div className="flex items-center gap-2 text-navy-600">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-navy-400" />
                    <span>{order.buyer_phone}</span>
                  </div>
                )}
                {order.buyer_email && (
                  <div className="flex items-center gap-2 text-navy-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-navy-400" />
                    <span className="truncate">{order.buyer_email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-navy-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400" />
                  <span>
                    {order.delivery_address}
                    <br />
                    {order.delivery_city}, {order.delivery_country}
                  </span>
                </div>
                {order.delivery_notes && (
                  <p className="mt-1 rounded-md bg-gold-100/50 p-2 text-xs italic text-navy-600">
                    "{order.delivery_notes}"
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-canvas-200" />

            <div className="flex flex-wrap items-center gap-2">
              {whatsappLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-green-600/50 bg-transparent text-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white"
                  asChild
                >
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat Buyer
                  </a>
                </Button>
              )}

              {!isPaid && order.status !== "cancelled" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  onClick={() =>
                    updateOrderStatus(
                      order.id,
                      { payment_status: "paid" },
                      onRefresh
                    )
                  }
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Paid
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateOrderStatus(
                    order.id,
                    { status: "confirmed" },
                    onRefresh
                  )
                }
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateOrderStatus(
                    order.id,
                    { status: "shipped" },
                    onRefresh
                  )
                }
              >
                Ship
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() =>
                  updateOrderStatus(
                    order.id,
                    { status: "delivered" },
                    onRefresh
                  )
                }
              >
                Delivered
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() =>
                  updateOrderStatus(
                    order.id,
                    { status: "cancelled" },
                    onRefresh
                  )
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}