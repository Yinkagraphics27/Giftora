import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Link } from "react-router-dom";
import { Flame, MapPin, Store, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <MobileShell>
      <MobileHeader />

      <main className="pb-24 md:pb-8">
        <CategoryGrid />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PromoBanner />

          <section className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
            <QuickLink
              to="/browse?sort=popular"
              icon={Flame}
              label="Trending Gifts"
              subtitle="What everyone is loving right now"
              tone="gold"
            />
            <QuickLink
              to="/browse?sort=newest"
              icon={MapPin}
              label="Popular Near You"
              subtitle="Great gifts from sellers in your area"
              tone="navy"
            />
            <QuickLink
              to="/signup"
              icon={Store}
              label="Become a Seller"
              subtitle="Turn your gifts into income"
              tone="canvas"
            />
          </section>
        </div>

        <div className="h-8" />
      </main>

      <MobileBottomNav />
    </MobileShell>
  );
};

function QuickLink({
  to,
  icon: Icon,
  label,
  subtitle,
  tone,
}: {
  to: string;
  icon: any;
  label: string;
  subtitle: string;
  tone: "gold" | "navy" | "canvas";
}) {
  const iconBg =
    tone === "gold"
      ? "bg-gold-100 text-gold-600"
      : tone === "navy"
      ? "bg-navy-700/15 text-navy-800"
      : "bg-canvas-100 text-navy-700";

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-canvas-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-navy-800">{label}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600" />
    </Link>
  );
}

export default Index;