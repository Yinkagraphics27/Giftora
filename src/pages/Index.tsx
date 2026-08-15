import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { WhyGiftora } from "@/components/home/WhyGiftora";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { CTA } from "@/components/home/CTA";
import { B2BSection } from "@/components/home/B2BSection";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedCollections />
        <WhyGiftora />
        <FeaturedVendors />
        <CTA />
        <B2BSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
