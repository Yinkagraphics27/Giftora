import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Shield, Globe, Award, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.webp";
import hero4 from "@/assets/hero4.jpg";
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

const rotatingWords = ["Gifts", "Gift Boxes", "Hampers", "Souvenirs", "Custom Gifts"];

const showcaseImages = [
  { image: hero1, label: "Gift Boxes", caption: "Beautifully curated, ready to ship" },
  { image: hero2, label: "Hampers", caption: "Luxury bundles for every occasion" },
  { image: hero3, label: "Corporate Gifts", caption: "Impress clients and teams alike" },
  { image: hero4, label: "Custom Gifts", caption: "Personalized touches that matter" },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block min-w-[1px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={rotatingWords[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="inline-block text-white"
        >
          {rotatingWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function LiveShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = showcaseImages[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mt-2 flex justify-center lg:mt-0 lg:h-full lg:items-center lg:justify-center"
    >
      <div className="w-full max-w-sm lg:max-w-md">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.image}
              src={current.image}
              alt={current.label}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {current.label}
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={current.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-3 font-heading text-xl font-bold text-white"
              >
                {current.caption}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex gap-1.5">
          {showcaseImages.map((s, i) => (
            <div
              key={s.label}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i === index ? "bg-white" : "bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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

      <div className="container relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm"
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
              className="font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[3.25rem]"
            >
              Discover Perfect <RotatingWord /> Worldwide
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-white/85"
            >
              Browse curated gift boxes, hampers, souvenirs, and custom gifts from verified vendors —
              or join as a vendor to grow your gift business.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-7 flex max-w-md gap-2"
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
          </div>

          <LiveShowcase />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 grid gap-4 sm:grid-cols-3 lg:mt-20"
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
    </section>
  );
}