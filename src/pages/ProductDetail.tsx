import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, Store, Shield, Truck, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  vendor_id: string;
  vendor_profiles: {
    id: string;
    business_name: string;
    city: string | null;
    country: string | null;
    whatsapp: string | null;
  } | null;
}

const CATEGORIES: Record<string, string> = {
  "gift-boxes": "Gift Boxes",
  hampers: "Hampers",
  corporate: "Corporate Gifts",
  souvenirs: "Souvenirs",
  custom: "Custom Gifts",
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, vendor_profiles(id, business_name, city, country, whatsapp)")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } else {
      setProduct(data as unknown as Product);
    }
    setIsLoading(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">The gift you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link to="/browse">Browse Gifts</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryLabel = CATEGORIES[product.category] || product.category;
  const vendor = product.vendor_profiles;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/browse" className="hover:text-foreground transition-colors">Gifts</Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-8xl">🎁</span>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <Badge variant="outline" className="rounded-full">{categoryLabel}</Badge>
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
                <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

                <Separator />

                {product.description && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Description</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{product.description}</p>
                  </div>
                )}

                <Separator />

                {vendor && (
                  <Card className="border-border bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{vendor.business_name}</p>
                            {(vendor.city || vendor.country) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {vendor?.whatsapp && (
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const cleanNumber = vendor.whatsapp!.replace(/[^\d]/g, "");
                      const message = encodeURIComponent(
                        `Hi ${vendor.business_name}! I'm interested in "${product.name}" (${categoryLabel}) I found on Giftora.`
                      );
                      window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Verified Vendor</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Package className="h-6 w-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Premium Quality</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;