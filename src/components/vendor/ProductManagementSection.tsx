import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductStatusTabs, getStatusBadgeProps } from "./ProductStatusTabs";
import { ProductLimitBanner } from "./ProductLimitBanner";
import { useSubscriptionLogic, type ProductStatus } from "@/hooks/useSubscriptionLogic";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_min: number;
  price_max: number | null;
  image_url: string | null;
  is_active: boolean;
  status: ProductStatus;
  is_vendor_deal: boolean;
  trade_price: number | null;
  minimum_order_quantity: number | null;
  admin_review_notes?: string | null;
}

interface ProductManagementSectionProps {
  isLocked: boolean;
  lockMessage?: string;
}

const categories = [
  { value: "gift-boxes", label: "Gift Boxes" },
  { value: "hampers", label: "Hampers" },
  { value: "baskets", label: "Baskets" },
  { value: "trunks", label: "Trunks" },
  { value: "souvenirs", label: "Souvenirs" },
  { value: "accessories", label: "Accessories" },
  { value: "corporate", label: "Corporate Gifts" },
  { value: "jewelry", label: "Jewelry" },
  { value: "handbags", label: "Handbags" },
  { value: "drinks-wine", label: "Drinks & Wine" },
];

export function ProductManagementSection({
  isLocked,
  lockMessage = "Activate your subscription to manage products",
}: ProductManagementSectionProps) {
  const { user, vendorProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Subscription logic
  const {
    isSubscribed,
    productCounts,
    getNewProductStatus,
    shouldShowDraftMessage,
    freeTierUsage,
  } = useSubscriptionLogic(vendorProfile, products);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price_min: "",
    price_max: "",
    is_vendor_deal: false,
    trade_price: "",
    minimum_order_quantity: "",
  });

  useEffect(() => {
    if (vendorProfile) {
      fetchProducts();
    }
  }, [vendorProfile]);

  const fetchProducts = async () => {
    if (!vendorProfile) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", vendorProfile.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map is_active to status for backward compatibility
      const mappedProducts = data.map((p: any) => ({
        ...p,
        status: p.status || (p.is_active ? "active" : "draft"),
      }));
      setProducts(mappedProducts);
    }
    setIsLoading(false);
  };

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.status === activeTab);
  }, [products, activeTab]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price_min: "",
      price_max: "",
      is_vendor_deal: false,
      trade_price: "",
      minimum_order_quantity: "",
    });
    setPreviewImage(null);
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price_min: product.price_min.toString(),
      price_max: product.price_max?.toString() || "",
      is_vendor_deal: product.is_vendor_deal,
      trade_price: product.trade_price?.toString() || "",
      minimum_order_quantity: product.minimum_order_quantity?.toString() || "",
    });
    setPreviewImage(product.image_url);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setPreviewImage(publicUrl);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!vendorProfile) return;

    if (!formData.name || !formData.category || !formData.price_min) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Determine status for new products based on subscription logic
      const newStatus = editingProduct ? editingProduct.status : getNewProductStatus();
      
      const productData = {
        vendor_id: vendorProfile.id,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price_min: parseFloat(formData.price_min),
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        image_url: previewImage,
        is_vendor_deal: formData.is_vendor_deal,
        trade_price: formData.trade_price ? parseFloat(formData.trade_price) : null,
        minimum_order_quantity: formData.minimum_order_quantity
          ? parseInt(formData.minimum_order_quantity)
          : null,
        status: newStatus,
        is_active: newStatus === "active", // Keep is_active in sync for backward compat
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: "Your product has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        // Show appropriate message based on status
        if (newStatus === "draft") {
          toast({
            title: "Product saved as Draft",
            description: "Subscribe to publish this product and make it visible to buyers.",
          });
        } else if (newStatus === "pending_review") {
          toast({
            title: "Product submitted for review",
            description: "Your product will be reviewed by our team shortly.",
          });
        } else {
          toast({
            title: "Product published!",
            description: "Your product is now visible to buyers.",
          });
        }
      }

      await fetchProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Your product has been removed",
      });

      await fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (product: Product, newStatus: ProductStatus) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ 
          status: newStatus,
          is_active: newStatus === "active" 
        })
        .eq("id", product.id);

      if (error) throw error;

      await fetchProducts();
      toast({
        title: "Status updated",
        description: `Product is now ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Product Management Locked
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{lockMessage}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-background p-6"
    >
      {/* Product Limit Banner for free tier users */}
      {!isSubscribed && <ProductLimitBanner productCount={products.length} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
            <Package className="h-5 w-5 text-primary" />
            My Products
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your gift products and listings
          </p>
        </div>
        <Button variant="gold" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Status Tabs */}
      {products.length > 0 && (
        <div className="mb-6">
          <ProductStatusTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={productCounts}
          />
        </div>
      )}

      {/* Draft message for non-subscribers */}
      {shouldShowDraftMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              New products will be saved as drafts. Subscribe to publish unlimited products.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold">No Products Yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Add your first product to start receiving inquiries from buyers.
          </p>
          <Button variant="outline" className="mt-4" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold">No {activeTab} Products</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            You don't have any products with this status.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const statusBadge = getStatusBadgeProps(product.status);
            const isActive = product.status === "active";
            const isDraft = product.status === "draft";
            const isPending = product.status === "pending_review";
            const isDeclined = product.status === "declined";
            const isClosed = product.status === "closed";

            return (
              <div
                key={product.id}
                className={`overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md ${
                  !isActive ? "opacity-75" : ""
                }`}
              >
                <div className="aspect-[4/3] bg-muted relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Status overlay for non-active products */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                      {isDraft && <EyeOff className="h-8 w-8 text-muted-foreground" />}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className={`text-xs ${statusBadge.className}`}>
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(product.category)}
                    </Badge>
                    {product.is_vendor_deal && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        Vendor Deal
                      </Badge>
                    )}
                  </div>
                  <h3 className={`font-semibold text-foreground line-clamp-1 ${isClosed ? "line-through" : ""}`}>
                    {product.name}
                  </h3>
                  <p className="mt-1 font-heading text-lg font-bold text-primary">
                    ₦{product.price_min.toLocaleString()}
                    {product.price_max && ` - ₦${product.price_max.toLocaleString()}`}
                  </p>

                  {/* Declined reason */}
                  {isDeclined && product.admin_review_notes && (
                    <p className="mt-2 text-xs text-destructive italic">
                      "{product.admin_review_notes}"
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {/* Status actions */}
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductStatus(product, "closed")}
                          className="h-7 px-2 text-xs"
                        >
                          <EyeOff className="mr-1 h-3 w-3" />
                          Hide
                        </Button>
                      )}
                      {(isClosed || (isDraft && isSubscribed)) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductStatus(product, "active")}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Publish
                        </Button>
                      )}
                      {isPending && (
                        <span className="text-xs text-muted-foreground">Under review</span>
                      )}
                      {isDraft && !isSubscribed && (
                        <span className="text-xs text-muted-foreground">Awaiting subscription</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Product Image
              </label>
              <div
                className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">Click to upload image</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Product Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Premium Gift Hamper"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Min Price (₦) *
                </label>
                <Input
                  type="number"
                  value={formData.price_min}
                  onChange={(e) =>
                    setFormData({ ...formData, price_min: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Max Price (₦)
                </label>
                <Input
                  type="number"
                  value={formData.price_max}
                  onChange={(e) =>
                    setFormData({ ...formData, price_max: e.target.value })
                  }
                  placeholder="15000"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Describe your gift product..."
              />
            </div>

            {/* Vendor Deal Toggle */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Make available for Vendor Deals</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow other vendors to purchase this product at trade pricing
                  </p>
                </div>
                <Switch
                  checked={formData.is_vendor_deal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_vendor_deal: checked })
                  }
                />
              </div>

              {formData.is_vendor_deal && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Trade Price (₦)
                    </label>
                    <Input
                      type="number"
                      value={formData.trade_price}
                      onChange={(e) =>
                        setFormData({ ...formData, trade_price: e.target.value })
                      }
                      placeholder="3500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Min Order Qty
                    </label>
                    <Input
                      type="number"
                      value={formData.minimum_order_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimum_order_quantity: e.target.value,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveProduct}
                disabled={isSaving}
                variant="gold"
                className="flex-1"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingProduct ? "Save Changes" : "Add Product"}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
