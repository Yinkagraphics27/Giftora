import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "./CartItem";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l-canvas-200 bg-canvas-50 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-canvas-200 bg-navy-800 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-canvas-50">
            <ShoppingBag className="h-5 w-5 text-gold-500" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-gold-400">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas-100">
              <ShoppingBag className="h-7 w-7 text-navy-400" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-navy-800">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our curated gifts to get started.
              </p>
            </div>
            <Button
              variant="gold"
              className="mt-2"
              onClick={() => onOpenChange(false)}
              asChild
            >
              <Link to="/browse">
                Browse Gifts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y divide-canvas-200">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t border-canvas-200 bg-canvas-50 px-6 py-4">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-heading text-lg font-bold text-navy-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Separator className="bg-canvas-200" />
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  asChild
                >
                  <Link to="/cart">
                    View Cart & Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}