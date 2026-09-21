import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight, Shield, Truck, CreditCard } from "lucide-react";
import PaystackPop from "@paystack/inline-js";
import { initOrderPayment } from "@/integrations/paystack/client";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

type PaymentMethod = "cod" | "paystack";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Nigeria",
    notes: "",
  });

  // Prefill email if logged in
  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((f) => ({ ...f, email: user.email! }));
    }
  }, [user]);

  const shippingFee = 0; // free for now
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Create the order + order items in Supabase.
   * Returns the new order ID.
   */
  const createOrder = async (
    paymentRef?: string,
    paymentStatus: "unpaid" | "paid" = "unpaid"
  ) => {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        subtotal,
        shipping_fee: shippingFee,
        total,
        buyer_email: form.email,
        buyer_name: form.name,
        buyer_phone: form.phone,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_country: form.country,
        delivery_notes: form.notes || null,
        payment_ref: paymentRef ?? null,
      })
      .select("id")
      .single();

    if (orderError || !order) throw orderError ?? new Error("Order failed");

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      vendor_id: i.product.vendor_id,
      product_name: i.product.name,
      product_image: i.product.image_url,
      quantity: i.quantity,
      unit_price: i.product.price,
      line_total: i.product.price * i.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate required fields
    const required = ["name", "email", "phone", "address", "city", "country"];
    for (const field of required) {
      if (!form[field as keyof typeof form]?.trim()) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        // ============ CASH ON DELIVERY ============
        const orderId = await createOrder();
        await clearCart();
        toast.success("Order placed!");
        navigate(`/order/${orderId}`);
      } else {
        // ============ CARD PAYMENT (PAYSTACK) ============

        // 1. Create order first (as pending + unpaid)
        const orderId = await createOrder();

        // 2. Initialize Paystack via Supabase Edge Function
        //    (server-side verifies amount, prevents tampering)
        const { access_code } = await initOrderPayment({
          orderId,
          email: form.email,
          amount: total,
        });

        // 3. Open Paystack popup
        const paystack = new PaystackPop();
        paystack.resumeTransaction(access_code, {
          onSuccess: async (transaction: any) => {
            // Webhook will mark as paid asynchronously.
            // Optimistically update UI here.
            await clearCart();
            toast.success("Payment successful!", {
              description: `Reference: ${transaction.reference}`,
            });
            navigate(`/order/${orderId}`);
          },
          onCancel: () => {
            toast.error("Payment cancelled", {
              description:
                "Your order was saved. You can retry payment from My Orders.",
            });
            setIsSubmitting(false);
            navigate(`/order/${orderId}`);
          },
          onError: (error: any) => {
            console.error("Paystack error:", error);
            toast.error(error?.message ?? "Payment failed", {
              description:
                "Your order was saved. You can retry payment from My Orders.",
            });
            setIsSubmitting(false);
          },
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Could not place order");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-50">
        <Header />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-navy-800">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add items to your cart before checking out.
            </p>
            <Button variant="gold" className="mt-6" asChild>
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
      <main className="flex-1 py-10">
        <div className="container max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-navy-800 md:text-4xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your delivery details to place the order.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]"
          >
            {/* LEFT — Form */}
            <div className="space-y-6">
              <Card className="border-canvas-200 bg-white">
                <CardContent className="space-y-4 p-6">
                  <h2 className="font-heading text-lg font-bold text-navy-800">
                    Contact Information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+234 801 234 5678"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-canvas-200 bg-white">
                <CardContent className="space-y-4 p-6">
                  <h2 className="font-heading text-lg font-bold text-navy-800">
                    Delivery Address
                  </h2>
                  <div>
                    <Label htmlFor="address">Street address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apartment 4"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Lagos"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Delivery notes (optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions for delivery"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-canvas-200 bg-white">
                <CardContent className="space-y-4 p-6">
                  <h2 className="font-heading text-lg font-bold text-navy-800">
                    Payment Method
                  </h2>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="space-y-3"
                  >
                    {/* CARD PAYMENT — PRIMARY */}
                    <label
                      htmlFor="paystack"
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        paymentMethod === "paystack"
                          ? "border-gold-500 bg-gold-100/40"
                          : "border-canvas-200 hover:border-canvas-300"
                      }`}
                    >
                      <RadioGroupItem
                        value="paystack"
                        id="paystack"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gold-600" />
                          <p className="font-semibold text-navy-800">
                            Card Payment
                          </p>
                          <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                            Instant
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Pay securely with your debit or credit card. Powered
                          by Paystack.
                        </p>
                      </div>
                    </label>

                    {/* COD — SECONDARY */}
                    <label
                      htmlFor="cod"
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        paymentMethod === "cod"
                          ? "border-gold-500 bg-gold-100/40"
                          : "border-canvas-200 hover:border-canvas-300"
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" className="mt-1" />
                      <div>
                        <p className="font-semibold text-navy-800">
                          Pay on Delivery / WhatsApp
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Arrange payment with the vendor directly after your
                          order is confirmed.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — Summary */}
            <div>
              <Card className="sticky top-24 border-canvas-200 bg-white">
                <CardContent className="space-y-4 p-6">
                  <h2 className="font-heading text-lg font-bold text-navy-800">
                    Order Summary
                  </h2>
                  <Separator className="bg-canvas-200" />

                  <div className="max-h-64 space-y-3 overflow-y-auto">
                    {items.map((i) => (
                      <div
                        key={i.product.id}
                        className="flex items-start gap-3"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-canvas-200 bg-canvas-100">
                          {i.product.image_url ? (
                            <img
                              src={i.product.image_url}
                              alt={i.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">
                              🎁
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-navy-800">
                            {i.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i.quantity} × {formatPrice(i.product.price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-navy-800">
                          {formatPrice(i.product.price * i.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-canvas-200" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-navy-800">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-navy-800">
                        {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-canvas-200" />

                  <div className="flex justify-between">
                    <span className="font-heading text-base font-bold text-navy-800">
                      Total
                    </span>
                    <span className="font-heading text-xl font-bold text-gold-600">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {paymentMethod === "paystack"
                          ? "Opening Payment..."
                          : "Placing Order..."}
                      </>
                    ) : (
                      <>
                        {paymentMethod === "paystack" ? (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Pay {formatPrice(total)}
                          </>
                        ) : (
                          <>
                            Place Order
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-gold-500" />
                      {paymentMethod === "paystack"
                        ? "Secured by Paystack"
                        : "No card needed"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-gold-500" />
                      Fast delivery
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;