import NavBar from '@/components/landing/NavBar';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import AcademySection from '@/components/landing/AcademySection';
import ClientSection from '@/components/landing/ClientSection';
import RecordsSection from '@/components/landing/RecordsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import './marketing-index.css';
import './marketing-app.css';

export default function LandingPage() {
  return (
    <div className="App w-full min-h-screen bg-[#050B14]">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <AcademySection />
      <ClientSection />
      <RecordsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
