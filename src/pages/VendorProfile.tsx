import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  business_name: string;
  city: string | null;
  country: string | null;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  is_verified: boolean;
}

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVendor(id);
  }, [id]);

  const fetchVendor = async (vendorId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("id, business_name, city, country, description, logo_url, whatsapp, is_verified")
      .eq("id", vendorId)
      .single();

    if (error) {
      console.error("Error fetching vendor:", error);
      setVendor(null);
    } else {
      setVendor(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Vendor Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This vendor profile doesn't exist or is no longer available.
            </p>
            <Link to="/vendors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Vendors
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container pt-6">
          <Link
            to="/vendors"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Link>
        </div>

        <section className="py-8">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-secondary/30 flex items-center justify-center">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.business_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-bold text-muted-foreground/30">
                      {vendor.business_name.charAt(0)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                      {vendor.business_name}
                    </h1>
                    {vendor.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {(vendor.city || vendor.country) && (
                    <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{[vendor.city, vendor.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>

                {vendor.description && (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
                    <p>{vendor.description}</p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                    Contact Vendor
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Chat directly with {vendor.business_name} on WhatsApp for inquiries and orders.
                  </p>

                  {vendor.whatsapp ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      onClick={() => {
                        const cleanNumber = vendor.whatsapp!.replace(/[^\d]/g, "");
                        const message = encodeURIComponent(
                          `Hi ${vendor.business_name}! I found your business on Giftora and I'm interested in learning more about your products.`
                        );
                        window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contact Not Available
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}