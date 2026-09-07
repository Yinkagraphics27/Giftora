import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  business_name: string;
  city: string | null;
  country: string | null;
  logo_url: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturedVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("id, business_name, city, country, logo_url")
        .eq("is_verified", true)
        .limit(4);

      if (!error) setVendors(data || []);
      setIsLoading(false);
    };
    fetchVendors();
  }, []);

  if (!isLoading && vendors.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium uppercase tracking-wider text-primary"
            >
              Featured
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
            >
              Featured Vendors
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" asChild>
              <Link to="/vendors">
                Find All Vendors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {vendors.map((vendor) => (
            <motion.div key={vendor.id} variants={item}>
              <Link to={`/vendors/${vendor.id}`}>
                <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-medium">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Store className="h-10 w-10 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {vendor.business_name}
                    </h3>

                    {(vendor.city || vendor.country) && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}