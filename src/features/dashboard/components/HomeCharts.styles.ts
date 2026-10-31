import styled from 'styled-components';

export const HomeChartBadge = styled.div`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  white-space: nowrap;

  &.up {
    background: #dcfce7;
  color: #16a34a;
  }
`;

export const HomeChartBody = styled.div`
  flex: 1;
  min-height: 120px;
  display: flex;
  align-items: stretch;
  width: 100%;
`;

export const HomeChartBodyBars = styled.div`
  align-items: flex-start;
`;

export const HomeChartCard = styled.div`
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 18px;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const HomeChartCardHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

export const HomeChartSubtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const HomeChartTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 2px;
`;

export const HomeCharts = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 1280px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const HomeLineChartWrap = styled.div`
  height: 120px;
  width: 100%;
`;

