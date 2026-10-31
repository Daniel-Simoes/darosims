import styled, { keyframes } from 'styled-components';

export const Float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

export const Hero = styled.div`
  padding-top: calc(var(--nav-height) + 60px);
  padding-bottom: 80px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f7f9fc 70%, #ffffff 100%);
  position: relative;
  overflow: hidden;

  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(41, 181, 232, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  @media (max-width: 1024px) {
    &-grid {
      grid-template-columns: 1fr;
    gap: 48px;
    }
    &-visual {
      order: -1;
    }
    &-image {
      height: 320px;
    }
    &-float-card--top {
      left: 12px;
    }
    &-float-card--bottom {
      right: 12px;
    }
  }

  @media (max-width: 640px) {
    &-stats {
      flex-direction: column;
    gap: 20px;
    }
    &-float-card {
      display: none;
    }
  }

`;

export const HeroActions = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  & .btn {
    padding: 14px 28px;
  font-size: 15px;
  }
`;

export const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
`;

export const HeroBadgeDot = styled.div`
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
`;

export const HeroContent = styled.div`
  position: relative;
`;

export const HeroDescription = styled.div`
  font-size: 1.125rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 40px;
  max-width: 540px;
`;

export const HeroFloatCard = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  animation: float 4s ease-in-out infinite;

  & strong {
    display: block;
  font-size: 16px;
  color: var(--color-dark);
  }

  & span:not(.hero-float-icon) {
    font-size: 12px;
  color: var(--color-text-muted);
  }
  @media (max-width: 640px) {
    & {
      display: none;
    }
  }

`;

export const HeroFloatCardBottom = styled.div`
  bottom: 32px;
  right: -24px;
  animation-delay: 1.5s;
  @media (max-width: 1024px) {
    & {
      right: 12px;
    }
  }

`;

export const HeroFloatCardTop = styled.div`
  top: 24px;
  left: -24px;
  @media (max-width: 1024px) {
    & {
      left: 12px;
    }
  }

`;

export const HeroFloatIcon = styled.span`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-alt);
  border-radius: var(--radius-sm);
  font-size: 16px;
`;

export const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  position: relative;
  @media (max-width: 1024px) {
    & {
      grid-template-columns: 1fr;
    gap: 48px;
    }
  }

`;

export const HeroImage = styled.div`
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  @media (max-width: 1024px) {
    & {
      height: 320px;
    }
  }

`;

export const HeroImageFrame = styled.div`
  position: relative;
`;

export const HeroStatLabel = styled.label`
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
`;

export const HeroStatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
`;

export const HeroStats = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  @media (max-width: 640px) {
    & {
      flex-direction: column;
    gap: 20px;
    }
  }

`;

export const HeroTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-dark);
  margin-bottom: 24px;
  letter-spacing: -0.02em;

  & span {
    background: linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  }
`;

export const HeroVisual = styled.div`
  position: relative;
  @media (max-width: 1024px) {
    & {
      order: -1;
    }
  }

`;

