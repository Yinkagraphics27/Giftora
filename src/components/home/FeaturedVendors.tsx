import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import giftBox from "@/assets/gift-box-1.jpg";
import hamper from "@/assets/hamper-1.jpg";
import corporate from "@/assets/corporate-gift-1.jpg";
import customGift from "@/assets/custom-gift-1.jpg";
import ChatWidget from "@/components/chat/ChatWidget";

// Demo vendors (in production, these would come from the public_vendor_profiles view)
const vendors = [
  {
    id: "demo-1",
    name: "Lagos Gift Co.",
    location: "Lagos, Nigeria",
    rating: 4.9,
    reviews: 127,
    priceRange: "₦15,000 - ₦150,000",
    image: giftBox,
    category: "Gift Boxes",
  },
  {
    id: "demo-2",
    name: "Dubai Luxury Hampers",
    location: "Dubai, UAE",
    rating: 4.8,
    reviews: 94,
    priceRange: "AED 200 - AED 2,000",
    image: hamper,
    category: "Hampers",
  },
  {
    id: "demo-3",
    name: "London Corporate Gifts",
    location: "London, UK",
    rating: 4.7,
    reviews: 156,
    priceRange: "£50 - £500",
    image: corporate,
    category: "Corporate Gifts",
  },
  {
    id: "demo-4",
    name: "Personalized NYC",
    location: "New York, US",
    rating: 4.9,
    reviews: 203,
    priceRange: "$30 - $300",
    image: customGift,
    category: "Customized",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturedVendors() {

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium uppercase tracking-wider text-primary"
            >
              Top Rated
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
            >
              Featured Vendors
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" asChild>
              <Link to="/vendors">
                Find All Vendors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Vendors Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {vendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              variants={item}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-medium"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {vendor.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {vendor.name}
                </h3>

                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {vendor.location}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {vendor.rating}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.reviews} reviews)
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-primary">
                  {vendor.priceRange}
                </p>

                <div className="mt-4">
                  <ChatWidget
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
