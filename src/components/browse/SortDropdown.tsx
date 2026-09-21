import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "name-asc";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  popular: "Most Popular",
  "name-asc": "Name: A → Z",
};

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="h-10 w-[180px] rounded-full border-canvas-200 bg-white text-sm">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-3.5 w-3.5 text-gold-500" />
          <SelectValue placeholder="Sort by" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: Low → High</SelectItem>
        <SelectItem value="price-desc">Price: High → Low</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="name-asc">Name: A → Z</SelectItem>
      </SelectContent>
    </Select>
  );
}