import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { MarketingPageContent } from '../../data/marketingPages';
import { getMarketingCategoryLabel, marketingPagePath } from '../../data/marketingPages';
import './MarketingPageLayout.css';

interface MarketingPageLayoutProps {
  page: MarketingPageContent;
  children?: ReactNode;
}

export function MarketingPageLayout({ page, children }: MarketingPageLayoutProps) {
  const categoryLabel = getMarketingCategoryLabel(page.category);

  return (
    <article className="marketing-page">
      <section className="marketing-hero">
        <div className="container marketing-hero-inner">
          <nav className="marketing-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{categoryLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="marketing-breadcrumb-current">{page.title}</span>
          </nav>
          <p className="marketing-eyebrow">{page.eyebrow}</p>
          <h1 className="marketing-title">{page.title}</h1>
          <p className="marketing-tagline">{page.tagline}</p>
          <p className="marketing-intro">{page.intro}</p>
          <div className="marketing-hero-actions">
            <Link to="/signin" className="btn btn-primary">
              Sign in to Daros
            </Link>
            <a href="/#demo" className="btn btn-outline">
              Request demo
            </a>
          </div>
        </div>
      </section>

      {page.stats && page.stats.length > 0 ? (
        <section className="marketing-stats">
          <div className="container marketing-stats-grid">
            {page.stats.map((stat) => (
              <div key={stat.label} className="marketing-stat">
                <span className="marketing-stat-value">{stat.value}</span>
                <span className="marketing-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="marketing-features">
        <div className="container">
          <h2 className="marketing-section-title">What you get</h2>
          <div className="marketing-features-grid">
            {page.features.map((feature) => (
              <div key={feature.title} className="marketing-feature-card">
                <div className="marketing-feature-accent" aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-highlights">
        <div className="container marketing-highlights-inner">
          <div className="marketing-highlights-copy">
            <h2 className="marketing-section-title">Built for real compliance work</h2>
            <p>
              Every screen is designed around how quality, safety, and operations teams actually
              run ISO-aligned programmes—not generic project management.
            </p>
          </div>
          <ul className="marketing-highlight-list">
            {page.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {children}

      <section className="marketing-cta">
        <div className="container marketing-cta-inner">
          <div>
            <h2>Ready to explore {page.title} in Daros?</h2>
            <p>See how modules connect in a live walkthrough tailored to your standard and industry.</p>
          </div>
          <div className="marketing-cta-actions">
            <a href="/#contact" className="btn btn-primary">
              Contact sales
            </a>
            <Link to="/" className="btn btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <footer className="marketing-page-meta">
        <div className="container">
          <Link to={marketingPagePath(page.category, page.slug)} className="marketing-permalink">
            {page.title}
          </Link>
        </div>
      </footer>
    </article>
  );
}
