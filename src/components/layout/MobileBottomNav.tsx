import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, MessageCircle, User } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  icon: any;
  matchExact?: boolean;
}

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home, matchExact: true },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (tab: Tab) => {
    if (tab.matchExact) return location.pathname === tab.to;
    return location.pathname.startsWith(tab.to);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-canvas-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 w-full items-center justify-around">
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
              aria-label={tab.label}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active
                    ? "text-gold-600"
                    : "text-navy-500 group-hover:text-navy-800"
                }`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active
                    ? "text-gold-600"
                    : "text-navy-500 group-hover:text-navy-800"
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}