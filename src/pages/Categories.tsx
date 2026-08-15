import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import giftBox from "@/assets/gift-box-1.jpg";
import hamper from "@/assets/hamper-1.jpg";
import corporate from "@/assets/corporate-gift-1.jpg";
import souvenir from "@/assets/souvenir-1.jpg";
import customGift from "@/assets/custom-gift-1.jpg";

const categories = [
  {
    id: "gift-boxes",
    name: "Gift Boxes",
    description:
      "Beautifully curated boxes filled with thoughtful items for birthdays, anniversaries, and celebrations. Each box is crafted with care to make any occasion special.",
    image: giftBox,
    vendorCount: 150,
    priceRange: "$25 - $500",
  },
  {
    id: "hampers",
    name: "Hampers",
    description:
      "Luxury hampers featuring gourmet foods, fine wines, and premium treats. Perfect for holidays, corporate gifting, and showing appreciation.",
    image: hamper,
    vendorCount: 89,
    priceRange: "$50 - $1,000",
  },
  {
    id: "corporate",
    name: "Corporate Gifts",
    description:
      "Professional gifts for clients, employees, and business partners. From branded merchandise to executive accessories, make a lasting impression.",
    image: corporate,
    vendorCount: 64,
    priceRange: "$30 - $800",
  },
  {
    id: "souvenirs",
    name: "Souvenirs",
    description:
      "Unique cultural keepsakes and collectibles from around the world. Authentic handcrafted items that tell a story and preserve memories.",
    image: souvenir,
    vendorCount: 112,
    priceRange: "$10 - $300",
  },
  {
    id: "customized",
    name: "Customized Gifts",
    description:
      "Personalized presents made just for you. Add names, photos, or special messages to create one-of-a-kind gifts that touch the heart.",
    image: customGift,
    vendorCount: 78,
    priceRange: "$20 - $400",
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
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-3xl font-bold text-foreground md:text-4xl"
            >
              Gift Categories
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 max-w-2xl text-muted-foreground"
            >
              Explore our curated categories to find the perfect gift for every
              occasion and recipient.
            </motion.p>
          </div>
        </section>

        {/* Categories List */}
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {categories.map((category, index) => (
                <motion.div key={category.id} variants={item}>
                  <Link
                    to={`/vendors?category=${category.id}`}
                    className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-medium md:flex-row ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-[16/10] w-full overflow-hidden md:aspect-auto md:w-2/5">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-10">
                      <div className="flex items-center gap-3">
                        <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                          {category.name}
                        </h2>
                        <ArrowRight className="h-6 w-6 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100" />
                      </div>

                      <p className="mt-4 text-muted-foreground">
                        {category.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-4">
                        <div className="rounded-full bg-primary/10 px-4 py-2">
                          <span className="text-sm font-medium text-primary">
                            {category.vendorCount}+ Vendors
                          </span>
                        </div>
                        <div className="rounded-full bg-secondary px-4 py-2">
                          <span className="text-sm font-medium text-secondary-foreground">
                            {category.priceRange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
