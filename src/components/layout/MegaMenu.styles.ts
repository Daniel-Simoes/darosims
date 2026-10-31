import styled, { keyframes } from 'styled-components';

export const FadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MegaMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  background: white;
  border-top: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  padding: 32px 0;
  z-index: 1001;
  animation: fadeIn 0.15s ease;
`;

export const MegaMenuLink = styled.button`
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;

  background: var(--color-bg-alt);
`;

export const MegaMenuLinkDesc = styled.div`
  font-size: 13px;
  color: var(--color-text-muted);
  display: block;
  margin-top: 2px;
`;

export const MegaMenuLinkLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark);
  display: block;
`;

export const MegaMenuLinks = styled.div`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MegaMenuSectionTitle = styled.h2`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-light);
  margin-bottom: 16px;
`;

