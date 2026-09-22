import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Occasion {
  id: string;
  name: string;
  icon: string;
  group_name: string;
}

const GROUP_LABELS: Record<string, string> = {
  seasonal: "Seasonal",
  "life-events": "Life Events",
  personal: "Personal",
  corporate: "Corporate",
  cultural: "Cultural",
  other: "Other",
};

const GROUP_ORDER = [
  "seasonal",
  "life-events",
  "personal",
  "corporate",
  "cultural",
  "other",
];

interface FilterSidebarProps {
  selectedOccasion: string;
  onOccasionChange: (occasionId: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function FilterSidebar({
  selectedOccasion,
  onOccasionChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  hasActiveFilters,
}: FilterSidebarProps) {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["seasonal", "life-events"])
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("occasions")
        .select("id, name, icon, group_name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setOccasions(data as Occasion[]);
    })();
  }, []);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-800">
          Filters
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1 px-2 text-xs text-gold-600 hover:bg-gold-100"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Selected occasion chip */}
      {selectedOccasion !== "all" && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gold-300 bg-gold-100/60 px-3 py-2">
          <span className="truncate text-sm font-medium text-gold-700">
            {occasions.find((o) => o.id === selectedOccasion)?.icon}{" "}
            {occasions.find((o) => o.id === selectedOccasion)?.name ??
              selectedOccasion}
          </span>
          <button
            type="button"
            onClick={() => onOccasionChange("all")}
            className="shrink-0 rounded-full p-0.5 hover:bg-gold-300/50"
            aria-label="Remove occasion filter"
          >
            <X className="h-3.5 w-3.5 text-gold-700" />
          </button>
        </div>
      )}

      {/* Occasion groups */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">
          Occasion
        </h3>

        <button
          type="button"
          onClick={() => onOccasionChange("all")}
          className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
            selectedOccasion === "all"
              ? "bg-gold-100 font-semibold text-gold-700 ring-1 ring-gold-300"
              : "text-navy-600 hover:bg-canvas-100"
          }`}
        >
          <span>All Occasions</span>
        </button>

        {GROUP_ORDER.map((group) => {
          const items = occasions.filter((o) => o.group_name === group);
          if (items.length === 0) return null;

          const expanded = expandedGroups.has(group);
          const hasSelected = items.some((i) => i.id === selectedOccasion);

          return (
            <div key={group} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  hasSelected
                    ? "text-gold-700"
                    : "text-navy-700 hover:bg-canvas-100"
                }`}
              >
                <span>{GROUP_LABELS[group]}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expanded && (
                <div className="ml-2 space-y-0.5 border-l border-canvas-200 pl-2">
                  {items.map((occ) => {
                    const active = selectedOccasion === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => onOccasionChange(occ.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-gold-100 font-semibold text-gold-700"
                            : "text-navy-600 hover:bg-canvas-100"
                        }`}
                      >
                        <span className="text-base">{occ.icon}</span>
                        <span className="truncate">{occ.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Separator className="bg-canvas-200" />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">
          Price Range (₦)
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="min-price"
              type="number"
              inputMode="numeric"
              placeholder="0"
              min="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="h-9 rounded-lg border-canvas-200 text-sm"
            />
          </div>
          <span className="mt-4 text-muted-foreground">—</span>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="max-price"
              type="number"
              inputMode="numeric"
              placeholder="Any"
              min="0"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="h-9 rounded-lg border-canvas-200 text-sm"
            />
          </div>
        </div>

        {/* Quick chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: "Under ₦10k", min: "", max: "10000" },
            { label: "₦10k–₦50k", min: "10000", max: "50000" },
            { label: "₦50k–₦200k", min: "50000", max: "200000" },
            { label: "Over ₦200k", min: "200000", max: "" },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                onMinPriceChange(chip.min);
                onMaxPriceChange(chip.max);
              }}
              className="rounded-full border border-canvas-200 bg-white px-3 py-1 text-xs font-medium text-navy-600 transition-colors hover:border-gold-400 hover:bg-gold-100/50 hover:text-gold-700"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}