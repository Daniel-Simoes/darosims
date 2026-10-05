export interface ChartPoint {
  label: string;
  value: number;
}

export interface ColoredChartPoint extends ChartPoint {
  color: string;
}

export interface ModuleStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ModuleChart {
  type: 'bar' | 'line' | 'donut' | 'mini-bar' | 'progress';
  title: string;
  subtitle: string;
  data: ChartPoint[] | ColoredChartPoint[];
  maxY?: number;
  badge?: string;
}

export interface ModuleVisualization {
  stats: ModuleStat[];
  charts: ModuleChart[];
}

export const moduleVisualizations: Record<string, ModuleVisualization> = {
  processes: {
    stats: [
      { label: 'Active Processes', value: 24, change: '+2 this month', trend: 'up' },
      { label: 'Completion Rate', value: '91%', change: '+4%', trend: 'up' },
      { label: 'Pending Reviews', value: 5, change: '1 overdue', trend: 'neutral' },
      { label: 'Avg. Cycle Time', value: '3.2d', change: '-0.5d', trend: 'down' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Processes by Department',
        subtitle: 'Active workflow count',
        data: [
          { label: 'Quality', value: 8 },
          { label: 'Production', value: 6 },
          { label: 'HR', value: 4 },
          { label: 'Operations', value: 4 },
          { label: 'Finance', value: 2 },
        ],
      },
      {
        type: 'line',
        title: 'Process Completion Trend',
        subtitle: 'Last 6 months',
        data: [
          { label: 'Mar', value: 82 },
          { label: 'Apr', value: 85 },
          { label: 'May', value: 87 },
          { label: 'Jun', value: 88 },
          { label: 'Jul', value: 90 },
          { label: 'Aug', value: 91 },
        ],
        badge: '+9% YTD',
      },
      {
        type: 'donut',
        title: 'Process Status',
        subtitle: 'Current workflow state',
        data: [
          { label: 'Active', value: 18, color: '#2563eb' },
          { label: 'Under Review', value: 4, color: '#f59e0b' },
          { label: 'Draft', value: 2, color: '#94a3b8' },
        ],
      },
      {
        type: 'mini-bar',
        title: 'Reviews Completed',
        subtitle: 'Monthly activity',
        data: [
          { label: 'Mar', value: 3 },
          { label: 'Apr', value: 5 },
          { label: 'May', value: 4 },
          { label: 'Jun', value: 6 },
          { label: 'Jul', value: 4 },
          { label: 'Aug', value: 5 },
        ],
      },
    ],
  },
  documents: {
    stats: [
      { label: 'Total Documents', value: 156, change: '+12 this month', trend: 'up' },
      { label: 'Due for Review', value: 5, change: '2 overdue', trend: 'neutral' },
      { label: 'Approved', value: '94%', change: '+1%', trend: 'up' },
      { label: 'Pending Approval', value: 8, change: '-2', trend: 'down' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Documents by Type',
        subtitle: 'Controlled document breakdown',
        data: [
          { label: 'Forms', value: 42 },
          { label: 'SOPs', value: 38 },
          { label: 'Work Instructions', value: 31 },
          { label: 'Policies', value: 24 },
          { label: 'Records', value: 21 },
        ],
      },
      {
        type: 'progress',
        title: 'Review Progress',
        subtitle: 'Documents reviewed on schedule',
        data: [
          { label: 'Q1 Reviews', value: 95 },
          { label: 'Q2 Reviews', value: 88 },
          { label: 'Q3 Reviews', value: 72 },
          { label: 'Acknowledgements', value: 81 },
        ],
        maxY: 100,
      },
      {
        type: 'donut',
        title: 'Document Status',
        subtitle: 'Current lifecycle state',
        data: [
          { label: 'Active', value: 132, color: '#16a34a' },
          { label: 'Draft', value: 14, color: '#f59e0b' },
          { label: 'Obsolete', value: 10, color: '#94a3b8' },
        ],
      },
      {
        type: 'mini-bar',
        title: 'Documents Created',
        subtitle: 'Monthly new records',
        data: [
          { label: 'Mar', value: 8 },
          { label: 'Apr', value: 12 },
          { label: 'May', value: 10 },
          { label: 'Jun', value: 15 },
          { label: 'Jul', value: 11 },
          { label: 'Aug', value: 12 },
        ],
      },
    ],
  },
  risks: {
    stats: [
      { label: 'Open Risks', value: 12, change: '+1 new', trend: 'neutral' },
      { label: 'High Priority', value: 3, change: 'Needs action', trend: 'neutral' },
      { label: 'Mitigated', value: 28, change: '+4 this quarter', trend: 'up' },
      { label: 'Risk Score Avg.', value: 'Medium', change: '-5%', trend: 'down' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Risks by Category',
        subtitle: 'Open risk register',
        data: [
          { label: 'Operational', value: 5 },
          { label: 'Compliance', value: 3 },
          { label: 'Financial', value: 2 },
          { label: 'Safety', value: 2 },
        ],
      },
      {
        type: 'donut',
        title: 'Risk Severity',
        subtitle: 'Priority distribution',
        data: [
          { label: 'High', value: 3, color: '#ef4444' },
          { label: 'Medium', value: 6, color: '#f59e0b' },
          { label: 'Low', value: 3, color: '#16a34a' },
        ],
      },
      {
        type: 'line',
        title: 'Risk Trend',
        subtitle: 'Open risks over time',
        data: [
          { label: 'Mar', value: 15 },
          { label: 'Apr', value: 14 },
          { label: 'May', value: 13 },
          { label: 'Jun', value: 14 },
          { label: 'Jul', value: 13 },
          { label: 'Aug', value: 12 },
        ],
        badge: '-20% YTD',
      },
      {
        type: 'progress',
        title: 'Mitigation Progress',
        subtitle: 'Action plan completion',
        data: [
          { label: 'Operational', value: 78 },
          { label: 'Compliance', value: 65 },
          { label: 'Financial', value: 90 },
          { label: 'Safety', value: 55 },
        ],
        maxY: 100,
      },
    ],
  },
  audits: {
    stats: [
      { label: 'Active Audits', value: 2, change: '1 scheduled', trend: 'neutral' },
      { label: 'Completed YTD', value: 14, change: '+3 vs last year', trend: 'up' },
      { label: 'Findings Open', value: 6, change: '-2 closed', trend: 'down' },
      { label: 'Avg. Close Time', value: '12d', change: '-3d', trend: 'down' },
    ],
    charts: [
      {
        type: 'mini-bar',
        title: 'Audits Completed',
        subtitle: 'Monthly audit activity',
        data: [
          { label: 'Mar', value: 1 },
          { label: 'Apr', value: 3 },
          { label: 'May', value: 2 },
          { label: 'Jun', value: 4 },
          { label: 'Jul', value: 2 },
          { label: 'Aug', value: 3 },
        ],
      },
      {
        type: 'bar',
        title: 'Findings by Area',
        subtitle: 'Open audit findings',
        data: [
          { label: 'Quality', value: 3 },
          { label: 'Production', value: 2 },
          { label: 'HR', value: 1 },
        ],
      },
      {
        type: 'donut',
        title: 'Audit Status',
        subtitle: 'Current audit pipeline',
        data: [
          { label: 'Completed', value: 14, color: '#16a34a' },
          { label: 'In Progress', value: 2, color: '#2563eb' },
          { label: 'Planned', value: 4, color: '#f59e0b' },
        ],
      },
      {
        type: 'progress',
        title: 'Audit Plan Progress',
        subtitle: 'Annual plan completion',
        data: [
          { label: 'Q1', value: 100 },
          { label: 'Q2', value: 85 },
          { label: 'Q3', value: 60 },
          { label: 'Q4', value: 0 },
        ],
        maxY: 100,
      },
    ],
  },
  suppliers: {
    stats: [
      { label: 'Active Suppliers', value: 18, change: '+1 new', trend: 'up' },
      { label: 'Approved', value: 15, change: '83% rate', trend: 'up' },
      { label: 'Pending Eval.', value: 3, change: 'Due this month', trend: 'neutral' },
      { label: 'Avg. Score', value: '4.2/5', change: '+0.3', trend: 'up' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Suppliers by Rating',
        subtitle: 'Evaluation score bands',
        data: [
          { label: 'Excellent', value: 6 },
          { label: 'Good', value: 9 },
          { label: 'Fair', value: 2 },
          { label: 'Poor', value: 1 },
        ],
      },
      {
        type: 'line',
        title: 'Supplier Score Trend',
        subtitle: 'Average rating over time',
        data: [
          { label: 'Mar', value: 3.8 },
          { label: 'Apr', value: 3.9 },
          { label: 'May', value: 4.0 },
          { label: 'Jun', value: 4.1 },
          { label: 'Jul', value: 4.1 },
          { label: 'Aug', value: 4.2 },
        ],
        maxY: 5,
        badge: '+10% YTD',
      },
      {
        type: 'donut',
        title: 'Approval Status',
        subtitle: 'Supplier qualification',
        data: [
          { label: 'Approved', value: 15, color: '#16a34a' },
          { label: 'Conditional', value: 2, color: '#f59e0b' },
          { label: 'Pending', value: 1, color: '#94a3b8' },
        ],
      },
      {
        type: 'progress',
        title: 'Evaluation Coverage',
        subtitle: 'Annual evaluation completion',
        data: [
          { label: 'Critical', value: 100 },
          { label: 'Standard', value: 85 },
          { label: 'Low Risk', value: 60 },
        ],
        maxY: 100,
      },
    ],
  },
  nonconformities: {
    stats: [
      { label: 'Open NCs', value: 7, change: '-2 this week', trend: 'down' },
      { label: 'Overdue CAPA', value: 2, change: 'Action required', trend: 'neutral' },
      { label: 'Closed YTD', value: 34, change: '+8 vs last year', trend: 'up' },
      { label: 'Avg. Close Time', value: '18d', change: '-4d', trend: 'down' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'NCs by Source',
        subtitle: 'Open nonconformities',
        data: [
          { label: 'Internal Audit', value: 3 },
          { label: 'Customer', value: 2 },
          { label: 'Process', value: 1 },
          { label: 'Supplier', value: 1 },
        ],
      },
      {
        type: 'donut',
        title: 'NC Severity',
        subtitle: 'Priority breakdown',
        data: [
          { label: 'Major', value: 2, color: '#ef4444' },
          { label: 'Minor', value: 4, color: '#f59e0b' },
          { label: 'Observation', value: 1, color: '#2563eb' },
        ],
      },
      {
        type: 'line',
        title: 'NC Trend',
        subtitle: 'Open items over time',
        data: [
          { label: 'Mar', value: 12 },
          { label: 'Apr', value: 10 },
          { label: 'May', value: 9 },
          { label: 'Jun', value: 8 },
          { label: 'Jul', value: 9 },
          { label: 'Aug', value: 7 },
        ],
        badge: '-42% YTD',
      },
      {
        type: 'progress',
        title: 'CAPA Completion',
        subtitle: 'Corrective action progress',
        data: [
          { label: 'Root Cause', value: 90 },
          { label: 'Action Plan', value: 75 },
          { label: 'Verification', value: 60 },
          { label: 'Closure', value: 45 },
        ],
        maxY: 100,
      },
    ],
  },
  kpis: {
    stats: [
      { label: 'Active KPIs', value: 32, change: '+4 new', trend: 'up' },
      { label: 'On Target', value: '78%', change: '+5%', trend: 'up' },
      { label: 'Below Target', value: 7, change: '-2 improved', trend: 'down' },
      { label: 'Reviews Due', value: 4, change: 'This month', trend: 'neutral' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'KPIs by Category',
        subtitle: 'Performance indicators tracked',
        data: [
          { label: 'Quality', value: 10 },
          { label: 'Production', value: 8 },
          { label: 'Safety', value: 6 },
          { label: 'Customer', value: 5 },
          { label: 'Finance', value: 3 },
        ],
      },
      {
        type: 'progress',
        title: 'Target Achievement',
        subtitle: 'KPIs meeting target',
        data: [
          { label: 'Quality', value: 85 },
          { label: 'Production', value: 72 },
          { label: 'Safety', value: 90 },
          { label: 'Customer', value: 78 },
          { label: 'Finance', value: 65 },
        ],
        maxY: 100,
      },
      {
        type: 'line',
        title: 'Overall Performance',
        subtitle: 'Weighted KPI score',
        data: [
          { label: 'Mar', value: 71 },
          { label: 'Apr', value: 73 },
          { label: 'May', value: 74 },
          { label: 'Jun', value: 76 },
          { label: 'Jul', value: 77 },
          { label: 'Aug', value: 78 },
        ],
        badge: '+7 pts YTD',
      },
      {
        type: 'mini-bar',
        title: 'Monthly Reviews',
        subtitle: 'KPI review sessions',
        data: [
          { label: 'Mar', value: 4 },
          { label: 'Apr', value: 5 },
          { label: 'May', value: 4 },
          { label: 'Jun', value: 6 },
          { label: 'Jul', value: 5 },
          { label: 'Aug', value: 5 },
        ],
      },
    ],
  },
  improvement: {
    stats: [
      { label: 'Active Initiatives', value: 9, change: '+2 new', trend: 'up' },
      { label: 'Completed YTD', value: 15, change: '+5 vs last year', trend: 'up' },
      { label: 'Est. Savings', value: '€42k', change: '+€8k', trend: 'up' },
      { label: 'On Track', value: '89%', change: '+3%', trend: 'up' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Initiatives by Type',
        subtitle: 'Improvement projects',
        data: [
          { label: 'Process', value: 4 },
          { label: 'Quality', value: 3 },
          { label: 'Cost Reduction', value: 2 },
        ],
      },
      {
        type: 'donut',
        title: 'Initiative Status',
        subtitle: 'Project pipeline',
        data: [
          { label: 'In Progress', value: 5, color: '#2563eb' },
          { label: 'Completed', value: 15, color: '#16a34a' },
          { label: 'Planned', value: 4, color: '#f59e0b' },
        ],
      },
      {
        type: 'line',
        title: 'Savings Trend',
        subtitle: 'Cumulative savings (€k)',
        data: [
          { label: 'Mar', value: 12 },
          { label: 'Apr', value: 18 },
          { label: 'May', value: 24 },
          { label: 'Jun', value: 30 },
          { label: 'Jul', value: 36 },
          { label: 'Aug', value: 42 },
        ],
        maxY: 50,
        badge: '+250% YTD',
      },
      {
        type: 'progress',
        title: 'Initiative Progress',
        subtitle: 'Completion by project',
        data: [
          { label: 'Lean Project A', value: 85 },
          { label: 'Quality Upgrade', value: 60 },
          { label: 'Automation Phase 1', value: 40 },
        ],
        maxY: 100,
      },
    ],
  },
};

export const moduleViewPrefix = 'module-';

export function getModuleViewId(moduleId: string) {
  return `${moduleViewPrefix}${moduleId}`;
}

export function parseModuleViewId(activeNav: string): string | null {
  if (!activeNav.startsWith(moduleViewPrefix)) return null;
  return activeNav.slice(moduleViewPrefix.length);
}
