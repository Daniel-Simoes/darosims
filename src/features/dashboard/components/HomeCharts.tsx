import { complianceTrend, monthlyAudits } from '../../../data/dashboardCharts';
import { useDocumentsByType } from '../hooks/useDocumentsByType';
import { useOpenActivity } from '../hooks/useOpenActivity';
import {
  BarChart,
  DonutChart,
  LineChart,
  MiniBarChart,
} from './ChartWidgets';
import { ChartBlockSkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import './HomeCharts.css';

interface HomeChartsProps {
  refreshKey?: number;
}

export function HomeCharts({ refreshKey = 0 }: HomeChartsProps) {
  const { data: documentsByType, isLoading: documentsByTypeLoading } =
    useDocumentsByType(refreshKey);
  const { data: activityBreakdown, isLoading: activityLoading } = useOpenActivity(refreshKey);

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
          {documentsByTypeLoading ? (
            <ChartBlockSkeleton height={160} />
          ) : documentsByType.length === 0 ? (
            <p className="home-chart-empty">No documents in the register yet.</p>
          ) : (
            <BarChart data={documentsByType} />
          )}
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
          {activityLoading ? (
            <ChartBlockSkeleton height={160} />
          ) : (
            <DonutChart data={activityBreakdown} showAllCategories />
          )}
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
