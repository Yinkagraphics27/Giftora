import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/vendor/ImageUploader";
import {
  Loader2,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/lib/storage";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function VendorProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user, vendorProfile, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "100",
    is_active: true,
    image_urls: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories + existing product (if editing)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }
    if (!vendorProfile) {
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, icon")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (cats) setCategories(cats);

      // If editing, fetch product
      if (isEditing && id) {
        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("vendor_id", vendorProfile.id)
          .maybeSingle();

        if (error || !product) {
          toast.error("Product not found");
          navigate("/vendor/products", { replace: true });
          return;
        }

        const images =
          product.image_urls ??
          (product.image_url ? [product.image_url] : []);

        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          category: product.category ?? "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? 100),
          is_active: product.is_active ?? true,
          image_urls: images,
        });
      }

      setIsLoading(false);
    })();
  }, [authLoading, user, vendorProfile, isEditing, id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileSelected = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not signed in");
    return uploadProductImage(file, user.id);
  };

  const handleRemoveImage = async (url: string) => {
    await deleteProductImage(url);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.name.trim()) next.name = "Product name is required";
    if (!form.category) next.category = "Please select a category";
    if (!form.price || Number(form.price) <= 0)
      next.price = "Enter a valid price";
    if (!form.description.trim())
      next.description = "Description is required";
    if (form.image_urls.length === 0)
      next.images = "At least one image is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }
    if (!vendorProfile) return;

    setIsSaving(true);
    try {
      const payload = {
        vendor_id: vendorProfile.id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock) || 100,
        is_active: form.is_active,
        image_url: form.image_urls[0] ?? null,
        image_urls: form.image_urls,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", id)
          .eq("vendor_id", vendorProfile.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product published!");
      }

      navigate("/vendor/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="container max-w-3xl">
          <Link
            to="/vendor/products"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Link>

          <h1 className="font-heading text-2xl font-bold text-navy-800 md:text-3xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Update your product details."
              : "Fill in the details below to publish your product."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Images */}
            <Card className="border-canvas-200 bg-white">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-navy-800">
                    Product Images
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Add up to 5 photos. The first one will be the cover.
                  </p>
                </div>
                <ImageUploader
                  value={form.image_urls}
                  onChange={(urls) => {
                    setForm({ ...form, image_urls: urls });
                    if (errors.images) setErrors({ ...errors, images: "" });
                  }}
                  onFileSelected={handleFileSelected}
                  onRemoveImage={handleRemoveImage}
                  maxImages={5}
                />
                {errors.images && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.images}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Basic info */}
            <Card className="border-canvas-200 bg-white">
              <CardContent className="space-y-4 p-6">
                <h2 className="font-heading text-base font-bold text-navy-800">
                  Product Details
                </h2>

                <div>
                  <Label htmlFor="name">Product name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Luxury Birthday Gift Box"
                    maxLength={120}
                    disabled={isSaving}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your product — what's included, who it's for, delivery info..."
                    rows={5}
                    maxLength={1000}
                    disabled={isSaving}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {form.description.length}/1000 characters
                  </p>
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => {
                      setForm({ ...form, category: v });
                      if (errors.category)
                        setErrors({ ...errors, category: "" });
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing + stock */}
            <Card className="border-canvas-200 bg-white">
              <CardContent className="space-y-4 p-6">
                <h2 className="font-heading text-base font-bold text-navy-800">
                  Pricing & Stock
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price (₦) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="100"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="e.g. 25000"
                      disabled={isSaving}
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock quantity</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="100"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <Separator className="bg-canvas-200" />

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-canvas-300 text-gold-500 focus:ring-gold-500"
                    disabled={isSaving}
                  />
                  <div>
                    <Label
                      htmlFor="is_active"
                      className="cursor-pointer font-medium"
                    >
                      Publish immediately
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Uncheck to save as draft — buyers won't see it until you
                      publish.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/vendor/products")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                className="flex-1 gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? "Save Changes" : "Publish Product"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}