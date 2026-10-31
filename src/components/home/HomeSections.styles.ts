import styled from 'styled-components';

export const Cta = styled.div`
  position: relative;
  padding: 100px 0;
  overflow: hidden;
  text-align: center;
  color: white;

  & .btn-primary {
    background: white;
  color: var(--color-primary);
  }

  & .btn-primary:hover {
    background: #f0f9ff;
  }

  & .btn-outline {
    border-color: rgba(255, 255, 255, 0.6);
  color: white;
  background: transparent;
  }

  & .btn-outline:hover {
    background: rgba(255, 255, 255, 0.15);
  border-color: white;
  }
`;

export const CtaActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const CtaBg = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const CtaContent = styled.div`
  position: relative;
`;

export const CtaDescription = styled.div`
  font-size: 1.125rem;
  opacity: 0.95;
  max-width: 560px;
  margin: 0 auto 40px;
  line-height: 1.7;
`;

export const CtaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(41, 181, 232, 0.92) 0%, rgba(99, 102, 241, 0.88) 100%);
`;

export const CtaTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
`;

export const Mission = styled.div`
  position: relative;
  padding: 120px 0;
  overflow: hidden;
`;

export const MissionAuthor = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
`;

export const MissionBg = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MissionContent = styled.div`
  position: relative;
  text-align: center;
  color: white;
`;

export const MissionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 20, 25, 0.92) 0%, rgba(26, 26, 46, 0.85) 100%);
`;

export const MissionQuote = styled.div`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto 32px;
  color: rgba(255, 255, 255, 0.95);
`;

export const StandardCard = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.25s ease;

  box-shadow: var(--shadow-md);
  transform: translateY(-4px);

  transform: scale(1.05);
`;

export const StandardCardBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary);
`;

export const StandardCardBody = styled.div`
  padding: 24px;
`;

export const StandardCardImage = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
`;

export const StandardCardImageWrap = styled.div`
  position: relative;
  height: 160px;
  overflow: hidden;
`;

export const StandardDescription = styled.div`
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
`;

export const StandardName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 8px;
`;

export const Standards = styled.div`
  padding: 100px 0;
  background: var(--color-bg-alt);
`;

export const StandardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
`;

export const ValueTag = styled.div`
  padding: 12px 24px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark);
  transition: all 0.2s ease;

  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
`;

export const Values = styled.div`
  padding: 100px 0;
  background: white;
  @media (max-width: 900px) {
    &-grid {
      grid-template-columns: 1fr;
    gap: 40px;
    }
    &-image {
      height: 300px;
    }
  }

`;

export const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  @media (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
    gap: 40px;
    }
  }

`;

export const ValuesImage = styled.div`
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  @media (max-width: 900px) {
    & {
      height: 300px;
    }
  }

`;

export const ValuesImageWrap = styled.div`
  position: relative;

  content: '';
  position: absolute;
  inset: 16px -16px -16px 16px;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  z-index: -1;
  opacity: 0.3;
`;

export const ValuesSubtitle = styled.p`
  margin-bottom: 32px;
`;

export const ValuesTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

