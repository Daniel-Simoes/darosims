import styled from 'styled-components';

export const Footer = styled.footer`
  background: var(--color-bg-dark);
  color: rgba(255, 255, 255, 0.85);
  padding: 64px 0 32px;
  @media (max-width: 1024px) {
    &-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    &-grid {
      grid-template-columns: 1fr;
    gap: 32px;
    }
    &-bottom {
      flex-direction: column;
    gap: 12px;
    text-align: center;
    }
  }

`;

export const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  @media (max-width: 640px) {
    & {
      flex-direction: column;
    gap: 12px;
    text-align: center;
    }
  }

`;

export const FooterBrand = styled.div`
  & img {
    height: 34px;
  width: auto;
  margin-bottom: 16px;
  display: block;
  mix-blend-mode: screen;
  }

  & p {
    font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  max-width: 280px;
  }
`;

export const FooterColumnTitle = styled.h2`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 48px;
  @media (max-width: 1024px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    & {
      grid-template-columns: 1fr;
    gap: 32px;
    }
  }

`;

export const FooterLinks = styled.div`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;

  & a {
    font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.15s ease;
  }

  & a:hover {
    color: var(--color-primary);
  }
`;

