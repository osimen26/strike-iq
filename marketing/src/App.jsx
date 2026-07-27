import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import HowItWorksSection from './components/HowItWorksSection';
import AcademySection from './components/AcademySection';
import ClientSection from './components/ClientSection';
import RecordsSection from './components/RecordsSection';
import PricingSection from './components/PricingSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
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

export default App;
