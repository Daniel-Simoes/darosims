import {
  MarketingBreadcrumb,
  MarketingBreadcrumbCurrent,
  MarketingCta,
  MarketingCtaActions,
  MarketingEyebrow,
  MarketingFeatureAccent,
  MarketingFeatures,
  MarketingFeaturesGrid,
  MarketingHero,
  MarketingHeroActions,
  MarketingHighlightList,
  MarketingHighlights,
  MarketingHighlightsCopy,
  MarketingIntro,
  MarketingPage,
  MarketingPageMeta,
  MarketingSectionTitle,
  MarketingStatLabel,
  MarketingStatValue,
  MarketingStats,
  MarketingTagline,
  MarketingTitle,
} from './MarketingPageLayout.styles';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { MarketingPageContent } from '../../data/marketingPages';
import { getMarketingCategoryLabel, marketingPagePath } from '../../data/marketingPages';

interface MarketingPageLayoutProps {
  page: MarketingPageContent;
  children?: ReactNode;
}

export function MarketingPageLayout({ page, children }: MarketingPageLayoutProps) {
  const categoryLabel = getMarketingCategoryLabel(page.category);

  return (
    <MarketingPage>
      <MarketingHero>
        <div className="container marketing-hero-inner">
          <MarketingBreadcrumb aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{categoryLabel}</span>
            <span aria-hidden="true">/</span>
            <MarketingBreadcrumbCurrent>{page.title}</MarketingBreadcrumbCurrent>
          </MarketingBreadcrumb>
          <MarketingEyebrow>{page.eyebrow}</MarketingEyebrow>
          <MarketingTitle>{page.title}</MarketingTitle>
          <MarketingTagline>{page.tagline}</MarketingTagline>
          <MarketingIntro>{page.intro}</MarketingIntro>
          <MarketingHeroActions>
            <Link to="/signin" className="btn btn-primary">
              Sign in to Daros
            </Link>
            <a href="/#demo" className="btn btn-outline">
              Request demo
            </a>
          </MarketingHeroActions>
        </div>
      </MarketingHero>

      {page.stats && page.stats.length > 0 ? (
        <MarketingStats>
          <div className="container marketing-stats-grid">
            {page.stats.map((stat) => (
              <div key={stat.label} className="marketing-stat">
                <MarketingStatValue>{stat.value}</MarketingStatValue>
                <MarketingStatLabel>{stat.label}</MarketingStatLabel>
              </div>
            ))}
          </div>
        </MarketingStats>
      ) : null}

      <MarketingFeatures>
        <div className="container">
          <MarketingSectionTitle>What you get</MarketingSectionTitle>
          <MarketingFeaturesGrid>
            {page.features.map((feature) => (
              <div key={feature.title} className="marketing-feature-card">
                <MarketingFeatureAccent aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </MarketingFeaturesGrid>
        </div>
      </MarketingFeatures>

      <MarketingHighlights>
        <div className="container marketing-highlights-inner">
          <MarketingHighlightsCopy>
            <MarketingSectionTitle>Built for real compliance work</MarketingSectionTitle>
            <p>
              Every screen is designed around how quality, safety, and operations teams actually
              run ISO-aligned programmes—not generic project management.
            </p>
          </MarketingHighlightsCopy>
          <MarketingHighlightList>
            {page.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </MarketingHighlightList>
        </div>
      </MarketingHighlights>

      {children}

      <MarketingCta>
        <div className="container marketing-cta-inner">
          <div>
            <h2>Ready to explore {page.title} in Daros?</h2>
            <p>See how modules connect in a live walkthrough tailored to your standard and industry.</p>
          </div>
          <MarketingCtaActions>
            <a href="/#contact" className="btn btn-primary">
              Contact sales
            </a>
            <Link to="/" className="btn btn-ghost">
              Back to home
            </Link>
          </MarketingCtaActions>
        </div>
      </MarketingCta>

      <MarketingPageMeta>
        <div className="container">
          <Link to={marketingPagePath(page.category, page.slug)} className="marketing-permalink">
            {page.title}
          </Link>
        </div>
      </MarketingPageMeta>
    </MarketingPage>
  );
}
