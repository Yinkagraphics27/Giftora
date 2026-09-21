import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800 lg:text-3xl">
          All Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and monitor all orders across the marketplace.
        </p>
      </div>
      <Card className="border-dashed border-canvas-300 bg-white">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-100">
            <ShoppingCart className="h-6 w-6 text-navy-400" />
          </div>
          <p className="font-heading text-lg font-semibold text-navy-800">
            Coming in Session 2
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Read-only order list with filters, search, and status badges.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}