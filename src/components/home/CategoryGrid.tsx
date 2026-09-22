import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Occasion {
  id: string;
  name: string;
  icon: string;
  group_name: string;
  color: "canvas" | "gold" | "navy";
  sort_order: number;
}

const GROUP_LABELS: Record<string, { title: string; subtitle: string }> = {
  seasonal: {
    title: "Seasonal & Religious",
    subtitle: "Celebrate the moments that come around every year",
  },
  "life-events": {
    title: "Life Events",
    subtitle: "Milestones worth marking with a gift",
  },
  personal: {
    title: "Personal Occasions",
    subtitle: "Small gestures, big meaning",
  },
  corporate: {
    title: "Corporate & Professional",
    subtitle: "Thoughtful gifts for clients, teams & partners",
  },
  cultural: {
    title: "Cultural Celebrations",
    subtitle: "Honour traditions with meaningful gifts",
  },
  other: {
    title: "More Ways to Gift",
    subtitle: "Unique finds for every reason",
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

// Fallback in case DB fetch fails
const FALLBACK: Occasion[] = [
  { id: "christmas", name: "Christmas", icon: "🎄", group_name: "seasonal", color: "gold", sort_order: 1 },
  { id: "new-year", name: "New Year", icon: "🎆", group_name: "seasonal", color: "navy", sort_order: 2 },
  { id: "valentines-day", name: "Valentine's Day", icon: "💝", group_name: "seasonal", color: "gold", sort_order: 3 },
  { id: "weddings", name: "Weddings", icon: "💍", group_name: "life-events", color: "gold", sort_order: 11 },
  { id: "birthdays", name: "Birthdays", icon: "🎂", group_name: "personal", color: "gold", sort_order: 19 },
  { id: "corporate-gifts", name: "Corporate Gifts", icon: "💼", group_name: "corporate", color: "navy", sort_order: 25 },
];

export function CategoryGrid() {
  const [occasions, setOccasions] = useState<Occasion[]>(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("occasions")
        .select("id, name, icon, group_name, color, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setOccasions(data as Occasion[]);
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

  // Group occasions
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: occasions.filter((o) => o.group_name === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6 sm:pt-8">
      {grouped.map((section, sectionIndex) => (
        <section key={section.group}>
          {/* Section heading */}
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-navy-800 sm:text-xl">
                {section.label.title}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {section.label.subtitle}
              </p>
            </div>
            <Link
              to={`/occasions?group=${section.group}`}
              className="shrink-0 text-xs font-medium text-gold-600 hover:text-gold-700 hover:underline sm:text-sm"
            >
              View all →
            </Link>
          </div>

          {/* Occasion grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
            {section.items.map((occ, index) => (
              <motion.div
                key={occ.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(sectionIndex * 0.1 + index * 0.02, 0.5),
                  duration: 0.3,
                }}
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
      ))}
    </div>
  );
}