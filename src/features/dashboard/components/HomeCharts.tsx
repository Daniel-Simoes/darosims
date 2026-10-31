import {
  activityBreakdown,
  complianceTrend,
  documentsByType,
  monthlyAudits,
} from '../../../data/dashboardCharts';
import {
  BarChart,
  DonutChart,
  LineChart,
  MiniBarChart,
} from './ChartWidgets';
import './HomeCharts.css';

export function HomeCharts() {
  return (
    <div className="home-charts">
      <div className="home-chart-card">
        <div className="home-chart-card-header">
          <div>
            <h3 className="home-chart-title">Compliance Score Trend</h3>
            <p className="home-chart-subtitle">Last 6 months performance</p>
          </div>
          <span className="home-chart-badge up">+15% YTD</span>
        </div>
        <div className="home-line-chart-wrap home-chart-body">
          <LineChart data={complianceTrend} />
        </div>
      </div>

      <div className="home-chart-card">
        <div className="home-chart-card-header">
          <div>
            <h3 className="home-chart-title">Documents by Type</h3>
            <p className="home-chart-subtitle">Controlled document breakdown</p>
          </div>
        </div>
        <div className="home-chart-body home-chart-body-bars">
          <BarChart data={documentsByType} />
        </div>
      </div>

      <div className="home-chart-card">
        <div className="home-chart-card-header">
          <div>
            <h3 className="home-chart-title">Open Activity</h3>
            <p className="home-chart-subtitle">Items requiring attention</p>
          </div>
        </div>
        <div className="home-chart-body">
          <DonutChart data={activityBreakdown} />
        </div>
      </div>

      <div className="home-chart-card">
        <div className="home-chart-card-header">
          <div>
            <h3 className="home-chart-title">Audits Completed</h3>
            <p className="home-chart-subtitle">Monthly audit activity</p>
          </div>
        </div>
        <div className="home-chart-body">
          <MiniBarChart data={monthlyAudits} />
        </div>
      </div>
    </div>
  );
}
