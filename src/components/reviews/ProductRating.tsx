import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  count: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function ProductRating({
  rating,
  count,
  size = "sm",
  showCount = true,
}: ProductRatingProps) {
  if (count === 0) return null;

  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < Math.round(rating)
                ? "fill-gold-500 text-gold-500"
                : "fill-none text-canvas-300"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-navy-800">
        {rating.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-xs text-muted-foreground">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}