import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./StarRating";
import { ProductRating } from "./ProductRating";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

interface ReviewsListProps {
  productId: string;
}

export function ReviewsList({ productId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setReviews([]);
      } else {
        setReviews((data ?? []) as unknown as Review[]);
      }
      setIsLoading(false);
    })();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-canvas-200 bg-canvas-100/50 py-12 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-navy-300" />
        <p className="mt-3 font-heading text-base font-semibold text-navy-800">
          No reviews yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Be the first to review this product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-canvas-200 bg-canvas-100/50">
        <CardContent className="flex items-center gap-6 p-5">
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-navy-800">
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={avgRating} size="sm" />
            <p className="mt-1 text-xs text-muted-foreground">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>

          <Separator orientation="vertical" className="h-20 bg-canvas-200" />

          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-xs font-medium text-navy-800">
                    {star}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas-200">
                    <div
                      className="h-full bg-gold-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-canvas-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-gold-500">
                    {(review.profiles?.full_name?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">
                      {review.profiles?.full_name ?? "Verified Buyer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>

              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  {review.comment}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}