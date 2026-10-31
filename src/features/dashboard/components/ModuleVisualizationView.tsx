import { dashboardModules } from '../../../data/dashboardModules';
import {
  moduleVisualizations,
  type ModuleChart,
  type ColoredChartPoint,
  type ChartPoint,
} from '../../../data/moduleVisualizations';
import {
  BarChart,
  DonutChart,
  LineChart,
  MiniBarChart,
  ProgressChart,
} from './ChartWidgets';
import './ModuleVisualizationView.css';

function renderChart(chart: ModuleChart) {
  switch (chart.type) {
    case 'bar':
      return <BarChart data={chart.data as ChartPoint[]} />;
    case 'progress':
      return <ProgressChart data={chart.data as ChartPoint[]} maxY={chart.maxY} />;
    case 'line':
      return (
        <div className="module-line-chart-wrap">
          <LineChart data={chart.data as ChartPoint[]} maxY={chart.maxY} />
        </div>
      );
    case 'donut':
      return <DonutChart data={chart.data as ColoredChartPoint[]} />;
    case 'mini-bar':
      return <MiniBarChart data={chart.data as ChartPoint[]} />;
    default:
      return null;
  }
}

interface ModuleVisualizationViewProps {
  moduleId: string;
}

export function ModuleVisualizationView({ moduleId }: ModuleVisualizationViewProps) {
  const module = dashboardModules.find((m) => m.id === moduleId);
  const visualization = moduleVisualizations[moduleId];

  if (!module || !visualization) {
    return (
      <div className="module-viz-empty">
        <p>Visualization not available for this module.</p>
      </div>
    );
  }

  return (
    <div className="module-viz">
      <div className="module-viz-hero">
        <div className="module-viz-hero-icon">{module.icon}</div>
        <div>
          <h2 className="module-viz-hero-title">{module.title}</h2>
          <p className="module-viz-hero-desc">{module.description}</p>
        </div>
        {module.count !== undefined && (
          <span className={`module-viz-hero-count ${module.status === 'warning' ? 'warning' : ''}`}>
            {module.count} records
          </span>
        )}
      </div>

      <div className="module-viz-stats">
        {visualization.stats.map((stat) => (
          <div key={stat.label} className="module-viz-stat">
            <div className="module-viz-stat-label">{stat.label}</div>
            <div className="module-viz-stat-value">{stat.value}</div>
            {stat.change && (
              <div className={`module-viz-stat-change ${stat.trend ?? ''}`}>{stat.change}</div>
            )}
          </div>
        ))}
      </div>

      <div className="module-viz-charts">
        {visualization.charts.map((chart) => (
          <div key={chart.title} className="module-viz-chart-card">
            <div className="module-viz-chart-header">
              <div>
                <h3 className="module-viz-chart-title">{chart.title}</h3>
                <p className="module-viz-chart-subtitle">{chart.subtitle}</p>
              </div>
              {chart.badge && (
                <span className={`module-viz-badge ${chart.badge.startsWith('-') ? 'down' : 'up'}`}>
                  {chart.badge}
                </span>
              )}
            </div>
            <div className="module-viz-chart-body">{renderChart(chart)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
