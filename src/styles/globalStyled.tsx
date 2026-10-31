import styled, { css, createGlobalStyle } from 'styled-components';

export const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 16px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-dark);
  margin-bottom: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.75rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-muted);
  max-width: 640px;
  line-height: 1.7;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: 40px;
  }

  ${SectionSubtitle} {
    margin: 0 auto;
  }
`;

const btnBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
`;

export const Btn = styled.button`
  ${btnBase}
`;

export const BtnLink = styled.a`
  ${btnBase}
`;

export const BtnPrimary = styled(Btn)`
  background: var(--color-primary);
  color: white;
  border: none;

  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const BtnPrimaryLink = styled(BtnLink)`
  background: var(--color-primary);
  color: white;
  border: none;

  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const BtnOutline = styled(BtnLink)`
  border: 1.5px solid var(--color-border);
  color: var(--color-text);
  background: white;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

export const BtnDark = styled(BtnLink)`
  background: var(--color-dark);
  color: white;
  border: none;

  &:hover {
    background: #2a2a4a;
  }
`;

export const BtnGhost = styled(BtnLink)`
  color: var(--color-text);
  padding: 10px 16px;
  background: none;
  border: none;

  &:hover {
    color: var(--color-primary);
  }
`;

/** Legacy class names used across marketing pages until each view is fully migrated. */
export const LegacyGlobalClasses = createGlobalStyle`
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }

  @media (max-width: 640px) {
    .container {
      padding: 0 16px;
    }

    .section-title {
      font-size: 1.75rem;
    }

    .section-subtitle {
      font-size: 1rem;
    }

    .section-header {
      margin-bottom: 40px;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-outline {
    border: 1.5px solid var(--color-border);
    color: var(--color-text);
    background: white;
  }

  .btn-outline:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .btn-dark {
    background: var(--color-dark);
    color: white;
  }

  .btn-dark:hover {
    background: #2a2a4a;
  }

  .btn-ghost {
    color: var(--color-text);
    padding: 10px 16px;
  }

  .btn-ghost:hover {
    color: var(--color-primary);
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--color-dark);
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 1.125rem;
    color: var(--color-text-muted);
    max-width: 640px;
    line-height: 1.7;
  }

  .section-header {
    text-align: center;
    margin-bottom: 64px;
  }

  .section-header .section-subtitle {
    margin: 0 auto;
  }
`;
