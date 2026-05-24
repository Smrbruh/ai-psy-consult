import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoTicker } from "@/components/sections/LogoTicker";
import { SecurityStrip } from "@/components/sections/SecurityStrip";
import { StatsSection } from "@/components/sections/StatsSection";
import { TestimonialSection } from "@/components/sections/TestimonialSection";
import { B2BComplexitySection } from "@/components/sections/B2BComplexitySection";
import { BrainfishDifferenceSection } from "@/components/sections/BrainfishDifferenceSection";
import { EnterpriseSection } from "@/components/sections/EnterpriseSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoTicker />
        <SecurityStrip />
        <StatsSection />
        <TestimonialSection />
        <B2BComplexitySection />
        <BrainfishDifferenceSection />
        <EnterpriseSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
