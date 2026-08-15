import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Building2, MapPin, Phone, Mail, Upload, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface VendorProfileSectionProps {
  isLocked: boolean;
}

export function VendorProfileSection({ isLocked }: VendorProfileSectionProps) {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    business_name: vendorProfile?.business_name || "",
    phone: vendorProfile?.phone || "",
    whatsapp: vendorProfile?.whatsapp || "",
    city: vendorProfile?.city || "",
    description: vendorProfile?.description || "",
  });

  if (!vendorProfile) return null;

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-logos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("vendor-logos")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("vendor_profiles")
        .update({ logo_url: publicUrl })
        .eq("id", vendorProfile.id);

      if (updateError) throw updateError;

      await refreshVendorProfile();

      toast({
        title: "Logo updated",
        description: "Your business logo has been updated successfully",
      });
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

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .update({
          business_name: formData.business_name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          city: formData.city,
          description: formData.description || null,
        })
        .eq("id", vendorProfile.id);

      if (error) throw error;

      await refreshVendorProfile();
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your business profile has been saved",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      className="rounded-2xl border border-border bg-background p-6"
    >
      <h2 className="mb-6 font-heading text-xl font-bold">Business Profile</h2>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Logo Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={vendorProfile.logo_url || undefined} alt={vendorProfile.business_name} />
              <AvatarFallback className="bg-muted text-lg font-semibold">
                {getInitials(vendorProfile.business_name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLocked}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <span className="text-xs text-muted-foreground">
            {isLocked ? "Unlock to edit" : "Click to upload logo"}
          </span>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-4">
          {isEditing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Business Name
                  </label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) =>
                      setFormData({ ...formData, business_name: e.target.value })
                    }
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    City
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    WhatsApp
                  </label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Business Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  disabled={isLocked}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || isLocked}
                  variant="gold"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{vendorProfile.business_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {vendorProfile.city}, {vendorProfile.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{vendorProfile.email}</span>
                </div>
                {vendorProfile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendorProfile.phone}</span>
                  </div>
                )}
                {vendorProfile.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {vendorProfile.description}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLocked}
              >
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
