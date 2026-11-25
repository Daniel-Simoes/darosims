export function parseDistributionIndividuals(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinDistributionIndividuals(values: string[]): string {
  return values
    .map((v) => v.trim())
    .filter(Boolean)
    .join(', ');
}

import { parseDistributionDepartments } from '../../data/documentFieldDefaults';

export function formatDistributionAccessSummary(
  departments: string | undefined,
  individuals: string | undefined,
): string {
  const dept = parseDistributionDepartments(departments);
  const people = parseDistributionIndividuals(individuals);
  const parts: string[] = [];
  if (dept.length > 0) {
    parts.push(`Departments: ${dept.join(', ')}`);
  }
  if (people.length > 0) {
    parts.push(`Individuals: ${people.join(', ')}`);
  }
  return parts.join(' · ') || '';
}