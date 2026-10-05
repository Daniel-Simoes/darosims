import { TYPE_PREFIX } from '@/data/documentTypes';

export const PROCESSES = [
  'Administration',
  'Commercial/Sales',
  'Customer Management',
  'Finance',
  'Human Resources',
  'Information Technology',
  'Quality Management',
  'Health and Safety',
  'Environmental Management',
  'Food Safety Supplier Management',
  'Procurement/Purchasing',
  'Operations',
  'Maintenance',
  'Logistics',
] as const;

export type Process = (typeof PROCESSES)[number];

export function isProcess(value: string): value is Process {
  return (PROCESSES as readonly string[]).includes(value);
}

export const PROCESS_PREFIX: Record<string, string> = {
  Administration: 'AD',
  'Commercial/Sales': 'CS',
  'Customer Management': 'CM',
  Finance: 'FI',
  'Human Resources': 'HR',
  'Information Technology': 'IT',
  'Quality Management': 'QM',
  'Health and Safety': 'HS',
  'Environmental Management': 'EM',
  'Food Safety Supplier Management': 'FSSM',
  'Procurement/Purchasing': 'PP',
  Operations: 'OP',
  Maintenance: 'MT',
  Logistics: 'LG',
};
