import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
  Loader2,
  Shield,
  Gift,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/vendors", label: "Vendors", icon: Store },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: Tag },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const { isAdmin, isLoading } = useAdminRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-50">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-canvas-50">
      {/* ---------- SIDEBAR (desktop) ---------- */}
      <aside className="hidden w-64 shrink-0 border-r border-canvas-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-canvas-200 p-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 ring-1 ring-gold-500/40">
              <Gift className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="font-heading text-base font-bold leading-tight text-navy-800">
                Giftora
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-100 text-gold-700 ring-1 ring-gold-300"
                    : "text-navy-600 hover:bg-canvas-100 hover:text-navy-800"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-canvas-200 p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-canvas-100 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-gold-500">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-navy-800">
                {user?.email}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gold-600">
                Admin
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-navy-600 hover:bg-canvas-100 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-canvas-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:h-16 lg:px-6">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-canvas-200 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-800 ring-1 ring-gold-500/40">
                <Gift className="h-3.5 w-3.5 text-gold-500" />
              </div>
              <span className="font-heading text-sm font-bold text-navy-800">
                Giftora
              </span>
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              <Shield className="h-4 w-4 text-gold-500" />
              <span className="font-heading text-sm font-semibold text-navy-800">
                Admin Console
              </span>
              <Badge
                variant="outline"
                className="ml-2 rounded-full border-gold-300 bg-gold-100 text-[10px] font-semibold uppercase tracking-wider text-gold-700"
              >
                Restricted
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/">View Site →</Link>
              </Button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-canvas-200 bg-white lg:hidden"
            >
              <nav className="space-y-1 p-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gold-100 text-gold-700 ring-1 ring-gold-300"
                          : "text-navy-600 hover:bg-canvas-100"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <div className="border-t border-canvas-200 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}