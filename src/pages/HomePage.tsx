import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { ShowcaseSection } from '../components/home/ShowcaseSection';
import {
  StandardsSection,
  MissionSection,
  ValuesSection,
  CTASection,
} from '../components/home/HomeSections';

export function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <FeaturesSection />
        <ShowcaseSection />
        <StandardsSection />
        <MissionSection />
        <ValuesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
