import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  vendorId: string;
  orderId: string;
  onSubmitted: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  vendorId,
  orderId,
  onSubmitted,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId,
        vendor_id: vendorId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("Review submitted — thank you!");
      onSubmitted();
    } catch (err: any) {
      console.error(err);
      if (err?.code === "23505") {
        toast.error("You already reviewed this product for this order");
      } else {
        toast.error(err?.message ?? "Could not submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-gold-500/40 bg-gold-100/30">
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-heading text-base font-bold text-navy-800">
            Write a Review
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Share your experience to help other buyers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Your rating *</Label>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onChange={setRating}
            />
          </div>

          <div>
            <Label htmlFor="review-comment">Your review (optional)</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? How was the quality and delivery?"
              rows={4}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="gold"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}