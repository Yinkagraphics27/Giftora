import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Package,
  ShoppingBasket,
  Archive,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  {
    id: "gift-boxes",
    name: "Gift Boxes",
    description: "Beautifully curated boxes for every occasion",
    icon: Gift,
  },
  {
    id: "hampers",
    name: "Gift Hampers",
    description: "Luxury hampers with gourmet selections",
    icon: Package,
  },
  {
    id: "corporate",
    name: "Corporate Gifts",
    description: "Professional gifts that make an impression",
    icon: ShoppingBasket,
  },
  {
    id: "custom",
    name: "Custom Gifts",
    description: "Personalized presents made just for you",
    icon: Archive,
  },
  {
    id: "souvenirs",
    name: "Souvenirs",
    description: "Unique cultural keepsakes",
    icon: Award,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);

      if (!error && data) {
        const tally: Record<string, number> = {};
        data.forEach((p) => {
          tally[p.category] = (tally[p.category] || 0) + 1;
        });
        setCounts(tally);
      }
    };
    fetchCounts();
  }, []);

  const topCategoryId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-primary"
          >
            Browse by Category
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
          >
            A Marketplace for Every Gift Type
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            From elegant hampers to personalized accessories — find exactly what you need.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => {
            const count = counts[category.id] || 0;
            const isTop = category.id === topCategoryId && count > 0;

            return (
              <motion.div key={category.id} variants={item}>
                <Link
                  to={`/browse?category=${category.id}`}
                  className="group relative flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium"
                >
                  {isTop && (
                    <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  )}

                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <category.icon className="h-7 w-7 text-primary-foreground" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {category.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary">
                      {count} {count === 1 ? "item" : "items"} available
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}