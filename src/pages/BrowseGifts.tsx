import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FilterSidebar } from "@/components/browse/FilterSidebar";
import { SortDropdown, SortOption } from "@/components/browse/SortDropdown";
import { ProductRating } from "@/components/reviews/ProductRating";

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url?: string | null;
  created_at: string;
  occasions: string[];
  vendor_profiles?: { business_name: string; city: string | null } | null;
}

interface ReviewStats {
  product_id: string;
  review_count: number;
  avg_rating: number;
}

interface OccasionLookup {
  id: string;
  name: string;
  icon: string;
}

const BrowseGifts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [occasionLookup, setOccasionLookup] = useState<Record<string, OccasionLookup>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const searchQuery = searchParams.get("search") || "";
  const selectedOccasion = searchParams.get("occasion") || "all";
  const sortBy = (searchParams.get("sort") as SortOption) || "newest";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [productsRes, reviewsRes, occasionsRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, vendor_profiles(business_name, city)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.from("reviews").select("product_id, rating"),
      supabase.from("occasions").select("id, name, icon").eq("is_active", true),
    ]);

    if (productsRes.error) {
      console.error("Error fetching products:", productsRes.error);
    } else {
      setProducts((productsRes.data as unknown as Product[]) || []);
    }

    if (!reviewsRes.error && reviewsRes.data) {
      const stats: Record<string, ReviewStats> = {};
      for (const r of reviewsRes.data as { product_id: string; rating: number }[]) {
        if (!stats[r.product_id]) {
          stats[r.product_id] = { product_id: r.product_id, review_count: 0, avg_rating: 0 };
        }
        stats[r.product_id].review_count += 1;
        stats[r.product_id].avg_rating += r.rating;
      }
      for (const key of Object.keys(stats)) {
        stats[key].avg_rating = stats[key].avg_rating / stats[key].review_count;
      }
      setReviewStats(stats);
    }

    if (!occasionsRes.error && occasionsRes.data) {
      const lookup: Record<string, OccasionLookup> = {};
      for (const o of occasionsRes.data as OccasionLookup[]) {
        lookup[o.id] = o;
      }
      setOccasionLookup(lookup);
    }

    setIsLoading(false);
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (v: string) => updateParam("search", v);
  const handleOccasionChange = (v: string) => updateParam("occasion", v);
  const handleSortChange = (v: SortOption) => updateParam("sort", v);
  const handleMinPriceChange = (v: string) => updateParam("min", v);
  const handleMaxPriceChange = (v: string) => updateParam("max", v);
  const resetFilters = () => setSearchParams({}, { replace: true });

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOccasion =
        selectedOccasion === "all" ||
        (product.occasions || []).includes(selectedOccasion);

      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const price = Number(product.price);
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesOccasion && matchesPrice;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "popular": {
          const aCount = reviewStats[a.id]?.review_count ?? 0;
          const bCount = reviewStats[b.id]?.review_count ?? 0;
          if (bCount !== aCount) return bCount - aCount;
          return (reviewStats[b.id]?.avg_rating ?? 0) - (reviewStats[a.id]?.avg_rating ?? 0);
        }
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return list;
  }, [products, searchQuery, selectedOccasion, sortBy, minPrice, maxPrice, reviewStats]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

  const hasActiveFilters =
    !!searchQuery ||
    selectedOccasion !== "all" ||
    sortBy !== "newest" ||
    !!minPrice ||
    !!maxPrice;

  const sidebarProps = {
    selectedOccasion,
    onOccasionChange: handleOccasionChange,
    minPrice,
    maxPrice,
    onMinPriceChange: handleMinPriceChange,
    onMaxPriceChange: handleMaxPriceChange,
    onReset: resetFilters,
    hasActiveFilters,
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex-1">
        <section className="border-b border-canvas-200 bg-gradient-to-b from-navy-800 to-navy-900 py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="font-heading text-3xl font-bold text-canvas-50 md:text-4xl lg:text-5xl">
                Discover Perfect <span className="text-gold-500">Gifts</span>
              </h1>
              <p className="mt-4 text-canvas-100/80 md:text-lg">
                Browse our curated collection of premium gifts from trusted vendors
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-8 max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
                <Input
                  type="text"
                  placeholder="Search gifts..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-14 rounded-2xl border-0 bg-canvas-50 pl-12 pr-4 text-base shadow-lg placeholder:text-navy-400"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <div className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-canvas-200 bg-white p-5 shadow-sm">
                  <FilterSidebar {...sidebarProps} />
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full border-canvas-200 lg:hidden"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                          <span className="ml-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-navy-900">
                            !
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-full overflow-y-auto bg-white p-5 sm:max-w-sm"
                    >
                      <SheetHeader className="mb-4">
                        <SheetTitle className="font-heading text-navy-800">
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <FilterSidebar {...sidebarProps} />
                    </SheetContent>
                  </Sheet>

                  <p className="flex-1 text-sm text-muted-foreground lg:text-left">
                    Showing{" "}
                    <span className="font-semibold text-navy-800">
                      {filteredProducts.length}
                    </span>{" "}
                    gift{filteredProducts.length === 1 ? "" : "s"}
                  </p>

                  <SortDropdown value={sortBy} onChange={handleSortChange} />
                </div>

                {hasActiveFilters && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {searchQuery && (
                      <Chip label={`Search: "${searchQuery}"`} onRemove={() => handleSearchChange("")} />
                    )}
                    {selectedOccasion !== "all" && (
                      <Chip
                        label={
                          occasionLookup[selectedOccasion]
                            ? `${occasionLookup[selectedOccasion].icon} ${occasionLookup[selectedOccasion].name}`
                            : selectedOccasion
                        }
                        onRemove={() => handleOccasionChange("all")}
                      />
                    )}
                    {(minPrice || maxPrice) && (
                      <Chip
                        label={`₦${minPrice || "0"} – ₦${maxPrice || "∞"}`}
                        onRemove={() => {
                          handleMinPriceChange("");
                          handleMaxPriceChange("");
                        }}
                      />
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        formatPrice={formatPrice}
                        reviewStats={reviewStats[product.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-canvas-300 bg-white py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                      No gifts found matching your criteria
                    </p>
                    <Button variant="gold" onClick={resetFilters} className="mt-4">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold-300 bg-gold-100 px-3 py-1 text-xs font-medium text-gold-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-gold-300/50"
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

const ProductCard = ({
  product,
  index,
  formatPrice,
  reviewStats,
}: {
  product: Product;
  index: number;
  formatPrice: (p: number) => string;
  reviewStats?: ReviewStats;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/gifts/${product.id}`}>
        <Card className="group h-full overflow-hidden border-canvas-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden bg-canvas-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">🎁</div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="line-clamp-1 font-heading text-lg font-semibold text-navy-800 transition-colors group-hover:text-gold-600">
              {product.name}
            </h3>

            {reviewStats && reviewStats.review_count > 0 && (
              <div className="mt-1.5">
                <ProductRating
                  rating={reviewStats.avg_rating}
                  count={reviewStats.review_count}
                  size="sm"
                />
              </div>
            )}

            <p className="mt-2 font-heading text-base font-bold text-gold-600">
              {formatPrice(product.price)}
            </p>

            {product.vendor_profiles && (
              <p className="mt-2 truncate text-sm text-muted-foreground">
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