import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  return (
    <MobileShell>
      <MobileHeader />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas-100">
          <Heart className="h-8 w-8 text-navy-400" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-bold text-navy-800">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your favorite gifts here. Coming soon.
        </p>
        <Button variant="gold" className="mt-6" asChild>
          <Link to="/browse">Browse Gifts</Link>
        </Button>
      </main>
      <MobileBottomNav />
    </MobileShell>
  );
};

export default Wishlist;