import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  MapPin,
  MessageCircle,
  Store,
  Shield,
  Truck,
  Package,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ReviewsList } from "@/components/reviews/ReviewsList";

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
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { addItem, isInCart } = useCart();

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
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async () => {
    if (!product || !product.vendor_profiles) return;

    await addItem(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        category: product.category,
        vendor_id: product.vendor_id,
        vendor_name: product.vendor_profiles.business_name,
      },
      quantity
    );

    setJustAdded(true);
    toast.success("Added to cart", {
      description: `${quantity} × ${product.name}`,
      action: {
        label: "View Cart",
        onClick: () => navigate("/cart"),
      },
    });

    setTimeout(() => setJustAdded(false), 2000);
  };

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

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

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-navy-800">
              Product Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              The gift you're looking for doesn't exist.
            </p>
            <Button variant="gold" asChild className="mt-4">
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
  const inCart = isInCart(product.id);
  const lineTotal = Number(product.price) * quantity;

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-canvas-200 bg-canvas-100/50">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-gold-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                to="/browse"
                className="hover:text-gold-600 transition-colors"
              >
                Gifts
              </Link>
              <span>/</span>
              <span className="text-navy-800 line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-canvas-200 bg-canvas-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-8xl">🎁</span>
                  )}
                  {inCart && (
                    <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-900 shadow-md">
                      <Check className="h-3.5 w-3.5" />
                      In Cart
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Badge
                  variant="outline"
                  className="rounded-full border-gold-500/40 bg-gold-100/50 text-gold-600 font-semibold"
                >
                  {categoryLabel}
                </Badge>

                <h1 className="font-heading text-3xl font-bold text-navy-800 md:text-4xl">
                  {product.name}
                </h1>

                <div>
                  <p className="font-heading text-3xl font-bold text-navy-800">
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Price per unit · NGN
                  </p>
                </div>

                <Separator className="bg-canvas-200" />

                {/* Quantity + Add to Cart block */}
                <div className="space-y-4 rounded-xl border border-canvas-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy-800">
                      Quantity
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Max 99 per order
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-lg border border-canvas-200 bg-canvas-50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-l-lg rounded-r-none hover:bg-canvas-100"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[3rem] text-center font-heading text-lg font-bold tabular-nums text-navy-800">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-l-none rounded-r-lg hover:bg-canvas-100"
                        onClick={incrementQuantity}
                        disabled={quantity >= 99}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Line Total */}
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-heading text-xl font-bold text-gold-600">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart Button (PRIMARY CTA) */}
                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full gap-2"
                    onClick={handleAddToCart}
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  {/* View Cart quick link */}
                  {inCart && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gold-600 hover:bg-gold-100"
                      asChild
                    >
                      <Link to="/cart">
                        View Cart
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-navy-800">
                      Description
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}

                <Separator className="bg-canvas-200" />

                {/* Vendor Card */}
                {vendor && (
                  <Card className="border-canvas-200 bg-canvas-100/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 ring-2 ring-gold-500/30">
                            <Store className="h-6 w-6 text-gold-500" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-navy-800">
                              {vendor.business_name}
                            </p>
                            {(vendor.city || vendor.country) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {[vendor.city, vendor.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/vendors/${vendor.id}`}
                          className="text-sm font-medium text-gold-600 hover:text-gold-500 transition-colors"
                        >
                          View Store →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* WhatsApp Button (SECONDARY) */}
                {vendor?.whatsapp && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 border-green-600/50 bg-transparent text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600"
                    onClick={() => {
                      const cleanNumber = vendor.whatsapp!.replace(/[^\d]/g, "");
                      const message = encodeURIComponent(
                        `Hi ${vendor.business_name}! I'm interested in "${product.name}" (${categoryLabel}) I found on Giftora. Quantity: ${quantity}.`
                      );
                      window.open(
                        `https://wa.me/${cleanNumber}?text=${message}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat with Vendor on WhatsApp
                  </Button>
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 rounded-xl border border-canvas-200 bg-canvas-100/50 p-4">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Shield className="h-6 w-6 text-gold-500" />
                    <span className="text-xs text-navy-500">
                      Verified Vendor
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Truck className="h-6 w-6 text-gold-500" />
                    <span className="text-xs text-navy-500">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Package className="h-6 w-6 text-gold-500" />
                    <span className="text-xs text-navy-500">
                      Premium Quality
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ✅ NEW — Reviews Section */}
        <section className="border-t border-canvas-200 bg-canvas-50 py-12">
          <div className="container">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-navy-800 md:text-3xl">
                Reviews & Ratings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What other buyers are saying about this product.
              </p>
            </div>
            <ReviewsList productId={product.id} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;