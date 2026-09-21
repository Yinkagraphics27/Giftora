import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "./CartDrawer";

export function CartButton() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-lg hover:bg-canvas-100"
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${itemCount} items`}
      >
        <ShoppingBag className="h-5 w-5 text-navy-800" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-navy-900 shadow-sm">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}