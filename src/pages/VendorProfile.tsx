import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  MapPin,
  BadgeCheck,
  ArrowLeft,
  MessageCircle,
  Loader2,
  Store,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  business_name: string;
  city: string | null;
  country: string | null;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  is_verified: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

const CATEGORIES: Record<string, string> = {
  "gift-boxes": "Gift Boxes",
  hampers: "Hampers",
  corporate: "Corporate Gifts",
  souvenirs: "Souvenirs",
  custom: "Custom Gifts",
};

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVendor(id);
  }, [id]);

  const fetchVendor = async (vendorId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select(
        "id, business_name, city, country, description, logo_url, whatsapp, is_verified"
      )
      .eq("id", vendorId)
      .single();

    if (error) {
      console.error("Error fetching vendor:", error);
      setVendor(null);
    } else {
      setVendor(data);
      fetchProducts(vendorId);
    }
    setIsLoading(false);
  };

  const fetchProducts = async (vendorId: string) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .eq("vendor_id", vendorId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

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

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-16 text-center">
            <h1 className="mb-4 font-heading text-2xl font-bold text-navy-800">
              Vendor Not Found
            </h1>
            <p className="mb-8 text-muted-foreground">
              This vendor profile doesn't exist or is no longer available.
            </p>
            <Button variant="gold" asChild>
              <Link to="/vendors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Vendors
              </Link>
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
      <main className="flex-1">
        {/* Cover banner — Modern Executive navy + gold */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-800 sm:h-56">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Subtle gold glow */}
          <div className="absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gold-500/20 blur-3xl" />

          <div className="container relative h-full">
            <Link
              to="/vendors"
              className="absolute left-0 top-4 inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-navy-900/40 px-3 py-1.5 text-sm font-medium text-gold-400 backdrop-blur-sm transition-colors hover:bg-navy-900/60"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vendors
            </Link>
          </div>
        </div>

        <div className="container">
          {/* Logo + name overlapping banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative -mt-16 flex flex-col items-start gap-4 sm:-mt-20 sm:flex-row sm:items-end"
          >
            <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-canvas-50 bg-white shadow-lg ring-2 ring-gold-500/30 sm:h-36 sm:w-36">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="h-12 w-12 text-navy-300" />
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-navy-800 sm:text-3xl">
                  {vendor.business_name}
                </h1>
                {vendor.is_verified && (
                  <Badge className="gap-1 rounded-full border-gold-300 bg-gold-100 text-gold-600 hover:bg-gold-100">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              {(vendor.city || vendor.country) && (
                <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8 lg:col-span-2"
            >
              {vendor.description && (
                <div>
                  <h2 className="mb-2 font-heading text-lg font-semibold text-navy-800">
                    About
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {vendor.description}
                  </p>
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-navy-800">
                    <Package className="h-5 w-5 text-gold-500" />
                    Products ({products.length})
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-canvas-300 bg-canvas-100/50 py-12 text-center">
                    <p className="text-muted-foreground">
                      This vendor hasn't listed any products yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Link to={`/gifts/${product.id}`}>
                          <Card className="group h-full overflow-hidden border-canvas-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg">
                            <div className="relative aspect-square overflow-hidden bg-canvas-100">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-3xl">
                                  🎁
                                </div>
                              )}
                              <Badge className="absolute left-2 top-2 rounded-full border-gold-300 bg-gold-100 text-[11px] text-gold-600 backdrop-blur-sm">
                                {CATEGORIES[product.category] ||
                                  product.category}
                              </Badge>
                            </div>
                            <CardContent className="p-3">
                              <h3 className="line-clamp-1 text-sm font-semibold text-navy-800 transition-colors group-hover:text-gold-600">
                                {product.name}
                              </h3>
                              <p className="mt-1 font-heading text-sm font-bold text-gold-600">
                                {formatPrice(product.price)}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="sticky top-24 rounded-2xl border border-canvas-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-navy-800">
                  Contact Vendor
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Chat directly with {vendor.business_name} on WhatsApp for
                  inquiries and orders.
                </p>

                {vendor.whatsapp ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-green-600/50 bg-transparent text-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white"
                    onClick={() => {
                      const cleanNumber = vendor.whatsapp!.replace(
                        /[^\d]/g,
                        ""
                      );
                      const message = encodeURIComponent(
                        `Hi ${vendor.business_name}! I found your business on Giftora and I'm interested in learning more about your products.`
                      );
                      window.open(
                        `https://wa.me/${cleanNumber}?text=${message}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contact Not Available
                  </Button>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-canvas-200 pt-6 text-center">
                  <div>
                    <p className="font-heading text-xl font-bold text-navy-800">
                      {products.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-gold-600">
                      {vendor.is_verified ? "✓" : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="h-16" />
      </main>
      <Footer />
    </div>
  );
}