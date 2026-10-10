import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="pt-6">
      <Link
        to="/browse"
        className="group relative block overflow-hidden rounded-2xl bg-navy-800 shadow-lg"
      >
        {/* Gold glow */}
        <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gold-500/20 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-stretch">
          {/* Left: Text */}
          <div className="flex-1 p-5 sm:p-6">
            <p className="font-heading text-2xl font-bold leading-tight text-canvas-50 sm:text-3xl">
              Find a Gift.
            </p>
            <p className="font-heading text-2xl font-bold leading-tight text-gold-500 sm:text-3xl">
              Give a Gift.
            </p>
            <p className="mt-2 max-w-[240px] text-sm leading-snug text-canvas-100/80">
              Thoughtful gifts for your loved ones, clients and friends.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-navy-900 shadow-sm transition-all group-hover:bg-gold-400 group-hover:shadow-md"
            >
              Explore Gifts
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Gift scene */}
          <div className="relative flex min-h-[140px] flex-1 items-center justify-center sm:min-h-[160px]">
            <div className="text-7xl sm:text-8xl">🎁</div>
            <div className="absolute bottom-4 left-4 text-5xl sm:text-6xl">🧸</div>
            <div className="absolute right-6 top-4 text-4xl sm:text-5xl">💐</div>
            <div className="absolute bottom-6 right-10 text-3xl sm:text-4xl">🎀</div>
          </div>
        </div>
      </Link>
    </section>
  );
}