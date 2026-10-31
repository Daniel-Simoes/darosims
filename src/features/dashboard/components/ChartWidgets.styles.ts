import styled from 'styled-components';

export const ChartArea = styled.div`
  fill: rgba(37, 99, 235, 0.12);
`;

export const ChartAxisLabel = styled.label`
  font-size: 10px;
  fill: #94a3b8;
`;

export const ChartBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #6366f1);
  border-radius: 100px;
  transition: width 0.4s ease;
  min-width: 4px;
`;

export const ChartBarFillGreen = styled.div`
  background: linear-gradient(90deg, #16a34a, #22c55e);
`;

export const ChartBarLabel = styled.label`
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChartBarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const ChartBarRow = styled.tr`
  display: grid;
  grid-template-columns: minmax(72px, 88px) 1fr 36px;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

export const ChartBarTrack = styled.div`
  height: 10px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
  min-width: 0;
`;

export const ChartBarValue = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  text-align: right;
`;

export const ChartDonutLegend = styled.div`
  list-style: none;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  & li {
    display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
  }
`;

export const ChartDonutLegendValue = styled.div`
  margin-left: auto;
  font-weight: 700;
  color: #1e293b;
`;

export const ChartDonutSub = styled.div`
  font-size: 9px;
  fill: #94a3b8;
`;

export const ChartDonutSvg = styled.svg`
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

export const ChartDonutSwatch = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
`;

export const ChartDonutTotal = styled.div`
  font-size: 18px;
  font-weight: 800;
  fill: #1e293b;
`;

export const ChartDonutWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

export const ChartDot = styled.div`
  fill: #2563eb;
  stroke: white;
  stroke-width: 2;
`;

export const ChartGrid = styled.div`
  stroke: #f1f5f9;
  stroke-width: 1;
`;

export const ChartLine = styled.div`
  fill: none;
  stroke: #2563eb;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

export const ChartMiniBar = styled.div`
  width: 100%;
  max-width: 36px;
  margin-top: auto;
  background: linear-gradient(180deg, #29b5e8, #2563eb);
  border-radius: 4px 4px 0 0;
  min-height: 8px;
  transition: height 0.4s ease;
`;

export const ChartMiniBarCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  gap: 6px;
`;

export const ChartMiniBarLabel = styled.label`
  font-size: 10px;
  color: #94a3b8;
`;

export const ChartMiniBars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 120px;
  width: 100%;
  padding-top: 8px;
`;

export const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

