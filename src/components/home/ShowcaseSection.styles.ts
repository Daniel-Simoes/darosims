import styled from 'styled-components';

export const Showcase = styled.div`
  background: white;
  @media (max-width: 900px) {
    &-inner {
      grid-template-columns: 1fr;
    gap: 40px;
    }
    &-row.reverse .showcase-inner {
      direction: ltr;
    }
    &-image {
      height: 280px;
    }
  }

`;

export const ShowcaseDescription = styled.div`
  font-size: 1.0625rem;
  color: var(--color-text-muted);
  line-height: 1.75;
  margin-bottom: 28px;
`;

export const ShowcaseImage = styled.div`
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  @media (max-width: 900px) {
    & {
      height: 280px;
    }
  }

`;

export const ShowcaseImageGlow = styled.div`
  position: absolute;
  inset: 20px -20px -20px 20px;
  background: linear-gradient(135deg, rgba(41, 181, 232, 0.25), rgba(99, 102, 241, 0.2));
  border-radius: var(--radius-lg);
  z-index: 0;
`;

export const ShowcaseImageWrap = styled.div`
  position: relative;
`;

export const ShowcaseInner = styled.div`
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

export const ShowcaseLink = styled.button`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  transition: color 0.15s ease;

  color: var(--color-primary-dark);
`;

export const ShowcaseRow = styled.tr`
  padding: 80px 0;

  background: var(--color-bg-alt);

  &.reverse .showcase-inner {
    direction: rtl;
  }

  &.reverse .showcase-inner > * {
    direction: ltr;
  }
`;

export const ShowcaseTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  color: var(--color-dark);
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
`;

