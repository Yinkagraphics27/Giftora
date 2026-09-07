import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  business_name: string;
  logo_url: string | null;
}

export function CTA() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data } = await supabase
        .from("vendor_profiles")
        .select("id, business_name, logo_url")
        .eq("is_verified", true);
      setVendors(data || []);
    };
    fetchVendors();
  }, []);

  const loopVendors = vendors.length > 0 ? [...vendors, ...vendors] : [];

  return (
    <section className="relative overflow-hidden bg-foreground py-16 md:py-24">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />

      <div className="container relative z-10">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl font-bold text-background md:text-4xl lg:text-5xl"
          >
            Join Giftora as a Vendor
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg text-background/80"
          >
            Connect with buyers and fellow vendors. Whether you're a curator
            or wholesaler, grow your gift business on our platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button variant="gold" size="xl" asChild>
              <Link to="/register">
                Become a Vendor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-background/30 bg-transparent text-background hover:bg-background/10"
              asChild
            >
              <Link to="/vendors">View Vendors</Link>
            </Button>
          </motion.div>
        </div>

        {loopVendors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 overflow-hidden"
          >
            <p className="mb-4 text-center text-sm uppercase tracking-wider text-background/50">
              Trusted by vendors like
            </p>
            <div className="relative flex overflow-hidden">
              <div className="flex animate-[marquee_25s_linear_infinite] gap-4 whitespace-nowrap">
                {loopVendors.map((vendor, i) => (
                  <div
                    key={vendor.id + "-" + i}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-background/10 bg-background/5 px-5 py-2 backdrop-blur-sm"
                  >
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <Store className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-background">
                      {vendor.business_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}