import { Link } from "react-router-dom";
import { ArrowRight, Gift, Sparkles } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="grid gap-4 pt-6 md:grid-cols-2">
      {/* FREE GIFTS */}
      <Link
        to="/browse"
        className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 p-5 shadow-lg"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-navy-900/10" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-800 shadow-md">
            <Gift className="h-8 w-8 text-gold-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-navy-900/70">
              <Sparkles className="h-3 w-3" />
              Rewards
            </p>
            <p className="mt-0.5 font-heading text-2xl font-bold leading-none text-navy-900">
              FREE GIFTS
            </p>
            <p className="mt-1 text-xs font-medium text-navy-900/70">
              Give. Get. Share.
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-gold-500 shadow-sm transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* FIND A GIFT */}
      <Link
        to="/browse"
        className="group relative block overflow-hidden rounded-2xl bg-navy-800 shadow-lg"
      >
        <div className="pointer-events-none absolute -right-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-gold-500/20 blur-2xl" />

        <div className="relative flex items-stretch">
          <div className="flex-1 p-5">
            <p className="font-heading text-xl font-bold leading-tight text-canvas-50">
              Find a Gift.
            </p>
            <p className="font-heading text-xl font-bold leading-tight text-gold-500">
              Give a Gift.
            </p>
            <p className="mt-2 max-w-[180px] text-xs leading-snug text-canvas-100/80">
              Thoughtful gifts for your loved ones, clients and friends.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-bold text-navy-900 shadow-sm transition-all group-hover:bg-gold-400 group-hover:shadow-md"
            >
              Explore Gifts
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative flex w-[130px] items-center justify-center">
            <div className="text-6xl">🎁</div>
            <div className="absolute bottom-2 right-2 text-4xl">🧸</div>
            <div className="absolute top-2 right-6 text-3xl">💐</div>
          </div>
        </div>
      </Link>
    </section>
  );
}