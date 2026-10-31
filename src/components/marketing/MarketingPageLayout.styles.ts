import styled from 'styled-components';

export const MarketingBreadcrumb = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 20px;

  & a:hover {
    color: var(--color-primary-dark);
  }
`;

export const MarketingBreadcrumbCurrent = styled.div`
  color: var(--color-dark);
  font-weight: 600;
`;

export const MarketingCta = styled.div`
  padding: 64px 0;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fff 100%);
  border-top: 1px solid var(--color-border);
`;

export const MarketingCtaActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const MarketingCtaInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  & h2 {
    font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  }

  & p {
    color: var(--color-text-muted);
  max-width: 480px;
  }
`;

export const MarketingEyebrow = styled.div`
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-dark);
  margin-bottom: 12px;
`;

export const MarketingFeatureAccent = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-primary), #5dd4f9);
  margin-bottom: 16px;
`;

export const MarketingFeatureCard = styled.div`
  position: relative;
  padding: 28px 24px 24px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  box-shadow: var(--shadow-md);
  transform: translateY(-2px);

  & h3 {
    font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 10px;
  }

  & p {
    font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.65;
  }
`;

export const MarketingFeatures = styled.div`
  padding: 72px 0;
  background: var(--color-bg);
  @media (max-width: 900px) {
    &-grid {
      grid-template-columns: 1fr;
    }
  }

`;

export const MarketingFeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const MarketingHero = styled.div`
  padding: 48px 0 72px;
  background: linear-gradient(145deg, #f0f9ff 0%, #e8f4fc 35%, #f7f9fc 100%);
  position: relative;
  overflow: hidden;

  content: '';
  position: absolute;
  width: 520px;
  height: 520px;
  right: -120px;
  top: -180px;
  background: radial-gradient(circle, rgba(41, 181, 232, 0.12) 0%, transparent 68%);
  pointer-events: none;
`;

export const MarketingHeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const MarketingHeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 820px;
`;

export const MarketingHighlightList = styled.div`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;

  & li {
    position: relative;
  padding-left: 28px;
  font-size: 15px;
  line-height: 1.55;
  color: #d1d9e6;
  }

  & li::before {
    content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(41, 181, 232, 0.2);
  }
`;

export const MarketingHighlights = styled.div`
  padding: 72px 0;
  background: var(--color-bg-dark);
  color: #e8ecf1;
`;

export const MarketingHighlightsCopy = styled.div`
  & .marketing-section-title {
    color: #fff;
  margin-bottom: 16px;
  }

  & p {
    color: #a8b2c1;
  line-height: 1.7;
  font-size: 1rem;
  }
`;

export const MarketingHighlightsInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
  @media (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
    gap: 32px;
    }
  }

`;

export const MarketingIntro = styled.div`
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 640px;
`;

export const MarketingPage = styled.div`
  padding-top: var(--nav-height);
`;

export const MarketingPageMeta = styled.div`
  padding: 16px 0 32px;
  border-top: 1px solid var(--color-border);
`;

export const MarketingPermalink = styled.div`
  font-size: 12px;
  color: var(--color-text-light);
`;

export const MarketingSectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
  letter-spacing: -0.02em;
  margin-bottom: 32px;
`;

export const MarketingStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

export const MarketingStatLabel = styled.label`
  font-size: 14px;
  color: var(--color-text-muted);
`;

export const MarketingStatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  letter-spacing: -0.02em;
`;

export const MarketingStats = styled.div`
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
`;

export const MarketingStatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 32px 24px;
`;

export const MarketingTagline = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  line-height: 1.4;
`;

export const MarketingTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-dark);
  margin-bottom: 16px;
`;

