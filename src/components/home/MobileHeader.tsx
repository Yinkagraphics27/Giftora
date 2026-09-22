import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Gift,
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Browse Gifts", path: "/browse" },
  { name: "Categories", path: "/categories" },
  { name: "Find Vendors", path: "/vendors" },
];

export function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/browse?search=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-800">
      {/* ============ DESKTOP LAYOUT (md+) ============ */}
      <div className="hidden md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 shadow-sm">
              <Gift className="h-5 w-5 text-navy-900" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold leading-none text-canvas-50">
                Giftora
              </p>
              <p className="mt-0.5 text-[10px] leading-none text-gold-400">
                Gifts for Every Moment
              </p>
            </div>
          </Link>

          {/* Location */}
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border border-navy-600 bg-navy-700/70 px-3 py-1.5 text-xs text-canvas-50 transition-colors hover:bg-navy-600 lg:flex"
          >
            <MapPin className="h-3 w-3 text-gold-400" />
            <span>Lagos</span>
            <ChevronDown className="h-3 w-3 text-canvas-200/70" />
          </button>

          {/* Search (expanded on desktop) */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for gifts, categories, or sellers..."
                className="h-10 w-full rounded-full border-0 bg-canvas-50 pl-9 pr-4 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-gold-400"
                    : "text-canvas-100/90 hover:bg-navy-700 hover:text-canvas-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy-600 bg-navy-700/70 backdrop-blur-sm transition-colors hover:bg-navy-600"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-4 w-4 text-canvas-50" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-navy-900 shadow-sm">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-navy-600 bg-navy-700/70 px-3 text-xs font-medium text-canvas-50 transition-colors hover:bg-navy-600"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-navy-900">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <span className="hidden xl:inline">Account</span>
          </Link>
        </div>
      </div>

      {/* ============ MOBILE LAYOUT (< md) ============ */}
      <div className="md:hidden">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500 shadow-sm">
              <Gift className="h-5 w-5 text-navy-900" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold leading-none text-canvas-50">
                Giftora
              </p>
              <p className="mt-0.5 text-[10px] leading-none text-gold-400">
                Gifts for Every Moment
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex max-w-[100px] items-center gap-1 rounded-full border border-navy-600 bg-navy-700/70 px-2.5 py-1.5 text-xs text-canvas-50 backdrop-blur-sm"
            >
              <MapPin className="h-3 w-3 shrink-0 text-gold-400" />
              <span className="truncate">Lagos</span>
              <ChevronDown className="h-3 w-3 shrink-0 text-canvas-200/70" />
            </button>

            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-navy-600 bg-navy-700/70 backdrop-blur-sm"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBag className="h-4 w-4 text-canvas-50" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-navy-900 shadow-sm">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for gifts, categories, or sellers..."
              className="h-10 w-full rounded-full border-0 bg-canvas-50 pl-9 pr-4 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
        </form>
      </div>
    </header>
  );
}