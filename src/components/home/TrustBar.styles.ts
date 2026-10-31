import styled from 'styled-components';

export const TrustBar = styled.div`
  padding: 40px 0;
  background: white;
  border-bottom: 1px solid var(--color-border);
`;

export const TrustBarItem = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 8px 16px;
  background: var(--color-bg-alt);
  border-radius: 100px;
`;

export const TrustBarItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
`;

export const TrustBarLabel = styled.label`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-light);
  margin-bottom: 20px;
`;

