import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight, Shield } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started on Giftora",
    icon: Sparkles,
    features: [
      "Upload up to 10 products",
      "Basic visibility in search",
      "Vendor profile page",
      "Access to Vendor Deals marketplace",
      "No expiry — always free",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth Boost",
    price: "Launch Incentive",
    period: "",
    description: "Accelerate your visibility during launch",
    icon: Zap,
    features: [
      "Upload up to 50 products",
      "14 days premium visibility",
      '"Launch Partner" badge',
      "Enhanced placement in search results",
      "Access to Vendor Deals marketplace",
    ],
    cta: "Claim Offer",
    popular: true,
    badge: "Launch Incentive",
  },
  {
    id: "power",
    name: "Power Vendor",
    price: "Best Value",
    period: "",
    description: "Maximum exposure for serious vendors",
    icon: Crown,
    features: [
      "Upload up to 100 products",
      "30 days premium placement",
      "Homepage feature (rotational)",
      "Priority approval for new listings",
      "Access to Vendor Deals marketplace",
    ],
    cta: "Claim Offer",
    popular: false,
    badge: "Launch Incentive",
  },
];

const steps = [
  {
    number: "1",
    title: "Create a vendor account",
    description: "Complete your profile with business details",
  },
  {
    number: "2",
    title: "Upload your products",
    description: "Gift boxes, hampers, baskets, trunks, souvenirs, or accessories",
  },
  {
    number: "3",
    title: "Get discovered",
    description: "Buyers browsing Giftora will find your products",
  },
  {
    number: "4",
    title: "Upgrade for more visibility",
    description: "Get premium placement and grow your brand",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Sell on <span className="text-gradient-gold">Giftora</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Join a premium marketplace for quality gift vendors.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium md:p-8 ${
                    plan.popular
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        plan.popular ? "bg-gradient-gold" : "bg-primary/10"
                      }`}
                    >
                      <plan.icon
                        className={`h-6 w-6 ${
                          plan.popular ? "text-primary-foreground" : "text-primary"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "gold" : "outline"}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link to="/register">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Quality Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-2 text-center"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                All listings are reviewed to maintain quality on Giftora.
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="text-sm font-medium uppercase tracking-wider text-primary">
                Simple Process
              </span>
              <h2 className="mt-2 font-heading text-2xl font-bold text-foreground md:text-3xl">
                How Selling on Giftora Works
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center"
                >
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-primary/10 lg:block" />
                  )}

                  <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold shadow-medium">
                    <span className="font-heading text-2xl font-bold text-primary-foreground">
                      {step.number}
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

            {/* Coming Soon Note */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center text-sm text-muted-foreground"
            >
              Advanced payment protection features coming soon.
            </motion.p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Ready to Start Selling?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join Giftora today and connect with customers actively looking for 
                premium gifts.
              </p>
              <Button variant="gold" size="xl" className="mt-8" asChild>
                <Link to="/register">
                  Become a Vendor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
