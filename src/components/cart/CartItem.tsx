import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="flex gap-4 py-4">
      <Link
        to={`/gifts/${product.id}`}
        className="shrink-0 overflow-hidden rounded-lg border border-canvas-200 bg-canvas-100"
      >
        <div className="flex h-20 w-20 items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl">🎁</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/gifts/${product.id}`}
            className="line-clamp-2 font-heading text-sm font-semibold text-navy-800 hover:text-gold-600 transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.vendor_name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-md border border-canvas-200 bg-canvas-50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-canvas-100"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums text-navy-800">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-canvas-100"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-heading text-sm font-bold text-navy-800">
              {formatPrice(lineTotal)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove(product.id)}
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}