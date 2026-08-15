import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, Globe } from "lucide-react";

const stats = [
  { icon: Store, value: "500+", label: "Active Vendors" },
  { icon: Users, value: "10K+", label: "Happy Customers" },
  { icon: Globe, value: "4", label: "Countries" },
];

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-foreground py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />

      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
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
              className="mt-6 text-lg text-background/80"
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
                className="border-background/30 text-background hover:bg-background/10"
                asChild
              >
                <Link to="/pricing">View Pricing Plans</Link>
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-background/10 bg-background/5 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-heading text-3xl font-bold text-background">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-background/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
