// src/pages/VendorDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gift,
  Store,
  Package,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  city: string | null;
  country: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  subscription_status: string;
  subscription_expires_at: string | null;
  free_month_earned: boolean;
}

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "gift-boxes", label: "Gift Boxes" },
  { value: "hampers", label: "Hampers" },
  { value: "corporate", label: "Corporate Gifts" },
  { value: "souvenirs", label: "Souvenirs" },
  { value: "custom", label: "Custom Gifts" },
];

const REQUIRED_PRODUCTS = 100;

const VendorDashboard = () => {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingVendor, setLoadingVendor] = useState(true);

  // Profile dialog
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Product dialog (add/edit)
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("gift-boxes");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [claimLoading, setClaimLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/signin");
      return;
    }
    fetchVendorProfile(user.id);
  };

  const fetchVendorProfile = async (userId: string) => {
    setLoadingVendor(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching vendor:", error);
      setLoadingVendor(false);
      return;
    }

    setVendor(data as Vendor);
    setProfileName(data.business_name || "");
    setProfileDescription(data.description || "");
    setProfileCity(data.city || "");
    setProfileCountry(data.country || "");
    setProfileWhatsapp(data.whatsapp || "");
    fetchProducts(data.id);
    setLoadingVendor(false);
  };

  const fetchProducts = async (vendorId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (!error) setProducts((data as Product[]) || []);
  };

  // ---------- Profile ----------

  const openProfileDialog = () => {
    if (!vendor) return;
    setProfileName(vendor.business_name || "");
    setProfileDescription(vendor.description || "");
    setProfileCity(vendor.city || "");
    setProfileCountry(vendor.country || "");
    setProfileWhatsapp(vendor.whatsapp || "");
    setLogoFile(null);
    setLogoPreview(null);
    setProfileOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", text: "Logo must be under 5MB" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!vendor) return;
    if (!profileName.trim()) {
      setToast({ type: "error", text: "Business name is required" });
      return;
    }

    setProfileSaving(true);
    try {
      let logoUrl = vendor.logo_url || null;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const fileName = `${vendor.id}-logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("vendor-logos")
          .upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("vendor-logos").getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("vendor_profiles")
        .update({
          business_name: profileName.trim(),
          description: profileDescription.trim() || null,
          city: profileCity.trim() || null,
          country: profileCountry.trim() || null,
          whatsapp: profileWhatsapp.trim() || null,
          logo_url: logoUrl,
        })
        .eq("id", vendor.id);

      if (error) throw error;

      setToast({ type: "success", text: "Profile updated" });
      setProfileOpen(false);
      fetchVendorProfile(vendor.user_id);
    } catch (err: any) {
      setToast({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setProfileSaving(false);
    }
  };

  // ---------- Products ----------

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory("gift-boxes");
    setProductImageFile(null);
    setProductImagePreview(null);
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description || "");
    setProductPrice(String(product.price));
    setProductCategory(product.category || "gift-boxes");
    setProductImageFile(null);
    setProductImagePreview(product.image_url);
    setProductDialogOpen(true);
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", text: "Image must be under 5MB" });
      return;
    }
    setProductImageFile(file);
    setProductImagePreview(URL.createObjectURL(file));
  };

  const saveProduct = async () => {
    if (!vendor) return;
    if (!productName.trim()) {
      setToast({ type: "error", text: "Product name is required" });
      return;
    }

    setProductSaving(true);
    try {
      let imageUrl = editingProductId ? productImagePreview : null;

      if (productImageFile) {
        const ext = productImageFile.name.split(".").pop();
        const fileName = `${vendor.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, productImageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      if (editingProductId) {
        const { error } = await supabase
          .from("products")
          .update({
            name: productName.trim(),
            description: productDescription.trim() || null,
            price: parseFloat(productPrice) || 0,
            category: productCategory,
            image_url: imageUrl,
          })
          .eq("id", editingProductId);
        if (error) throw error;
        setToast({ type: "success", text: "Product updated" });
      } else {
        const { error } = await supabase.from("products").insert([
          {
            vendor_id: vendor.id,
            name: productName.trim(),
            description: productDescription.trim() || null,
            price: parseFloat(productPrice) || 0,
            category: productCategory,
            image_url: imageUrl,
            status: "draft",
            is_active: true,
          },
        ]);
        if (error) throw error;
        setToast({ type: "success", text: "Product added" });
      }

      setProductDialogOpen(false);
      fetchProducts(vendor.id);
    } catch (err: any) {
      setToast({ type: "error", text: err.message || "Failed to save product" });
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!vendor) return;
    if (!window.confirm("Delete this product? This cannot be undone.")) return;

    setDeletingId(productId);
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      setToast({ type: "success", text: "Product deleted" });
      fetchProducts(vendor.id);
    } catch (err: any) {
      setToast({ type: "error", text: err.message || "Failed to delete product" });
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Free month ----------

  const handleClaimFreeMonth = async () => {
    setClaimLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        "https://iaoriuznuyppshgujnrw.supabase.co/functions/v1/activate-free-month",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const result = await response.json();
      if (result.success) {
        setToast({ type: "success", text: result.message || "Free month claimed!" });
        if (vendor) fetchVendorProfile(vendor.user_id);
      } else {
        setToast({ type: "error", text: result.error || "Something went wrong" });
      }
    } catch (err: any) {
      setToast({ type: "error", text: err.message || "Failed to claim free month" });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  if (loadingVendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-center">
        <p className="text-muted-foreground">Vendor profile not found.</p>
      </div>
    );
  }

  const productCount = products.length;
  const remaining = Math.max(0, REQUIRED_PRODUCTS - productCount);
  const progress = Math.min(100, (productCount / REQUIRED_PRODUCTS) * 100);
  const isEligible = productCount >= REQUIRED_PRODUCTS;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-soft">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">Giftora</span>
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">Dashboard</Badge>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="hidden sm:block">
              <Button variant="outline" size="sm">Back to Site</Button>
            </Link>
            <Badge variant="outline" className="hidden capitalize sm:inline-flex">
              {vendor.subscription_status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Profile card */}
        <Card className="mb-8 overflow-hidden border-border">
          <div className="h-20 bg-gradient-to-r from-primary to-[#c95f1f]" />
          <CardContent className="relative px-6 pb-6">
            <div className="-mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-medium">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.business_name} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                    {vendor.business_name}
                  </h1>
                  {(vendor.city || vendor.country) ? (
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Location not set</p>
                  )}
                </div>
              </div>

              <Button onClick={openProfileDialog} className="w-full sm:w-auto">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              {vendor.description || "No description yet — tell buyers what makes your business special."}
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Products</p>
              <p className="mt-1 font-heading text-3xl font-bold text-foreground">{productCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {remaining > 0 ? `${remaining} more for free month` : "Goal reached!"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subscription</p>
              <p className="mt-1 font-heading text-2xl font-bold capitalize text-foreground">
                {vendor.subscription_status}
              </p>
              {vendor.subscription_expires_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Expires {new Date(vendor.subscription_expires_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Free Month</p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                {vendor.free_month_earned ? "Claimed" : "Available"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {vendor.free_month_earned ? "Enjoy!" : `${remaining} products to go`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Free month progress */}
        {!vendor.free_month_earned && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Progress to Free Month
                </h3>
                <span className="text-sm font-medium text-muted-foreground">
                  {productCount} / {REQUIRED_PRODUCTS}
                </span>
              </div>
              <Progress value={progress} className="h-2.5" />
              {isEligible && (
                <Button className="mt-4" onClick={handleClaimFreeMonth} disabled={claimLoading}>
                  {claimLoading ? "Processing..." : "Claim Free Month"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
            <Package className="h-5 w-5 text-primary" />
            Your Products ({products.length})
          </h2>
          <Button onClick={openAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No products yet. Add your first one!</p>
              <Button className="mt-4" onClick={openAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🎁</div>
                  )}
                  <Badge className="absolute left-2 top-2 bg-background/90 text-[11px] text-foreground backdrop-blur-sm capitalize">
                    {product.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="line-clamp-1 font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-1 text-sm font-bold text-primary">
                    NGN {product.price.toLocaleString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditProduct(product)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deletingId === product.id}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      {deletingId === product.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                  {logoPreview || vendor.logo_url ? (
                    <img src={logoPreview || vendor.logo_url!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleLogoChange} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Business Name</label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
              <Textarea rows={3} value={profileDescription} onChange={(e) => setProfileDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                <Input value={profileCity} onChange={(e) => setProfileCity(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                <Input value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">WhatsApp Number</label>
              <Input
                placeholder="e.g. 2348001234567"
                value={profileWhatsapp}
                onChange={(e) => setProfileWhatsapp(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)} disabled={profileSaving}>
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Product Name *</label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
              <Textarea rows={3} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
              <Select value={productCategory} onValueChange={setProductCategory}>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Price (NGN)</label>
              <Input type="number" min="0" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Image</label>
              <Input type="file" accept="image/*" onChange={handleProductImageChange} />
              {productImagePreview && (
                <img
                  src={productImagePreview}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-lg border border-border object-cover"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)} disabled={productSaving}>
              Cancel
            </Button>
            <Button onClick={saveProduct} disabled={productSaving}>
              {productSaving ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;