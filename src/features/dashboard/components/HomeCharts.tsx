import {
  HomeChartBadge,
  HomeChartBody,
  HomeChartCard,
  HomeChartCardHeader,
  HomeChartSubtitle,
  HomeChartTitle,
  HomeCharts as HomeChartsRoot,
  HomeLineChartWrap,
} from './HomeCharts.styles';
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

export function HomeCharts() {
  return (
    <HomeChartsRoot>
      <HomeChartCard>
        <HomeChartCardHeader>
          <div>
            <HomeChartTitle>Compliance Score Trend</HomeChartTitle>
            <HomeChartSubtitle>Last 6 months performance</HomeChartSubtitle>
          </div>
          <HomeChartBadge>+15% YTD</HomeChartBadge>
        </HomeChartCardHeader>
        <HomeLineChartWrap>
          <LineChart data={complianceTrend} />
        </HomeLineChartWrap>
      </HomeChartCard>

      <HomeChartCard>
        <HomeChartCardHeader>
          <div>
            <HomeChartTitle>Documents by Type</HomeChartTitle>
            <HomeChartSubtitle>Controlled document breakdown</HomeChartSubtitle>
          </div>
        </HomeChartCardHeader>
        <HomeChartBody>
          <BarChart data={documentsByType} />
        </HomeChartBody>
      </HomeChartCard>

      <HomeChartCard>
        <HomeChartCardHeader>
          <div>
            <HomeChartTitle>Open Activity</HomeChartTitle>
            <HomeChartSubtitle>Items requiring attention</HomeChartSubtitle>
          </div>
        </HomeChartCardHeader>
        <HomeChartBody>
          <DonutChart data={activityBreakdown} />
        </HomeChartBody>
      </HomeChartCard>

      <HomeChartCard>
        <HomeChartCardHeader>
          <div>
            <HomeChartTitle>Audits Completed</HomeChartTitle>
            <HomeChartSubtitle>Monthly audit activity</HomeChartSubtitle>
          </div>
        </HomeChartCardHeader>
        <HomeChartBody>
          <MiniBarChart data={monthlyAudits} />
        </HomeChartBody>
      </HomeChartCard>
    </HomeChartsRoot>
  );
}
