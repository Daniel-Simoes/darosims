export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  count?: number;
  status?: 'active' | 'warning' | 'neutral';
  category: 'core' | 'compliance' | 'analytics';
  /** Home carousel: false = blurred “coming soon” preview */
  available?: boolean;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const dashboardModules: DashboardModule[] = [
  {
    id: 'documents',
    title: 'Document Control',
    description: 'Centralised document control with version tracking and approvals.',
    icon: '📄',
    count: 0,
    status: 'active',
    category: 'core',
    available: true,
  },
  {
    id: 'processes',
    title: 'Process Management',
    description: 'Map, monitor and improve business workflows across your organisation.',
    icon: '⚙️',
    count: 0,
    status: 'active',
    category: 'core',
    available: false,
  },
  {
    id: 'risks',
    title: 'Risk Management',
    description: 'Identify, assess and mitigate operational and compliance risks.',
    icon: '⚠️',
    count: 0,
    status: 'warning',
    category: 'core',
    available: false,
  },
  {
    id: 'audits',
    title: 'Audits',
    description: 'Plan, schedule and report on internal and external audits.',
    icon: '🔍',
    count: 0,
    status: 'neutral',
    category: 'compliance',
    available: false,
  },
  {
    id: 'suppliers',
    title: 'Supplier Management',
    description: 'Evaluate and monitor third-party supplier compliance.',
    icon: '🏭',
    count: 0,
    status: 'active',
    category: 'compliance',
    available: false,
  },
  {
    id: 'nonconformities',
    title: 'Nonconformities',
    description: 'Track issues, root causes and corrective actions.',
    icon: '❌',
    count: 0,
    status: 'warning',
    category: 'compliance',
    available: false,
  },
  {
    id: 'kpis',
    title: 'KPIs',
    description: 'Monitor key performance indicators and operational metrics.',
    icon: '📊',
    count: 0,
    status: 'active',
    category: 'analytics',
    available: false,
  },
  {
    id: 'improvement',
    title: 'Continual Improvement',
    description: 'Drive ongoing enhancements and track improvement initiatives.',
    icon: '📈',
    count: 0,
    status: 'active',
    category: 'analytics',
    available: false,
  },
];

/** Live module counts for the home carousel (only implemented modules use real data). */
export function buildDashboardModules(documentRegisterCount: number): DashboardModule[] {
  return dashboardModules.map((module) => {
    if (module.id === 'documents') {
      return { ...module, count: documentRegisterCount };
    }
    return { ...module, count: 0 };
  });
}

export const isoStandards = [
  { id: 'iso-9001', name: 'ISO 9001', label: 'Quality Management', progress: 78, status: 'In Progress' },
  { id: 'iso-14001', name: 'ISO 14001', label: 'Environmental Management', progress: 45, status: 'Planned' },
  { id: 'iso-45001', name: 'ISO 45001', label: 'Health & Safety', progress: 32, status: 'Planned' },
  { id: 'iso-22000', name: 'ISO 22000', label: 'Food Safety', progress: 0, status: 'Future' },
];

export const dashboardStats: DashboardStat[] = [
  { label: 'Open Actions', value: 14, change: '-3 this week', trend: 'down' },
  { label: 'Compliance Score', value: '87%', change: '+2%', trend: 'up' },
  { label: 'Documents Due', value: 5, change: '2 overdue', trend: 'neutral' },
  { label: 'Active Audits', value: 2, change: '1 scheduled', trend: 'neutral' },
];

export const sidebarNav = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'processes', label: 'Processes', icon: '⚙️' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'risks', label: 'Risks', icon: '⚠️' },
  { id: 'audits', label: 'Audits', icon: '🔍' },
  { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
  { id: 'nonconformities', label: 'Nonconformities', icon: '❌' },
  { id: 'kpis', label: 'KPIs', icon: '📊' },
  { id: 'improvement', label: 'Improvement', icon: '📈' },
];
