import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { CartButton } from "@/components/cart/CartButton";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Browse Gifts", path: "/browse" },
  { name: "Find Vendors", path: "/vendors" },
  { name: "Join as Vendor", path: "/signup" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-canvas-200 bg-canvas-50/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-50/80">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 shadow-soft ring-1 ring-gold-500/40">
            <Gift className="h-5 w-5 text-gold-500" />
          </div>
          <span className="font-heading text-2xl font-bold text-navy-800">
            Giftora
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                location.pathname === link.path
                  ? "text-gold-600"
                  : "text-navy-500"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/my-orders"
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                location.pathname === "/my-orders"
                  ? "text-gold-600"
                  : "text-navy-500"
              }`}
            >
              My Orders
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CartButton />
          <Button variant="gold" asChild>
            <Link to={user ? "/dashboard" : "/signup"}>
              {user ? "Dashboard" : "Start Selling"}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartButton />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-canvas-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-canvas-200 bg-canvas-50 md:hidden"
          >
            <nav className="container flex flex-col gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-gold-600 ${
                    location.pathname === link.path
                      ? "text-gold-600"
                      : "text-navy-500"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/my-orders"
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-gold-600 ${
                    location.pathname === "/my-orders"
                      ? "text-gold-600"
                      : "text-navy-500"
                  }`}
                >
                  My Orders
                </Link>
              )}
              <Button
                variant="gold"
                className="mt-2 w-full"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link to={user ? "/dashboard" : "/signup"}>
                  {user ? "Dashboard" : "Start Selling"}
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}