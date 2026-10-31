import {
  ModuleLineChartWrap,
  ModuleViz,
  ModuleVizChartBody,
  ModuleVizChartHeader,
  ModuleVizChartSubtitle,
  ModuleVizChartTitle,
  ModuleVizCharts,
  ModuleVizEmpty,
  ModuleVizHero,
  ModuleVizHeroDesc,
  ModuleVizHeroIcon,
  ModuleVizHeroTitle,
  ModuleVizStatLabel,
  ModuleVizStatValue,
  ModuleVizStats,
} from './ModuleVisualizationView.styles';
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

function renderChart(chart: ModuleChart) {
  switch (chart.type) {
    case 'bar':
      return <BarChart data={chart.data as ChartPoint[]} />;
    case 'progress':
      return <ProgressChart data={chart.data as ChartPoint[]} maxY={chart.maxY} />;
    case 'line':
      return (
        <ModuleLineChartWrap>
          <LineChart data={chart.data as ChartPoint[]} maxY={chart.maxY} />
        </ModuleLineChartWrap>
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
      <ModuleVizEmpty>
        <p>Visualization not available for this module.</p>
      </ModuleVizEmpty>
    );
  }

  return (
    <ModuleViz>
      <ModuleVizHero>
        <ModuleVizHeroIcon>{module.icon}</ModuleVizHeroIcon>
        <div>
          <ModuleVizHeroTitle>{module.title}</ModuleVizHeroTitle>
          <ModuleVizHeroDesc>{module.description}</ModuleVizHeroDesc>
        </div>
        {module.count !== undefined && (
          <span className={`module-viz-hero-count ${module.status === 'warning' ? 'warning' : ''}`}>
            {module.count} records
          </span>
        )}
      </ModuleVizHero>

      <ModuleVizStats>
        {visualization.stats.map((stat) => (
          <div key={stat.label} className="module-viz-stat">
            <ModuleVizStatLabel>{stat.label}</ModuleVizStatLabel>
            <ModuleVizStatValue>{stat.value}</ModuleVizStatValue>
            {stat.change && (
              <div className={`module-viz-stat-change ${stat.trend ?? ''}`}>{stat.change}</div>
            )}
          </div>
        ))}
      </ModuleVizStats>

      <ModuleVizCharts>
        {visualization.charts.map((chart) => (
          <div key={chart.title} className="module-viz-chart-card">
            <ModuleVizChartHeader>
              <div>
                <ModuleVizChartTitle>{chart.title}</ModuleVizChartTitle>
                <ModuleVizChartSubtitle>{chart.subtitle}</ModuleVizChartSubtitle>
              </div>
              {chart.badge && (
                <span className={`module-viz-badge ${chart.badge.startsWith('-') ? 'down' : 'up'}`}>
                  {chart.badge}
                </span>
              )}
            </ModuleVizChartHeader>
            <ModuleVizChartBody>{renderChart(chart)}</ModuleVizChartBody>
          </div>
        ))}
      </ModuleVizCharts>
    </ModuleViz>
  );
}
