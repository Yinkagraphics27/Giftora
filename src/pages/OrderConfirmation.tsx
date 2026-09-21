import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Package, MapPin, Clock } from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
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

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setOrder(null);
      } else {
        setOrder(data as unknown as Order);
      }
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
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

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-navy-800">
              Order not found
            </h1>
            <Button variant="gold" className="mt-4" asChild>
              <Link to="/browse">Browse Gifts</Link>
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
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          {/* Success banner */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-100 ring-2 ring-gold-500/40">
              <CheckCircle2 className="h-10 w-10 text-gold-600" />
            </div>
            <h1 className="mt-6 font-heading text-3xl font-bold text-navy-800">
              Order placed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thanks {order.buyer_name}. Your order has been received.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                Order ID:{" "}
                <span className="font-mono text-navy-800">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </span>
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-gold-300 bg-gold-100 text-gold-600"
              >
                <Clock className="h-3 w-3" />
                {order.status === "pending"
                  ? "Awaiting Confirmation"
                  : order.status}
              </Badge>
            </div>
          </div>

          {/* Order summary */}
          <Card className="border-canvas-200 bg-white">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gold-500" />
                <h2 className="font-heading text-lg font-bold text-navy-800">
                  Items
                </h2>
              </div>

              <div className="space-y-3">
                {order.order_items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-canvas-200 bg-canvas-100">
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

              <Separator className="bg-canvas-200" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-navy-800">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-navy-800">
                    {order.shipping_fee === 0
                      ? "Free"
                      : formatPrice(order.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-heading font-bold text-navy-800">
                    Total
                  </span>
                  <span className="font-heading text-lg font-bold text-gold-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              <Separator className="bg-canvas-200" />

              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold-500" />
                  <h3 className="font-heading text-sm font-bold text-navy-800">
                    Delivery
                  </h3>
                </div>
                <div className="mt-2 rounded-lg border border-canvas-200 bg-canvas-100/50 p-4 text-sm">
                  <p className="font-medium text-navy-800">
                    {order.buyer_name}
                  </p>
                  <p className="text-muted-foreground">{order.buyer_phone}</p>
                  <p className="mt-2 text-muted-foreground">
                    {order.delivery_address}
                    <br />
                    {order.delivery_city}, {order.delivery_country}
                  </p>
                  {order.delivery_notes && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      "{order.delivery_notes}"
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-canvas-200" />

              <div className="rounded-lg border border-gold-500/30 bg-gold-100/40 p-4 text-sm">
                <p className="font-semibold text-navy-800">
                  What happens next?
                </p>
                <p className="mt-1 text-muted-foreground">
                  The vendor will contact you on{" "}
                  <span className="font-medium text-navy-800">
                    {order.buyer_phone}
                  </span>{" "}
                  to arrange payment and delivery. You'll find this order in{" "}
                  <Link
                    to="/my-orders"
                    className="font-medium text-gold-600 hover:underline"
                  >
                    My Orders
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button variant="gold" className="flex-1" asChild>
                  <Link to="/my-orders">View My Orders</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/browse">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;