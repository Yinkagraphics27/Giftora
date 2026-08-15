import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cake, Building2, Heart, Crown, Palette } from "lucide-react";
import giftBox from "@/assets/gift-box-1.jpg";
import hamper from "@/assets/hamper-1.jpg";
import souvenir from "@/assets/souvenir-1.jpg";
import corporate from "@/assets/corporate-gift-1.jpg";
import customGift from "@/assets/custom-gift-1.jpg";

const collections = [
  {
    id: "birthday",
    name: "Birthday Gift Boxes",
    description: "Celebrate special moments with curated birthday surprises",
    image: giftBox,
    icon: Cake,
    itemCount: 85,
  },
  {
    id: "corporate",
    name: "Corporate & Luxury Hampers",
    description: "Impress clients and partners with premium business gifts",
    image: hamper,
    icon: Building2,
    itemCount: 64,
  },
  {
    id: "wedding",
    name: "Wedding & Event Souvenirs",
    description: "Memorable keepsakes for your special celebrations",
    image: souvenir,
    icon: Heart,
    itemCount: 112,
  },
  {
    id: "premium-trunks",
    name: "Premium Gift Trunks",
    description: "Luxury trunk presentations for grand gestures",
    image: corporate,
    icon: Crown,
    itemCount: 42,
  },
  {
    id: "custom-accessories",
    name: "Custom Gift Accessories",
    description: "Personalized finishing touches for any gift",
    image: customGift,
    icon: Palette,
    itemCount: 78,
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

export function FeaturedCollections() {
  const featuredCollection = collections[0];
  const FeaturedIcon = featuredCollection.icon;

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-primary"
          >
            Curated For You
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl"
          >
            Featured Collections
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Explore our handpicked collections for every occasion and recipient.
          </motion.p>
        </div>

        {/* Collections Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Featured large card */}
          <motion.div variants={item} className="group md:col-span-2 lg:col-span-1 lg:row-span-2">
            <Link
              to={`/vendors?collection=${featuredCollection.id}`}
              className="relative block h-full min-h-[300px] overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:shadow-medium lg:min-h-full"
            >
              <img
                src={featuredCollection.image}
                alt={featuredCollection.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/90">
                  <FeaturedIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="mb-2 inline-block rounded-full bg-background/20 px-3 py-1 text-xs font-medium text-cream backdrop-blur-sm">
                  {featuredCollection.itemCount}+ items
                </span>
                <h3 className="font-heading text-xl font-bold text-cream md:text-2xl">
                  {featuredCollection.name}
                </h3>
                <p className="mt-2 text-sm text-cream/80">
                  {featuredCollection.description}
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Other collections */}
          {collections.slice(1).map((collection) => {
            const CollectionIcon = collection.icon;
            return (
              <motion.div key={collection.id} variants={item} className="group">
                <Link
                  to={`/vendors?collection=${collection.id}`}
                  className="relative block aspect-[16/10] overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:shadow-medium"
                >
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90">
                      <CollectionIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="mb-1 inline-block rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium text-cream backdrop-blur-sm">
                      {collection.itemCount}+ items
                    </span>
                    <h3 className="font-heading text-lg font-bold text-cream">
                      {collection.name}
                    </h3>
                    <p className="mt-1 text-xs text-cream/80">
                      {collection.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
