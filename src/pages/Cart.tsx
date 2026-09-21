    import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/components/cart/CartItem";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

const Cart = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-navy-800 md:text-4xl">
                Shopping Cart
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length === 0
                  ? "Your cart is empty"
                  : `${items.length} ${
                      items.length === 1 ? "item" : "items"
                    } in your cart`}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="border-canvas-200 bg-white">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas-100">
                  <ShoppingBag className="h-9 w-9 text-navy-400" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-navy-800">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover premium gifts from verified vendors worldwide.
                  </p>
                </div>
                <Button variant="gold" size="lg" className="mt-4" asChild>
                  <Link to="/browse">
                    Browse Gifts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              <Card className="border-canvas-200 bg-white">
                <CardContent className="px-6 py-2">
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
                </CardContent>
              </Card>

              <div>
                <Card className="sticky top-24 border-canvas-200 bg-white">
                  <CardContent className="space-y-4 p-6">
                    <h2 className="font-heading text-lg font-bold text-navy-800">
                      Order Summary
                    </h2>
                    <Separator className="bg-canvas-200" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-navy-800">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-muted-foreground">
                          Calculated at checkout
                        </span>
                      </div>
                    </div>
                    <Separator className="bg-canvas-200" />
                    <div className="flex justify-between">
                      <span className="font-heading text-base font-bold text-navy-800">
                        Total
                      </span>
                      <span className="font-heading text-xl font-bold text-gold-600">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link to="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      asChild
                    >
                      <Link to="/browse">Continue shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;