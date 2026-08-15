import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Gift, 
  Package, 
  ShoppingBasket, 
  Archive, 
  Award, 
  Sparkles 
} from "lucide-react";

const categories = [
  {
    id: "gift-boxes",
    name: "Gift Boxes",
    description: "Beautifully curated boxes for every occasion",
    icon: Gift,
  },
  {
    id: "gift-hampers",
    name: "Gift Hampers",
    description: "Luxury hampers with gourmet selections",
    icon: Package,
  },
  {
    id: "gift-baskets",
    name: "Gift Baskets",
    description: "Thoughtfully arranged basket collections",
    icon: ShoppingBasket,
  },
  {
    id: "gift-trunks",
    name: "Gift Trunks",
    description: "Premium trunk presentations",
    icon: Archive,
  },
  {
    id: "souvenirs",
    name: "Souvenirs",
    description: "Unique cultural keepsakes",
    icon: Award,
  },
  {
    id: "gift-accessories",
    name: "Gift Accessories",
    description: "Ribbons, wraps, and finishing touches",
    icon: Sparkles,
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
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
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

        {/* Categories Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Link
                to={`/vendors?category=${category.id}`}
                className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-medium"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-gold shadow-md transition-transform duration-300 group-hover:scale-110">
                  <category.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
