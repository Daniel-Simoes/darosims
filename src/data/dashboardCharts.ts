export interface ChartPoint {
  label: string;
  value: number;
}

export const complianceTrend: ChartPoint[] = [
  { label: 'Mar', value: 72 },
  { label: 'Apr', value: 74 },
  { label: 'May', value: 79 },
  { label: 'Jun', value: 81 },
  { label: 'Jul', value: 84 },
  { label: 'Aug', value: 87 },
];

export const documentsByType: ChartPoint[] = [
  { label: 'Forms', value: 42 },
  { label: 'SOPs', value: 38 },
  { label: 'Work Instructions', value: 31 },
  { label: 'Policies', value: 24 },
  { label: 'Records', value: 21 },
];

export const activityBreakdown: (ChartPoint & { color: string })[] = [
  { label: 'Documents', value: 35, color: '#2563eb' },
  { label: 'Audits', value: 20, color: '#7c3aed' },
  { label: 'Nonconformities', value: 18, color: '#ef4444' },
  { label: 'CAPA', value: 15, color: '#f59e0b' },
  { label: 'Training', value: 12, color: '#10b981' },
];

export const monthlyAudits: ChartPoint[] = [
  { label: 'Mar', value: 1 },
  { label: 'Apr', value: 3 },
  { label: 'May', value: 2 },
  { label: 'Jun', value: 4 },
  { label: 'Jul', value: 2 },
  { label: 'Aug', value: 3 },
];
