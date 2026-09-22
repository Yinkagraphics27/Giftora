import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Occasion {
  id: string;
  name: string;
  icon: string;
  group_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  vendor_profiles?: { business_name: string } | null;
}

const OccasionPage = () => {
  const { id } = useParams<{ id: string }>();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);

      // Fetch occasion info
      const { data: occ } = await supabase
        .from("occasions")
        .select("id, name, icon, group_name")
        .eq("id", id)
        .maybeSingle();

      setOccasion(occ);

      // Fetch products tagged with this occasion
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, image_url, vendor_profiles(business_name)")
        .eq("is_active", true)
        .contains("occasions", [id])
        .order("created_at", { ascending: false });

      setProducts((prods ?? []) as unknown as Product[]);
      setIsLoading(false);
    })();
  }, [id]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <MobileShell>
      <MobileHeader />

      <main className="pb-24 md:pb-8">
        {/* Hero banner */}
        <section className="border-b border-canvas-200 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>

            <div className="flex items-center gap-4">
              {occasion && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-4xl shadow-lg sm:h-20 sm:w-20 sm:text-5xl">
                  {occasion.icon}
                </div>
              )}
              <div>
                <h1 className="font-heading text-2xl font-bold text-canvas-50 sm:text-3xl md:text-4xl">
                  {occasion?.name ?? "Gifts"}
                </h1>
                <p className="mt-1 text-sm text-canvas-100/80">
                  {products.length} perfect{" "}
                  {products.length === 1 ? "gift" : "gifts"} for this occasion
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-canvas-300 bg-white py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canvas-100">
                <Package className="h-6 w-6 text-navy-400" />
              </div>
              <p className="mt-3 font-heading text-lg font-semibold text-navy-800">
                No gifts yet for {occasion?.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vendors are adding gifts every day. Check back soon.
              </p>
              <Button variant="gold" className="mt-4" asChild>
                <Link to="/browse">Browse All Gifts</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/gifts/${product.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-canvas-200 bg-white transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                >
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
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-xs font-semibold text-navy-800 sm:text-sm">
                      {product.name}
                    </h3>
                    <p className="mt-auto pt-2 font-heading text-sm font-bold text-gold-600 sm:text-base">
                      {formatPrice(product.price)}
                    </p>
                    {product.vendor_profiles?.business_name && (
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {product.vendor_profiles.business_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <MobileBottomNav />
    </MobileShell>
  );
};

export default OccasionPage;