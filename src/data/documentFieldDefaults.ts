export type DocumentFieldOptionCategory =
  | 'repository'
  | 'location'
  | 'retention_period'
  | 'disposition'
  | 'distribution_department'
  | 'review_frequency';

export const DOCUMENT_FIELD_OPTION_DEFAULTS: Record<DocumentFieldOptionCategory, readonly string[]> = {
  repository: ['Physical Repository', 'Employee Personal File', 'Document Control', 'Quality System'],
  location: ['Head Office', 'Production Site', 'Archive Room'],
  retention_period: ['1 year', '2 years', '3 years', '4 years', '5 years', 'Permanent'],
  disposition: ['Delete', 'Destroy', 'Delete + Destroy', 'Return to employee'],
  distribution_department: [
    'Administration',
    'Human Resources',
    'IT',
    'Quality',
    'Production',
    'Operations',
  ],
  review_frequency: [
    'Monthly',
    'Quarterly',
    'Every six months',
    'Annually',
    'Every two months',
    'Every three months',
    'Every four months',
  ],
};

export function mergeDocumentFieldOptions(
  category: DocumentFieldOptionCategory,
  saved: string[],
  currentValue?: string,
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

  for (const item of DOCUMENT_FIELD_OPTION_DEFAULTS[category]) push(item);
  for (const item of saved) push(item);
  if (currentValue?.trim()) push(currentValue);

  return merged.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function parseDistributionDepartments(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinDistributionDepartments(values: string[]): string {
  return values
    .map((v) => v.trim())
    .filter(Boolean)
    .join(', ');
}