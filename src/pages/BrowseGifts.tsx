import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url?: string | null;
  vendor_profiles?: { business_name: string; city: string | null } | null;
}

const CATEGORIES = [
  { id: "gift-boxes", name: "Gift Boxes", icon: "🎁" },
  { id: "hampers", name: "Hampers", icon: "🧺" },
  { id: "corporate", name: "Corporate Gifts", icon: "💼" },
  { id: "souvenirs", name: "Souvenirs", icon: "🗺️" },
  { id: "custom", name: "Custom Gifts", icon: "✨" },
];

const BrowseGifts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, vendor_profiles(business_name, city)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Discover Perfect <span className="text-gradient-gold">Gifts</span>
              </h1>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Browse our curated collection of premium gifts from trusted vendors
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 rounded-2xl border-border bg-background pl-12 pr-4 text-base shadow-soft"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container">
            <div className="mb-6 flex items-center justify-between md:hidden">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
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

            <div className={`mb-8 flex-wrap gap-3 ${showFilters ? "flex" : "hidden md:flex"}`}>
              <Button variant={selectedCategory === "all" ? "gold" : "outline"} size="sm" onClick={() => setSelectedCategory("all")} className="rounded-full">
                All Gifts
              </Button>
              {CATEGORIES.map((category) => (
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
            </div>

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

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length > 0 ? (
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

const ProductCard = ({ product, index, formatPrice }: { product: Product; index: number; formatPrice: (p: number) => string }) => {
  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.name || product.category;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={`/gifts/${product.id}`}>
        <Card className="group h-full overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-medium">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">🎁</div>
            )}
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">{categoryLabel}</Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="mt-1 text-base font-bold text-primary">{formatPrice(product.price)}</p>
            {product.vendor_profiles && (
              <p className="mt-2 text-sm text-muted-foreground truncate">
                {product.vendor_profiles.business_name}
                {product.vendor_profiles.city && ` • ${product.vendor_profiles.city}`}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default BrowseGifts;