import styled from 'styled-components';

export const FeatureCard = styled.div`
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.25s ease;
  background: white;

  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
`;

export const FeatureDescription = styled.div`
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
`;

export const FeatureIcon = styled.span`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  font-size: 24px;
  margin-bottom: 20px;
`;

export const FeatureTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 8px;
`;

export const Features = styled.div`
  background: white;
  @media (max-width: 640px) {
    &-banner {
      height: 280px;
    }
  }

`;

export const FeaturesBanner = styled.div`
  position: relative;
  height: 360px;
  overflow: hidden;
  @media (max-width: 640px) {
    & {
      height: 280px;
    }
  }

`;

export const FeaturesBannerImage = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const FeaturesBannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(15, 20, 25, 0.85) 0%,
    rgba(15, 20, 25, 0.5) 60%,
    transparent 100%
  );
  display: flex;
  align-items: center;
`;

export const FeaturesBannerText = styled.div`
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.85);
  max-width: 480px;
  line-height: 1.6;
`;

export const FeaturesBannerTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
  max-width: 520px;
`;

export const FeaturesBody = styled.div`
  padding: 80px 24px 100px;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

