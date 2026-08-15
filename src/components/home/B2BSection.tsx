import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Store, Package, Sparkles } from "lucide-react";

export function B2BSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-background p-6 sm:flex-row sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/5">
              <Store className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                For Gift Businesses
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground sm:text-base">
                Source gift boxes, packaging, accessories, souvenirs, and bulk
                gift items at special vendor-only trade rates.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Package className="h-3 w-3" />
                  Trade Pricing
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  Bulk Available
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/vendor/auth">Vendor Login</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
