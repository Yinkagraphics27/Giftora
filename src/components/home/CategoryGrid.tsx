import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  image_url?: string | null;
}

/**
 * Card background palette — matches mockup pastels.
 */
const COLOR_CLASSES: Record<string, string> = {
  canvas: "bg-canvas-100",
  gold: "bg-gold-100",
  navy: "bg-navy-100",
  pink: "bg-rose-100",
  mint: "bg-emerald-100",
  peach: "bg-orange-100",
  lavender: "bg-purple-100",
  blue: "bg-sky-100",
  cream: "bg-[#F5EFE0]",
  "dark-green": "bg-emerald-700",
};

/**
 * 16 categories from the mockup. Order matches the grid layout:
 *
 * Row 1: Birthday | Gift Boxes | Hampers    | Flowers
 * Row 2: Perfumes | FREE GIFTS | Fashion
 * Row 3: Jewelry  | (FREE GIFTS)| Gadgets
 * Row 4: Home     | Baby & Kids| Corporate  | Souvenirs
 * Row 5: Personal | Gift Card  | Food       | Packaging
 */
const FALLBACK_CATEGORIES: Category[] = [
  { id: "birthday-gifts", name: "Birthday Gifts", icon: "🎂", color: "pink", sort_order: 1 },
  { id: "gift-boxes", name: "Gift Boxes", icon: "🎁", color: "mint", sort_order: 2 },
  { id: "hampers", name: "Hampers", icon: "🧺", color: "peach", sort_order: 3 },
  { id: "flowers", name: "Flowers", icon: "💐", color: "pink", sort_order: 4 },
  { id: "perfumes-beauty", name: "Perfumes & Beauty", icon: "💄", color: "pink", sort_order: 5 },
  // FREE GIFTS tile inserts here (position 6)
  { id: "fashion-gifts", name: "Fashion Gifts", icon: "👟", color: "peach", sort_order: 6 },
  { id: "jewelry-watches", name: "Jewelry & Watches", icon: "⌚", color: "dark-green", sort_order: 7 },
  { id: "gadgets-electronics", name: "Gadgets & Electronics", icon: "📱", color: "blue", sort_order: 8 },
  { id: "home-decor", name: "Home & Decor", icon: "🛋️", color: "peach", sort_order: 9 },
  { id: "baby-kids", name: "Baby & Kids", icon: "🧸", color: "lavender", sort_order: 10 },
  { id: "corporate-gifts", name: "Corporate Gifts", icon: "📓", color: "mint", sort_order: 11 },
  { id: "souvenirs", name: "Souvenirs", icon: "🗿", color: "cream", sort_order: 12 },
  { id: "personalized-gifts", name: "Personalized Gifts", icon: "☕", color: "mint", sort_order: 13 },
  { id: "gift-cards", name: "Gift Card", icon: "🎟️", color: "mint", sort_order: 14 },
  { id: "food-treats", name: "Food & Treats", icon: "🍫", color: "cream", sort_order: 15 },
  { id: "packaging", name: "Packaging", icon: "📦", color: "lavender", sort_order: 16 },
];

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, icon, color, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const reordered = FALLBACK_CATEGORIES.map((fb) => {
          const db = data.find((d: any) => d.id === fb.id);
          return {
            ...fb,
            name: db?.name ?? fb.name,
            icon: db?.icon ?? fb.icon,
            color: db?.color ?? fb.color,
          };
        });
        setCategories(reordered);
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto flex h-40 max-w-7xl items-center justify-center px-4">
        <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {categories.slice(0, 5).map((cat, index) => (
          <CategoryCard key={cat.id} category={cat} index={index} />
        ))}

        {/* FREE GIFTS tile — 2 rows tall */}
        <FreeGiftsTile />

        {categories.slice(5).map((cat, index) => (
          <CategoryCard key={cat.id} category={cat} index={index + 6} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CATEGORY CARD
   ============================================================ */
function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const bgClass = COLOR_CLASSES[category.color] ?? COLOR_CLASSES.canvas;
  const isDark = category.color === "dark-green";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
    >
      <Link
        to={`/browse?category=${category.id}`}
        className="group flex flex-col items-center gap-1.5"
      >
        <div
          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl ${bgClass} transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md`}
        >
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-[85%] w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
              {category.icon}
            </span>
          )}
        </div>
        <p
          className={`line-clamp-2 text-center text-[11px] font-bold leading-tight sm:text-xs ${
            isDark
              ? "text-navy-800 group-hover:text-gold-600"
              : "text-navy-800 group-hover:text-gold-600"
          }`}
        >
          {category.name}
        </p>
      </Link>
    </motion.div>
  );
}

/* ============================================================
   FREE GIFTS TILE — pixel-precise to mockup
   ============================================================ */
function FreeGiftsTile() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.3 }}
      className="row-span-2"
    >
      <Link
        to="/browse?sort=popular"
        className="group relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl p-3 text-center shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ backgroundColor: "#F5D547" }}
      >
        {/* TOP: Gift box + sparkles */}
        <div className="relative flex flex-1 items-center justify-center pt-2">
          <span className="pointer-events-none absolute left-1 top-3 select-none text-xl text-[#0B5B2D]/40">
            ✦
          </span>
          <span className="pointer-events-none absolute right-2 top-1 select-none text-2xl text-white">
            ✦
          </span>
          <span className="pointer-events-none absolute bottom-3 left-3 select-none text-lg text-white/80">
            ✦
          </span>
          <span className="pointer-events-none absolute bottom-4 right-3 select-none text-sm text-[#0B5B2D]/40">
            ✦
          </span>
          <span className="pointer-events-none absolute left-7 top-6 select-none text-xs text-white/90">
            ✦
          </span>

          <div className="relative z-10 flex h-[75%] w-[75%] items-center justify-center">
            <img
              src="/categories/free-gifts-box.png"
              alt="Free gifts"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const emoji = target.nextElementSibling as HTMLElement | null;
                if (emoji) emoji.style.display = "block";
              }}
            />
            <span
              className="hidden select-none text-[68px] leading-none drop-shadow-lg"
              role="img"
              aria-label="Gift box"
            >
              🎁
            </span>
          </div>
        </div>

        {/* MIDDLE: FREE GIFTS text */}
        <div className="relative z-10 -mt-2 space-y-0">
          <p
            className="font-heading text-[26px] font-black uppercase leading-[0.85] tracking-tighter sm:text-3xl"
            style={{ color: "#0B5B2D" }}
          >
            FREE
          </p>
          <p
            className="font-heading text-[26px] font-black uppercase leading-[0.85] tracking-tighter sm:text-3xl"
            style={{ color: "#0B5B2D" }}
          >
            GIFTS
          </p>
        </div>

        {/* BOTTOM: pill */}
        <div
          className="relative z-10 mb-1 mt-2 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-sm sm:text-[11px]"
          style={{ backgroundColor: "#0B5B2D" }}
        >
          Give. Get. Share.
        </div>
      </Link>
    </motion.div>
  );
}