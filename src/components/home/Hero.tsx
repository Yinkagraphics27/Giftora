import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Shield, Globe, Award, Search } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

const valuePoints = [
  {
    icon: Globe,
    title: "Global Vendors",
    description: "Connect with trusted gift vendors from Nigeria, Dubai, UK, and beyond",
  },
  {
    icon: Shield,
    title: "Trusted Sellers",
    description: "Every vendor is verified and reviewed for quality assurance",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Curated selection of exceptional gifts for every occasion",
  },
];

export function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorCount, setVendorCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchVendorCount = async () => {
      const { count } = await supabase
        .from("vendor_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true);
      setVendorCount(count ?? 0);
    };
    fetchVendorCount();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/browse?search=${encodeURIComponent(searchQuery.trim())}` : "/browse");
  };

  return (
    <section className="relative overflow-hidden bg-[#E8752F]">
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Premium gift boxes"
          className="h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E8752F] via-[#E8752F]/95 to-[#E8752F]/70" />
      </div>

      <div className="container relative z-10 py-20 md:py-28 lg:py-36">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">
              Premium Gift Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Discover Perfect Gifts Worldwide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-white/85 md:text-xl"
          >
            Browse curated gift boxes, hampers, souvenirs, and custom gifts from verified vendors —
            or join as a vendor to grow your gift business.
          </motion.p>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 flex max-w-md gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for gift boxes, hampers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-full border-0 bg-white pl-10 text-foreground shadow-soft"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-full bg-white px-6 text-[#E8752F] hover:bg-white/90">
              Search
            </Button>
          </motion.form>

          {vendorCount !== null && vendorCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-3 text-sm text-white/80"
            >
              <span className="font-semibold text-white">{vendorCount}</span> verified vendor{vendorCount !== 1 ? "s" : ""} ready to serve you
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button size="xl" className="bg-white text-[#E8752F] hover:bg-white/90" asChild>
              <Link to="/browse">
                Browse Gifts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/40 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/register">Join as Vendor</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            {valuePoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-soft">
                  <point.icon className="h-6 w-6 text-[#E8752F]" />
                </div>
                <h3 className="mt-3 font-heading text-lg font-bold text-white">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm text-white/75">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}