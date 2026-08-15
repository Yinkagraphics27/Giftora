import { motion } from "framer-motion";
import { Search, MessageCircle, Gift, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description:
      "Explore curated gifts from verified vendors across categories, budgets, and occasions.",
  },
  {
    icon: MessageCircle,
    title: "Connect via WhatsApp",
    description:
      "Reach vendors directly on WhatsApp to discuss details, customization, and pricing.",
  },
  {
    icon: Gift,
    title: "Order & Receive",
    description:
      "Place your order with the vendor and receive your beautifully packaged gift.",
  },
  {
    icon: CheckCircle,
    title: "Share the Joy",
    description:
      "Delight your loved ones with a premium gift selected just for them.",
  },
];

export function HowItWorks() {
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
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
          >
            How Giftora Works
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-primary/10 lg:block" />
              )}

              {/* Step number */}
              <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-gold shadow-medium">
                <step.icon className="h-8 w-8 text-primary-foreground" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-heading text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
