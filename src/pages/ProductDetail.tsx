import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  MessageCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Store,
  Shield,
  Truck,
  Package,
} from "lucide-react";
import { getProductById, getProductsByVendor, giftCategories, DemoProduct } from "@/data/demoProducts";
import { getVendorById } from "@/data/demoVendors";
import { WhatsAppInquiryDialog } from "@/components/vendors/WhatsAppInquiryDialog";
import { generateProductInquiryMessage, openWhatsAppChat } from "@/utils/whatsapp";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">The gift you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link to="/gifts">Browse Gifts</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const vendor = getVendorById(product.vendorId);
  const relatedProducts = getProductsByVendor(product.vendorId).filter((p) => p.id !== product.id).slice(0, 4);
  const categoryLabel = giftCategories.find((c) => c.id === product.category)?.name || product.category;

  const formatPrice = (price: number, priceMax?: number) => {
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

    if (priceMax) {
      const formattedMax = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(priceMax);
      return `${formatted} - ${formattedMax}`;
    }

    return formatted;
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted/30">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/gifts" className="hover:text-foreground transition-colors">
                Gifts
              </Link>
              <span>/</span>
              <Link
                to={`/gifts?category=${product.category}`}
                className="hover:text-foreground transition-colors"
              >
                {categoryLabel}
              </Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Category Badge */}
                <Badge variant="outline" className="rounded-full">
                  {categoryLabel}
                </Badge>

                {/* Title */}
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(product.price, product.priceMax)}
                  </p>
                  {product.priceMax && (
                    <p className="text-sm text-muted-foreground">
                      Price varies based on customization options
                    </p>
                  )}
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Description</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{product.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Features</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Vendor Card */}
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.vendorName}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {product.vendorCity}, {product.vendorCountry}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/vendors/${product.vendorId}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {vendor?.whatsapp ? (
                    <>
                      <Button 
                        variant="gold" 
                        size="lg" 
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const message = generateProductInquiryMessage(
                            product.name,
                            categoryLabel,
                            product.vendorName
                          );
                          openWhatsAppChat(vendor.whatsapp, message);
                        }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Chat on WhatsApp
                      </Button>
                      <WhatsAppInquiryDialog
                        vendorName={product.vendorName}
                        vendorWhatsApp={vendor.whatsapp}
                        productName={product.name}
                        productCategory={categoryLabel}
                        trigger={
                          <Button variant="outline" size="lg" className="flex-1">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Send Detailed Inquiry
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <Button variant="gold" size="lg" className="flex-1 gap-2" asChild>
                      <Link to={`/vendors/${product.vendorId}`}>
                        <MessageCircle className="h-5 w-5" />
                        Contact Vendor
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Trust Badges */}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-12">
            <div className="container">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                More from {product.vendorName}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link to={`/vendors/${product.vendorId}`}>View All from This Vendor</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

interface RelatedProductCardProps {
  product: DemoProduct;
  formatPrice: (price: number, priceMax?: number) => string;
}

const RelatedProductCard = ({ product, formatPrice }: RelatedProductCardProps) => {
  return (
    <Link to={`/gifts/${product.id}`}>
      <Card className="group h-full overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-medium">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 font-bold text-primary">{formatPrice(product.price, product.priceMax)}</p>
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductDetail;
