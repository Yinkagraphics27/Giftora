import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Occasion {
  id: string;
  name: string;
  icon: string;
  group_name: string;
  color: "canvas" | "gold" | "navy";
  sort_order: number;
}

const GROUP_META: Record<
  string,
  { title: string; subtitle: string; emoji: string }
> = {
  seasonal: {
    title: "Seasonal & Religious",
    subtitle: "Celebrations that return every year",
    emoji: "🎄",
  },
  "life-events": {
    title: "Life Events",
    subtitle: "Milestones worth celebrating",
    emoji: "💍",
  },
  personal: {
    title: "Personal Occasions",
    subtitle: "Small gestures, big meaning",
    emoji: "🎂",
  },
  corporate: {
    title: "Corporate & Professional",
    subtitle: "Gifts for clients, teams & partners",
    emoji: "💼",
  },
  cultural: {
    title: "Cultural Celebrations",
    subtitle: "Honour traditions with meaningful gifts",
    emoji: "🌍",
  },
  other: {
    title: "More Ways to Gift",
    subtitle: "Unique finds for every reason",
    emoji: "🏷️",
  },
};

const GROUP_ORDER = [
  "seasonal",
  "life-events",
  "personal",
  "corporate",
  "cultural",
  "other",
];

const COLOR_CLASSES: Record<Occasion["color"], string> = {
  canvas: "bg-canvas-100 ring-1 ring-canvas-200",
  gold: "bg-gold-100 ring-1 ring-gold-300",
  navy: "bg-navy-700/10 ring-1 ring-navy-800/10",
};

type FilterGroup = "all" | string;

const Occasions = () => {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterGroup>("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("occasions")
        .select("id, name, icon, group_name, color, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setOccasions(data as Occasion[]);
      }
      setIsLoading(false);
    })();
  }, []);

  const visibleGroups =
    filter === "all" ? GROUP_ORDER : GROUP_ORDER.filter((g) => g === filter);

  return (
    <MobileShell>
      <MobileHeader />

      <main className="pb-24 md:pb-8">
        {/* Hero */}
        <section className="border-b border-canvas-200 bg-navy-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <h1 className="font-heading text-2xl font-bold text-canvas-50 sm:text-3xl md:text-4xl">
              Every Occasion, Every Gift
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-canvas-100/80">
              Browse gifting ideas by the moment you're celebrating.
            </p>
          </div>
        </section>

        {/* Filter chips */}
        <section className="sticky top-[112px] z-30 border-b border-canvas-200 bg-canvas-50/95 backdrop-blur md:top-[64px]">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6">
            <div className="flex gap-2">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label="All"
                emoji="✨"
              />
              {GROUP_ORDER.map((g) => (
                <FilterChip
                  key={g}
                  active={filter === g}
                  onClick={() => setFilter(g)}
                  label={GROUP_META[g].title.split(" & ")[0]}
                  emoji={GROUP_META[g].emoji}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Groups */}
        <div className="mx-auto max-w-7xl space-y-10 px-4 pt-6 sm:px-6 sm:pt-8">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
            </div>
          ) : (
            visibleGroups.map((group) => {
              const items = occasions.filter((o) => o.group_name === group);
              if (items.length === 0) return null;
              const meta = GROUP_META[group];

              return (
                <section key={group}>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.emoji}</span>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-navy-800 sm:text-xl">
                          {meta.title}
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {meta.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? "occasion" : "occasions"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
                    {items.map((occ, index) => (
                      <motion.div
                        key={occ.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      >
                        <Link
                          to={`/occasions/${occ.id}`}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <div
                            className={`flex aspect-square w-full items-center justify-center rounded-2xl text-2xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md sm:text-3xl ${COLOR_CLASSES[occ.color]}`}
                          >
                            <span>{occ.icon}</span>
                          </div>
                          <p className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-navy-700 group-hover:text-gold-600 sm:text-xs">
                            {occ.name}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="h-8" />
      </main>

      <MobileBottomNav />
    </MobileShell>
  );
};

function FilterChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "bg-gold-500 text-navy-900 shadow-sm"
          : "border border-canvas-200 bg-white text-navy-600 hover:border-gold-300 hover:bg-gold-100/40"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

export default Occasions;