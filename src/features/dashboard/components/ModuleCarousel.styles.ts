import styled from 'styled-components';

export const ModuleCarousel = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 55%, #f0f9ff 100%);
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  @media (max-width: 640px) {
    & {
      padding: 16px 12px;
    margin-bottom: 16px;
    }
    &-header {
      flex-direction: column;
    align-items: stretch;
    }
    &-nav {
      justify-content: flex-end;
    }
    &-title {
      font-size: 1.05rem;
    }
    &-card {
      flex: 0 0 min(280px, 88vw);
    }
    &-fade {
      width: 20px;
    }
  }

`;

export const ModuleCarouselArrow = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);

  opacity: 0.35;
  cursor: default;
`;

export const ModuleCarouselCard = styled.div`
  position: relative;
  flex: 0 0 min(320px, 85vw);
  scroll-snap-align: start;
  text-align: left;
  padding: 22px 20px 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);

  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  border-color: #cbd5e1;

  &.is-preview {
    cursor: default;
  }

  &.is-preview:disabled {
    opacity: 1;
  }

  &.is-preview .module-carousel-card-content {
    filter: blur(2px);
  opacity: 0.5;
  user-select: none;
  }

  &.accent-core .module-carousel-card-glow {
    background: linear-gradient(90deg, #2563eb, #38bdf8);
  }

  &.accent-compliance .module-carousel-card-glow {
    background: linear-gradient(90deg, #7c3aed, #f59e0b);
  }

  &.accent-analytics .module-carousel-card-glow {
    background: linear-gradient(90deg, #059669, #14b8a6);
  }
  @media (max-width: 640px) {
    & {
      flex: 0 0 min(280px, 88vw);
    }
  }

`;

export const ModuleCarouselCardContent = styled.div`
  position: relative;
  z-index: 0;
`;

export const ModuleCarouselCardCta = styled.div`
  display: inline-block;
  margin-top: 14px;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
`;

export const ModuleCarouselCardDesc = styled.div`
  font-size: 13px;
  color: #64748b;
  line-height: 1.55;
  min-height: 60px;
`;

export const ModuleCarouselCardGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 14px 14px 0 0;
`;

export const ModuleCarouselCardTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1.3;
`;

export const ModuleCarouselCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
`;

export const ModuleCarouselCount = styled.div`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;

  &.warning {
    background: #fef3c7;
  color: #b45309;
  }
`;

export const ModuleCarouselDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: #cbd5e1;
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;

  &.active {
    width: 24px;
  background: #2563eb;
  }
`;

export const ModuleCarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

export const ModuleCarouselEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2563eb;
  margin-bottom: 6px;
`;

export const ModuleCarouselFade = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 48px;
  z-index: 2;
  pointer-events: none;
  @media (max-width: 640px) {
    & {
      width: 20px;
    }
  }

`;

export const ModuleCarouselFadeLeft = styled.div`
  left: 0;
  background: linear-gradient(90deg, #f8fafc 0%, transparent 100%);
`;

export const ModuleCarouselFadeRight = styled.div`
  right: 0;
  background: linear-gradient(270deg, #f0f9ff 0%, transparent 100%);
`;

export const ModuleCarouselHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  @media (max-width: 640px) {
    & {
      flex-direction: column;
    align-items: stretch;
    }
  }

`;

export const ModuleCarouselIcon = styled.span`
  font-size: 28px;
  line-height: 1;
`;

export const ModuleCarouselNav = styled.nav`
  display: flex;
  gap: 8px;
  @media (max-width: 640px) {
    & {
      justify-content: flex-end;
    }
  }

`;

export const ModuleCarouselSoonBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #475569;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  pointer-events: none;
`;

export const ModuleCarouselTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  @media (max-width: 640px) {
    & {
      font-size: 1.05rem;
    }
  }

`;

export const ModuleCarouselTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 4px 2px 12px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  display: none;
`;

export const ModuleCarouselViewport = styled.div`
  position: relative;
`;

