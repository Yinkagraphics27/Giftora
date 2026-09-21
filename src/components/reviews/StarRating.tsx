import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass = SIZE_MAP[size];

  return (
    <div
      className={`flex items-center gap-0.5 ${interactive ? "cursor-pointer" : ""}`}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`Rating: ${rating} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive ? () => onChange?.(starValue) : undefined}
            className={`transition-transform ${
              interactive ? "hover:scale-110 active:scale-95" : "cursor-default"
            }`}
            aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={`${sizeClass} ${
                filled
                  ? "fill-gold-500 text-gold-500"
                  : "fill-none text-canvas-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}