import styled from 'styled-components';

export const ModuleLineChartWrap = styled.div`
  width: 100%;
  height: 120px;
`;

export const ModuleViz = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 1280px) {
    &-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    &-charts {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    &-hero {
      flex-wrap: wrap;
    }
    &-hero-count {
      margin-left: 0;
    }
    &-stats {
      grid-template-columns: 1fr;
    }
  }

`;

export const ModuleVizBadge = styled.div`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  white-space: nowrap;

  &.up {
    background: #dcfce7;
  color: #16a34a;
  }

  &.down {
    background: #dcfce7;
  color: #16a34a;
  }
`;

export const ModuleVizChartBody = styled.div`
  flex: 1;
  min-height: 120px;
  display: flex;
  align-items: stretch;
  width: 100%;
`;

export const ModuleVizChartCard = styled.div`
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 18px;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const ModuleVizChartHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

export const ModuleVizChartSubtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const ModuleVizChartTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 2px;
`;

export const ModuleVizCharts = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 1280px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const ModuleVizEmpty = styled.div`
  padding: 48px;
  text-align: center;
  color: #64748b;
`;

export const ModuleVizHero = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  @media (max-width: 768px) {
    & {
      flex-wrap: wrap;
    }
    &-count {
      margin-left: 0;
    }
  }

`;

export const ModuleVizHeroCount = styled.div`
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 100px;
  background: var(--color-bg-alt);
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;

  &.warning {
    background: #fef3c7;
  color: #d97706;
  }
  @media (max-width: 768px) {
    & {
      margin-left: 0;
    }
  }

`;

export const ModuleVizHeroDesc = styled.div`
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  max-width: 560px;
`;

export const ModuleVizHeroIcon = styled.span`
  font-size: 36px;
  line-height: 1;
  flex-shrink: 0;
`;

export const ModuleVizHeroTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 4px;
`;

export const ModuleVizStat = styled.div`
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 18px;
  @media (max-width: 1280px) {
    &s {
      grid-template-columns: repeat(2, 1fr);
    }
  }

`;

export const ModuleVizStatChange = styled.div`
  font-size: 11px;
  margin-top: 4px;
  color: var(--color-text-light);

  &.up {
    color: var(--color-success);
  }

  &.down {
    color: var(--color-success);
  }
`;

export const ModuleVizStatLabel = styled.label`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
`;

export const ModuleVizStatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
`;

export const ModuleVizStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 1280px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

