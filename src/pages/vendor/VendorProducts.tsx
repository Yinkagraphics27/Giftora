import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Package,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Store,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { deleteProductImage } from "@/lib/storage";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  image_url: string | null;
  image_urls: string[] | null;
  is_active: boolean;
  stock: number;
  created_at: string;
}

export default function VendorProducts() {
  const { user, vendorProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch products when vendorProfile is loaded
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }
    if (!vendorProfile) {
      // Not a vendor
      navigate("/", { replace: true });
      return;
    }
    fetchProducts();
  }, [authLoading, user, vendorProfile, navigate]);

  const fetchProducts = async () => {
    if (!vendorProfile) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, category, price, image_url, image_urls, is_active, stock, created_at")
      .eq("vendor_id", vendorProfile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load products");
    } else {
      setProducts((data ?? []) as Product[]);
    }
    setIsLoading(false);
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(product.is_active ? "Product hidden" : "Product visible");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      // Delete images from storage
      const images = product.image_urls ?? (product.image_url ? [product.image_url] : []);
      for (const url of images) {
        await deleteProductImage(url);
      }

      // Delete product row
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                to="/dashboard"
                className="text-xs font-medium text-gold-600 hover:underline"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800 md:text-3xl">
                My Products
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {vendorProfile?.business_name}
              </p>
            </div>
            <Button variant="gold" className="gap-2" asChild>
              <Link to="/vendor/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Card className="border-canvas-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-600">
                  Total Products
                </span>
                <Package className="h-4 w-4 text-navy-400" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-navy-800">
                {products.length}
              </p>
            </Card>
            <Card className="border-canvas-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-600">
                  Active
                </span>
                <Eye className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-emerald-600">
                {products.filter((p) => p.is_active).length}
              </p>
            </Card>
            <Card className="border-canvas-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-600">
                  Hidden
                </span>
                <EyeOff className="h-4 w-4 text-navy-400" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-navy-500">
                {products.filter((p) => !p.is_active).length}
              </p>
            </Card>
          </div>

          {/* Search */}
          {products.length > 0 && (
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                <Input
                  placeholder="Search your products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {products.length === 0 ? (
            <Card className="border-dashed border-canvas-300 bg-white">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas-100">
                  <Store className="h-7 w-7 text-navy-400" />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-navy-800">
                    No products yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first product and it will go live on the marketplace.
                  </p>
                </div>
                <Button variant="gold" className="mt-2 gap-2" asChild>
                  <Link to="/vendor/products/new">
                    <Plus className="h-4 w-4" />
                    Add Your First Product
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-canvas-200 bg-white py-12 text-center">
              <p className="text-muted-foreground">
                No products match "{search}"
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onToggleActive={() => handleToggleActive(product)}
                  onDelete={() => handleDelete(product)}
                  isDeleting={deletingId === product.id}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ============================================================
   PRODUCT ROW
   ============================================================ */
function ProductRow({
  product,
  onToggleActive,
  onDelete,
  isDeleting,
  formatPrice,
}: {
  product: Product;
  onToggleActive: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  formatPrice: (n: number) => string;
}) {
  const coverImage =
    product.image_urls?.[0] ?? product.image_url ?? null;
  const imageCount = product.image_urls?.length ?? (product.image_url ? 1 : 0);

  return (
    <Card className="border-canvas-200 bg-white transition hover:border-gold-300">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        {/* Image */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-canvas-200 bg-canvas-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              🎁
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 font-heading text-base font-semibold text-navy-800">
              {product.name}
            </h3>
            {product.is_active ? (
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-emerald-200 bg-emerald-100 text-emerald-700"
              >
                <Eye className="h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-canvas-300 bg-canvas-100 text-navy-500"
              >
                <EyeOff className="h-3 w-3" />
                Hidden
              </Badge>
            )}
          </div>
          <p className="mt-1 font-heading text-lg font-bold text-gold-600">
            {formatPrice(product.price)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {imageCount} image{imageCount === 1 ? "" : "s"} · Stock: {product.stock}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleActive}
            title={product.is_active ? "Hide product" : "Make visible"}
          >
            {product.is_active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/vendor/products/${product.id}/edit`} title="Edit">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Delete"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}