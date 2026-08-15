import { motion } from "framer-motion";
import { ShieldCheck, Layers, Sparkles, Search, Lock } from "lucide-react";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Curated & Reviewed Vendors",
    description:
      "Every vendor is verified to ensure quality products and reliable service.",
  },
  {
    icon: Layers,
    title: "Wide Variety in One Place",
    description:
      "Gift boxes, hampers, baskets, trunks, souvenirs, and accessories — all in one marketplace.",
  },
  {
    icon: Sparkles,
    title: "Premium & Customizable",
    description:
      "From ready-made gifts to fully personalized options, find exactly what you need.",
  },
  {
    icon: Search,
    title: "Built for Discovery",
    description:
      "Browse by category, budget, or occasion to find the perfect gift quickly.",
  },
];

export function WhyGiftora() {
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
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
          >
            Why Giftora?
          </motion.h2>
        </div>

        {/* Trust Points Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <point.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2 text-center"
        >
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Secure payments and buyer protection features coming soon.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
