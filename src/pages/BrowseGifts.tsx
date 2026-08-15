import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Search, Star, MapPin, X, SlidersHorizontal } from "lucide-react";
import { demoProducts, giftCategories, DemoProduct } from "@/data/demoProducts";
import { getActiveVendors, getVendorById } from "@/data/demoVendors";

const BrowseGifts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    // First, filter to only show products from vendors with active subscriptions
    const activeVendorIds = new Set(getActiveVendors().map((v) => v.id));
    const activeProducts = demoProducts.filter((product) => activeVendorIds.has(product.vendorId));

    return activeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Discover Perfect <span className="text-gradient-gold">Gifts</span>
              </h1>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Browse our curated collection of premium gifts from trusted vendors worldwide
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-8 max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search gifts, categories, or vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 rounded-2xl border-border bg-background pl-12 pr-4 text-base shadow-soft"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter & Products */}
        <section className="py-8 md:py-12">
          <div className="container">
            {/* Mobile Filter Toggle */}
            <div className="mb-6 flex items-center justify-between md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Categories
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 flex-wrap gap-3 ${showFilters ? "flex" : "hidden md:flex"}`}
            >
              <Button
                variant={selectedCategory === "all" ? "gold" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
              >
                All Gifts
              </Button>
              {giftCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "gold" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2 rounded-full"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </motion.div>

            {/* Results Count & Reset */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> gifts
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="hidden md:flex">
                  <X className="mr-1 h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} formatPrice={formatPrice} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">No gifts found matching your criteria</p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

interface ProductCardProps {
  product: DemoProduct;
  index: number;
  formatPrice: (price: number, priceMax?: number) => string;
}

const ProductCard = ({ product, index, formatPrice }: ProductCardProps) => {
  const categoryLabel = giftCategories.find((c) => c.id === product.category)?.name || product.category;
  const vendor = getVendorById(product.vendorId);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/gifts/${product.id}`}>
        <Card className="group h-full overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-medium">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
              {categoryLabel}
            </Badge>
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <p className="mt-1 text-base font-bold text-primary">
              {formatPrice(product.price, product.priceMax)}
            </p>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews})</span>
            </div>

            {/* Vendor with Logo */}
            <div className="mt-3 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={vendor?.logo_url} alt={product.vendorName} />
                <AvatarFallback className="bg-muted text-[10px]">
                  {getInitials(product.vendorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
                <span className="truncate">{product.vendorName}</span>
                <span className="flex-shrink-0">•</span>
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{product.vendorCity}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default BrowseGifts;
