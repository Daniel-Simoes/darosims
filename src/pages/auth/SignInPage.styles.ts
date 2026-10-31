import styled from 'styled-components';

export const FormGroup = styled.div`
  & label {
    display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 6px;
  }

  & input {
    width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s ease;
  }

  & input:focus {
    outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(41, 181, 232, 0.15);
  }
`;

export const SigninBack = styled.div`
  display: block;
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-muted);

  color: var(--color-primary);
`;

export const SigninCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 48px 40px;
  @media (max-width: 480px) {
    & {
      padding: 32px 20px;
    }
  }

`;

export const SigninError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 16px;
`;

export const SigninForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  & .btn-primary {
    width: 100%;
  padding: 14px;
  font-size: 15px;
  margin-top: 8px;
  }
  @media (max-width: 480px) {
    &-panel {
      padding: 16px;
    }
  }

`;

export const SigninFormPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-alt);
  padding: 24px;
  @media (max-width: 480px) {
    & {
      padding: 16px;
    }
  }

`;

export const SigninHint = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;

  & code {
    background: var(--color-bg-alt);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  }
  @media (max-width: 480px) {
    & {
      font-size: 11px;
    }
  }

`;

export const SigninLogo = styled.img`
  text-align: center;
  margin-bottom: 32px;

  & img {
    height: 44px;
  width: auto;
  display: block;
  margin: 0 auto;
  }
`;

export const SigninPage = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const SigninSubtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: 32px;
`;

export const SigninTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dark);
  text-align: center;
  margin-bottom: 8px;
`;

export const SigninVisual = styled.div`
  position: relative;
  overflow: hidden;
  @media (max-width: 900px) {
    & {
      min-height: 240px;
    }
    &-overlay {
      padding: 32px 24px;
    }
    &-title {
      font-size: 1.5rem;
    }
  }

`;

export const SigninVisualContent = styled.div`
  max-width: 420px;
  color: white;
`;

export const SigninVisualFeatures = styled.div`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;

  & li {
    font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  padding-left: 24px;
  position: relative;
  }

  & li::before {
    content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
  }
`;

export const SigninVisualImage = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const SigninVisualLogo = styled.img`
  height: 40px;
  width: auto;
  margin-bottom: 32px;
  display: block;
  mix-blend-mode: screen;
`;

export const SigninVisualOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(15, 20, 25, 0.88) 0%,
    rgba(26, 26, 46, 0.75) 100%
  );
  display: flex;
  align-items: center;
  padding: 48px;
  @media (max-width: 900px) {
    & {
      padding: 32px 24px;
    }
  }

`;

export const SigninVisualText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 28px;
`;

export const SigninVisualTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
  @media (max-width: 900px) {
    & {
      font-size: 1.5rem;
    }
  }

`;

