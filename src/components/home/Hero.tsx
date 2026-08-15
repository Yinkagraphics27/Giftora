import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Globe, Award } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

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
  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Premium gift boxes"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container relative z-10 py-20 md:py-28 lg:py-36">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Premium Gift Marketplace
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Discover Perfect{" "}
            <span className="text-gradient-gold">Gifts</span> Worldwide
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground md:text-xl"
          >
            Browse curated gift boxes, hampers, souvenirs, and custom gifts from verified vendors — 
            or join as a vendor to grow your gift business.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button variant="gold" size="xl" asChild>
              <Link to="/gifts">
                Browse Gifts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/register">Join as Vendor</Link>
            </Button>
          </motion.div>

          {/* Value Points - Bold Visual Design */}
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
                className="group rounded-2xl border border-primary/20 bg-background/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-background/90 hover:shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold shadow-soft">
                  <point.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-3 font-heading text-lg font-bold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
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
