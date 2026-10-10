import { Link } from "react-router-dom";
import { Flame, MapPin, Store, ArrowRight } from "lucide-react";

interface QuickLink {
  to: string;
  icon: any;
  label: string;
  subtitle: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  arrowColor: string;
}

const LINKS: QuickLink[] = [
  {
    to: "/browse?sort=popular",
    icon: Flame,
    label: "Trending Gifts",
    subtitle: "What everyone is loving right now",
    bg: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    arrowColor: "text-rose-400",
  },
  {
    to: "/browse?sort=newest",
    icon: MapPin,
    label: "Popular Near You",
    subtitle: "Great gifts from sellers in your area",
    bg: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    arrowColor: "text-emerald-400",
  },
  {
    to: "/signup",
    icon: Store,
    label: "Become a Seller",
    subtitle: "Turn your gifts into income",
    bg: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    arrowColor: "text-purple-400",
  },
];

export function QuickLinks() {
  return (
    <section className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`group flex items-center gap-3 rounded-2xl border ${link.bg} p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${link.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${link.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-800">{link.label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {link.subtitle}
              </p>
            </div>
            <ArrowRight
              className={`h-4 w-4 shrink-0 ${link.arrowColor} transition-transform group-hover:translate-x-0.5`}
            />
          </Link>
        );
      })}
    </section>
  );
}