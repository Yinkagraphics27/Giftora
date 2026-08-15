import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, ArrowLeft, Upload, X, Plus, Loader2, ImageIcon } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/contexts/AuthContext";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "UAE",
  "Other",
];

const CATEGORIES = [
  { value: "gift-boxes", label: "Gift Boxes" },
  { value: "hampers", label: "Hampers" },
  { value: "corporate", label: "Corporate Gifts" },
  { value: "souvenirs", label: "Souvenirs" },
  { value: "custom", label: "Custom Gifts" },
];

const VENDOR_TYPES = [
  { value: "curator", label: "Gift Curator" },
  { value: "wholesaler", label: "Gift Producer / Wholesaler" },
];

const vendorSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(100),
  email: z.string().email("Invalid email address"),
  whatsapp: z.string().min(10, "WhatsApp number is required").max(20),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(2, "City is required").max(100),
  vendorType: z.enum(["curator", "wholesaler"]),
  category: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
});

const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Category is required"),
  priceMin: z.coerce.number().min(0, "Price must be positive"),
  priceMax: z.coerce.number().min(0).optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;
type ProductFormData = z.infer<typeof productSchema>;

interface ProductEntry extends ProductFormData {
  imageFile: File | null;
  imagePreview: string | null;
}

export default function AdminAddVendor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const { user } = useAuth();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [addProducts, setAddProducts] = useState(false);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorType: "curator",
      country: "Nigeria",
    },
  });

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const addProduct = () => {
    if (products.length >= 5) {
      toast({
        title: "Limit reached",
        description: "Maximum 5 products allowed",
        variant: "destructive",
      });
      return;
    }
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        category: "gift-boxes",
        priceMin: 0,
        priceMax: undefined,
        imageFile: null,
        imagePreview: null,
      },
    ]);
  };

  const updateProduct = (index: number, field: keyof ProductEntry, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleProductImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const updated = [...products];
    updated[index].imageFile = file;
    updated[index].imagePreview = URL.createObjectURL(file);
    setProducts(updated);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicData.publicUrl;
  };

  const onSubmit = async (data: VendorFormData) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const logoPath = `admin-added/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        logoUrl = await uploadFile(logoFile, "vendor-logos", logoPath);
      }

      // Create vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendor_profiles")
        .insert({
          user_id: user.id, // Admin's ID - can be transferred later
          business_name: data.businessName,
          email: data.email,
          whatsapp: data.whatsapp,
          country: data.country,
          city: data.city,
          vendor_type: data.vendorType,
          description: data.description,
          logo_url: logoUrl,
          status: "approved",
          is_verified: true,
          subscription_status: "active", // Give them active status
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      // Upload products if any
      if (addProducts && products.length > 0) {
        for (const product of products) {
          if (!product.name) continue;

          let productImageUrl: string | null = null;
          if (product.imageFile) {
            const imagePath = `admin-added/${Date.now()}-${product.imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
            productImageUrl = await uploadFile(product.imageFile, "product-images", imagePath);
          }

          await supabase.from("products").insert({
            vendor_id: vendorData.id,
            name: product.name,
            description: product.description || null,
            category: product.category,
            price_min: product.priceMin,
            price_max: product.priceMax || null,
            image_url: productImageUrl,
            status: "active",
            is_active: true,
          });
        }
      }

      toast({
        title: "Vendor Added!",
        description: `${data.businessName} has been added successfully.`,
      });

      // Navigate to vendor profile or back to admin
      navigate(`/vendors/${vendorData.id}`);
    } catch (error: any) {
      console.error("Error adding vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vendor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">Giftora</span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              Add Vendor
            </Badge>
          </Link>

          <Button variant="outline" size="sm" asChild>
            <Link to="/internal-admin-review">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 font-heading text-2xl font-bold">Add New Vendor</h1>
          <p className="mb-8 text-muted-foreground">
            Manually onboard a vendor with their complete details
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendor Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Business Name */}
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    {...register("businessName")}
                    placeholder="e.g., Elegant Gifts & Hampers"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-destructive">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Email & WhatsApp */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="vendor@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                    <Input
                      id="whatsapp"
                      {...register("whatsapp")}
                      placeholder="+234 800 000 0000"
                    />
                    {errors.whatsapp && (
                      <p className="mt-1 text-sm text-destructive">{errors.whatsapp.message}</p>
                    )}
                  </div>
                </div>

                {/* Country & City */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={watch("country")}
                      onValueChange={(v) => setValue("country", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} placeholder="e.g., Lagos" />
                    {errors.city && (
                      <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Vendor Type & Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="vendorType">Vendor Type *</Label>
                    <Select
                      value={watch("vendorType")}
                      onValueChange={(v) => setValue("vendorType", v as "curator" | "wholesaler")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VENDOR_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Primary Category</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(v) => setValue("category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the vendor's business, specialties, and what makes them unique..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logo Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="mt-1 text-xs text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>Upload the vendor's logo</p>
                    <p className="mt-1">Max 5MB, JPG/PNG recommended</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Samples */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Product Samples (Optional)</CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="addProducts"
                      checked={addProducts}
                      onCheckedChange={(checked) => setAddProducts(checked === true)}
                    />
                    <Label htmlFor="addProducts" className="cursor-pointer text-sm">
                      Add products
                    </Label>
                  </div>
                </div>
              </CardHeader>
              {addProducts && (
                <CardContent className="space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>

                      <p className="mb-3 text-sm font-medium">Product {index + 1}</p>

                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label>Name *</Label>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(index, "name", e.target.value)}
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <Label>Category *</Label>
                            <Select
                              value={product.category}
                              onValueChange={(v) => updateProduct(index, "category", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <Label>Min Price (₦)</Label>
                            <Input
                              type="number"
                              value={product.priceMin}
                              onChange={(e) =>
                                updateProduct(index, "priceMin", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label>Max Price (₦)</Label>
                            <Input
                              type="number"
                              value={product.priceMax || ""}
                              onChange={(e) =>
                                updateProduct(
                                  index,
                                  "priceMax",
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label>Image</Label>
                            {product.imagePreview ? (
                              <div className="relative h-10 w-10">
                                <img
                                  src={product.imagePreview}
                                  alt=""
                                  className="h-10 w-10 rounded object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProduct(index, "imageFile", null);
                                    updateProduct(index, "imagePreview", null);
                                  }}
                                  className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5"
                                >
                                  <X className="h-2 w-2 text-destructive-foreground" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-dashed hover:bg-muted/50">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleProductImageChange(index, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={product.description || ""}
                            onChange={(e) => updateProduct(index, "description", e.target.value)}
                            placeholder="Optional product description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {products.length < 5 && (
                    <Button type="button" variant="outline" onClick={addProduct} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  )}

                  {products.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Click "Add Product" to add sample products for this vendor
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              variant="gold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Vendor...
                </>
              ) : (
                "Add Vendor"
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
