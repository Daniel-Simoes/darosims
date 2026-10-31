import {
  ChartBarFill,
  ChartBarLabel,
  ChartBarList,
  ChartBarTrack,
  ChartBarValue,
  ChartDonutLegend,
  ChartDonutLegendValue,
  ChartDonutWrap,
  ChartMiniBar,
  ChartMiniBarLabel,
  ChartMiniBars,
} from './ChartWidgets.styles';
import type { ChartPoint, ColoredChartPoint } from '../../../data/moduleVisualizations';

export function LineChart({
  data,
  maxY = 100,
}: {
  data: ChartPoint[];
  maxY?: number;
}) {
  const width = 320;
  const height = 140;
  const padX = 28;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - (d.value / maxY) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" aria-hidden="true">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padY + chartH - (tick / 100) * chartH;
        return (
          <g key={tick}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} className="chart-grid" />
          </g>
        );
      })}
      <path d={areaPath} className="chart-area" />
      <path d={linePath} className="chart-line" />
      {points.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="4" className="chart-dot" />
      ))}
      {points.map((p) => (
        <text key={`${p.label}-lbl`} x={p.x} y={height - 2} textAnchor="middle" className="chart-axis-label">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ChartBarList>
      {data.map((item) => (
        <div key={item.label} className="chart-bar-row">
          <ChartBarLabel>{item.label}</ChartBarLabel>
          <ChartBarTrack>
            <ChartBarFill
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </ChartBarTrack>
          <ChartBarValue>{item.value}</ChartBarValue>
        </div>
      ))}
    </ChartBarList>
  );
}

export function ProgressChart({ data, maxY = 100 }: { data: ChartPoint[]; maxY?: number }) {
  return (
    <div className="chart-bar-list">
      {data.map((item) => (
        <div key={item.label} className="chart-bar-row">
          <ChartBarLabel>{item.label}</ChartBarLabel>
          <ChartBarTrack>
            <ChartBarFill
              style={{ width: `${Math.max((item.value / maxY) * 100, 2)}%` }}
            />
          </ChartBarTrack>
          <ChartBarValue>{item.value}%</ChartBarValue>
        </div>
      ))}
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function DonutChart({ data }: { data: ColoredChartPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const radius = 54;
  const cx = 70;
  const cy = 70;

  const slices = data.map((item) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
    return { ...item, path };
  });

  return (
    <ChartDonutWrap>
      <svg viewBox="0 0 140 140" className="chart-donut-svg" aria-hidden="true">
        {slices.map((slice) => (
          <path key={slice.label} d={slice.path} fill={slice.color} />
        ))}
        <circle cx={cx} cy={cy} r="32" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="chart-donut-total">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="chart-donut-sub">Total</text>
      </svg>
      <ChartDonutLegend>
        {data.map((item) => (
          <li key={item.label}>
            <span className="chart-donut-swatch" style={{ background: item.color }} />
            {item.label}
            <ChartDonutLegendValue>{item.value}</ChartDonutLegendValue>
          </li>
        ))}
      </ChartDonutLegend>
    </ChartDonutWrap>
  );
}

export function MiniBarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ChartMiniBars>
      {data.map((item) => (
        <div key={item.label} className="chart-mini-bar-col">
          <ChartMiniBar
            style={{ height: `${Math.max((item.value / max) * 100, 8)}%` }}
            title={`${item.label}: ${item.value}`}
          />
          <ChartMiniBarLabel>{item.label}</ChartMiniBarLabel>
        </div>
      ))}
    </ChartMiniBars>
  );
}
