import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyGiftora } from "@/components/home/WhyGiftora";
import { B2BSection } from "@/components/home/B2BSection";
import { CTA } from "@/components/home/CTA";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedVendors />
        <FeaturedCollections />
        <HowItWorks />
        <WhyGiftora />
        <B2BSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;