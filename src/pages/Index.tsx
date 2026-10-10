import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { QuickLinks } from "@/components/home/QuickLinks";

const Index = () => {
  return (
    <MobileShell>
      <MobileHeader />

      <main className="pb-24 md:pb-8">
        <CategoryGrid />

        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <PromoBanner />
          <QuickLinks />
        </div>

        <div className="h-8" />
      </main>

      <MobileBottomNav />
    </MobileShell>
  );
};

export default Index;