import { parseDistributionDepartments } from '../../data/documentFieldDefaults';

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

function mergeDistributionAccessLabels(
  departments: string | undefined,
  individuals: string | undefined,
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  const push = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(label);
  };

  for (const item of parseDistributionDepartments(departments)) push(item);
  for (const item of parseDistributionIndividuals(individuals)) push(item);

  return merged;
}

/** Document Control owner column: IT, Human Resources — no labels. */
export function formatDistributionAccessOwnerPrimary(
  departments: string | undefined,
  individuals: string | undefined,
  options?: { maxVisible?: number },
): string {
  const merged = mergeDistributionAccessLabels(departments, individuals);
  const maxVisible = options?.maxVisible;
  if (maxVisible != null && maxVisible > 0 && merged.length > maxVisible) {
    return `${merged.slice(0, maxVisible).join(', ')}…`;
  }
  return merged.join(', ');
}