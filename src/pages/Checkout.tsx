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
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  Shield,
  Truck,
  MessageCircle,
  Info,
} from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

interface VendorInfo {
  id: string;
  business_name: string;
  whatsapp: string | null;
  items: typeof items;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Nigeria",
    notes: "",
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((f) => ({ ...f, email: user.email! }));
    }
  }, [user]);

  // Fetch vendor info for WhatsApp buttons
  useEffect(() => {
    (async () => {
      if (items.length === 0) return;
      setIsLoadingVendors(true);

      const vendorIds = Array.from(new Set(items.map((i) => i.product.vendor_id)));

      const { data } = await supabase
        .from("vendor_profiles")
        .select("id, business_name, whatsapp")
        .in("id", vendorIds);

      if (data) {
        const vendorList: VendorInfo[] = (data as any[]).map((v) => ({
          id: v.id,
          business_name: v.business_name,
          whatsapp: v.whatsapp,
          items: items.filter((i) => i.product.vendor_id === v.id),
        }));
        setVendors(vendorList);
      }

      setIsLoadingVendors(false);
    })();
  }, [items]);

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const required = ["name", "email", "phone", "address", "city", "country"];
    for (const field of required) {
      if (!form[field as keyof typeof form]?.trim()) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          status: "pending",
          payment_method: "cod",
          payment_status: "unpaid",
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
        })
        .select("id")
        .single();

      if (orderError || !order) throw orderError ?? new Error("Order failed");

      // 2. Create order items
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

      // 3. Clear cart
      await clearCart();

      toast.success("Order placed!");
      navigate(`/order/${order.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Could not place order");
    } finally {
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
              {/* Contact */}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery */}
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
                      disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card className="border-gold-300 bg-gold-100/40">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800">
                      <Info className="h-4 w-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy-800">
                        How it works
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-navy-600">
                        After you place your order, the vendor will contact you
                        directly to arrange payment and delivery. No card needed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat with Vendors */}
              {!isLoadingVendors && vendors.length > 0 && (
                <Card className="border-canvas-200 bg-white">
                  <CardContent className="space-y-3 p-6">
                    <h2 className="font-heading text-lg font-bold text-navy-800">
                      Chat with Your {vendors.length === 1 ? "Vendor" : "Vendors"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      You can also reach out directly to arrange details before
                      placing your order.
                    </p>
                    <div className="space-y-2">
                      {vendors.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-canvas-200 bg-canvas-50 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-navy-800">
                              {v.business_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.items.length} item{v.items.length === 1 ? "" : "s"} from this vendor
                            </p>
                          </div>
                          {v.whatsapp ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 gap-1.5 border-green-600/50 bg-transparent text-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white"
                              onClick={() => {
                                const clean = v.whatsapp!.replace(/[^\d]/g, "");
                                const msg = encodeURIComponent(
                                  `Hi ${v.business_name}! I'm interested in ordering ${v.items
                                    .map((i) => `"${i.product.name}" (x${i.quantity})`)
                                    .join(", ")} from Giftora.`
                                );
                                window.open(
                                  `https://wa.me/${clean}?text=${msg}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Chat
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No WhatsApp
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                      <div key={i.product.id} className="flex items-start gap-3">
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
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-gold-500" />
                      Secure
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