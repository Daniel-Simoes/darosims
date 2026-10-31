import styled, { keyframes } from 'styled-components';

const ringSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const iconPulse = keyframes`
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.92;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const DarosEntryLoadingRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef4f8 100%);
  animation: ${fadeIn} 0.2s ease;
`;

export const DarosEntryLoadingIconWrap = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DarosEntryLoadingIcon = styled.img`
  width: 52px;
  height: auto;
  position: relative;
  z-index: 1;
  animation: ${iconPulse} 1.6s ease-in-out infinite;
`;

export const DarosEntryLoadingRing = styled.span<{ $delay?: boolean }>`
  position: absolute;
  inset: ${({ $delay }) => ($delay ? '10px' : '0')};
  border: 2px solid transparent;
  border-top-color: ${({ $delay }) =>
    $delay ? 'rgba(41, 181, 232, 0.45)' : 'var(--color-primary, #29b5e8)'};
  border-right-color: ${({ $delay }) => ($delay ? 'transparent' : 'rgba(41, 181, 232, 0.35)')};
  border-radius: 50%;
  animation: ${ringSpin} ${({ $delay }) => ($delay ? '1.6s' : '1.1s')} linear infinite;
  animation-direction: ${({ $delay }) => ($delay ? 'reverse' : 'normal')};
`;
