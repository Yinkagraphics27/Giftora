import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

export const CATEGORIES = [
  { id: "gift-boxes", name: "Gift Boxes", icon: "🎁" },
  { id: "hampers", name: "Hampers", icon: "🧺" },
  { id: "corporate", name: "Corporate Gifts", icon: "💼" },
  { id: "souvenirs", name: "Souvenirs", icon: "🗺️" },
  { id: "custom", name: "Custom Gifts", icon: "✨" },
];

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  hasActiveFilters,
}: FilterSidebarProps) {
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

      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">
          Category
        </h3>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              selectedCategory === "all"
                ? "bg-gold-100 font-semibold text-gold-700 ring-1 ring-gold-300"
                : "text-navy-600 hover:bg-canvas-100"
            }`}
          >
            <span>All Gifts</span>
          </button>

          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-gold-100 font-semibold text-gold-700 ring-1 ring-gold-300"
                    : "text-navy-600 hover:bg-canvas-100"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
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

        {/* Quick price chips */}
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