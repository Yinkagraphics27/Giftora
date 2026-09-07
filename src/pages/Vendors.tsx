import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Search, BadgeCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  business_name: string;
  city: string | null;
  country: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("id, business_name, city, country, description, logo_url, is_verified")
      .eq("is_verified", true);

    if (error) {
      console.error("Error fetching vendors:", error);
    } else {
      setVendors(data || []);
    }
    setIsLoading(false);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const q = searchQuery.toLowerCase();
    return (
      vendor.business_name.toLowerCase().includes(q) ||
      (vendor.description || "").toLowerCase().includes(q) ||
      (vendor.city || "").toLowerCase().includes(q) ||
      (vendor.country || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-3xl font-bold text-foreground md:text-4xl"
            >
              Find Vendors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-muted-foreground"
            >
              Connect with trusted gift vendors from around the world
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name, city, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
            </p>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredVendors.map((vendor) => (
                  <Link key={vendor.id} to={`/vendors/${vendor.id}`}>
                    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-medium cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                        {vendor.logo_url ? (
                          <img
                            src={vendor.logo_url}
                            alt={vendor.business_name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-4xl">🎁</span>
                        )}
                        {vendor.is_verified && (
                          <div className="absolute right-3 top-3">
                            <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur-sm">
                              <BadgeCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {vendor.business_name}
                        </h3>
                        {vendor.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {vendor.description}
                          </p>
                        )}
                        {(vendor.city || vendor.country) && (
                          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && filteredVendors.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">No vendors found.</p>
                {vendors.length === 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No verified vendors yet — approve some in the admin panel first.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}