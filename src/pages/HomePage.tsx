import { PublicSiteLayout } from '../components/layout/PublicSiteLayout';
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
    <PublicSiteLayout>
      <Hero />
      <TrustBar />
      <FeaturesSection />
      <ShowcaseSection />
      <StandardsSection />
      <MissionSection />
      <ValuesSection />
      <CTASection />
    </PublicSiteLayout>
  );
}